# apps/vehicles/admin.py

from django.contrib import admin
from django.utils.translation import gettext_lazy as _

from .models import Vehicle, VehicleEntry, ParkingSession, VehicleCategory


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    """تنظیمات ادمین برای مدل خودرو"""
    list_display = ('license_plate', 'make', 'model', 'vehicle_type', 'color', 'is_verified')
    list_filter = ('vehicle_type', 'is_verified', 'created_at')
    search_fields = ('license_plate', 'make', 'model')
    date_hierarchy = 'created_at'

    fieldsets = (
        (_('اطلاعات خودرو'), {
            'fields': ('license_plate', 'vehicle_type', 'make', 'model', 'color', 'year')
        }),
        (_('وضعیت تأیید'), {
            'fields': ('is_verified', 'verification_date'),
        }),
        (_('تصاویر'), {
            'fields': ('vehicle_image', 'license_plate_image'),
            'classes': ('collapse',),
        }),
    )

    readonly_fields = ('created_at', 'updated_at')


@admin.register(VehicleEntry)
class VehicleEntryAdmin(admin.ModelAdmin):
    """تنظیمات ادمین برای مدل ورود و خروج خودرو"""
    list_display = ('vehicle', 'parking', 'entry_type', 'timestamp', 'recorded_by')
    list_filter = ('entry_type', 'parking', 'timestamp')
    search_fields = ('vehicle__license_plate', 'parking__name', 'notes')
    date_hierarchy = 'timestamp'

    fieldsets = (
        (_('اطلاعات ورود/خروج'), {
            'fields': ('vehicle', 'parking', 'entry_type', 'notes', 'recorded_by')
        }),
        (_('داده‌های هوش مصنوعی'), {
            'fields': ('captured_image', 'plate_detection_data', 'face_detection_data'),
            'classes': ('collapse',),
        }),
    )

    readonly_fields = ('timestamp',)


@admin.register(ParkingSession)
class ParkingSessionAdmin(admin.ModelAdmin):
    """تنظیمات ادمین برای مدل جلسه پارک"""
    list_display = ('vehicle', 'parking', 'entry_time', 'exit_time', 'status', 'calculated_amount', 'calculated_duration')
    list_filter = ('status', 'parking', 'entry_time')
    search_fields = ('vehicle__license_plate', 'parking__name', 'notes')
    date_hierarchy = 'entry_time'

    fieldsets = (
        (_('اطلاعات جلسه'), {
            'fields': ('vehicle', 'parking', 'entry_time', 'exit_time', 'status', 'notes')
        }),
        (_('اشتراک و رزرو'), {
            'fields': ('reservation', 'subscription', 'parking_slot'),
            'classes': ('collapse',),
        }),
        (_('محاسبات'), {
            'fields': ('calculated_amount', 'calculated_duration'),
        }),
    )


@admin.register(VehicleCategory)
class VehicleCategoryAdmin(admin.ModelAdmin):
    """تنظیمات ادمین برای مدل دسته‌بندی خودرو"""
    list_display = ('name', 'price_multiplier', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'description')

    fieldsets = (
        (_('اطلاعات دسته‌بندی'), {
            'fields': ('name', 'description', 'price_multiplier')
        }),
        (_('انواع خودروی مجاز'), {
            'fields': ('allowed_vehicle_types',),
        }),
    )

    readonly_fields = ('created_at', 'updated_at')