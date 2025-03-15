# apps/parking/admin.py

from django.contrib import admin
from django.utils.translation import gettext_lazy as _

from .models import (
    ParkingLocation, ParkingSlot, ParkingRate,
    ParkingSubscription, ParkingReservation
)


@admin.register(ParkingLocation)
class ParkingLocationAdmin(admin.ModelAdmin):
    """تنظیمات ادمین برای مدل پارکینگ"""
    list_display = ('name', 'address', 'parking_type', 'total_capacity', 'available_capacity', 'manager', 'is_active')
    list_filter = ('parking_type', 'is_active', 'created_at')
    search_fields = ('name', 'address', 'manager__email')
    date_hierarchy = 'created_at'

    fieldsets = (
        (_('اطلاعات پایه'), {
            'fields': ('name', 'address', 'parking_type', 'total_capacity', 'is_active')
        }),
        (_('موقعیت جغرافیایی'), {
            'fields': ('latitude', 'longitude'),
            'classes': ('collapse',),
        }),
        (_('مدیریت'), {
            'fields': ('manager',)
        }),
    )


@admin.register(ParkingSlot)
class ParkingSlotAdmin(admin.ModelAdmin):
    """تنظیمات ادمین برای مدل جایگاه پارک"""
    list_display = ('parking', 'slot_number', 'status')
    list_filter = ('status', 'parking')
    search_fields = ('slot_number', 'parking__name')


@admin.register(ParkingRate)
class ParkingRateAdmin(admin.ModelAdmin):
    """تنظیمات ادمین برای مدل تعرفه پارکینگ"""
    list_display = ('name', 'parking', 'vehicle_type', 'hourly_rate', 'daily_rate', 'monthly_rate', 'is_active')
    list_filter = ('vehicle_type', 'is_active', 'parking')
    search_fields = ('name', 'parking__name')
    date_hierarchy = 'effective_from'


@admin.register(ParkingSubscription)
class ParkingSubscriptionAdmin(admin.ModelAdmin):
    """تنظیمات ادمین برای مدل اشتراک پارکینگ"""
    list_display = ('user', 'parking', 'vehicle', 'subscription_type', 'start_date', 'end_date', 'is_active')
    list_filter = ('subscription_type', 'is_active', 'start_date', 'end_date')
    search_fields = ('user__email', 'parking__name', 'vehicle__license_plate')
    date_hierarchy = 'start_date'


@admin.register(ParkingReservation)
class ParkingReservationAdmin(admin.ModelAdmin):
    """تنظیمات ادمین برای مدل رزرو پارکینگ"""
    list_display = ('user', 'parking', 'vehicle', 'reservation_start', 'reservation_end', 'status')
    list_filter = ('status', 'reservation_start', 'created_at')
    search_fields = ('user__email', 'parking__name', 'vehicle__license_plate')
    date_hierarchy = 'reservation_start'