from rest_framework import viewsets, generics, status, permissions
from rest_framework.permissions import IsAuthenticated
from rest_framework import serializers
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from django.utils.translation import gettext_lazy as _
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserDetailSerializer,
    UserVehicleSerializer
)
from ..models import UserVehicle
from utils.permissions import IsAdmin
from rest_framework.viewsets import ModelViewSet

User = get_user_model()


class UserRegistrationView(generics.CreateAPIView):
    """ویو ثبت‌نام کاربر"""
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # ایجاد توکن‌های JWT
        refresh = RefreshToken.for_user(user)

        return Response({
            'user': UserDetailSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)


class UserLoginView(generics.GenericAPIView):
    """ویو ورود کاربر"""
    serializer_class = UserLoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = authenticate(
            email=serializer.validated_data['email'],
            password=serializer.validated_data['password']
        )

        if user is None:
            return Response({'detail': _('Invalid email or password.')}, status=status.HTTP_401_UNAUTHORIZED)

        # ایجاد توکن‌های JWT
        refresh = RefreshToken.for_user(user)

        return Response({
            'user': UserDetailSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })


class UserViewSet(viewsets.ModelViewSet):
    """ویوست کاربران"""
    queryset = User.objects.all()
    serializer_class = UserDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # مدیران سیستم می‌توانند همه کاربران را ببینند
        if self.request.user.is_admin:
            return User.objects.all()
        # سایر کاربران فقط می‌توانند اطلاعات خود را ببینند
        return User.objects.filter(id=self.request.user.id)

    def get_permissions(self):
        # برای لیست کردن و ایجاد کاربر جدید باید مدیر سیستم باشد
        if self.action in ['list', 'create', 'destroy']:
            return [IsAdmin()]
        return super().get_permissions()

    def retrieve(self, request, *args, **kwargs):
        # کاربر می‌تواند فقط اطلاعات خود را ببیند یا باید مدیر سیستم باشد
        instance = self.get_object()
        if request.user.id != instance.id and not request.user.is_admin:
            return Response({'detail': _('You do not have permission to view this user.')},
                            status=status.HTTP_403_FORBIDDEN)
        return super().retrieve(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        # کاربر می‌تواند فقط اطلاعات خود را به‌روز کند یا باید مدیر سیستم باشد
        instance = self.get_object()
        if request.user.id != instance.id and not request.user.is_admin:
            return Response({'detail': _('You do not have permission to update this user.')},
                            status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    @action(detail=True, methods=['get'])
    def vehicles(self, request, pk=None):
        """گرفتن لیست خودروهای یک کاربر"""
        user = self.get_object()
        if request.user.id != user.id and not request.user.is_admin:
            return Response({'detail': _('You do not have permission to view this user\'s vehicles.')},
                            status=status.HTTP_403_FORBIDDEN)

        user_vehicles = UserVehicle.objects.filter(user=user)
        serializer = UserVehicleSerializer(user_vehicles, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)


class UserVehicleViewSet(viewsets.ModelViewSet):
    """ویوست رابطه کاربر-خودرو"""
    queryset = UserVehicle.objects.all()
    serializer_class = UserVehicleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # مدیران سیستم می‌توانند همه رابطه‌ها را ببینند
        if self.request.user.is_admin:
            return UserVehicle.objects.all()
        # سایر کاربران فقط می‌توانند رابطه‌های خود را ببینند
        return UserVehicle.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # اگر کاربر مدیر سیستم نیست، فقط می‌تواند برای خود رابطه ایجاد کند
        if not self.request.user.is_admin and serializer.validated_data['user'].id != self.request.user.id:
            raise serializers.ValidationError(_('You can only add vehicles to your own account.'))
        serializer.save()
