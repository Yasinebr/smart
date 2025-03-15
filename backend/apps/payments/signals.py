from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from .models import Payment
from apps.users.models import WalletTransaction
from django.utils import timezone


@receiver(post_save, sender=Payment)
def create_wallet_transaction(sender, instance, created, **kwargs):
    """
    ایجاد تراکنش کیف پول هنگام پرداخت موفق
    """
    if instance.status == 'completed' and instance.payment_method == 'wallet' and not hasattr(instance,
                                                                                              '_transaction_created'):
        instance._transaction_created = True

        # ایجاد تراکنش کیف پول
        WalletTransaction.objects.create(
            wallet=instance.user.wallet,
            amount=instance.amount,
            transaction_type='withdraw',
            description=f"پرداخت برای جلسه پارکینگ #{instance.parking_session.id}",
            status='completed',
            timestamp=timezone.now()
        )


@receiver(post_save, sender=Payment)
def update_parking_session_payment_status(sender, instance, **kwargs):
    """
    به‌روزرسانی وضعیت پرداخت جلسه پارکینگ
    """
    if instance.status == 'completed' and instance.parking_session:
        parking_session = instance.parking_session
        parking_session.is_paid = True
        parking_session.save()