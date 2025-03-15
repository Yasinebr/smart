from django.db import models
from django.utils.translation import gettext_lazy as _


class PaymentGateway(models.Model):
    """مدل درگاه پرداخت"""

    class GatewayType(models.TextChoices):
        ONLINE = 'online', _('آنلاین')
        POS = 'pos', _('کارتخوان')
        CASH = 'cash', _('نقدی')
        WALLET = 'wallet', _('کیف پول')

    name = models.CharField(_('نام درگاه'), max_length=100)
    gateway_type = models.CharField(
        _('نوع درگاه'),
        max_length=20,
        choices=GatewayType.choices,
        default=GatewayType.ONLINE
    )
    api_key = models.CharField(_('کلید API'), max_length=255, blank=True)
    api_secret = models.CharField(_('رمز API'), max_length=255, blank=True)
    is_active = models.BooleanField(_('فعال'), default=True)
    config = models.JSONField(_('تنظیمات'), null=True, blank=True)
    created_at = models.DateTimeField(_('تاریخ ایجاد'), auto_now_add=True)

    class Meta:
        verbose_name = _('درگاه پرداخت')
        verbose_name_plural = _('درگاه‌های پرداخت')

    def __str__(self):
        return self.name


class Payment(models.Model):
    """مدل پرداخت"""

    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='payments')

    # نوع پرداخت
    PARKING_SESSION = 'parking_session'
    RESERVATION = 'reservation'
    SUBSCRIPTION = 'subscription'

    PAYMENT_TYPE_CHOICES = [
        (PARKING_SESSION, _('Parking Session')),
        (RESERVATION, _('Reservation')),
        (SUBSCRIPTION, _('Subscription')),
    ]

    payment_type = models.CharField(_('payment type'), max_length=20, choices=PAYMENT_TYPE_CHOICES)

    # مقدار و وضعیت
    amount = models.DecimalField(_('amount'), max_digits=10, decimal_places=2)

    # وضعیت پرداخت
    PENDING = 'pending'
    COMPLETED = 'completed'
    FAILED = 'failed'
    REFUNDED = 'refunded'

    STATUS_CHOICES = [
        (PENDING, _('Pending')),
        (COMPLETED, _('Completed')),
        (FAILED, _('Failed')),
        (REFUNDED, _('Refunded')),
    ]

    status = models.CharField(_('status'), max_length=10, choices=STATUS_CHOICES, default=PENDING)

    # اطلاعات تراکنش
    transaction_id = models.CharField(_('transaction ID'), max_length=255, blank=True, null=True)
    payment_gateway = models.CharField(_('payment gateway'), max_length=100, blank=True, null=True)
    payment_method = models.CharField(_('payment method'), max_length=100, blank=True, null=True)

    # تاریخ‌ها
    payment_date = models.DateTimeField(_('payment date'), blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('payment')
        verbose_name_plural = _('payments')

    def __str__(self):
        return f"{self.user.email} - {self.amount} ({self.get_status_display()})"

    @property
    def is_successful(self):
        return self.status == self.COMPLETED


class Invoice(models.Model):
    """مدل فاکتور"""

    payment = models.OneToOneField(Payment, on_delete=models.CASCADE, related_name='invoice')
    invoice_number = models.CharField(_('invoice number'), max_length=50, unique=True)

    # جزئیات فاکتور
    items = models.JSONField(_('items'), default=list)
    tax_amount = models.DecimalField(_('tax amount'), max_digits=10, decimal_places=2, default=0)
    discount_amount = models.DecimalField(_('discount amount'), max_digits=10, decimal_places=2, default=0)

    # وضعیت فاکتور
    is_paid = models.BooleanField(_('is paid'), default=False)
    due_date = models.DateTimeField(_('due date'), blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('invoice')
        verbose_name_plural = _('invoices')

    def __str__(self):
        return self.invoice_number

    @property
    def total_amount(self):
        return self.payment.amount + self.tax_amount - self.discount_amount


class Subscription(models.Model):
    """مدل اشتراک"""

    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='subscriptions')

    # نوع اشتراک
    BASIC = 'basic'
    PREMIUM = 'premium'
    VIP = 'vip'

    SUBSCRIPTION_TYPE_CHOICES = [
        (BASIC, _('Basic')),
        (PREMIUM, _('Premium')),
        (VIP, _('VIP')),
    ]

    subscription_type = models.CharField(_('subscription type'), max_length=10, choices=SUBSCRIPTION_TYPE_CHOICES)

    # دوره زمانی
    MONTHLY = 'monthly'
    QUARTERLY = 'quarterly'
    YEARLY = 'yearly'

    PERIOD_CHOICES = [
        (MONTHLY, _('Monthly')),
        (QUARTERLY, _('Quarterly')),
        (YEARLY, _('Yearly')),
    ]

    period = models.CharField(_('period'), max_length=10, choices=PERIOD_CHOICES, default=MONTHLY)

    # تاریخ‌ها
    start_date = models.DateTimeField(_('start date'))
    end_date = models.DateTimeField(_('end date'))

    # وضعیت
    is_active = models.BooleanField(_('is active'), default=True)
    auto_renew = models.BooleanField(_('auto renew'), default=False)

    # مبلغ
    amount = models.DecimalField(_('amount'), max_digits=10, decimal_places=2)

    # پرداخت مرتبط
    payment = models.ForeignKey(Payment, on_delete=models.SET_NULL, null=True, related_name='subscriptions')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('subscription')
        verbose_name_plural = _('subscriptions')

    def __str__(self):
        return f"{self.user.email} - {self.get_subscription_type_display()} ({self.get_period_display()})"

    @property
    def is_expired(self):
        from django.utils import timezone
        return self.end_date < timezone.now()


class InvoiceItem(models.Model):
    """مدل آیتم فاکتور"""

    invoice = models.ForeignKey('Invoice', on_delete=models.CASCADE, related_name='invoice_items', verbose_name=_('فاکتور'))

    custom_items = models.TextField()

    title = models.CharField(_('عنوان'), max_length=255)
    description = models.TextField(_('توضیحات'), blank=True)

    quantity = models.PositiveIntegerField(_('تعداد'), default=1)
    unit_price = models.PositiveIntegerField(_('قیمت واحد (ریال)'))
    total_price = models.PositiveIntegerField(_('قیمت کل (ریال)'))

    # اطلاعات تکمیلی
    tax_percentage = models.DecimalField(_('درصد مالیات'), max_digits=5, decimal_places=2, default=0)
    tax_amount = models.PositiveIntegerField(_('مبلغ مالیات (ریال)'), default=0)
    discount_percentage = models.DecimalField(_('درصد تخفیف'), max_digits=5, decimal_places=2, default=0)
    discount_amount = models.PositiveIntegerField(_('مبلغ تخفیف (ریال)'), default=0)

    class Meta:
        verbose_name = _('آیتم فاکتور')
        verbose_name_plural = _('آیتم‌های فاکتور')

    def __str__(self):
        return f"{self.title} - {self.invoice.invoice_number}"