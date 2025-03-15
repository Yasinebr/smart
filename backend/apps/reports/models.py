from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings


class Report(models.Model):
    """مدل گزارش پایه"""

    class ReportType(models.TextChoices):
        DAILY = 'daily', _('Daily')
        WEEKLY = 'weekly', _('Weekly')
        MONTHLY = 'monthly', _('Monthly')
        CUSTOM = 'custom', _('Custom')

    class ReportCategory(models.TextChoices):
        SUMMARY = 'summary', _('خلاصه')
        DETAILED = 'detailed', _('جزئیات')
        ANALYTICS = 'analytics', _('تحلیلی')

    # نوع گزارش
    report_type = models.CharField(_('report type'), max_length=10, choices=ReportType.choices)

    # بازه زمانی
    start_date = models.DateField(_('start date'))
    end_date = models.DateField(_('end date'))

    # کاربر ایجاد کننده
    created_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, related_name='created_reports')

    # محتوای گزارش
    data = models.JSONField(_('data'), default=dict)

    # وضعیت گزارش
    PENDING = 'pending'
    COMPLETED = 'completed'
    FAILED = 'failed'

    STATUS_CHOICES = [
        (PENDING, _('Pending')),
        (COMPLETED, _('Completed')),
        (FAILED, _('Failed')),
    ]

    status = models.CharField(_('status'), max_length=10, choices=STATUS_CHOICES, default=PENDING)

    # فایل خروجی
    file = models.FileField(_('file'), upload_to='reports/', blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('report')
        verbose_name_plural = _('reports')

    def __str__(self):
        return f"{self.get_report_type_display()} Report ({self.start_date} to {self.end_date})"


class ReportSchedule(models.Model):
    """مدل زمان‌بندی خودکار گزارش‌ها"""

    class ScheduleFrequency(models.TextChoices):
        DAILY = 'daily', _('روزانه')
        WEEKLY = 'weekly', _('هفتگی')
        MONTHLY = 'monthly', _('ماهانه')

    name = models.CharField(_('نام زمان‌بندی'), max_length=100)
    description = models.TextField(_('توضیحات'), blank=True)

    frequency = models.CharField(
        _('تناوب'),
        max_length=20,
        choices=ScheduleFrequency.choices,
        default=ScheduleFrequency.MONTHLY
    )

    # برای تناوب هفتگی، روز هفته (0-6)
    day_of_week = models.IntegerField(_('روز هفته'), null=True, blank=True)

    # برای تناوب ماهانه، روز ماه (1-31)
    day_of_month = models.IntegerField(_('روز ماه'), null=True, blank=True)

    # زمان اجرا (ساعت:دقیقه)
    time = models.TimeField(_('زمان اجرا'))

    report_type = models.CharField(
        _('نوع گزارش'),
        max_length=20,
        choices=Report.ReportType.choices,
        default=Report.ReportType.MONTHLY
    )

    category = models.CharField(
        _('دسته‌بندی'),
        max_length=20,
        choices=Report.ReportCategory.choices,
        default=Report.ReportCategory.SUMMARY
    )

    parking = models.ForeignKey(
        'parking.ParkingLocation',
        on_delete=models.CASCADE,
        related_name='report_schedules',
        verbose_name=_('پارکینگ'),
        null=True,
        blank=True
    )

    # کاربرانی که باید گزارش را دریافت کنند
    recipients = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='report_schedules',
        verbose_name=_('دریافت‌کنندگان')
    )

    # گزینه‌های دیگر
    is_active = models.BooleanField(_('فعال'), default=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_schedules',
        verbose_name=_('ایجاد کننده')
    )
    created_at = models.DateTimeField(_('تاریخ ایجاد'), auto_now_add=True)

    class Meta:
        verbose_name = _('زمان‌بندی گزارش')
        verbose_name_plural = _('زمان‌بندی‌های گزارش')

    def __str__(self):
        return self.name


class ParkingReport(Report):
    """گزارش پارکینگ"""

    parking_lot = models.ForeignKey('parking.ParkingLot', on_delete=models.CASCADE, related_name='reports')

    # نوع گزارش پارکینگ
    OCCUPANCY = 'occupancy'
    REVENUE = 'revenue'
    TRAFFIC = 'traffic'

    PARKING_REPORT_TYPE_CHOICES = [
        (OCCUPANCY, _('Occupancy')),
        (REVENUE, _('Revenue')),
        (TRAFFIC, _('Traffic')),
    ]

    parking_report_type = models.CharField(
        _('parking report type'),
        max_length=10,
        choices=PARKING_REPORT_TYPE_CHOICES,
        default=OCCUPANCY
    )

    class Meta:
        verbose_name = _('parking report')
        verbose_name_plural = _('parking reports')

    def __str__(self):
        return f"{self.parking_lot.name} - {self.get_parking_report_type_display()} Report"


