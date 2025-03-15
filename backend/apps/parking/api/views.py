from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from .serializers import (
    ParkingLotSerializer,
    ParkingZoneSerializer,
    ParkingSlotSerializer,
    ParkingSessionSerializer,
    ParkingReservationSerializer
)
from ..models import (
    ParkingLot,
    ParkingZone,
    ParkingSlot,
    ParkingSession,
    ParkingReservation
)
from utils.permissions import IsAdmin, IsParkingManager, IsParkingLotManager
from utils.exceptions import ParkingFullError, ParkingSpotUnavailableError, ReservationConflictError
from apps.vehicles.models import Vehicle
from apps.ai.license_plate.processors import LicensePlateProcessor


class ParkingLotViewSet(viewsets.ModelViewSet):
    """ویوست پارکینگ"""
    queryset = ParkingLot.objects.all()
    serializer_class = ParkingLotSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['name', 'indoor', 'has_cctv', 'has_elevator', 'has_electric_charger', 'is_24h']
    search_fields = ['name', 'address']
    ordering_fields = ['name', 'total_capacity', 'current_occupancy', 'created_at']

    def get_permissions(self):
        """تعیین مجوزهای دسترسی بر اساس عملیات"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdmin()]
        return super().get_permissions()

    @action(detail=True, methods=['get'])
    def zones(self, request, pk=None):
        """گرفتن زون‌های یک پارکینگ"""
        parking_lot = self.get_object()
        zones = ParkingZone.objects.filter(parking_lot=parking_lot)
        serializer = ParkingZoneSerializer(zones, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def available_spots(self, request, pk=None):
        """گرفتن جاهای پارک آزاد یک پارکینگ"""
        parking_lot = self.get_object()
        available_spots = ParkingSlot.objects.filter(
            zone__parking_lot=parking_lot,
            status=ParkingSlot.AVAILABLE
        )
        serializer = ParkingSlotSerializer(available_spots, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def sessions(self, request, pk=None):
        """گرفتن جلسات پارک یک پارکینگ"""
        parking_lot = self.get_object()

        # بررسی مجوز دسترسی
        if not (request.user.is_admin or (parking_lot.manager == request.user)):
            return Response(
                {'detail': _('You do not have permission to view these sessions.')},
                status=status.HTTP_403_FORBIDDEN
            )

        sessions = ParkingSession.objects.filter(parking_lot=parking_lot)
        serializer = ParkingSessionSerializer(sessions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def reservations(self, request, pk=None):
        """گرفتن رزروهای یک پارکینگ"""
        parking_lot = self.get_object()

        # بررسی مجوز دسترسی
        if not (request.user.is_admin or (parking_lot.manager == request.user)):
            return Response(
                {'detail': _('You do not have permission to view these reservations.')},
                status=status.HTTP_403_FORBIDDEN
            )

        reservations = ParkingReservation.objects.filter(parking_lot=parking_lot)
        serializer = ParkingReservationSerializer(reservations, many=True)
        return Response(serializer.data)


class ParkingZoneViewSet(viewsets.ModelViewSet):
    """ویوست زون پارکینگ"""
    queryset = ParkingZone.objects.all()
    serializer_class = ParkingZoneSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['parking_lot', 'zone_type', 'floor']
    ordering_fields = ['name', 'capacity', 'current_occupancy', 'price_multiplier']

    def get_permissions(self):
        """تعیین مجوزهای دسترسی بر اساس عملیات"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            # نیاز به مجوز مدیر سیستم یا مدیر پارکینگ
            return [IsAuthenticated(), (IsAdmin() | IsParkingManager())]
        return super().get_permissions()

    @action(detail=True, methods=['get'])
    def spots(self, request, pk=None):
        """گرفتن جاهای پارک یک زون"""
        zone = self.get_object()
        spots = ParkingSlot.objects.filter(zone=zone)
        serializer = ParkingSlotSerializer(spots, many=True)
        return Response(serializer.data)


