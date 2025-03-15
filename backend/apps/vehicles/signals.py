from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from .models import Vehicle

@receiver(post_save, sender=Vehicle)
def validate_primary_vehicle(sender, instance, created, **kwargs):
    """
    اطمینان از اینکه هر کاربر فقط یک خودرو اصلی دارد
    """
    if instance.is_primary:
        # غیرفعال کردن وضعیت اصلی برای سایر خودروهای کاربر
        Vehicle.objects.filter(
            user=instance.user,
            is_primary=True
        ).exclude(id=instance.id).update(is_primary=False)