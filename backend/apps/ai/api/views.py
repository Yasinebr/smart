from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils.translation import gettext_lazy as _
from .serializers import LicensePlateDetectionSerializer, FaceDetectionSerializer
from ..models import LicensePlateDetection, FaceDetection
from utils.permissions import IsAdmin, IsParkingManager
from utils.exceptions import LicensePlateDetectionError, FaceDetectionError
from ..license_plate.processors import LicensePlateProcessor
from ..face.processors import FaceProcessor
import os
from django.conf import settings


class LicensePlateDetectionViewSet(viewsets.ModelViewSet):
    """ویوست تشخیص پلاک"""
    queryset = LicensePlateDetection.objects.all()
    serializer_class = LicensePlateDetectionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """فیلتر کردن نتایج تشخیص بر اساس نقش کاربر"""
        user = self.request.user
        if user.is_admin:
            return LicensePlateDetection.objects.all()
        elif user.is_parking_manager:
            # مدیر پارکینگ فقط تشخیص‌های مرتبط با جلسات پارکینگ خود را می‌بیند
            return LicensePlateDetection.objects.filter(
                parking_session__parking_lot__manager=user
            )
        else:
            # کاربر عادی فقط تشخیص‌های مرتبط با خودروهای خود را می‌بیند
            return LicensePlateDetection.objects.filter(
                vehicle__owners__user=user
            )

    def get_permissions(self):
        """تعیین مجوزهای دسترسی بر اساس عملیات"""
        if self.action in ['create', 'detect']:
            # فقط مدیران سیستم و مدیران پارکینگ می‌توانند تشخیص جدید انجام دهند
            return [IsAuthenticated(), IsAdmin()]
        return super().get_permissions()

    def perform_create(self, serializer):
        """ذخیره و پردازش تشخیص پلاک"""
        detection = serializer.save(status=LicensePlateDetection.PENDING)

        try:
            # پردازش تصویر
            processor = LicensePlateProcessor()

            # دریافت مسیر کامل تصویر
            input_image_path = os.path.join(settings.MEDIA_ROOT, detection.input_image.name)

            # انجام تشخیص
            result = processor.process_image(input_image_path)

            if not result['success']:
                # ذخیره وضعیت خطا
                detection.status = LicensePlateDetection.FAILED
                detection.save()
                raise LicensePlateDetectionError(detail=result['message'])

            # به‌روزرسانی اطلاعات تشخیص
            detection.license_plate_text = result['license_plate']
            detection.confidence = result['confidence']
            detection.bounding_box = result['bbox']
            detection.output_image = result['output_image'].replace(settings.MEDIA_URL, '')
            detection.processing_time = result['processing_time']
            detection.status = LicensePlateDetection.COMPLETED
            detection.save()

        except Exception as e:
            # ذخیره وضعیت خطا در صورت بروز مشکل
            detection.status = LicensePlateDetection.FAILED
            detection.save()
            raise LicensePlateDetectionError(detail=str(e))

        @action(detail=False, methods=['post'])
        def detect(self, request):
            """تشخیص پلاک بدون ذخیره در دیتابیس"""
            # دریافت تصویر از درخواست
            image_file = request.FILES.get('image')

            if not image_file:
                return Response(
                    {'detail': _('Image file is required.')},
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                # ذخیره موقت تصویر
                from django.core.files.storage import default_storage
                from django.core.files.base import ContentFile

                file_path = default_storage.save(
                    os.path.join('temp/', image_file.name),
                    ContentFile(image_file.read())
                )

                full_path = os.path.join(settings.MEDIA_ROOT, file_path)

                # پردازش تصویر
                processor = LicensePlateProcessor()
                result = processor.process_image(full_path)

                # حذف فایل موقت
                default_storage.delete(file_path)

                if not result['success']:
                    return Response(
                        {'success': False, 'detail': result['message']},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                return Response({
                    'success': True,
                    'license_plate': result['license_plate'],
                    'confidence': result['confidence'],
                    'bbox': result['bbox'],
                    'output_image': result['output_image'],
                    'processing_time': result['processing_time']
                })

            except Exception as e:
                return Response(
                    {'success': False, 'detail': str(e)},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
class FaceDetectionViewSet(viewsets.ModelViewSet):
        """ویوست تشخیص چهره"""
        queryset = FaceDetection.objects.all()
        serializer_class = FaceDetectionSerializer
        permission_classes = [IsAuthenticated]

        def get_queryset(self):
            """فیلتر کردن نتایج تشخیص بر اساس نقش کاربر"""
            user = self.request.user
            if user.is_admin:
                return FaceDetection.objects.all()
            elif user.is_parking_manager:
                # مدیر پارکینگ فقط تشخیص‌های مرتبط با جلسات پارکینگ خود را می‌بیند
                return FaceDetection.objects.filter(
                    parking_session__parking_lot__manager=user
                )
            else:
                # کاربر عادی فقط تشخیص‌های مرتبط با خود را می‌بیند
                return FaceDetection.objects.filter(user=user)

        def get_permissions(self):
            """تعیین مجوزهای دسترسی بر اساس عملیات"""
            if self.action in ['create', 'detect']:
                # فقط مدیران سیستم و مدیران پارکینگ می‌توانند تشخیص جدید انجام دهند
                return [IsAuthenticated(), IsAdmin() ]
            return super().get_permissions()

        def perform_create(self, serializer):
            """ذخیره و پردازش تشخیص چهره"""
            detection = serializer.save(status=FaceDetection.PENDING)

            try:
                # پردازش تصویر
                processor = FaceProcessor()

                # دریافت مسیر کامل تصویر
                input_image_path = os.path.join(settings.MEDIA_ROOT, detection.input_image.name)

                # انجام تشخیص
                result = processor.process_image(input_image_path)

                if not result['success']:
                    # ذخیره وضعیت خطا
                    detection.status = FaceDetection.FAILED
                    detection.save()
                    raise FaceDetectionError(detail=result['message'])

                # به‌روزرسانی اطلاعات تشخیص
                detection.face_count = result['face_count']
                detection.faces_data = result['faces']
                detection.output_image = result['output_image'].replace(settings.MEDIA_URL, '')
                detection.processing_time = result['processing_time']
                detection.status = FaceDetection.COMPLETED
                detection.save()

            except Exception as e:
                # ذخیره وضعیت خطا در صورت بروز مشکل
                detection.status = FaceDetection.FAILED
                detection.save()
                raise FaceDetectionError(detail=str(e))

        @action(detail=False, methods=['post'])
        def detect(self, request):
            """تشخیص چهره بدون ذخیره در دیتابیس"""
            # دریافت تصویر از درخواست
            image_file = request.FILES.get('image')

            if not image_file:
                return Response(
                    {'detail': _('Image file is required.')},
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                # ذخیره موقت تصویر
                from django.core.files.storage import default_storage
                from django.core.files.base import ContentFile

                file_path = default_storage.save(
                    os.path.join('temp/', image_file.name),
                    ContentFile(image_file.read())
                )

                full_path = os.path.join(settings.MEDIA_ROOT, file_path)

                # پردازش تصویر
                processor = FaceProcessor()
                result = processor.process_image(full_path)

                # حذف فایل موقت
                default_storage.delete(file_path)

                if not result['success']:
                    return Response(
                        {'success': False, 'detail': result['message']},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                return Response({
                    'success': True,
                    'face_count': result['face_count'],
                    'faces': result['faces'],
                    'output_image': result['output_image'],
                    'processing_time': result['processing_time']
                })

            except Exception as e:
                return Response(
                    {'success': False, 'detail': str(e)},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

