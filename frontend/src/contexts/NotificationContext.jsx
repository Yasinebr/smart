// src/contexts/NotificationContext.jsx
import React, { createContext, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // اضافه کردن اعلان جدید
  const addNotification = useCallback((notification) => {
    const id = notification.id || uuidv4();
    const newNotification = {
      id,
      type: notification.type || 'info',
      title: notification.title || '',
      message: notification.message || '',
      duration: notification.duration || 5000, // پیش‌فرض: 5 ثانیه
      ...notification
    };

    setNotifications((prevNotifications) => [...prevNotifications, newNotification]);

    // حذف خودکار اعلان بعد از زمان معین
    if (newNotification.duration !== 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  // افزودن اعلان از نوع اطلاعات
  const info = useCallback((message, options = {}) => {
    return addNotification({ type: 'info', message, ...options });
  }, [addNotification]);

  // افزودن اعلان از نوع موفقیت
  const success = useCallback((message, options = {}) => {
    return addNotification({ type: 'success', message, ...options });
  }, [addNotification]);

  // افزودن اعلان از نوع هشدار
  const warning = useCallback((message, options = {}) => {
    return addNotification({ type: 'warning', message, ...options });
  }, [addNotification]);

  // افزودن اعلان از نوع خطا
  const error = useCallback((message, options = {}) => {
    return addNotification({ type: 'error', message, ...options });
  }, [addNotification]);

  // حذف اعلان با شناسه
  const removeNotification = useCallback((id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id !== id)
    );
  }, []);

  // حذف همه اعلان‌ها
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearAllNotifications,
        info,
        success,
        warning,
        error
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;