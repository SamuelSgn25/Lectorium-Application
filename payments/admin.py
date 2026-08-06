from django.contrib import admin
from .models import PaymentTransaction


@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = ['reference', 'user', 'transaction_type', 'provider', 'amount_fcfa', 'status', 'created_at']
    list_filter = ['transaction_type', 'provider', 'status', 'created_at']
    search_fields = ['reference', 'external_reference', 'user__phone_number', 'phone_number']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    
    def amount_fcfa(self, obj):
        return f"{obj.amount / 100} F"
    amount_fcfa.short_description = 'Montant'
