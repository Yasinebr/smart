from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from django.conf import settings



class ParkingLocation(models.Model):
    """مدل مکان پارکینگ"""

    name = models.CharField(_('نام پارکینگ'), max_length=100)
    address = models.TextField(_('آدرس'))
    latitude = models.DecimalField(
        _('عرض جغرافیایی'),
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True
    )
    longitude = models.DecimalField(
        _('طول جغرافیایی'),
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True
    )
    total_capacity = models.PositiveIntegerField(_('ظرفیت کل'))

    class ParkingType(models.TextChoices):
        PUBLIC = 'public', _('عمومی')
        PRIVATE = 'private', _('خصوصی')

    parking_type = models.CharField(
        _('نوع پارکینگ'),
        max_length=10,
        choices=ParkingType.choices,
        default=ParkingType.PUBLIC
    )

    is_active = models.BooleanField(_('فعال'), default=True)
    created_at = models.DateTimeField(_('تاریخ ایجاد'), auto_now_add=True)
    manager = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='managed_parkings',
        verbose_name=_('مدیر پارکینگ')
    )

    class Meta:
        verbose_name = _('پارکینگ')
        verbose_name_plural = _('پارکینگ‌ها')
        ordering = ['name']

    def __str__(self):
        return self.name

    @property
    def available_capacity(self):
        """محاسبه ظرفیت در دسترس"""
        occupied = self.parking_slots.filter(status=ParkingSlot.SlotStatus.OCCUPIED).count()
        return self.total_capacity - occupied

class ParkingLot(models.Model):
    """مدل پارکینگ"""

    name = models.CharField(_('name'), max_length=255)
    address = models.TextField(_('address'))

    # موقعیت مکانی
    latitude = models.DecimalField(_('latitude'), max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(_('longitude'), max_digits=9, decimal_places=6, blank=True, null=True)

    # اطلاعات ظرفیت
    total_capacity = models.PositiveIntegerField(_('total capacity'), default=0)
    current_occupancy = models.PositiveIntegerField(_('current occupancy'), default=0)

    # اطلاعات هزینه
    hourly_rate = models.DecimalField(_('hourly rate'), max_digits=10, decimal_places=2, default=0)
    daily_rate = models.DecimalField(_('daily rate'), max_digits=10, decimal_places=2, default=0)
    monthly_rate = models.DecimalField(_('monthly rate'), max_digits=10, decimal_places=2, default=0)

    # مشخصات پارکینگ
    has_cctv = models.BooleanField(_('has CCTV'), default=False)
    has_elevator = models.BooleanField(_('has elevator'), default=False)
    has_electric_charger = models.BooleanField(_('has electric charger'), default=False)
    indoor = models.BooleanField(_('indoor'), default=False)

    # ساعات کاری
    opening_time = models.TimeField(_('opening time'), blank=True, null=True)
    closing_time = models.TimeField(_('closing time'), blank=True, null=True)
    is_24h = models.BooleanField(_('is 24 hours'), default=False)

    # مدیر پارکینگ
    manager = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, related_name='managed_parking_lots')

    # زمان‌ها
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('parking lot')
        verbose_name_plural = _('parking lots')

    def __str__(self):
        return self.name

    @property
    def available_capacity(self):
        return self.total_capacity - self.current_occupancy

    @property
    def occupancy_percentage(self):
        if self.total_capacity > 0:
            return (self.current_occupancy / self.total_capacity) * 100
        return 0


