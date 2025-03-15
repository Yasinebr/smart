from django.db import models
from django.utils.translation import gettext_lazy as _


class LicensePlateDetection(models.Model):
    """مدل ثبت تشخیص پلاک"""

    # تصویر ورودی و خروجی
    input_image = models.ImageField(_('input image'), upload_to='license_plate_detections/input/')
    output_image = models.ImageField(_('output image'), upload_to='license_plate_detections/output/', blank=True,
                                     null=True)

    # نتیجه تشخیص
    license_plate_text = models.CharField(_('license plate text'), max_length=20, blank=True, null=True)
    confidence = models.FloatField(_('confidence'), default=0.0)

    # موقعیت پلاک در تصویر
    bounding_box = models.JSONField(_('bounding box'), blank=True, null=True)

    # وضعیت تشخیص
    PENDING = 'pending'
    COMPLETED = 'completed'
    FAILED = 'failed'

    STATUS_CHOICES = [
        (PENDING, _('Pending')),
        (COMPLETED, _('Completed')),
        (FAILED, _('Failed')),
    ]

    status = models.CharField(_('status'), max_length=10, choices=STATUS_CHOICES, default=PENDING)

    # زمان پردازش
    processing_time = models.FloatField(_('processing time (s)'), blank=True, null=True)

    # سایر اطلاعات
    vehicle = models.ForeignKey('vehicles.Vehicle', on_delete=models.SET_NULL, null=True, blank=True,
                                related_name='license_plate_detections')
    parking_session = models.ForeignKey('parking.ParkingSession', on_delete=models.SET_NULL, null=True, blank=True,
                                        related_name='license_plate_detections')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('license plate detection')
        verbose_name_plural = _('license plate detections')

    def __str__(self):
        if self.license_plate_text:
            return f"License Plate: {self.license_plate_text} ({self.confidence:.2f})"
        return f"License Plate Detection ({self.created_at})"


class FaceDetection(models.Model):
    """مدل ثبت تشخیص چهره"""

    # تصویر ورودی و خروجی
    input_image = models.ImageField(_('input image'), upload_to='face_detections/input/')
    output_image = models.ImageField(_('output image'), upload_to='face_detections/output/', blank=True, null=True)

    # نتیجه تشخیص
    face_embedding = models.BinaryField(_('face embedding'), blank=True, null=True)
    face_count = models.PositiveIntegerField(_('face count'), default=0)

    # اطلاعات چهره‌های تشخیص داده شده
    faces_data = models.JSONField(_('faces data'), blank=True, null=True)

    # وضعیت تشخیص
    PENDING = 'pending'
    COMPLETED = 'completed'
    FAILED = 'failed'

    STATUS_CHOICES = [
        (PENDING, _('Pending')),
        (COMPLETED, _('Completed')),
        (FAILED, _('Failed')),
    ]

    status = models.CharField(_('status'), max_length=10, choices=STATUS_CHOICES, default=PENDING)

    # زمان پردازش
    processing_time = models.FloatField(_('processing time (s)'), blank=True, null=True)

    # سایر اطلاعات
    user = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True,
                             related_name='face_detections')
    parking_session = models.ForeignKey('parking.ParkingSession', on_delete=models.SET_NULL, null=True, blank=True,
                                        related_name='face_detections')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('face detection')
        verbose_name_plural = _('face detections')

    def __str__(self):
        if self.user:
            return f"Face Detection: {self.user.email} ({self.created_at})"
        return f"Face Detection ({self.created_at})"