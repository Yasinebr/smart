# apps/payments/admin.py

from django.contrib import admin
from django.utils.translation import gettext_lazy as _

from .models import PaymentGateway, Payment, Invoice, InvoiceItem, Subscription


@admin.register(PaymentGateway)
class PaymentGatewayAdmin(admin.ModelAdmin):
    """تنظیمات ادمین برای مدل درگاه پرداخت"""
    list_display = ('name', 'gateway_type', 'is_active', 'created_at')
    list_filter = ('gateway_type', 'is_active', 'created_at')
    search_fields = ('name',)

    fieldsets = (
        (_('اطلاعات درگاه'), {
            'fields': ('name', 'gateway_type', 'is_active')
        }),
        (_('تنظیمات API'), {
            'fields': ('api_key', 'api_secret', 'config'),
            'classes': ('collapse',),
        }),
    )


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    """تنظیمات ادمین برای مدل پرداخت"""
    list_display = ('user', 'amount', 'payment_gateway', 'status', 'transaction_id', 'created_at')
    list_filter = ('status', 'payment_gateway', 'created_at')
    search_fields = ('user__email', 'transaction_id', 'payment_method')
    date_hierarchy = 'created_at'

    fieldsets = (
        (_('اطلاعات پرداخت'), {
            'fields': ('user', 'amount', 'payment_gateway', 'payment_method', 'status', 'payment_type')
        }),
        (_('شناسه‌ها'), {
            'fields': ('transaction_id',),
        }),
        (_('تاریخ‌ها'), {
            'fields': ('payment_date',),
        }),
    )

    readonly_fields = ('created_at', 'updated_at')


class InvoiceItemInline(admin.TabularInline):
    """اینلاین برای آیتم‌های فاکتور"""
    model = InvoiceItem
    extra = 1
    fields = ('title', 'quantity', 'unit_price', 'total_price', 'tax_percentage', 'tax_amount', 'discount_percentage',
              'discount_amount')


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    """تنظیمات ادمین برای مدل فاکتور"""
    list_display = ('invoice_number', 'get_user', 'get_amount', 'get_total_amount', 'get_status', 'created_at', 'get_payment_date')
    list_filter = ('payment__status', 'created_at', 'payment__payment_date')
    search_fields = ('invoice_number', 'payment__user__email')
    date_hierarchy = 'created_at'
    inlines = [InvoiceItemInline]

    fieldsets = (
        (_('اطلاعات فاکتور'), {
            'fields': ('invoice_number', 'payment', 'is_paid')
        }),
        (_('مبالغ'), {
            'fields': ('tax_amount', 'discount_amount'),
        }),
        (_('تاریخ‌ها'), {
            'fields': ('due_date',),
        }),
    )

    readonly_fields = ('created_at', 'updated_at')

    def get_user(self, obj):
        return obj.payment.user
    get_user.short_description = _('کاربر')
    get_user.admin_order_field = 'payment__user'

    def get_amount(self, obj):
        return obj.payment.amount
    get_amount.short_description = _('مبلغ')
    get_amount.admin_order_field = 'payment__amount'

    def get_total_amount(self, obj):
        return obj.total_amount
    get_total_amount.short_description = _('مبلغ نهایی')

    def get_status(self, obj):
        return obj.payment.get_status_display()
    get_status.short_description = _('وضعیت')
    get_status.admin_order_field = 'payment__status'

    def get_payment_date(self, obj):
        return obj.payment.payment_date
    get_payment_date.short_description = _('تاریخ پرداخت')
    get_payment_date.admin_order_field = 'payment__payment_date'


@admin.register(InvoiceItem)
class InvoiceItemAdmin(admin.ModelAdmin):
    """تنظیمات ادمین برای مدل آیتم فاکتور"""
    list_display = ('title', 'invoice', 'quantity', 'unit_price', 'total_price')
    list_filter = ('invoice__payment__status',)
    search_fields = ('title', 'description', 'invoice__invoice_number')


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    """تنظیمات ادمین برای مدل اشتراک"""
    list_display = ('user', 'subscription_type', 'period', 'start_date', 'end_date', 'is_active', 'amount')
    list_filter = ('subscription_type', 'period', 'is_active', 'auto_renew')
    search_fields = ('user__email',)
    date_hierarchy = 'start_date'

    fieldsets = (
        (_('اطلاعات اشتراک'), {
            'fields': ('user', 'subscription_type', 'period', 'is_active', 'auto_renew')
        }),
        (_('تاریخ‌ها'), {
            'fields': ('start_date', 'end_date'),
        }),
        (_('مالی'), {
            'fields': ('amount', 'payment'),
        }),
    )

    readonly_fields = ('created_at', 'updated_at')