class ParkingZone(models.Model):
    """زون‌های پارکینگ (طبقات، بخش‌ها و...)"""

    parking_lot = models.ForeignKey(ParkingLot, on_delete=models.CASCADE, related_name='zones')
    name = models.CharField(_('name'), max_length=100)
    capacity = models.PositiveIntegerField(_('capacity'), default=0)
    current_occupancy = models.PositiveIntegerField(_('current occupancy'), default=0)

    # نوع زون
    REGULAR = 'regular'
    VIP = 'vip'
    DISABLED = 'disabled'

    ZONE_TYPE_CHOICES = [
        (REGULAR, _('Regular')),
        (VIP, _('VIP')),
        (DISABLED, _('Disabled')),
    ]

    zone_type = models.CharField(_('zone type'), max_length=10, choices=ZONE_TYPE_CHOICES, default=REGULAR)

    # اگر طبقات مختلف وجود داشته باشد
    floor = models.IntegerField(_('floor'), default=0)

    # اگر قیمت‌گذاری متفاوت دارد
    price_multiplier = models.DecimalField(
        _('price multiplier'),
        max_digits=3,
        decimal_places=2,
        default=1.0,
        validators=[MinValueValidator(0.1), MaxValueValidator(10.0)]
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('parking zone')
        verbose_name_plural = _('parking zones')

    def __str__(self):
        return f"{self.parking_lot.name} - {self.name}"

    @property
    def available_capacity(self):
        return self.capacity - self.current_occupancy

    @property
    def occupancy_percentage(self):
        if self.capacity > 0:
            return (self.current_occupancy / self.capacity) * 100
        return 0


class ParkingSlot(models.Model):
    """مدل جایگاه پارک"""

    class SlotStatus(models.TextChoices):
        AVAILABLE = 'available', _('در دسترس')
        OCCUPIED = 'occupied', _('اشغال شده')
        RESERVED = 'reserved', _('رزرو شده')
        UNAVAILABLE = 'unavailable', _('غیر قابل دسترس')

    parking = models.ForeignKey(
        ParkingLocation,
        on_delete=models.CASCADE,
        related_name='parking_slots',
        verbose_name=_('پارکینگ')
    )
    slot_number = models.CharField(_('شماره جایگاه'), max_length=10)
    status = models.CharField(
        _('وضعیت'),
        max_length=15,
        choices=SlotStatus.choices,
        default=SlotStatus.AVAILABLE
    )

    class Meta:
        verbose_name = _('جایگاه پارک')
        verbose_name_plural = _('جایگاه‌های پارک')
        unique_together = ('parking', 'slot_number')

    def __str__(self):
        return f"{self.parking.name} - {self.slot_number}"


class ParkingSession(models.Model):
    """مدل جلسه پارک - برای ثبت ورود و خروج خودروها"""

    parking_lot = models.ForeignKey(ParkingLot, on_delete=models.CASCADE, related_name='sessions')
    spot = models.ForeignKey(ParkingSlot, on_delete=models.SET_NULL, null=True, related_name='sessions')
    vehicle = models.ForeignKey('vehicles.Vehicle', on_delete=models.CASCADE, related_name='parking_sessions_vehicles')
    user = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, related_name='parking_sessions')

    # زمان‌های ورود و خروج
    entry_time = models.DateTimeField(_('entry time'), auto_now_add=True)
    exit_time = models.DateTimeField(_('exit time'), blank=True, null=True)

    # تصاویر ثبت شده
    entry_image = models.ImageField(_('entry image'), upload_to='parking_sessions/entry/', blank=True, null=True)
    exit_image = models.ImageField(_('exit image'), upload_to='parking_sessions/exit/', blank=True, null=True)

    # وضعیت جلسه
    ACTIVE = 'active'
    COMPLETED = 'completed'
    EXPIRED = 'expired'

    STATUS_CHOICES = [
        (ACTIVE, _('Active')),
        (COMPLETED, _('Completed')),
        (EXPIRED, _('Expired')),
    ]

    status = models.CharField(_('status'), max_length=10, choices=STATUS_CHOICES, default=ACTIVE)

    # اطلاعات مالی
    amount_due = models.DecimalField(_('amount due'), max_digits=10, decimal_places=2, default=0)
    is_paid = models.BooleanField(_('is paid'), default=False)
    payment = models.ForeignKey('payments.Payment', on_delete=models.SET_NULL, null=True, blank=True,
                                related_name='parking_sessions')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('parking session')
        verbose_name_plural = _('parking sessions')

    def __str__(self):
        return f"{self.vehicle} at {self.parking_lot.name} ({self.entry_time})"

    @property
    def duration(self):
        if self.exit_time:
            return self.exit_time - self.entry_time
        return None

    @property
    def is_active(self):
        return self.status == self.ACTIVE


class ParkingRate(models.Model):
    """مدل تعرفه پارکینگ"""

    parking = models.ForeignKey(
        ParkingLocation,
        on_delete=models.CASCADE,
        related_name='parking_rates',
        verbose_name=_('پارکینگ')
    )
    name = models.CharField(_('نام تعرفه'), max_length=100)
    hourly_rate = models.PositiveIntegerField(_('نرخ ساعتی (ریال)'))
    daily_rate = models.PositiveIntegerField(_('نرخ روزانه (ریال)'), null=True, blank=True)
    monthly_rate = models.PositiveIntegerField(_('نرخ ماهانه (ریال)'), null=True, blank=True)

    class VehicleType(models.TextChoices):
        CAR = 'car', _('سواری')
        MOTORCYCLE = 'motorcycle', _('موتور سیکلت')
        SUV = 'suv', _('شاسی بلند')
        TRUCK = 'truck', _('کامیون')

    vehicle_type = models.CharField(
        _('نوع خودرو'),
        max_length=15,
        choices=VehicleType.choices,
        default=VehicleType.CAR
    )

    is_active = models.BooleanField(_('فعال'), default=True)
    effective_from = models.DateTimeField(_('تاریخ شروع اعتبار'), auto_now_add=True)
    effective_to = models.DateTimeField(_('تاریخ پایان اعتبار'), null=True, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_rates',
        verbose_name=_('ایجاد کننده')
    )

    class Meta:
        verbose_name = _('تعرفه پارکینگ')
        verbose_name_plural = _('تعرفه‌های پارکینگ')
        ordering = ['-effective_from']

    def __str__(self):
        return f"{self.name} - {self.parking.name}"