class ParkingSpotViewSet(viewsets.ModelViewSet):
    """ویوست جای پارک"""
    queryset = ParkingSlot.objects.all()
    serializer_class = ParkingSlotSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['zone', 'status', 'is_covered', 'has_charger']
    ordering_fields = ['spot_number', 'zone']

    def get_permissions(self):
        """تعیین مجوزهای دسترسی بر اساس عملیات"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            # نیاز به مجوز مدیر سیستم یا مدیر پارکینگ
            return [IsAuthenticated(), (IsAdmin() | IsParkingManager())]
        return super().get_permissions()

    @action(detail=True, methods=['post'])
    def change_status(self, request, pk=None):
        """تغییر وضعیت جای پارک"""
        spot = self.get_object()

        # بررسی مجوز دسترسی
        parking_lot_manager = spot.zone.parking_lot.manager
        if not (request.user.is_admin or (parking_lot_manager == request.user)):
            return Response(
                {'detail': _('You do not have permission to change this spot\'s status.')},
                status=status.HTTP_403_FORBIDDEN
            )

        status_value = request.data.get('status')
        if not status_value or status_value not in [choice[0] for choice in ParkingSlot.STATUS_CHOICES]:
            return Response(
                {'detail': _('Invalid status value.')},
                status=status.HTTP_400_BAD_REQUEST
            )

        # بررسی آیا وضعیت جدید مجاز است
        if spot.status != status_value:
            # اگر جای پارک رزرو یا اشغال شده است، نمی‌توان آن را به راحتی تغییر داد
            if spot.status in [ParkingSlot.RESERVED, ParkingSlot.OCCUPIED]:
                # بررسی رزروها و جلسات فعال
                active_sessions = ParkingSession.objects.filter(
                    spot=spot,
                    status=ParkingSession.ACTIVE
                ).exists()

                active_reservations = ParkingReservation.objects.filter(
                    spot=spot,
                    status__in=[ParkingReservation.PENDING, ParkingReservation.CONFIRMED]
                ).exists()

                if active_sessions or active_reservations:
                    return Response(
                        {'detail': _('This spot has active sessions or reservations. Cannot change status.')},
                        status=status.HTTP_400_BAD_REQUEST
                    )

        # تغییر وضعیت
        spot.status = status_value
        spot.save()

        # به‌روزرسانی تعداد جاهای اشغال شده در زون و پارکینگ
        self._update_occupancy_counters(spot.zone.id)

        return Response(ParkingSlotSerializer(spot).data)

    def _update_occupancy_counters(self, zone_id):
        """به‌روزرسانی شمارنده‌های اشغال بر اساس وضعیت جاهای پارک"""
        zone = ParkingZone.objects.get(id=zone_id)

        # شمارش جاهای اشغال شده در زون
        occupied_count = ParkingSlot.objects.filter(
            zone=zone,
            status__in=[ParkingSlot.OCCUPIED, ParkingSlot.RESERVED]
        ).count()

        # به‌روزرسانی شمارنده زون
        zone.current_occupancy = occupied_count
        zone.save()

        # محاسبه مجموع اشغال‌های زون‌های پارکینگ
        parking_lot = zone.parking_lot
        total_occupied = ParkingZone.objects.filter(
            parking_lot=parking_lot
        ).values_list('current_occupancy', flat=True)

        # به‌روزرسانی شمارنده پارکینگ
        parking_lot.current_occupancy = sum(total_occupied)
        parking_lot.save()


class ParkingSessionViewSet(viewsets.ModelViewSet):
    """ویوست جلسه پارک"""
    queryset = ParkingSession.objects.all()
    serializer_class = ParkingSessionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['parking_lot', 'vehicle', 'user', 'status', 'is_paid']
    search_fields = ['vehicle__license_plate']
    ordering_fields = ['entry_time', 'exit_time', 'amount_due', 'created_at']

    def get_queryset(self):
        """فیلتر کردن جلسات بر اساس نقش کاربر"""
        user = self.request.user
        if user.is_admin:
            return ParkingSession.objects.all()
        elif user.is_parking_manager:
            return ParkingSession.objects.filter(parking_lot__manager=user)
        else:
            return ParkingSession.objects.filter(user=user)

    @action(detail=False, methods=['post'])
    def vehicle_entry(self, request):
        """ثبت ورود خودرو با استفاده از تشخیص پلاک"""
        # اطلاعات مورد نیاز
        parking_lot_id = request.data.get('parking_lot')
        spot_id = request.data.get('spot')
        image_file = request.FILES.get('image')

        if not parking_lot_id or not image_file:
            return Response(
                {'detail': _('Parking lot ID and image are required.')},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            parking_lot = ParkingLot.objects.get(id=parking_lot_id)

            # بررسی مجوز دسترسی
            if not (request.user.is_admin or parking_lot.manager == request.user):
                return Response(
                    {'detail': _('You do not have permission to manage entries for this parking lot.')},
                    status=status.HTTP_403_FORBIDDEN
                )

            # بررسی ظرفیت پارکینگ
            if parking_lot.current_occupancy >= parking_lot.total_capacity:
                raise ParkingFullError()

            # انتخاب جای پارک
            spot = None
            if spot_id:
                try:
                    spot = ParkingSlot.objects.get(id=spot_id)
                    if spot.zone.parking_lot.id != parking_lot.id:
                        return Response(
                            {'detail': _('This spot does not belong to the specified parking lot.')},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    if spot.status != ParkingSlot.AVAILABLE:
                        raise ParkingSpotUnavailableError()
                except ParkingSlot.DoesNotExist:
                    return Response(
                        {'detail': _('Parking spot not found.')},
                        status=status.HTTP_404_NOT_FOUND
                    )

            # ذخیره تصویر
            from django.core.files.storage import default_storage
            from django.core.files.base import ContentFile
            import os
            from django.conf import settings

            file_path = default_storage.save(
                os.path.join('parking_sessions/entry/', image_file.name),
                ContentFile(image_file.read())
            )
            full_path = os.path.join(settings.MEDIA_ROOT, file_path)

            # تشخیص پلاک
            license_plate_processor = LicensePlateProcessor()
            result = license_plate_processor.process_image(full_path)

            if not result['success']:
                return Response(
                    {'detail': _('Failed to detect license plate.'), 'error': result['message']},
                    status=status.HTTP_400_BAD_REQUEST
                )

            license_plate_text = result['license_plate']

            # جستجوی خودرو بر اساس پلاک
            try:
                vehicle = Vehicle.objects.get(license_plate=license_plate_text)
                vehicle_user = vehicle.owners.first().user if vehicle.owners.exists() else None
            except Vehicle.DoesNotExist:
                # ثبت خودروی جدید
                vehicle = Vehicle.objects.create(
                    license_plate=license_plate_text,
                    license_plate_image=file_path
                )
                vehicle_user = None

            # انتخاب جای پارک آزاد اگر مشخص نشده باشد
            if not spot:
                available_spots = ParkingSlot.objects.filter(
                    zone__parking_lot=parking_lot,
                    status=ParkingSlot.AVAILABLE
                )
                if available_spots.exists():
                    spot = available_spots.first()
                else:
                    raise ParkingFullError()

            # ایجاد جلسه پارک
            session = ParkingSession.objects.create(
                parking_lot=parking_lot,
                spot=spot,
                vehicle=vehicle,
                user=vehicle_user,
                entry_image=file_path,
                status=ParkingSession.ACTIVE
            )

            # به‌روزرسانی وضعیت جای پارک
            spot.status = ParkingSlot.OCCUPIED
            spot.save()

            # به‌روزرسانی شمارنده‌های اشغال
            zone = spot.zone
            zone.current_occupancy += 1
            zone.save()

            parking_lot.current_occupancy += 1
            parking_lot.save()

            return Response(
                {
                    'success': True,
                    'session': ParkingSessionSerializer(session).data,
                    'license_plate': license_plate_text,
                    'confidence': result['confidence'],
                    'output_image': result['output_image']
                },
                status=status.HTTP_201_CREATED
            )

        except ParkingLot.DoesNotExist:
            return Response(
                {'detail': _('Parking lot not found.')},
                status=status.HTTP_404_NOT_FOUND
            )
        except (ParkingFullError, ParkingSpotUnavailableError) as e:
            return Response({'detail': str(e)}, status=e.status_code)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def vehicle_exit(self, request):
        """ثبت خروج خودرو با استفاده از تشخیص پلاک"""
        # اطلاعات مورد نیاز
        parking_lot_id = request.data.get('parking_lot')
        image_file = request.FILES.get('image')

        if not parking_lot_id or not image_file:
            return Response(
                {'detail': _('Parking lot ID and image are required.')},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            parking_lot = ParkingLot.objects.get(id=parking_lot_id)

            # بررسی مجوز دسترسی
            if not (request.user.is_admin or parking_lot.manager == request.user):
                return Response(
                    {'detail': _('You do not have permission to manage exits for this parking lot.')},
                    status=status.HTTP_403_FORBIDDEN
                )

            # ذخیره تصویر
            from django.core.files.storage import default_storage
            from django.core.files.base import ContentFile
            import os
            from django.conf import settings

            file_path = default_storage.save(
                os.path.join('parking_sessions/exit/', image_file.name),
                ContentFile(image_file.read())
            )
            full_path = os.path.join(settings.MEDIA_ROOT, file_path)

            # تشخیص پلاک
            license_plate_processor = LicensePlateProcessor()
            result = license_plate_processor.process_image(full_path)

            if not result['success']:
                return Response(
                    {'detail': _('Failed to detect license plate.'), 'error': result['message']},
                    status=status.HTTP_400_BAD_REQUEST
                )

            license_plate_text = result['license_plate']

            # جستجوی جلسه پارک فعال بر اساس پلاک
            try:
                vehicle = Vehicle.objects.get(license_plate=license_plate_text)
            except Vehicle.DoesNotExist:
                return Response(
                    {'detail': _('No vehicle with this license plate is registered.')},
                    status=status.HTTP_404_NOT_FOUND
                )

            # جستجوی جلسه پارک فعال
            try:
                session = ParkingSession.objects.get(
                    parking_lot=parking_lot,
                    vehicle=vehicle,
                    status=ParkingSession.ACTIVE,
                    exit_time__isnull=True
                )
            except ParkingSession.DoesNotExist:
                return Response(
                    {'detail': _('No active session found for this vehicle in this parking lot.')},
                    status=status.HTTP_404_NOT_FOUND
                )

            # محاسبه زمان و مبلغ
            session.exit_time = timezone.now()
            session.exit_image = file_path
            session.status = ParkingSession.COMPLETED

            # محاسبه مبلغ بر اساس مدت زمان
            duration_hours = session.duration.total_seconds() / 3600
            price_multiplier = session.spot.zone.price_multiplier

            if duration_hours <= 24:
                # محاسبه بر اساس نرخ ساعتی
                session.amount_due = duration_hours * parking_lot.hourly_rate * price_multiplier
            else:
                # محاسبه بر اساس نرخ روزانه
                days = duration_hours / 24
                session.amount_due = days * parking_lot.daily_rate * price_multiplier

            session.save()

            # به‌روزرسانی وضعیت جای پارک
            spot = session.spot
            spot.status = ParkingSlot.AVAILABLE
            spot.save()

            # به‌روزرسانی شمارنده‌های اشغال
            zone = spot.zone
            zone.current_occupancy = max(0, zone.current_occupancy - 1)
            zone.save()

            parking_lot.current_occupancy = max(0, parking_lot.current_occupancy - 1)
            parking_lot.save()

            return Response(
                {
                    'success': True,
                    'session': ParkingSessionSerializer(session).data,
                    'license_plate': license_plate_text,
                    'confidence': result['confidence'],
                    'output_image': result['output_image'],
                    'amount_due': session.amount_due
                }
            )

        except ParkingLot.DoesNotExist:
            return Response(
                {'detail': _('Parking lot not found.')},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ParkingReservationViewSet(viewsets.ModelViewSet):
    """ویوست رزرو پارکینگ"""
    queryset = ParkingReservation.objects.all()
    serializer_class = ParkingReservationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['parking', 'spot', 'user', 'vehicle', 'status']  # تغییر از parking_lot به parking
    search_fields = ['vehicle__license_plate', 'user__email']
    ordering_fields = ['reservation_start', 'reservation_end', 'amount_paid', 'created_at']  # تغییر نام فیلدها

    def get_queryset(self):
        """فیلتر کردن رزروها بر اساس نقش کاربر"""
        # برای رفع مشکل swagger
        if getattr(self, 'swagger_fake_view', False):
            return ParkingReservation.objects.none()

        user = self.request.user
        if user.is_admin:
            return ParkingReservation.objects.all()
        elif user.is_parking_manager:
            return ParkingReservation.objects.filter(parking__manager=user)  # تغییر از parking_lot به parking
        else:
            return ParkingReservation.objects.filter(user=user)

    def perform_create(self, serializer):
        """ذخیره رزرو با محاسبه مبلغ"""
        start_time = serializer.validated_data.get('reservation_start')  # تغییر نام فیلد
        end_time = serializer.validated_data.get('reservation_end')  # تغییر نام فیلد
        parking = serializer.validated_data.get('parking')  # تغییر از parking_lot به parking
        spot = serializer.validated_data.get('spot')

        # بررسی تداخل رزرو
        if spot:
            overlapping_reservations = ParkingReservation.objects.filter(
                spot=spot,
                status__in=['pending', 'confirmed'],  # مقادیر متناسب با ReservationStatus
                reservation_start__lt=end_time,  # تغییر نام فیلد
                reservation_end__gt=start_time  # تغییر نام فیلد
            )

            if overlapping_reservations.exists():
                raise ReservationConflictError()

            # بررسی وضعیت جای پارک
            if spot.status != ParkingSlot.SlotStatus.AVAILABLE:  # تغییر به ParkingSlot.SlotStatus.AVAILABLE
                raise ParkingSpotUnavailableError()

        # محاسبه مبلغ رزرو
        duration_hours = (end_time - start_time).total_seconds() / 3600
        price_multiplier = spot.zone.price_multiplier if spot else 1.0

        if duration_hours <= 24:
            # محاسبه بر اساس نرخ ساعتی
            amount = duration_hours * parking.hourly_rate * price_multiplier  # تغییر از parking_lot به parking
        else:
            # محاسبه بر اساس نرخ روزانه
            days = duration_hours / 24
            amount = days * parking.daily_rate * price_multiplier  # تغییر از parking_lot به parking

        # ذخیره رزرو
        serializer.save(amount_paid=amount, user=self.request.user)  # تغییر از amount به amount_paid

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """تأیید رزرو توسط مدیر پارکینگ"""
        reservation = self.get_object()

        # بررسی مجوز دسترسی
        if not (
                request.user.is_admin or reservation.parking.manager == request.user):  # تغییر از parking_lot به parking
            return Response(
                {'detail': _('You do not have permission to confirm this reservation.')},
                status=status.HTTP_403_FORBIDDEN
            )

        # بررسی وضعیت رزرو - نیاز به تطبیق با StatusChoices در مدل ParkingReservation
        if reservation.status != 'pending':  # مقدار متناسب با ReservationStatus
            return Response(
                {'detail': _('Only pending reservations can be confirmed.')},
                status=status.HTTP_400_BAD_REQUEST
            )

        # به‌روزرسانی وضعیت رزرو
        reservation.status = 'confirmed'  # مقدار متناسب با ReservationStatus
        reservation.save()

        # به‌روزرسانی وضعیت جای پارک
        if reservation.spot:
            reservation.spot.status = ParkingSlot.SlotStatus.RESERVED  # تغییر به ParkingSlot.SlotStatus.RESERVED
            reservation.spot.save()

        return Response(ParkingReservationSerializer(reservation).data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """لغو رزرو"""
        reservation = self.get_object()

        # بررسی مجوز دسترسی - فقط کاربر ایجاد کننده یا مدیر می‌تواند لغو کند
        if not (
                request.user.is_admin or reservation.parking.manager == request.user or reservation.user == request.user):  # تغییر از parking_lot به parking
            return Response(
                {'detail': _('You do not have permission to cancel this reservation.')},
                status=status.HTTP_403_FORBIDDEN
            )

        # بررسی وضعیت رزرو - نیاز به تطبیق با StatusChoices در مدل ParkingReservation
        if reservation.status not in ['pending', 'confirmed']:  # مقادیر متناسب با ReservationStatus
            return Response(
                {'detail': _('Only pending or confirmed reservations can be canceled.')},
                status=status.HTTP_400_BAD_REQUEST
            )

        # به‌روزرسانی وضعیت رزرو
        reservation.status = 'cancelled'  # مقدار متناسب با ReservationStatus
        reservation.save()

        # به‌روزرسانی وضعیت جای پارک
        if reservation.spot and reservation.spot.status == ParkingSlot.SlotStatus.RESERVED:  # تغییر به ParkingSlot.SlotStatus.RESERVED
            reservation.spot.status = ParkingSlot.SlotStatus.AVAILABLE  # تغییر به ParkingSlot.SlotStatus.AVAILABLE
            reservation.spot.save()

        return Response(ParkingReservationSerializer(reservation).data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """تکمیل رزرو"""
        reservation = self.get_object()

        # بررسی مجوز دسترسی
        if not (
                request.user.is_admin or reservation.parking.manager == request.user):  # تغییر از parking_lot به parking
            return Response(
                {'detail': _('You do not have permission to complete this reservation.')},
                status=status.HTTP_403_FORBIDDEN
            )

        # بررسی وضعیت رزرو - نیاز به تطبیق با StatusChoices در مدل ParkingReservation
        if reservation.status != 'confirmed':  # مقدار متناسب با ReservationStatus
            return Response(
                {'detail': _('Only confirmed reservations can be completed.')},
                status=status.HTTP_400_BAD_REQUEST
            )

        # به‌روزرسانی وضعیت رزرو
        reservation.status = 'completed'  # مقدار متناسب با ReservationStatus
        reservation.save()

        # به‌روزرسانی وضعیت جای پارک
        if reservation.spot and reservation.spot.status == ParkingSlot.SlotStatus.RESERVED:  # تغییر به ParkingSlot.SlotStatus.RESERVED
            reservation.spot.status = ParkingSlot.SlotStatus.AVAILABLE  # تغییر به ParkingSlot.SlotStatus.AVAILABLE
            reservation.spot.save()

        return Response(ParkingReservationSerializer(reservation).data)