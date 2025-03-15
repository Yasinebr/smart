# apps/reports/admin.py

from django.contrib import admin
from django.utils.translation import gettext_lazy as _

from .models import (
    Report, ReportSchedule, ParkingReport, FinancialReport,
    DailyReport, MonthlyReport, Dashboard, DashboardWidget
)


class ReportBaseAdmin(admin.ModelAdmin):
    """کلاس پایه برای ادمین گزارش‌ها"""
    list_display = ('report_type', 'start_date', 'end_date', 'status', 'created_by', 'created_at')
    list_filter = ('report_type', 'status', 'created_at')
    search_fields = ('created_by__email',)
    date_hierarchy = 'created_at'

    fieldsets = (
        (_('اطلاعات گزارش'), {
            'fields': ('report_type', 'start_date', 'end_date', 'created_by')
        }),
        (_('وضعیت'), {
            'fields': ('status', 'file'),
        }),
        (_('داده‌های گزارش'), {
            'fields': ('data',),
            'classes': ('collapse',),
        }),
    )

    readonly_fields = ('created_at', 'updated_at')


@admin.register(Report)
class ReportAdmin(ReportBaseAdmin):
    """تنظیمات ادمین برای مدل گزارش پایه"""
    pass


@admin.register(ParkingReport)
class ParkingReportAdmin(ReportBaseAdmin):
    """تنظیمات ادمین برای مدل گزارش پارکینگ"""
    list_display = ('parking_lot', 'parking_report_type', 'report_type', 'start_date', 'end_date', 'status', 'created_at')
    list_filter = ('parking_report_type', 'report_type', 'status', 'created_at')
    search_fields = ('parking_lot__name', 'created_by__email')

    fieldsets = (
        (_('اطلاعات گزارش پارکینگ'), {
            'fields': ('parking_lot', 'parking_report_type')
        }),
        (_('اطلاعات گزارش پایه'), {
            'fields': ('report_type', 'start_date', 'end_date', 'created_by', 'status')
        }),
        (_('داده‌های گزارش'), {
            'fields': ('data', 'file'),
            'classes': ('collapse',),
        }),
    )


@admin.register(FinancialReport)
class FinancialReportAdmin(ReportBaseAdmin):
    """تنظیمات ادمین برای مدل گزارش مالی"""
    list_display = ('financial_report_type', 'report_type', 'start_date', 'end_date', 'total_revenue', 'total_expenses', 'net_profit', 'status')
    list_filter = ('financial_report_type', 'report_type', 'status', 'created_at')
    search_fields = ('created_by__email',)

    fieldsets = (
        (_('اطلاعات گزارش مالی'), {
            'fields': ('financial_report_type', 'total_revenue', 'total_expenses', 'net_profit')
        }),
        (_('اطلاعات گزارش پایه'), {
            'fields': ('report_type', 'start_date', 'end_date', 'created_by', 'status')
        }),
        (_('داده‌های گزارش'), {
            'fields': ('data', 'file'),
            'classes': ('collapse',),
        }),
    )


@admin.register(DailyReport)
class DailyReportAdmin(admin.ModelAdmin):
    """تنظیمات ادمین برای مدل گزارش روزانه"""
    list_display = ('date', 'total_revenue', 'total_sessions', 'created_at')
    list_filter = ('date', 'created_at')
    search_fields = ('date',)
    date_hierarchy = 'date'

    fieldsets = (
        (_('اطلاعات گزارش روزانه'), {
            'fields': ('date', 'total_revenue', 'total_sessions')
        }),
    )

    readonly_fields = ('created_at', 'updated_at')


@admin.register(MonthlyReport)
class MonthlyReportAdmin(admin.ModelAdmin):
    """تنظیمات ادمین برای مدل گزارش ماهانه"""
    list_display = ('year', 'month', 'total_revenue', 'total_sessions', 'average_session_duration', 'created_at')
    list_filter = ('year', 'month', 'created_at')
    search_fields = ('year', 'month')

    fieldsets = (
        (_('اطلاعات گزارش ماهانه'), {
            'fields': ('year', 'month', 'total_revenue', 'total_sessions', 'average_session_duration')
        }),
    )

    readonly_fields = ('created_at', 'updated_at')


@admin.register(ReportSchedule)
class ReportScheduleAdmin(admin.ModelAdmin):
    """تنظیمات ادمین برای مدل زمان‌بندی گزارش"""
    list_display = ('name', 'frequency', 'report_type', 'category', 'parking', 'time', 'is_active')
    list_filter = ('frequency', 'report_type', 'category', 'is_active')
    search_fields = ('name', 'description', 'parking__name')
    filter_horizontal = ('recipients',)

    fieldsets = (
        (_('اطلاعات زمان‌بندی'), {
            'fields': ('name', 'description', 'frequency', 'is_active')
        }),
        (_('زمان اجرا'), {
            'fields': ('day_of_week', 'day_of_month', 'time'),
        }),
        (_('نوع گزارش'), {
            'fields': ('report_type', 'category', 'parking'),
        }),
        (_('دریافت‌کنندگان'), {
            'fields': ('recipients', 'created_by'),
        }),
    )


@admin.register(Dashboard)
class DashboardAdmin(admin.ModelAdmin):
    """تنظیمات ادمین برای مدل داشبورد"""
    list_display = ('name', 'owner', 'parking', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('name', 'description', 'owner__email', 'parking__name')
    date_hierarchy = 'created_at'

    fieldsets = (
        (_('اطلاعات داشبورد'), {
            'fields': ('name', 'description', 'owner', 'parking')
        }),
        (_('تنظیمات'), {
            'fields': ('settings',),
            'classes': ('collapse',),
        }),
    )


class DashboardWidgetInline(admin.TabularInline):
    """اینلاین برای ویجت‌های داشبورد"""
    model = DashboardWidget
    extra = 1
    fields = ('title', 'widget_type', 'category', 'position_x', 'position_y', 'width', 'height')


# اضافه کردن اینلاین به ادمین داشبورد
DashboardAdmin.inlines = [DashboardWidgetInline]


@admin.register(DashboardWidget)
class DashboardWidgetAdmin(admin.ModelAdmin):
    """تنظیمات ادمین برای مدل ویجت داشبورد"""
    list_display = ('title', 'dashboard', 'widget_type', 'category', 'position_x', 'position_y', 'width', 'height')
    list_filter = ('widget_type', 'category', 'created_at')
    search_fields = ('title', 'dashboard__name')

    fieldsets = (
        (_('اطلاعات ویجت'), {
            'fields': ('dashboard', 'title', 'widget_type', 'category')
        }),
        (_('موقعیت و اندازه'), {
            'fields': ('position_x', 'position_y', 'width', 'height'),
        }),
        (_('تنظیمات'), {
            'fields': ('settings',),
            'classes': ('collapse',),
        }),
    )