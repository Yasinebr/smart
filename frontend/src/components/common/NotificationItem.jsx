// src/components/common/NotificationItem.jsx
import React, { useState, useEffect } from 'react';

const NotificationItem = ({ notification, onDismiss }) => {
  const { id, type, message, title, autoDismiss, timeout = 5000 } = notification;
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (autoDismiss !== false) {
      const dismissTimeout = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onDismiss(id), 300); // حذف بعد از انیمیشن fade
      }, timeout);

      // نمایش پیشرفت تایمر
      const intervalTime = 100;
      const steps = timeout / intervalTime;
      const progressStep = 100 / steps;

      const progressInterval = setInterval(() => {
        setProgress((prevProgress) => {
          const newProgress = prevProgress - progressStep;
          return newProgress < 0 ? 0 : newProgress;
        });
      }, intervalTime);

      return () => {
        clearTimeout(dismissTimeout);
        clearInterval(progressInterval);
      };
    }
  }, [id, timeout, autoDismiss, onDismiss]);

  const getIconClass = () => {
    switch (type) {
      case 'success':
        return 'fas fa-check-circle';
      case 'error':
        return 'fas fa-times-circle';
      case 'warning':
        return 'fas fa-exclamation-circle';
      case 'info':
      default:
        return 'fas fa-info-circle';
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss(id), 300);
  };

  return (
    <div
      className={`notification notification-${type} ${isVisible ? 'show' : 'hide'}`}
      role="alert"
    >
      <div className="notification-icon">
        <i className={getIconClass()}></i>
      </div>
      <div className="notification-content">
        {title && <div className="notification-title">{title}</div>}
        <div className="notification-message">{message}</div>
        {autoDismiss !== false && (
          <div className="notification-progress">
            <div
              className="notification-progress-bar"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
      </div>
      <button
        className="notification-close"
        onClick={handleClose}
        aria-label="بستن اعلان"
      >
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
};

export default NotificationItem;