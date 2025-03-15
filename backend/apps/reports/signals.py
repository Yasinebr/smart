from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db.models import Sum
from apps.parking.models import ParkingSession
from apps.payments.models import Payment
from .models import DailyReport, MonthlyReport
from django.utils import timezone


@receiver(post_save, sender=Payment)
def update_daily_report(sender, instance, **kwargs):
    """
    به‌روزرسانی گزارش روزانه با هر پرداخت جدید
    """
    if instance.status == 'completed':
        today = timezone.now().date()
        report, created = DailyReport.objects.get_or_create(date=today)

        # به‌روزرسانی آمار
        total_payments = Payment.objects.filter(
            created_at__date=today,
            status='completed'
        ).aggregate(Sum('amount'))

        total_sessions = ParkingSession.objects.filter(
            start_time__date=today
        ).count()

        report.total_revenue = total_payments['amount__sum'] or 0
        report.total_sessions = total_sessions
        report.save()