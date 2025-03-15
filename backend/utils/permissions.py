from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """
    مجوز دسترسی فقط برای مدیران سیستم
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_admin


class IsParkingManager(permissions.BasePermission):
    """
    مجوز دسترسی فقط برای مدیران پارکینگ
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_parking_manager


class IsCustomer(permissions.BasePermission):
    """
    مجوز دسترسی فقط برای مشتریان
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_customer


class IsParkingLotManager(permissions.BasePermission):
    """
    مجوز دسترسی فقط برای مدیر همان پارکینگ
    """

    def has_object_permission(self, request, view, obj):
        return request.user and request.user.is_authenticated and obj.manager == request.user