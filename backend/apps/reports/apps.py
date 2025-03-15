from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class ReportsConfig(AppConfig):
    name = 'apps.reports'
    verbose_name = _('گزارش‌ها')

    def ready(self):
        # ثبت سیگنال‌ها
        import apps.reports.signals