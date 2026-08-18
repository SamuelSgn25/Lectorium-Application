from django.db import models
from common.models import BaseModel
from apps.accounts.models import User


class PaymentTransaction(BaseModel):
    TYPE_CHOICES = [
        ('recharge', 'Rechargement'),
        ('withdrawal', 'Retrait'),
        ('payment', 'Paiement'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('processing', 'En cours'),
        ('completed', 'Complété'),
        ('failed', 'Échoué'),
        ('cancelled', 'Annulé'),
    ]
    
    PROVIDER_CHOICES = [
        ('mtn_momo', 'MTN Mobile Money'),
        ('moov_flooz', 'Moov Flooz'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payment_transactions')
    transaction_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    provider = models.CharField(max_length=20, choices=PROVIDER_CHOICES)
    amount = models.PositiveIntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    reference = models.CharField(max_length=100, unique=True, db_index=True)
    external_reference = models.CharField(max_length=100, blank=True)
    phone_number = models.CharField(max_length=20)
    metadata = models.JSONField(default=dict, blank=True)
    error_message = models.TextField(blank=True)
    
    # MTN MoMo specific fields
    mtn_financial_transaction_id = models.CharField(max_length=255, blank=True, null=True)
    callback_received_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        verbose_name = 'Transaction de paiement'
        verbose_name_plural = 'Transactions de paiement'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['reference']),
            models.Index(fields=['external_reference']),
        ]

    def __str__(self):
        return f"{self.transaction_type} - {self.amount/100} F - {self.status}"
