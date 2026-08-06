from django.urls import path
from .views import mtn_momo_callback, check_payment_status

app_name = 'payments'

urlpatterns = [
    path('callback/mtn/', mtn_momo_callback, name='mtn-momo-callback'),
    path('check-status/', check_payment_status, name='check-payment-status'),
]
