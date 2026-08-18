import logging
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.utils import timezone
from common.responses import success_response, error_response
from .models import PaymentTransaction
from .services import MTNMoMoService

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def mtn_momo_callback(request):
    """
    Callback MTN Mobile Money
    MTN envoie une notification POST quand le statut d'une transaction change
    """
    data = request.data
    logger.info(f"MTN MoMo callback received: {data}")
    
    # MTN envoie le X-Reference-Id dans les headers
    reference_id = request.headers.get('X-Reference-Id') or data.get('referenceId')
    
    if not reference_id:
        logger.error("MTN callback: Missing reference ID")
        return error_response('INVALID_CALLBACK', 'Reference ID manquant')

    try:
        payment_txn = PaymentTransaction.objects.get(reference=reference_id)
    except PaymentTransaction.DoesNotExist:
        logger.error(f"MTN callback: Transaction not found for reference {reference_id}")
        return error_response('TRANSACTION_NOT_FOUND', 'Transaction introuvable')

    # Vérifier le statut via l'API MTN pour sécurité
    mtn_service = MTNMoMoService()
    product = 'collection' if payment_txn.transaction_type in ['recharge', 'payment'] else 'disbursement'
    
    status_result = mtn_service.get_transaction_status(reference_id, product=product)
    
    if not status_result.get('success'):
        logger.error(f"Failed to verify MTN transaction status: {status_result.get('error')}")
        return error_response('VERIFICATION_FAILED', 'Échec de la vérification du statut')
    
    mtn_status = status_result.get('status')  # PENDING, SUCCESSFUL, FAILED
    financial_txn_id = status_result.get('financial_transaction_id')
    
    # Mettre à jour la transaction
    payment_txn.callback_received_at = timezone.now()
    if financial_txn_id:
        payment_txn.mtn_financial_transaction_id = financial_txn_id
    
    if mtn_status == 'SUCCESSFUL':
        payment_txn.status = 'completed'
        
        if payment_txn.transaction_type == 'recharge':
            from apps.wallet.models import WalletTransaction
            wallet = payment_txn.user.wallet
            wallet.add_balance(payment_txn.amount)
            
            # Créer une WalletTransaction pour tracer l'opération
            WalletTransaction.objects.create(
                wallet=wallet,
                transaction_type='recharge',
                amount=payment_txn.amount,
                status='completed',
                reference=payment_txn.reference,
                description=f'Rechargement via MTN Mobile Money',
                metadata={
                    'payment_reference': payment_txn.reference,
                    'financial_transaction_id': financial_txn_id,
                    'provider': payment_txn.provider
                }
            )
            
            logger.info(f"Recharge completed: {payment_txn.amount} FCFA for user {payment_txn.user.phone_number}")
        
        elif payment_txn.transaction_type == 'payment':
            from apps.transactions.models import Transaction
            txn = Transaction.objects.filter(
                momo_transaction_id=payment_txn.external_reference,
                status='pending'
            ).first()
            
            if txn:
                wallet = payment_txn.user.wallet
                wallet.add_savings(txn.savings_amount)
                txn.mark_completed()
                logger.info(f"Payment completed: {txn.savings_amount} FCFA saved")
        
        elif payment_txn.transaction_type == 'withdrawal':
            from apps.wallet.models import WalletTransaction
            
            # Créer une WalletTransaction pour tracer l'opération
            WalletTransaction.objects.create(
                wallet=payment_txn.user.wallet,
                transaction_type='savings_withdraw',
                amount=payment_txn.amount,
                status='completed',
                reference=payment_txn.reference,
                description=f'Retrait vers {payment_txn.phone_number}',
                metadata={
                    'payment_reference': payment_txn.reference,
                    'financial_transaction_id': financial_txn_id,
                    'provider': payment_txn.provider,
                    'destination_phone': payment_txn.phone_number
                }
            )
            
            logger.info(f"Withdrawal completed: {payment_txn.amount} FCFA to {payment_txn.phone_number}")

    elif mtn_status == 'FAILED':
        payment_txn.status = 'failed'
        payment_txn.error_message = status_result.get('reason', 'Paiement échoué')
        
        if payment_txn.transaction_type == 'withdrawal':
            # Rembourser le wallet si le retrait a échoué
            wallet = payment_txn.user.wallet
            wallet.add_savings(payment_txn.amount)
            logger.info(f"Withdrawal failed, refunded: {payment_txn.amount} FCFA")
        
        elif payment_txn.transaction_type == 'payment':
            from apps.transactions.models import Transaction
            txn = Transaction.objects.filter(
                momo_transaction_id=payment_txn.external_reference,
                status='pending'
            ).first()
            
            if txn:
                txn.mark_failed(payment_txn.error_message)
                logger.info(f"Payment failed: {payment_txn.error_message}")

    payment_txn.save()
    logger.info(f"Transaction {reference_id} updated to status: {payment_txn.status}")

    return success_response(message='Callback traité avec succès')


