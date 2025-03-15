from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from ..models import UserVehicle
from utils.validators import validate_phone_number, validate_national_id

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """سریالایزر ثبت‌نام کاربر"""

    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    confirm_password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['email', 'password', 'confirm_password', 'first_name', 'last_name', 'phone_number', 'role']
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'phone_number': {'validators': [validate_phone_number]},
        }

    def validate(self, data):
        if data['password'] != data.pop('confirm_password'):
            raise serializers.ValidationError(_("Passwords do not match."))
        return data

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UserLoginSerializer(serializers.Serializer):
    """سریالایزر ورود کاربر"""

    email = serializers.EmailField()
    password = serializers.CharField(style={'input_type': 'password'})


class UserDetailSerializer(serializers.ModelSerializer):
    """سریالایزر جزئیات کاربر"""

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone_number', 'role',
                  'profile_image', 'national_id', 'date_of_birth', 'address', 'created_at']
        read_only_fields = ['email', 'role', 'created_at']
        extra_kwargs = {
            'phone_number': {'validators': [validate_phone_number]},
            'national_id': {'validators': [validate_national_id]},
        }


class UserVehicleSerializer(serializers.ModelSerializer):
    """سریالایزر رابطه کاربر-خودرو"""

    class Meta:
        model = UserVehicle
        fields = ['id', 'user', 'vehicle', 'is_primary', 'created_at']
        read_only_fields = ['created_at']