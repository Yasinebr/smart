// src/contexts/NotificationContext.jsx
import React, { createContext, useState, useContext } from 'react';

// ایجاد کانتکست اعلان‌ها
const NotificationContext = createContext();

// ارائه دهنده کانتکست اعلان‌ها
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // افزودن اعلان جدید
  const addNotification = (notification) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotification = {
      id,
      ...notification,
      timestamp: new Date(),
    };

    setNotifications((prev) => [newNotification, ...prev]);

    // حذف خودکار اعلان بعد از مدت زمان مشخص شده
    if (notification.autoDismiss !== false) {
      const timeout = notification.timeout || 5000;
      setTimeout(() => dismissNotification(id), timeout);
    }

    return id;
  };

  // حذف اعلان با شناسه
  const dismissNotification = (id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  // حذف همه اعلان‌ها
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // انواع مختلف اعلان
  const notify = {
    success: (message, options = {}) =>
      addNotification({ type: 'success', message, ...options }),
    error: (message, options = {}) =>
      addNotification({ type: 'error', message, ...options }),
    warning: (message, options = {}) =>
      addNotification({ type: 'warning', message, ...options }),
    info: (message, options = {}) =>
      addNotification({ type: 'info', message, ...options }),
  };

  const value = {
    notifications,
    addNotification,
    dismissNotification,
    clearAllNotifications,
    notify,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {/* کامپوننت نمایش اعلان‌ها */}
      <div className="notifications-container">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`notification notification-${notification.type}`}
          >
            <div className="notification-content">
              {notification.title && (
                <div className="notification-title">{notification.title}</div>
              )}
              <div className="notification-message">{notification.message}</div>
            </div>
            <button
              className="notification-close"
              onClick={() => dismissNotification(notification.id)}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

// هوک برای دسترسی به اعلان‌ها
export const useNotification = () => {
  return useContext(NotificationContext);
};