@api_view(['POST'])
@permission_classes([AllowAny])
def check_payment_status(request):
    """
    Endpoint pour vérifier manuellement le statut d'une transaction
    Utile pour tester en local sans callback
    """
    reference = request.data.get('reference')
    
    if not reference:
        return error_response('INVALID_REQUEST', 'Reference manquante')
    
    try:
        payment_txn = PaymentTransaction.objects.get(reference=reference)
    except PaymentTransaction.DoesNotExist:
        return error_response('TRANSACTION_NOT_FOUND', 'Transaction introuvable')
    
    # Si déjà complétée, retourner le statut
    if payment_txn.status in ['completed', 'failed', 'cancelled']:
        return success_response(data={
            'reference': payment_txn.reference,
            'status': payment_txn.status,
            'amount': payment_txn.amount,
            'message': 'Transaction déjà traitée'
        })
    
    # Vérifier le statut via l'API MTN
    mtn_service = MTNMoMoService()
    product = 'collection' if payment_txn.transaction_type in ['recharge', 'payment'] else 'disbursement'
    
    logger.info(f"Checking status for transaction {reference}")
    status_result = mtn_service.get_transaction_status(reference, product=product)
    
    if not status_result.get('success'):
        return error_response('VERIFICATION_FAILED', f"Échec de la vérification: {status_result.get('error')}")
    
    mtn_status = status_result.get('status')
    financial_txn_id = status_result.get('financial_transaction_id')
    
    logger.info(f"MTN status for {reference}: {mtn_status}")
    
    # Mettre à jour la transaction
    if financial_txn_id:
        payment_txn.mtn_financial_transaction_id = financial_txn_id
    
    if mtn_status == 'SUCCESSFUL':
        payment_txn.status = 'completed'
        
        if payment_txn.transaction_type == 'recharge':
            from apps.wallet.models import WalletTransaction
            wallet = payment_txn.user.wallet
            wallet.add_balance(payment_txn.amount)
            
            # Créer une WalletTransaction pour tracer l'opération
            WalletTransaction.objects.create(
                wallet=wallet,
                transaction_type='recharge',
                amount=payment_txn.amount,
                status='completed',
                reference=payment_txn.reference,
                description=f'Rechargement via MTN Mobile Money',
                metadata={
                    'payment_reference': payment_txn.reference,
                    'financial_transaction_id': financial_txn_id,
                    'provider': payment_txn.provider
                }
            )
            
            logger.info(f"✅ Wallet credited: {payment_txn.amount} FCFA for user {payment_txn.user.phone_number}")
        
        elif payment_txn.transaction_type == 'payment':
            from apps.transactions.models import Transaction
            txn = Transaction.objects.filter(
                momo_transaction_id=payment_txn.external_reference,
                status='pending'
            ).first()
            
            if txn:
                wallet = payment_txn.user.wallet
                wallet.add_savings(txn.savings_amount)
                txn.mark_completed()
                logger.info(f"✅ Payment completed: {txn.savings_amount} FCFA saved")
        
        elif payment_txn.transaction_type == 'withdrawal':
            from apps.wallet.models import WalletTransaction
            
            # Créer une WalletTransaction pour tracer l'opération
            WalletTransaction.objects.create(
                wallet=payment_txn.user.wallet,
                transaction_type='savings_withdraw',
                amount=payment_txn.amount,
                status='completed',
                reference=payment_txn.reference,
                description=f'Retrait vers {payment_txn.phone_number}',
                metadata={
                    'payment_reference': payment_txn.reference,
                    'financial_transaction_id': financial_txn_id,
                    'provider': payment_txn.provider,
                    'destination_phone': payment_txn.phone_number
                }
            )
            
            logger.info(f"✅ Withdrawal completed: {payment_txn.amount} FCFA to {payment_txn.phone_number}")
        
        payment_txn.save()
        
        return success_response(data={
            'reference': payment_txn.reference,
            'status': 'completed',
            'amount': payment_txn.amount,
            'financial_transaction_id': financial_txn_id,
            'message': 'Paiement réussi ! Wallet crédité.'
        })
    
    elif mtn_status == 'FAILED':
        payment_txn.status = 'failed'
        payment_txn.error_message = status_result.get('reason', 'Paiement échoué')
        
        if payment_txn.transaction_type == 'withdrawal':
            wallet = payment_txn.user.wallet
            wallet.add_savings(payment_txn.amount)
            logger.info(f"❌ Withdrawal failed, refunded: {payment_txn.amount} FCFA")
        
        payment_txn.save()
        
        return error_response('PAYMENT_FAILED', payment_txn.error_message, data={
            'reference': payment_txn.reference,
            'status': 'failed',
            'reason': payment_txn.error_message
        })
    
    else:  # PENDING
        return success_response(data={
            'reference': payment_txn.reference,
            'status': 'pending',
            'amount': payment_txn.amount,
            'message': 'Transaction en attente de validation par l\'utilisateur'
        })
