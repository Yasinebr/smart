# apps/users/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from .models import User, Profile, Wallet, WalletTransaction, UserVehicle


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """تنظیمات ادمین برای مدل کاربر سفارشی"""
    list_display = ('email', 'first_name', 'last_name', 'role', 'is_active', 'is_staff')
    list_filter = ('role', 'is_active', 'is_staff', 'created_at')
    search_fields = ('email', 'first_name', 'last_name', 'phone_number')
    ordering = ('-created_at',)

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': (
        'first_name', 'last_name', 'phone_number', 'profile_image', 'national_id', 'date_of_birth', 'address')}),
        (_('Permissions'), {
            'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        (_('Important dates'), {'fields': ('last_login', 'created_at', 'updated_at')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'role', 'is_active', 'is_staff'),
        }),
    )

    readonly_fields = ('created_at', 'updated_at')


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    """تنظیمات ادمین برای مدل پروفایل"""
    list_display = ('user', 'national_id', 'has_face_image')
    list_filter = ('user__role',)
    search_fields = ('user__email', 'user__first_name', 'user__last_name', 'national_id')

    def has_face_image(self, obj):
        return bool(obj.face_image)

    has_face_image.boolean = True
    has_face_image.short_description = _('دارای تصویر چهره')


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    """تنظیمات ادمین برای مدل کیف پول"""
    list_display = ('user', 'balance', 'created_at')
    list_filter = ('user__role',)
    search_fields = ('user__email', 'user__first_name', 'user__last_name')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(WalletTransaction)
class WalletTransactionAdmin(admin.ModelAdmin):
    """تنظیمات ادمین برای مدل تراکنش کیف پول"""
    list_display = ('wallet', 'transaction_type', 'amount', 'status', 'timestamp')
    list_filter = ('transaction_type', 'status', 'timestamp')
    search_fields = ('wallet__user__email', 'description')
    date_hierarchy = 'timestamp'


@admin.register(UserVehicle)
class UserVehicleAdmin(admin.ModelAdmin):
    """تنظیمات ادمین برای مدل خودروهای کاربر"""
    list_display = ('user', 'vehicle', 'is_primary', 'created_at')
    list_filter = ('is_primary', 'created_at')
    search_fields = ('user__email', 'vehicle__plate_number')
    readonly_fields = ('created_at', 'updated_at')