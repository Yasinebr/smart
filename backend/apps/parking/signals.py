# apps/parking/signals.py
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from .models import ParkingSession
from apps.payments.models import Payment


@receiver(post_save, sender=ParkingSession)
def create_payment_for_completed_session(sender, instance, created, **kwargs):
    """
    ایجاد خودکار صورتحساب هنگام اتمام جلسه پارکینگ
    """
    if not created and instance.end_time and not instance.is_paid:
        # محاسبه هزینه
        duration = instance.end_time - instance.start_time
        hours = duration.total_seconds() / 3600
        amount = hours * instance.parking_spot.hourly_rate

        # ایجاد پرداخت
        Payment.objects.create(
            user=instance.user,
            parking_session=instance,
            amount=amount,
            status='pending'
        )