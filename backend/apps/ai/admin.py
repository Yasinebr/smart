# apps/ai/admin.py

from django.contrib import admin
from django.utils.translation import gettext_lazy as _

# در یک پروژه واقعی، ممکن است مدل‌های دیگری هم برای ماژول هوش مصنوعی ایجاد کنید
# که می‌توانید آن‌ها را اینجا ثبت کنید

# from .models import AIModel, AIProcessingLog

# در حال حاضر، این ماژول فاقد مدل‌های مستقیم است و بیشتر به عنوان یک سرویس عمل می‌کند
# اما می‌توانید در صورت نیاز، مدل‌هایی مانند زیر را اضافه کنید:

"""
@admin.register(AIModel)
class AIModelAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'version', 'accuracy', 'is_active', 'created_at')
    list_filter = ('type', 'is_active', 'created_at')
    search_fields = ('name', 'description')
    date_hierarchy = 'created_at'

    fieldsets = (
        (_('اطلاعات مدل'), {
            'fields': ('name', 'type', 'version', 'description', 'is_active')
        }),
        (_('عملکرد'), {
            'fields': ('accuracy', 'parameters'),
        }),
        (_('فایل مدل'), {
            'fields': ('model_file', 'config_file'),
        }),
    )


@admin.register(AIProcessingLog)
class AIProcessingLogAdmin(admin.ModelAdmin):
    list_display = ('model', 'request_type', 'success', 'processing_time', 'created_at')
    list_filter = ('model', 'request_type', 'success', 'created_at')
    search_fields = ('request_data', 'response_data', 'error_message')
    date_hierarchy = 'created_at'

    fieldsets = (
        (_('اطلاعات پردازش'), {
            'fields': ('model', 'request_type', 'success', 'processing_time')
        }),
        (_('داده‌ها'), {
            'fields': ('request_data', 'response_data'),
            'classes': ('collapse',),
        }),
        (_('خطا'), {
            'fields': ('error_message', 'stack_trace'),
            'classes': ('collapse',),
        }),
    )
"""