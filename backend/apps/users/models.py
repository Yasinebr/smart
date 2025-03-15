from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import gettext_lazy as _


class UserManager(BaseUserManager):
    """مدیریت کاربران سفارشی"""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError(_('The Email field must be set'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', User.ADMIN)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """مدل کاربر سفارشی"""

    # نقش‌های کاربر
    ADMIN = 'admin'
    PARKING_MANAGER = 'parking_manager'
    CUSTOMER = 'customer'

    ROLE_CHOICES = [
        (ADMIN, _('Admin')),
        (PARKING_MANAGER, _('Parking Manager')),
        (CUSTOMER, _('Customer')),
    ]

    username = None
    email = models.EmailField(_('email address'), unique=True)
    phone_number = models.CharField(_('phone number'), max_length=15, blank=True, null=True)
    role = models.CharField(_('role'), max_length=20, choices=ROLE_CHOICES, default=CUSTOMER)

    # اطلاعات پروفایل
    profile_image = models.ImageField(upload_to='profiles/', blank=True, null=True)
    national_id = models.CharField(_('national ID'), max_length=20, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    # زمان‌های مهم
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')

    def __str__(self):
        return self.email

    @property
    def is_admin(self):
        return self.role == self.ADMIN

    @property
    def is_parking_manager(self):
        return self.role == self.PARKING_MANAGER

    @property
    def is_customer(self):
        return self.role == self.CUSTOMER


class UserVehicle(models.Model):
    """رابطه بین کاربر و خودروهای او"""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='vehicles')
    vehicle = models.ForeignKey('vehicles.Vehicle', on_delete=models.CASCADE, related_name='owners')
    is_primary = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'vehicle')
        verbose_name = _('user vehicle')
        verbose_name_plural = _('user vehicles')

    def __str__(self):
        return f"{self.user.email} - {self.vehicle}"


# اضافه کردن در فایل users/models.py

class Wallet(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='wallet')
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s wallet - {self.balance}"


class Profile(models.Model):
    """پروفایل کاربر با اطلاعات اضافی"""

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile',
        verbose_name=_('کاربر')
    )
    avatar = models.ImageField(
        _('تصویر'),
        upload_to='profiles/',
        blank=True,
        null=True
    )
    national_id = models.CharField(
        _('کد ملی'),
        max_length=10,
        blank=True
    )
    face_image = models.ImageField(
        _('تصویر چهره'),
        upload_to='faces/',
        blank=True,
        null=True
    )
    face_encoding = models.BinaryField(
        _('کدگذاری چهره'),
        blank=True,
        null=True
    )

    class Meta:
        verbose_name = _('پروفایل')
        verbose_name_plural = _('پروفایل‌ها')

    def __str__(self):
        return f"پروفایل {self.user.email}"


class WalletTransaction(models.Model):
    TRANSACTION_TYPES = (
        ('deposit', 'واریز'),
        ('withdraw', 'برداشت'),
    )

    STATUS_CHOICES = (
        ('pending', 'در انتظار'),
        ('completed', 'تکمیل شده'),
        ('failed', 'ناموفق'),
    )

    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.transaction_type} - {self.amount} ({self.status})"