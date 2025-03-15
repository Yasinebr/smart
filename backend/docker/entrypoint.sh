#!/bin/bash

# در انتظار آماده شدن پایگاه داده
if [ "$DATABASE" = "postgres" ]
then
    echo "Waiting for postgres..."

    while ! nc -z $DB_HOST $DB_PORT; do
      sleep 0.1
    done

    echo "PostgreSQL started"
fi

# اجرای مایگریشن‌ها
python manage.py migrate

# جمع‌آوری فایل‌های استاتیک
python manage.py collectstatic --no-input

# اجرای دستور داده شده
exec "$@"