class FinancialReport(Report):
    """گزارش مالی"""

    # نوع گزارش مالی
    REVENUE = 'revenue'
    EXPENSES = 'expenses'
    PROFIT_LOSS = 'profit_loss'

    FINANCIAL_REPORT_TYPE_CHOICES = [
        (REVENUE, _('Revenue')),
        (EXPENSES, _('Expenses')),
        (PROFIT_LOSS, _('Profit & Loss')),
    ]

    financial_report_type = models.CharField(
        _('financial report type'),
        max_length=15,
        choices=FINANCIAL_REPORT_TYPE_CHOICES,
        default=REVENUE
    )

    # اطلاعات خلاصه
    total_revenue = models.DecimalField(_('total revenue'), max_digits=12, decimal_places=2, default=0)
    total_expenses = models.DecimalField(_('total expenses'), max_digits=12, decimal_places=2, default=0)
    net_profit = models.DecimalField(_('net profit'), max_digits=12, decimal_places=2, default=0)

    class Meta:
        verbose_name = _('financial report')
        verbose_name_plural = _('financial reports')

    def __str__(self):
        return f"{self.get_financial_report_type_display()} Report ({self.start_date} to {self.end_date})"


class DailyReport(models.Model):
    date = models.DateField(unique=True)
    total_revenue = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_sessions = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Daily Report for {self.date} - Revenue: {self.total_revenue}"

    class Meta:
        ordering = ['-date']


class MonthlyReport(models.Model):
    year = models.IntegerField()
    month = models.IntegerField()
    total_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_sessions = models.IntegerField(default=0)
    average_session_duration = models.FloatField(default=0)  # در دقیقه
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Monthly Report for {self.year}/{self.month} - Revenue: {self.total_revenue}"

    class Meta:
        ordering = ['-year', '-month']
        unique_together = ['year', 'month']


class Dashboard(models.Model):
    """مدل داشبورد برای نمایش گزارش‌ها"""

    name = models.CharField(_('نام داشبورد'), max_length=100)
    description = models.TextField(_('توضیحات'), blank=True)

    # کاربر مالک داشبورد
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='dashboards',
        verbose_name=_('مالک')
    )

    # پارکینگ مرتبط (اختیاری)
    parking = models.ForeignKey(
        'parking.ParkingLocation',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='dashboards',
        verbose_name=_('پارکینگ')
    )

    # تنظیمات داشبورد به صورت JSON
    settings = models.JSONField(
        _('تنظیمات'),
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(_('تاریخ ایجاد'), auto_now_add=True)
    updated_at = models.DateTimeField(_('آخرین به‌روزرسانی'), auto_now=True)

    class Meta:
        verbose_name = _('داشبورد')
        verbose_name_plural = _('داشبوردها')

    def __str__(self):
        return self.name


class DashboardWidget(models.Model):
    """مدل ویجت‌های داشبورد"""

    class WidgetType(models.TextChoices):
        CHART = 'chart', _('نمودار')
        TABLE = 'table', _('جدول')
        METRIC = 'metric', _('معیار')
        MAP = 'map', _('نقشه')
        CUSTOM = 'custom', _('سفارشی')

    dashboard = models.ForeignKey(
        Dashboard,
        on_delete=models.CASCADE,
        related_name='widgets',
        verbose_name=_('داشبورد')
    )

    title = models.CharField(_('عنوان'), max_length=100)
    widget_type = models.CharField(
        _('نوع ویجت'),
        max_length=20,
        choices=WidgetType.choices,
        default=WidgetType.CHART
    )

    # مرتبط با نوع گزارش
    category = models.CharField(
        _('دسته‌بندی'),
        max_length=20,
        choices=Report.ReportCategory.choices,
        default=Report.ReportCategory.SUMMARY
    )

    # تنظیمات ویجت به صورت JSON
    settings = models.JSONField(
        _('تنظیمات'),
        null=True,
        blank=True
    )

    # موقعیت در داشبورد
    position_x = models.IntegerField(_('موقعیت X'), default=0)
    position_y = models.IntegerField(_('موقعیت Y'), default=0)
    width = models.IntegerField(_('عرض'), default=1)
    height = models.IntegerField(_('ارتفاع'), default=1)

    created_at = models.DateTimeField(_('تاریخ ایجاد'), auto_now_add=True)
    updated_at = models.DateTimeField(_('آخرین به‌روزرسانی'), auto_now=True)

    class Meta:
        verbose_name = _('ویجت داشبورد')
        verbose_name_plural = _('ویجت‌های داشبورد')
        ordering = ['position_y', 'position_x']
