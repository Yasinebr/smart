from rest_framework.exceptions import APIException
from rest_framework import status

class LicensePlateDetectionError(APIException):
    """
    خطای تشخیص پلاک
    """
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Failed to detect license plate.'
    default_code = 'license_plate_detection_error'

class FaceDetectionError(APIException):
    """
    خطای تشخیص چهره
    """
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Failed to detect face.'
    default_code = 'face_detection_error'

class ParkingFullError(APIException):
    """
    خطای پر بودن ظرفیت پارکینگ
    """
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'The parking lot is full.'
    default_code = 'parking_full_error'

class ParkingSpotUnavailableError(APIException):
    """
    خطای در دسترس نبودن جای پارک
    """
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'The selected parking spot is unavailable.'
    default_code = 'parking_spot_unavailable_error'

class ReservationConflictError(APIException):
    """
    خطای تداخل رزرو
    """
    status_code = status.HTTP_409_CONFLICT
    default_detail = 'There is a conflict with an existing reservation.'
    default_code = 'reservation_conflict_error'

class PaymentError(APIException):
    """
    خطای پرداخت
    """
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Payment process failed.'
    default_code = 'payment_error'

