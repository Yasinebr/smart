from rest_framework import serializers
from ..models import (
    ParkingLocation, ParkingLot, ParkingZone, ParkingSlot,
    ParkingSession, ParkingRate, ParkingReservation, ParkingSubscription
)
from django.utils.translation import gettext_lazy as _


class ParkingLocationSerializer(serializers.ModelSerializer):
    """سریالایزر مکان پارکینگ"""

    available_capacity = serializers.ReadOnlyField()

    class Meta:
        model = ParkingLocation
        fields = [
            'id', 'name', 'address', 'latitude', 'longitude',
            'total_capacity', 'parking_type', 'is_active',
            'created_at', 'manager', 'available_capacity'
        ]
        read_only_fields = ['created_at']

    def validate(self, data):
        # بررسی ظرفیت کل
        if 'total_capacity' in data and data['total_capacity'] <= 0:
            raise serializers.ValidationError(_("Total capacity must be greater than zero."))
        return data


class ParkingSlotSerializer(serializers.ModelSerializer):
    """سریالایزر جایگاه پارک"""

    parking_name = serializers.CharField(source='parking.name', read_only=True)
    is_available = serializers.SerializerMethodField()

    class Meta:
        model = ParkingSlot
        fields = [
            'id', 'parking', 'parking_name', 'slot_number', 'status',
            'is_available'
        ]

    def get_is_available(self, obj):
        return obj.status == ParkingSlot.SlotStatus.AVAILABLE


class ParkingRateSerializer(serializers.ModelSerializer):
    """سریالایزر تعرفه پارکینگ"""

    parking_name = serializers.CharField(source='parking.name', read_only=True)
    created_by_email = serializers.EmailField(source='created_by.email', read_only=True)
    vehicle_type_display = serializers.CharField(source='get_vehicle_type_display', read_only=True)

    class Meta:
        model = ParkingRate
        fields = [
            'id', 'parking', 'parking_name', 'name', 'hourly_rate',
            'daily_rate', 'monthly_rate', 'vehicle_type', 'vehicle_type_display',
            'is_active', 'effective_from', 'effective_to',
            'created_by', 'created_by_email'
        ]
        read_only_fields = ['effective_from']

    def validate(self, data):
        # بررسی نرخ‌ها
        if 'hourly_rate' in data and data['hourly_rate'] <= 0:
            raise serializers.ValidationError(_("Hourly rate must be greater than zero."))

        # بررسی تاریخ شروع و پایان اعتبار
        if data.get('effective_to') and 'effective_from' in data and data['effective_from'] >= data['effective_to']:
            raise serializers.ValidationError(_("Effective to date must be after effective from date."))

        return data


