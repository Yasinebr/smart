from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.parking.models import ParkingSession
from apps.vehicles.models import Vehicle
from django.utils import timezone

@receiver(post_save, sender=ParkingSession)
def log_ai_detection(sender, instance, created, **kwargs):
    """
    ثبت تشخیص خودکار پلاک در لاگ
    """
    if created and instance.detected_by_ai:
        # اینجا می‌توانید منطق ثبت لاگ برای تشخیص AI را پیاده‌سازی کنید
        # مثلاً ارسال به سیستم لاگینگ یا ذخیره در دیتابیس
        pass