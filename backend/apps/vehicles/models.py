from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import RegexValidator, MinValueValidator, MaxValueValidator
from django.conf import settings

class Vehicle(models.Model):
    """مدل خودرو"""

    # اطلاعات خودرو
    license_plate = models.CharField(
        _('license plate'),
        max_length=20,
        unique=True
    )

    # نوع خودرو
    SEDAN = 'sedan'
    SUV = 'suv'
    HATCHBACK = 'hatchback'
    PICKUP = 'pickup'
    VAN = 'van'
    TRUCK = 'truck'
    MOTORCYCLE = 'motorcycle'

    VEHICLE_TYPE_CHOICES = [
        (SEDAN, _('Sedan')),
        (SUV, _('SUV')),
        (HATCHBACK, _('Hatchback')),
        (PICKUP, _('Pickup')),
        (VAN, _('Van')),
        (TRUCK, _('Truck')),
        (MOTORCYCLE, _('Motorcycle')),
    ]

    vehicle_type = models.CharField(_('vehicle type'), max_length=15, choices=VEHICLE_TYPE_CHOICES, default=SEDAN)

    # مشخصات فنی
    make = models.CharField(_('make'), max_length=50)
    model = models.CharField(_('model'), max_length=50)
    year = models.PositiveIntegerField(_('year'), blank=True, null=True)
    color = models.CharField(_('color'), max_length=30, blank=True, null=True)

    # تصویر خودرو و پلاک
    vehicle_image = models.ImageField(_('vehicle image'), upload_to='vehicles/', blank=True, null=True)
    license_plate_image = models.ImageField(_('license plate image'), upload_to='license_plates/', blank=True,
                                            null=True)

    # وضعیت خودرو در سیستم
    is_verified = models.BooleanField(_('is verified'), default=False)
    verification_date = models.DateTimeField(_('verification date'), blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('vehicle')
        verbose_name_plural = _('vehicles')

    def __str__(self):
        return f"{self.make} {self.model} - {self.license_plate}"


class VehicleEntry(models.Model):
    """مدل ورود و خروج خودرو به پارکینگ"""

    class EntryType(models.TextChoices):
        ENTRY = 'entry', _('ورود')
        EXIT = 'exit', _('خروج')

    vehicle = models.ForeignKey(
        Vehicle,
        on_delete=models.CASCADE,
        related_name='entries',
        verbose_name=_('خودرو')
    )
    parking = models.ForeignKey(
        'parking.ParkingLocation',
        on_delete=models.CASCADE,
        related_name='vehicle_entries',
        verbose_name=_('پارکینگ')
    )
    entry_type = models.CharField(
        _('نوع ورود/خروج'),
        max_length=10,
        choices=EntryType.choices
    )
    timestamp = models.DateTimeField(_('زمان'), auto_now_add=True)

    # تصویر ضبط شده در زمان ورود/خروج
    captured_image = models.ImageField(
        _('تصویر ضبط شده'),
        upload_to='vehicle_entries/',
        null=True,
        blank=True
    )

    # اطلاعات تشخیص پلاک
    plate_detection_data = models.JSONField(
        _('داده‌های تشخیص پلاک'),
        null=True,
        blank=True
    )

    # اطلاعات تشخیص چهره
    face_detection_data = models.JSONField(
        _('داده‌های تشخیص چهره'),
        null=True,
        blank=True
    )

    # اطلاعات تکمیلی
    notes = models.TextField(_('توضیحات'), blank=True)
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='recorded_entries',
        verbose_name=_('ثبت کننده')
    )

    class Meta:
        verbose_name = _('ورود/خروج خودرو')
        verbose_name_plural = _('ورود/خروج خودروها')
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.get_entry_type_display()} - {self.vehicle.license_plate} - {self.timestamp}"


class VehicleCategory(models.Model):
    """دسته‌بندی خودروها برای تعریف قیمت‌های متفاوت"""

    name = models.CharField(_('name'), max_length=100)
    description = models.TextField(_('description'), blank=True, null=True)

    # ضریب قیمت
    price_multiplier = models.DecimalField(
        _('price multiplier'),
        max_digits=3,
        decimal_places=2,
        default=1.0,
        validators=[MinValueValidator(0.1), MaxValueValidator(10.0)]
    )

    # نوع خودروهای مجاز
    allowed_vehicle_types = models.JSONField(_('allowed vehicle types'), default=list)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('vehicle category')
        verbose_name_plural = _('vehicle categories')

    def __str__(self):
        return self.name


class ParkingSession(models.Model):
    """مدل جلسه پارک خودرو (از زمان ورود تا خروج)"""

    class SessionStatus(models.TextChoices):
        ACTIVE = 'active', _('فعال')
        COMPLETED = 'completed', _('تکمیل شده')
        CANCELLED = 'cancelled', _('لغو شده')

    vehicle = models.ForeignKey(
        Vehicle,
        on_delete=models.CASCADE,
        related_name='parking_sessions',
        verbose_name=_('خودرو')
    )
    parking = models.ForeignKey(
        'parking.ParkingLocation',
        on_delete=models.CASCADE,
        related_name='parking_sessions',
        verbose_name=_('پارکینگ')
    )
    entry_time = models.DateTimeField(_('زمان ورود'))
    exit_time = models.DateTimeField(_('زمان خروج'), null=True, blank=True)

    # ارتباط با رزرو در صورت وجود
    reservation = models.ForeignKey(
        'parking.ParkingReservation',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='parking_sessions',
        verbose_name=_('رزرو')
    )

    # ارتباط با اشتراک در صورت وجود
    subscription = models.ForeignKey(
        'parking.ParkingSubscription',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='parking_sessions',
        verbose_name=_('اشتراک')
    )

    # جایگاه پارک
    parking_slot = models.ForeignKey(
        'parking.ParkingSlot',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='parking_sessions',
        verbose_name=_('جایگاه پارک')
    )

    # وضعیت جلسه
    status = models.CharField(
        _('وضعیت'),
        max_length=15,
        choices=SessionStatus.choices,
        default=SessionStatus.ACTIVE
    )

    # مبلغ محاسبه شده
    calculated_amount = models.PositiveIntegerField(
        _('مبلغ محاسبه شده (ریال)'),
        null=True,
        blank=True
    )

    # زمان محاسبه شده (ساعت)
    calculated_duration = models.FloatField(
        _('مدت زمان محاسبه شده (ساعت)'),
        null=True,
        blank=True
    )

    # اطلاعات تکمیلی
    notes = models.TextField(_('توضیحات'), blank=True)

    class Meta:
        verbose_name = _('جلسه پارک')
        verbose_name_plural = _('جلسات پارک')
        ordering = ['-entry_time']

    def __str__(self):
        return f"{self.vehicle.license_plate} - {self.entry_time}"

    @property
    def duration(self):
        """محاسبه مدت زمان پارک به ساعت"""
        if self.exit_time and self.entry_time:
            diff = self.exit_time - self.entry_time
            return diff.total_seconds() / 3600
        return None