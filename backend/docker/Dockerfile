# backend/docker/Dockerfile

FROM python:3.9-slim

# تنظیم محیط‌های غیر تعاملی
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# تنظیم دایرکتوری کاری
WORKDIR /app

# نصب پیش‌نیازها
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-client \
        build-essential \
        libpq-dev \
        libjpeg-dev \
        zlib1g-dev \
        ffmpeg \
        libsm6 \
        libxext6 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# کپی فایل نیازمندی‌ها
COPY ./requirements /app/requirements

# نصب نیازمندی‌ها
RUN pip install --upgrade pip \
    && pip install -r requirements/production.txt

# کپی پروژه
COPY . /app/

# ایجاد کاربر غیر root برای اجرای برنامه
RUN useradd -m appuser
RUN chown -R appuser:appuser /app
USER appuser

# اسکریپت ورودی
COPY ./docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]