# apps/ai/admin.py

from django.contrib import admin
from .models import LicensePlateDetection , FaceDetection
from django.utils.translation import gettext_lazy as _

admin.site.register(LicensePlateDetection)
admin.site.register(FaceDetection)