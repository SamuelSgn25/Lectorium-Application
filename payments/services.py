import uuid
import base64
import requests
import logging
from django.conf import settings
from django.db import transaction
from django.core.cache import cache
from django.utils import timezone
from common.exceptions import PaySaveException
from .models import PaymentTransaction
from apps.wallet.models import WalletTransaction

logger = logging.getLogger(__name__)


class MTNMoMoService:
    """Service pour intégrer MTN Mobile Money API"""
    
    def __init__(self):
        self.base_url = settings.MTN_MOMO_BASE_URL
        self.api_user = settings.MTN_MOMO_API_USER
        self.api_key = settings.MTN_MOMO_API_KEY
        self.target_environment = settings.MTN_MOMO_TARGET_ENVIRONMENT
        self.currency = settings.MTN_MOMO_CURRENCY
        self.callback_url = settings.MTN_MOMO_CALLBACK_URL
        
        self.collection_primary_key = settings.MTN_MOMO_COLLECTION_PRIMARY_KEY
        self.disbursement_primary_key = settings.MTN_MOMO_DISBURSEMENT_PRIMARY_KEY

    def _get_basic_auth_token(self):
        """Génère le token Basic Auth pour l'authentification OAuth"""
        credentials = f"{self.api_user}:{self.api_key}"
        encoded = base64.b64encode(credentials.encode()).decode()
        return f"Basic {encoded}"

    def _get_access_token(self, product='collection'):
        """
        Obtient un access token OAuth 2.0 avec cache
        product: 'collection' ou 'disbursement'
        """
        cache_key = f'mtn_momo_{product}_access_token'
        cached_token = cache.get(cache_key)
        
        if cached_token:
            return cached_token
        
        endpoint = f"{self.base_url}/{product}/token/"
        subscription_key = (
            self.collection_primary_key if product == 'collection' 
            else self.disbursement_primary_key
        )
        
        headers = {
            'Authorization': self._get_basic_auth_token(),
            'Ocp-Apim-Subscription-Key': subscription_key,
        }
        
        try:
            response = requests.post(endpoint, headers=headers, timeout=30)
            response.raise_for_status()
            data = response.json()
            
            access_token = data.get('access_token')
            expires_in = data.get('expires_in', 3600)
            
            # Cache le token avec une marge de sécurité de 60 secondes
            cache.set(cache_key, access_token, timeout=expires_in - 60)
            
            logger.info(f"MTN MoMo {product} access token obtained successfully")
            return access_token
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to get MTN MoMo access token: {str(e)}")
            raise PaySaveException('MTN_AUTH_FAILED', f'Échec de l\'authentification MTN: {str(e)}')

    def request_to_pay(self, amount, phone_number, reference_id=None, payer_message='', payee_note=''):
        """
        Initie une demande de paiement (Collection)
        amount: Montant en FCFA (pas en centimes)
        phone_number: Numéro de téléphone au format international (ex: 22997000000)
        """
        if not reference_id:
            reference_id = str(uuid.uuid4())
        
        external_id = "RCH-" + reference_id
        access_token = self._get_access_token('collection')
        endpoint = f"{self.base_url}/collection/v1_0/requesttopay"
        
        headers = {
            'Authorization': f'Bearer {access_token}',
            'X-Reference-Id': reference_id,
            'X-Target-Environment': self.target_environment,
            'Ocp-Apim-Subscription-Key': self.collection_primary_key,
            'Content-Type': 'application/json',
        }
        
        # S'assurer que le numéro est au format international sans le +
        if phone_number.startswith('+'):
            phone_number = phone_number[4:]
        
        payload = {
            'amount': str(amount),
            'currency': self.currency,
            'externalId': external_id,
            'payer': {
                'partyIdType': 'MSISDN',
                'partyId': phone_number
            },
            'payerMessage': payer_message or 'Paiement PaySave',
            'payeeNote': payee_note or 'Rechargement compte PaySave'
        }

        print("Headers:", headers)
        print("==================")
        print("Payload:", payload)
        print("==================")
        
        try:
            response = requests.post(endpoint, json=payload, headers=headers, timeout=30)
            
            if response.status_code == 202:
                logger.info(f"MTN RequestToPay initiated successfully: {reference_id}")
                return {
                    'success': True,
                    'reference': reference_id,
                    'external_reference': external_id,
                    'status': 'pending'
                }
            else:
                error_data = response.json() if response.content else {}
                logger.error(f"MTN RequestToPay failed: {response.status_code} - {error_data}")
                return {
                    'success': False,
                    'error': error_data.get('message', 'Erreur inconnue')
                }
                
        except requests.exceptions.RequestException as e:
            logger.error(f"MTN RequestToPay exception: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }

    def transfer(self, amount, phone_number, reference_id=None, payer_message='', payee_note=''):
        """
        Initie un transfert d'argent (Disbursement)
        amount: Montant en FCFA (pas en centimes)
        phone_number: Numéro de téléphone au format international
        """
        if not reference_id:
            reference_id = str(uuid.uuid4())

        external_id = "WTH-" + reference_id
        access_token = self._get_access_token('disbursement')
        endpoint = f"{self.base_url}/disbursement/v1_0/transfer"
        
        headers = {
            'Authorization': f'Bearer {access_token}',
            'X-Reference-Id': reference_id,
            'X-Target-Environment': self.target_environment,
            'Ocp-Apim-Subscription-Key': self.disbursement_primary_key,
            'Content-Type': 'application/json',
        }
        
        if phone_number.startswith('+'):
            phone_number = phone_number[4:]
        
        payload = {
            'amount': str(amount),
            'currency': self.currency,
            'externalId': external_id,
            'payee': {
                'partyIdType': 'MSISDN',
                'partyId': phone_number
            },
            'payerMessage': payer_message or 'Retrait PaySave',
            'payeeNote': payee_note or 'Retrait depuis PaySave'
        }
        
        try:
            response = requests.post(endpoint, json=payload, headers=headers, timeout=30)
            
            if response.status_code == 202:
                logger.info(f"MTN Transfer initiated successfully: {reference_id}")
                return {
                    'success': True,
                    'reference': reference_id,
                    'external_reference': external_id,
                    'status': 'pending'
                }
            else:
                error_data = response.json() if response.content else {}
                logger.error(f"MTN Transfer failed: {response.status_code} - {error_data}")
                return {
                    'success': False,
                    'error': error_data.get('message', 'Erreur inconnue')
                }
                
        except requests.exceptions.RequestException as e:
            logger.error(f"MTN Transfer exception: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }

    def get_transaction_status(self, reference_id, product='collection'):
        """
        Vérifie le statut d'une transaction
        product: 'collection' ou 'disbursement'
        """
        access_token = self._get_access_token(product)
        
        if product == 'collection':
            endpoint = f"{self.base_url}/collection/v1_0/requesttopay/{reference_id}"
            subscription_key = self.collection_primary_key
        else:
            endpoint = f"{self.base_url}/disbursement/v1_0/transfer/{reference_id}"
            subscription_key = self.disbursement_primary_key
        
        headers = {
            'Authorization': f'Bearer {access_token}',
            'X-Target-Environment': self.target_environment,
            'Ocp-Apim-Subscription-Key': subscription_key,
        }
        
        try:
            response = requests.get(endpoint, headers=headers, timeout=30)
            response.raise_for_status()
            data = response.json()
            
            return {
                'success': True,
                'status': data.get('status'),  # PENDING, SUCCESSFUL, FAILED
                'amount': data.get('amount'),
                'currency': data.get('currency'),
                'financial_transaction_id': data.get('financialTransactionId'),
                'external_id': data.get('externalId'),
                'reason': data.get('reason'),
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to get transaction status: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }


class PaymentService:
    def __init__(self):
        self.mtn_momo = MTNMoMoService()

    @transaction.atomic
    def initiate_recharge(self, user, amount_centimes, payment_method, phone_number):
        provider_map = {
            'momo': 'mtn_momo',
            'moov': 'moov_flooz'
        }
        
        provider = provider_map.get(payment_method)
        if not provider:
            raise PaySaveException('INVALID_PROVIDER', 'Méthode de paiement invalide')

        if provider != 'mtn_momo':
            raise PaySaveException('PROVIDER_NOT_SUPPORTED', 'Seul MTN Mobile Money est supporté pour le moment')

        reference = str(uuid.uuid4())
        
        payment_txn = PaymentTransaction.objects.create(
            user=user,
            transaction_type='recharge',
            provider=provider,
            amount=amount_centimes,
            status='pending',
            reference=reference,
            phone_number=phone_number
        )

        # MTN MoMo attend le montant en FCFA, pas en centimes
        result = self.mtn_momo.request_to_pay(
            amount=amount_centimes,
            phone_number=phone_number,
            reference_id=reference,
            payer_message='Rechargement PaySave',
            payee_note=f'Rechargement compte {user.phone_number}'
        )

        if not result.get('success'):
            payment_txn.status = 'failed'
            payment_txn.error_message = result.get('error', 'Erreur inconnue')
            payment_txn.save()
            raise PaySaveException('PAYMENT_FAILED', 'Échec de l\'initiation du paiement')

        payment_txn.external_reference = result.get('external_reference', '')
        payment_txn.status = 'processing'
        payment_txn.save()

        return {
            'reference': payment_txn.reference,
            'external_reference': payment_txn.external_reference,
            'amount': amount_centimes,
            'amount_fcfa': amount_centimes,
            'status': 'processing'
        }

    @transaction.atomic
    def initiate_withdrawal(self, user, amount_centimes, destination_phone, payment_method):
        provider_map = {
            'momo': 'mtn_momo',
            'moov': 'moov_flooz'
        }
        
        provider = provider_map.get(payment_method)
        if not provider:
            raise PaySaveException('INVALID_PROVIDER', 'Méthode de paiement invalide')

        if provider != 'mtn_momo':
            raise PaySaveException('PROVIDER_NOT_SUPPORTED', 'Seul MTN Mobile Money est supporté pour le moment')

        reference = str(uuid.uuid4())
        
        payment_txn = PaymentTransaction.objects.create(
            user=user,
            transaction_type='withdrawal',
            provider=provider,
            amount=amount_centimes,
            status='pending',
            reference=reference,
            phone_number=destination_phone
        )

        result = self.mtn_momo.transfer(
            amount=amount_centimes,
            phone_number=destination_phone,
            reference_id=reference,
            payer_message='Retrait PaySave',
            payee_note=f'Retrait depuis {user.phone_number}'
        )

        if not result.get('success'):
            payment_txn.status = 'failed'
            payment_txn.error_message = result.get('error', 'Erreur inconnue')
            payment_txn.save()
            raise PaySaveException('WITHDRAWAL_FAILED', 'Échec de l\'initiation du retrait')

        payment_txn.external_reference = result.get('external_reference', '')
        payment_txn.status = 'processing'
        payment_txn.save()

        user.wallet.deduct_savings(amount_centimes)

        return {
            'reference': payment_txn.reference,
            'external_reference': payment_txn.external_reference,
            'amount': amount_centimes,
            'amount_fcfa': amount_centimes,
            'status': 'processing'
        }

    @transaction.atomic
    def initiate_payment_with_savings(self, user, declared_amount, category, recipient_phone, payment_method, notes='', rule_id=None):
        from apps.transactions.services import TransactionService
        from apps.savings.calculator import calculate_savings
        
        rule = TransactionService.get_applicable_rule(user, category, rule_id)
        monthly_savings = TransactionService.get_monthly_savings(user)
        calc_result = calculate_savings(declared_amount, rule, monthly_savings)

        provider_map = {
            'momo': 'mtn_momo',
            'moov': 'moov_flooz'
        }
        
        provider = provider_map.get(payment_method)
        if not provider:
            raise PaySaveException('INVALID_PROVIDER', 'Méthode de paiement invalide')

        if provider != 'mtn_momo':
            raise PaySaveException('PROVIDER_NOT_SUPPORTED', 'Seul MTN Mobile Money est supporté pour le moment')

        reference = str(uuid.uuid4())
        
        payment_txn = PaymentTransaction.objects.create(
            user=user,
            transaction_type='payment',
            provider=provider,
            amount=calc_result['total_to_debit'],
            status='pending',
            reference=reference,
            phone_number=recipient_phone,
            metadata={
                'declared_amount': declared_amount,
                'savings_amount': calc_result['savings_amount'],
                'category': category
            }
        )

        result = self.mtn_momo.request_to_pay(
            amount=calc_result['total_to_debit'],
            phone_number=user.phone_number,
            reference_id=reference,
            payer_message=f'Paiement PaySave - {category}',
            payee_note=f'Paiement avec épargne automatique'
        )

        if not result.get('success'):
            payment_txn.status = 'failed'
            payment_txn.error_message = result.get('error', 'Erreur inconnue')
            payment_txn.save()
            raise PaySaveException('PAYMENT_FAILED', 'Échec de l\'initiation du paiement')

        payment_txn.external_reference = result.get('external_reference', '')
        payment_txn.status = 'processing'
        payment_txn.save()

        from apps.transactions.models import Transaction
        txn = Transaction.objects.create(
            user=user,
            channel='A',
            category=category,
            declared_amount=declared_amount,
            savings_amount=calc_result['savings_amount'],
            total_debited=calc_result['total_to_debit'],
            status='pending',
            rule_applied=rule,
            momo_transaction_id=payment_txn.external_reference,
            recipient_phone=recipient_phone,
            notes=notes,
            metadata={
                'payment_reference': payment_txn.reference,
                'rule_description': calc_result['rule_applied']
            }
        )

        return {
            'reference': payment_txn.reference,
            'transaction_id': str(txn.id),
            'amount': calc_result['total_to_debit'],
            'amount_fcfa': calc_result['total_to_debit'],
            'savings_amount': calc_result['savings_amount'],
            'savings_amount_fcfa': calc_result['savings_amount'],
            'status': 'processing'
        }
