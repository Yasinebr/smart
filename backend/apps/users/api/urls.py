from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserRegistrationView, UserLoginView, UserViewSet, UserVehicleViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'user-vehicles', UserVehicleViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    path('login/', UserLoginView.as_view(), name='user-login'),
]