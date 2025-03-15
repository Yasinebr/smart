from rest_framework import serializers
from ..models import LicensePlateDetection, FaceDetection
from django.utils.translation import gettext_lazy as _


class LicensePlateDetectionSerializer(serializers.ModelSerializer):
    """سریالایزر تشخیص پلاک"""

    class Meta:
        model = LicensePlateDetection
        fields = [
            'id', 'input_image', 'output_image', 'license_plate_text',
            'confidence', 'bounding_box', 'status', 'processing_time',
            'vehicle', 'parking_session', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'output_image', 'license_plate_text', 'confidence', 'bounding_box',
            'status', 'processing_time', 'created_at', 'updated_at'
        ]


class FaceDetectionSerializer(serializers.ModelSerializer):
    """سریالایزر تشخیص چهره"""

    class Meta:
        model = FaceDetection
        fields = [
            'id', 'input_image', 'output_image', 'face_count',
            'faces_data', 'status', 'processing_time',
            'user', 'parking_session', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'output_image', 'face_count', 'faces_data',
            'status', 'processing_time', 'created_at', 'updated_at'
        ]