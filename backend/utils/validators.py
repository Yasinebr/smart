import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


def validate_license_plate(value):
    """
    اعتبارسنجی شماره پلاک خودرو ایرانی
    مثال‌های معتبر: 12ب345-78، 12ب34567
    """
    pattern = r'^[0-9]{2}[آ-ی]{1}[0-9]{3}[-]?[0-9]{2}$'

    if not re.match(pattern, value):
        raise ValidationError(
            _('Invalid license plate format. Use format like 12ب345-67 or 12ب34567.'),
            code='invalid_license_plate'
        )


def validate_phone_number(value):
    """
    اعتبارسنجی شماره تلفن همراه ایرانی
    مثال‌های معتبر: 09123456789، +989123456789
    """
    pattern = r'^(?:\+98|0)?9[0-9]{9}$'

    if not re.match(pattern, value):
        raise ValidationError(
            _('Invalid phone number format. Use format like 09123456789 or +989123456789.'),
            code='invalid_phone_number'
        )


def validate_national_id(value):
    """
    اعتبارسنجی کد ملی ایرانی
    """
    if not re.match(r'^\d{10}$', value):
        raise ValidationError(
            _('National ID must be a 10-digit number.'),
            code='invalid_national_id'
        )

    # کنترل کد ملی
    check = int(value[9])
    sum_val = sum(int(value[i]) * (10 - i) for i in range(9)) % 11

    if (sum_val < 2 and check != sum_val) or (sum_val >= 2 and check != 11 - sum_val):
        raise ValidationError(
            _('Invalid national ID.'),
            code='invalid_national_id'
        )


def validate_vehicle_year(value):
    """
    اعتبارسنجی سال تولید خودرو
    """
    from django.utils import timezone

    current_year = timezone.now().year

    if value < 1900 or value > current_year + 1:
        raise ValidationError(
            _('Year must be between 1900 and %(current_year)s.'),
            params={'current_year': current_year + 1},
            code='invalid_vehicle_year'
        )


def validate_positive_decimal(value):
    """
    اعتبارسنجی مقدار اعشاری مثبت
    """
    if value < 0:
        raise ValidationError(
            _('Value must be greater than or equal to 0.'),
            code='negative_decimal'
        )