class ParkingReservation(models.Model):
    """مدل رزرو پارکینگ"""

    parking_lot = models.ForeignKey(ParkingLot, on_delete=models.CASCADE, related_name='reservations')
    spot = models.ForeignKey(ParkingSlot, on_delete=models.SET_NULL, null=True, related_name='reservations')
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='parking_reservations')
    vehicle = models.ForeignKey('vehicles.Vehicle', on_delete=models.CASCADE, related_name='reservations')

    # زمان‌های رزرو
    start_time = models.DateTimeField(_('start time'))
    end_time = models.DateTimeField(_('end time'))

    # وضعیت رزرو
    PENDING = 'pending'
    CONFIRMED = 'confirmed'
    CANCELED = 'canceled'
    COMPLETED = 'completed'

    STATUS_CHOICES = [
        (PENDING, _('Pending')),
        (CONFIRMED, _('Confirmed')),
        (CANCELED, _('Canceled')),
        (COMPLETED, _('Completed')),
    ]

    status = models.CharField(_('status'), max_length=10, choices=STATUS_CHOICES, default=PENDING)

    # اطلاعات مالی
    amount = models.DecimalField(_('amount'), max_digits=10, decimal_places=2, default=0)
    is_paid = models.BooleanField(_('is paid'), default=False)
    payment = models.ForeignKey('payments.Payment', on_delete=models.SET_NULL, null=True, blank=True,
                                related_name='reservations')

    # یادآوری
    reminder_sent = models.BooleanField(_('reminder sent'), default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('parking reservation')
        verbose_name_plural = _('parking reservations')

    def __str__(self):
        return f"{self.user.email} - {self.parking_lot.name} ({self.start_time})"

    @property
    def duration(self):
        return self.end_time - self.start_time

    @property
    def is_active(self):
        return self.status in [self.PENDING, self.CONFIRMED]


class ParkingSubscription(models.Model):
    """مدل اشتراک پارکینگ"""

    class SubscriptionType(models.TextChoices):
        WEEKLY = 'weekly', _('هفتگی')
        MONTHLY = 'monthly', _('ماهانه')
        QUARTERLY = 'quarterly', _('سه ماهه')
        SEMIANNUAL = 'semiannual', _('شش ماهه')
        ANNUAL = 'annual', _('سالانه')

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='parking_subscriptions',
        verbose_name=_('کاربر')
    )
    parking = models.ForeignKey(
        ParkingLocation,
        on_delete=models.CASCADE,
        related_name='subscriptions',
        verbose_name=_('پارکینگ')
    )
    vehicle = models.ForeignKey(
        'vehicles.Vehicle',
        on_delete=models.CASCADE,
        related_name='subscriptions',
        verbose_name=_('خودرو')
    )
    subscription_type = models.CharField(
        _('نوع اشتراک'),
        max_length=15,
        choices=SubscriptionType.choices,
        default=SubscriptionType.MONTHLY
    )
    start_date = models.DateField(_('تاریخ شروع'))
    end_date = models.DateField(_('تاریخ پایان'))
    amount_paid = models.PositiveIntegerField(_('مبلغ پرداخت شده (ریال)'))
    is_active = models.BooleanField(_('فعال'), default=True)

    class Meta:
        verbose_name = _('اشتراک پارکینگ')
        verbose_name_plural = _('اشتراک‌های پارکینگ')
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.user.email} - {self.parking.name} - {self.get_subscription_type_display()}"


class ParkingReservation(models.Model):
    """مدل رزرو پارکینگ"""

    class ReservationStatus(models.TextChoices):
        PENDING = 'pending', _('در انتظار')
        CONFIRMED = 'confirmed', _('تایید شده')
        CHECKEDIN = 'checked_in', _('ورود انجام شده')
        COMPLETED = 'completed', _('تکمیل شده')
        CANCELLED = 'cancelled', _('لغو شده')

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='parking_reservations',
        verbose_name=_('کاربر')
    )
    parking = models.ForeignKey(
        ParkingLocation,
        on_delete=models.CASCADE,
        related_name='reservations',
        verbose_name=_('پارکینگ')
    )
    vehicle = models.ForeignKey(
        'vehicles.Vehicle',
        on_delete=models.CASCADE,
        related_name='reservations',
        verbose_name=_('خودرو')
    )
    reservation_start = models.DateTimeField(_('زمان شروع رزرو'))
    reservation_end = models.DateTimeField(_('زمان پایان رزرو'))
    parking_slot = models.ForeignKey(
        ParkingSlot,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reservations',
        verbose_name=_('جایگاه پارک')
    )
    status = models.CharField(
        _('وضعیت'),
        max_length=15,
        choices=ReservationStatus.choices,
        default=ReservationStatus.PENDING
    )
    created_at = models.DateTimeField(_('تاریخ ایجاد'), auto_now_add=True)

    class Meta:
        verbose_name = _('رزرو پارکینگ')
        verbose_name_plural = _('رزروهای پارکینگ')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.parking.name} - {self.reservation_start}"