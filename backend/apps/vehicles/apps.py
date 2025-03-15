from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class VehiclesConfig(AppConfig):
    name = 'apps.vehicles'
    verbose_name = _('خودروها')

    def ready(self):
        # ثبت سیگنال‌ها
        import apps.vehicles.signals