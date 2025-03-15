from rest_framework import serializers
from ..models import ParkingLot, ParkingZone, ParkingSlot, ParkingSession, ParkingReservation
from django.utils.translation import gettext_lazy as _


class ParkingLotSerializer(serializers.ModelSerializer):
    """سریالایزر پارکینگ"""

    available_capacity = serializers.ReadOnlyField()
    occupancy_percentage = serializers.ReadOnlyField()

    class Meta:
        model = ParkingLot
        fields = [
            'id', 'name', 'address', 'latitude', 'longitude', 'total_capacity',
            'current_occupancy', 'available_capacity', 'occupancy_percentage',
            'hourly_rate', 'daily_rate', 'monthly_rate', 'has_cctv', 'has_elevator',
            'has_electric_charger', 'indoor', 'opening_time', 'closing_time', 'is_24h',
            'manager', 'created_at', 'updated_at'
        ]
        read_only_fields = ['current_occupancy', 'created_at', 'updated_at']

    def validate(self, data):
        if not data.get('is_24h') and (not data.get('opening_time') or not data.get('closing_time')):
            raise serializers.ValidationError(_("Opening and closing times must be provided for non-24h parking lots."))
        return data


class ParkingZoneSerializer(serializers.ModelSerializer):
    """سریالایزر زون پارکینگ"""

    available_capacity = serializers.ReadOnlyField()
    occupancy_percentage = serializers.ReadOnlyField()

    class Meta:
        model = ParkingZone
        fields = [
            'id', 'parking_lot', 'name', 'capacity', 'current_occupancy',
            'available_capacity', 'occupancy_percentage', 'zone_type',
            'floor', 'price_multiplier', 'created_at', 'updated_at'
        ]
        read_only_fields = ['current_occupancy', 'created_at', 'updated_at']


class ParkingSpotSerializer(serializers.ModelSerializer):
    """سریالایزر جای پارک"""

    is_available = serializers.ReadOnlyField()

    class Meta:
        model = ParkingSlot
        fields = [
            'id', 'zone', 'spot_number', 'status', 'is_available',
            'is_covered', 'has_charger', 'length', 'width',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class ParkingSessionSerializer(serializers.ModelSerializer):
    """سریالایزر جلسه پارک"""

    duration = serializers.ReadOnlyField()
    is_active = serializers.ReadOnlyField()

    class Meta:
        model = ParkingSession
        fields = [
            'id', 'parking_lot', 'spot', 'vehicle', 'user', 'entry_time',
            'exit_time', 'entry_image', 'exit_image', 'status', 'duration',
            'is_active', 'amount_due', 'is_paid', 'payment',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['entry_time', 'amount_due', 'created_at', 'updated_at']


class ParkingReservationSerializer(serializers.ModelSerializer):
    """سریالایزر رزرو پارکینگ"""

    duration = serializers.ReadOnlyField()
    is_active = serializers.ReadOnlyField()

    class Meta:
        model = ParkingReservation
        fields = [
            'id', 'parking_lot', 'spot', 'user', 'vehicle', 'start_time',
            'end_time', 'status', 'duration', 'is_active', 'amount',
            'is_paid', 'payment', 'reminder_sent', 'created_at', 'updated_at'
        ]
        read_only_fields = ['amount', 'created_at', 'updated_at']

    def validate(self, data):
        # بررسی تداخل زمانی با رزروهای دیگر
        if data.get('spot') and data.get('start_time') and data.get('end_time'):
            overlapping_reservations = ParkingReservation.objects.filter(
                spot=data['spot'],
                status__in=['pending', 'confirmed'],
                start_time__lt=data['end_time'],
                end_time__gt=data['start_time']
            ).exclude(id=self.instance.id if self.instance else None)

            if overlapping_reservations.exists():
                raise serializers.ValidationError(_("This spot is already reserved for this time period."))

        # بررسی تاریخ شروع و پایان
        if data.get('start_time') and data.get('end_time') and data['start_time'] >= data['end_time']:
            raise serializers.ValidationError(_("End time must be after start time."))

        return data