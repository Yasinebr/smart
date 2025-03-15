from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, Wallet

@receiver(post_save, sender=User)
def create_user_wallet(sender, instance, created, **kwargs):
    """
    ایجاد خودکار کیف پول برای کاربر جدید بعد از ثبت‌نام
    """
    if created:
        Wallet.objects.create(user=instance, balance=0)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """
    به‌روزرسانی کیف پول کاربر در صورت تغییر اطلاعات کاربر
    """
    # اگر کاربر کیف پول دارد، آن را ذخیره کن
    try:
        instance.wallet.save()
    except:
        # اگر کاربر کیف پول ندارد، نادیده بگیر
        pass