from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class ParkingConfig(AppConfig):
    name = 'apps.parking'
    verbose_name = _('پارکینگ')

    def ready(self):
        # ثبت سیگنال‌ها
        import apps.parking.signals