class ParkingLotSerializer(serializers.ModelSerializer):
    """سریالایزر پارکینگ"""

    available_capacity = serializers.ReadOnlyField()
    occupancy_percentage = serializers.ReadOnlyField()
    manager_email = serializers.EmailField(source='manager.email', read_only=True)

    class Meta:
        model = ParkingLot
        fields = [
            'id', 'name', 'address', 'latitude', 'longitude',
            'total_capacity', 'current_occupancy', 'available_capacity',
            'occupancy_percentage', 'hourly_rate', 'daily_rate', 'monthly_rate',
            'has_cctv', 'has_elevator', 'has_electric_charger', 'indoor',
            'opening_time', 'closing_time', 'is_24h', 'manager', 'manager_email',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['current_occupancy', 'created_at', 'updated_at']

    def validate(self, data):
        # بررسی ساعات کاری برای پارکینگ‌های غیر ۲۴ ساعته
        if not data.get('is_24h') and (not data.get('opening_time') or not data.get('closing_time')):
            raise serializers.ValidationError(_("Opening and closing times must be provided for non-24h parking lots."))

        # بررسی ظرفیت کل
        if 'total_capacity' in data and data['total_capacity'] <= 0:
            raise serializers.ValidationError(_("Total capacity must be greater than zero."))

        return data


class ParkingZoneSerializer(serializers.ModelSerializer):
    """سریالایزر زون پارکینگ"""

    parking_lot_name = serializers.CharField(source='parking_lot.name', read_only=True)
    available_capacity = serializers.ReadOnlyField()
    occupancy_percentage = serializers.ReadOnlyField()
    zone_type_display = serializers.CharField(source='get_zone_type_display', read_only=True)

    class Meta:
        model = ParkingZone
        fields = [
            'id', 'parking_lot', 'parking_lot_name', 'name', 'capacity',
            'current_occupancy', 'available_capacity', 'occupancy_percentage',
            'zone_type', 'zone_type_display', 'floor', 'price_multiplier',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['current_occupancy', 'created_at', 'updated_at']

    def validate(self, data):
        # بررسی ظرفیت
        if 'capacity' in data and data['capacity'] <= 0:
            raise serializers.ValidationError(_("Capacity must be greater than zero."))

        # بررسی ضریب قیمت
        if 'price_multiplier' in data and data['price_multiplier'] <= 0:
            raise serializers.ValidationError(_("Price multiplier must be greater than zero."))

        return data


class ParkingSessionSerializer(serializers.ModelSerializer):
    """سریالایزر جلسه پارک"""

    parking_lot_name = serializers.CharField(source='parking_lot.name', read_only=True)
    spot_number = serializers.CharField(source='spot.slot_number', read_only=True)
    vehicle_plate = serializers.CharField(source='vehicle.plate', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    duration = serializers.SerializerMethodField()
    is_active = serializers.ReadOnlyField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = ParkingSession
        fields = [
            'id', 'parking_lot', 'parking_lot_name', 'spot', 'spot_number',
            'vehicle', 'vehicle_plate', 'user', 'user_email', 'entry_time',
            'exit_time', 'entry_image', 'exit_image', 'status', 'status_display',
            'amount_due', 'is_paid', 'payment', 'duration', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['entry_time', 'amount_due', 'created_at', 'updated_at']

    def get_duration(self, obj):
        if obj.duration:
            hours, remainder = divmod(obj.duration.total_seconds(), 3600)
            minutes, seconds = divmod(remainder, 60)
            return f"{int(hours)}h {int(minutes)}m"
        return None


class ParkingReservationSerializer(serializers.ModelSerializer):
    """سریالایزر رزرو پارکینگ"""

    # تغییر از parking_lot به parking برای مطابقت با مدل ParkingReservation
    parking_name = serializers.CharField(source='parking.name', read_only=True)
    spot_number = serializers.CharField(source='spot.slot_number', read_only=True, allow_null=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    vehicle_plate = serializers.CharField(source='vehicle.plate', read_only=True)
    duration = serializers.SerializerMethodField()
    is_active = serializers.ReadOnlyField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = ParkingReservation
        fields = [
            'id', 'parking', 'parking_name', 'parking_slot', 'spot_number',  # تغییر از parking_lot به parking
            'user', 'user_email', 'vehicle', 'vehicle_plate',
            'reservation_start', 'reservation_end',  # تغییر نام فیلدها مطابق با مدل
            'status', 'status_display', 'amount_paid', 'is_active',  # تطبیق با مدل
            'created_at', 'duration'  # اضافه کردن duration به fields
        ]
        read_only_fields = ['amount_paid', 'created_at']  # تغییر از amount به amount_paid

    def get_duration(self, obj):
        if hasattr(obj, 'duration'):
            hours, remainder = divmod(obj.duration.total_seconds(), 3600)
            minutes, seconds = divmod(remainder, 60)
            return f"{int(hours)}h {int(minutes)}m"
        return None

    def validate(self, data):
        # بررسی تاریخ شروع و پایان
        if data.get('reservation_start') and data.get('reservation_end') and data['reservation_start'] >= data[
            'reservation_end']:
            raise serializers.ValidationError(_("Reservation end time must be after start time."))

        # بررسی تداخل زمانی با رزروهای دیگر
        if data.get('spot') and data.get('reservation_start') and data.get('reservation_end'):
            overlapping_reservations = ParkingReservation.objects.filter(
                spot=data['spot'],
                status__in=['pending', 'confirmed'],
                reservation_start__lt=data['reservation_end'],
                reservation_end__gt=data['reservation_start']
            ).exclude(id=self.instance.id if self.instance else None)

            if overlapping_reservations.exists():
                raise serializers.ValidationError(_("This spot is already reserved for this time period."))

        return data

class ParkingSubscriptionSerializer(serializers.ModelSerializer):
    """سریالایزر اشتراک پارکینگ"""

    user_email = serializers.EmailField(source='user.email', read_only=True)
    parking_name = serializers.CharField(source='parking.name', read_only=True)
    vehicle_plate = serializers.CharField(source='vehicle.plate', read_only=True)
    subscription_type_display = serializers.CharField(source='get_subscription_type_display', read_only=True)

    class Meta:
        model = ParkingSubscription
        fields = [
            'id', 'user', 'user_email', 'parking', 'parking_name',
            'vehicle', 'vehicle_plate', 'subscription_type', 'subscription_type_display',
            'start_date', 'end_date', 'amount_paid', 'is_active'
        ]

    def validate(self, data):
        # بررسی تاریخ شروع و پایان
        if data.get('start_date') and data.get('end_date') and data['start_date'] >= data['end_date']:
            raise serializers.ValidationError(_("End date must be after start date."))

        # بررسی مبلغ پرداخت‌شده
        if 'amount_paid' in data and data['amount_paid'] <= 0:
            raise serializers.ValidationError(_("Amount paid must be greater than zero."))

        # بررسی اشتراک‌های فعال همپوشان برای یک خودرو
        if data.get('vehicle') and data.get('parking') and data.get('start_date') and data.get('end_date'):
            overlapping_subscriptions = ParkingSubscription.objects.filter(
                vehicle=data['vehicle'],
                parking=data['parking'],
                is_active=True,
                start_date__lt=data['end_date'],
                end_date__gt=data['start_date']
            ).exclude(id=self.instance.id if self.instance else None)

            if overlapping_subscriptions.exists():
                raise serializers.ValidationError(
                    _("An active subscription already exists for this vehicle and parking location during this period."))

        return data


# Nested serializers for detailed views
class ParkingLocationDetailSerializer(ParkingLocationSerializer):
    """سریالایزر جزئیات مکان پارکینگ"""

    parking_slots = ParkingSlotSerializer(many=True, read_only=True)
    parking_rates = ParkingRateSerializer(many=True, read_only=True)

    class Meta(ParkingLocationSerializer.Meta):
        fields = ParkingLocationSerializer.Meta.fields + ['parking_slots', 'parking_rates']


class ParkingLotDetailSerializer(ParkingLotSerializer):
    """سریالایزر جزئیات پارکینگ"""

    zones = ParkingZoneSerializer(many=True, read_only=True)
    sessions = serializers.SerializerMethodField()
    reservations = serializers.SerializerMethodField()

    class Meta(ParkingLotSerializer.Meta):
        fields = ParkingLotSerializer.Meta.fields + ['zones', 'sessions', 'reservations']

    def get_sessions(self, obj):
        # فقط جلسات فعال را برمی‌گرداند تا از بازگرداندن حجم زیادی داده جلوگیری شود
        active_sessions = obj.sessions.filter(status='active')  # تغییر به مقدار متناسب با مدل
        return ParkingSessionSerializer(active_sessions, many=True).data

    def get_reservations(self, obj):
        # فقط رزروهای در انتظار و تایید شده را برمی‌گرداند
        active_reservations = obj.reservations.filter(
            status__in=['pending', 'confirmed']  # تغییر به مقدار متناسب با مدل
        )
        return ParkingReservationSerializer(active_reservations, many=True).data