from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from .serializers import VehicleSerializer, VehicleCategorySerializer
from ..models import Vehicle, VehicleCategory
from apps.users.models import UserVehicle
from utils.permissions import IsAdmin, IsParkingManager


class VehicleViewSet(viewsets.ModelViewSet):
    """ویوست خودرو"""
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['vehicle_type', 'make', 'model', 'year', 'color', 'is_verified']
    search_fields = ['license_plate', 'make', 'model']
    ordering_fields = ['license_plate', 'make', 'model', 'year', 'created_at']

    def get_queryset(self):
        """فیلتر کردن خودروها بر اساس نقش کاربر"""
        user = self.request.user
        if user.is_admin or user.is_parking_manager:
            return Vehicle.objects.all()
        else:
            # کاربران عادی فقط خودروهای خود را می‌بینند
            user_vehicles = UserVehicle.objects.filter(user=user).values_list('vehicle_id', flat=True)
            return Vehicle.objects.filter(id__in=user_vehicles)

    def perform_create(self, serializer):
        """ذخیره خودرو و ایجاد رابطه با کاربر"""
        vehicle = serializer.save()
        # ایجاد رابطه با کاربر فعلی
        if not self.request.user.is_admin:
            UserVehicle.objects.create(
                user=self.request.user,
                vehicle=vehicle,
                is_primary=not UserVehicle.objects.filter(user=self.request.user).exists()
            )

    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """تأیید خودرو توسط مدیر سیستم"""
        vehicle = self.get_object()

        # بررسی مجوز دسترسی
        if not (request.user.is_admin or request.user.is_parking_manager):
            return Response(
                {'detail': _('You do not have permission to verify vehicles.')},
                status=status.HTTP_403_FORBIDDEN
            )

        # به‌روزرسانی وضعیت تأیید
        vehicle.is_verified = True
        vehicle.verification_date = timezone.now()
        vehicle.save()

        return Response(VehicleSerializer(vehicle).data)


class VehicleCategoryViewSet(viewsets.ModelViewSet):
    """ویوست دسته‌بندی خودرو"""
    queryset = VehicleCategory.objects.all()
    serializer_class = VehicleCategorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'price_multiplier', 'created_at']

    def get_permissions(self):
        """تعیین مجوزهای دسترسی بر اساس عملیات"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdmin()]
        return super().get_permissions()