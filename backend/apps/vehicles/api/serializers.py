from rest_framework import serializers
from ..models import Vehicle, VehicleCategory
from django.utils.translation import gettext_lazy as _
from utils.validators import validate_license_plate, validate_vehicle_year


class VehicleSerializer(serializers.ModelSerializer):
    """سریالایزر خودرو"""

    class Meta:
        model = Vehicle
        fields = [
            'id', 'license_plate', 'vehicle_type', 'make', 'model', 'year',
            'color', 'vehicle_image', 'license_plate_image', 'is_verified',
            'verification_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['is_verified', 'verification_date', 'created_at', 'updated_at']
        extra_kwargs = {
            'license_plate': {'validators': [validate_license_plate]},
            'year': {'validators': [validate_vehicle_year]},
        }


class VehicleCategorySerializer(serializers.ModelSerializer):
    """سریالایزر دسته‌بندی خودرو"""

    class Meta:
        model = VehicleCategory
        fields = [
            'id', 'name', 'description', 'price_multiplier',
            'allowed_vehicle_types', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']