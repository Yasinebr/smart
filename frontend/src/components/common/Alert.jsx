// src/components/common/Alert.jsx
import React from 'react';
import { AlertCircle, CheckCircle, XCircle, Info, X } from 'lucide-react';

const Alert = ({
  type = 'info',
  message,
  title,
  onClose,
  className = '',
  dismissible = true,
}) => {
  // تعیین استایل‌های مختلف با توجه به نوع هشدار
  const styles = {
    info: {
      container: 'bg-blue-50 border-blue-500 text-blue-800',
      icon: <Info className="h-5 w-5 text-blue-500" />,
      title: 'اطلاعات',
    },
    success: {
      container: 'bg-green-50 border-green-500 text-green-800',
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      title: 'موفقیت',
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-500 text-yellow-800',
      icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
      title: 'هشدار',
    },
    error: {
      container: 'bg-red-50 border-red-500 text-red-800',
      icon: <XCircle className="h-5 w-5 text-red-500" />,
      title: 'خطا',
    },
  };

  const currentStyle = styles[type] || styles.info;

  return (
    <div
      className={`border-r-4 rounded p-4 ${currentStyle.container} ${className}`}
      role="alert"
    >
      <div className="flex">
        <div className="flex-shrink-0 ml-3">
          {currentStyle.icon}
        </div>
        <div className="flex-1">
          {title && (
            <h3 className="text-sm font-medium mb-1">
              {title}
            </h3>
          )}
          <div className="text-sm">
            {message}
          </div>
        </div>
        {dismissible && onClose && (
          <button
            type="button"
            className="mr-auto -mr-1 -mt-1 bg-transparent text-gray-400 hover:text-gray-900 rounded-md focus:outline-none"
            onClick={onClose}
            aria-label="بستن"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;