from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class PaymentsConfig(AppConfig):
    name = 'apps.payments'
    verbose_name = _('پرداخت‌ها')

    def ready(self):
        # ثبت سیگنال‌ها
        import apps.payments.signals