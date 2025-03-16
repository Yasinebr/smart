// src/components/common/Loader.jsx
import React from 'react';

const Loader = ({
  size = 'md',
  color = 'blue',
  fullScreen = false,
  text = 'در حال بارگذاری...',
  showText = true
}) => {
  // تعیین اندازه لودر با توجه به مقدار ورودی
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
    xl: 'h-16 w-16 border-4',
  };

  // تعیین رنگ لودر با توجه به مقدار ورودی
  const colorClasses = {
    blue: 'border-blue-600 border-t-transparent',
    gray: 'border-gray-600 border-t-transparent',
    green: 'border-green-600 border-t-transparent',
    red: 'border-red-600 border-t-transparent',
    yellow: 'border-yellow-500 border-t-transparent',
  };

  const loaderElement = (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`rounded-full animate-spin ${sizeClasses[size] || sizeClasses.md} ${colorClasses[color] || colorClasses.blue}`}
      ></div>
      {showText && text && (
        <p className="mt-3 text-gray-700 font-medium">{text}</p>
      )}
    </div>
  );

  // اگر fullScreen باشد، لودر را در تمام صفحه نمایش می‌دهیم
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
        {loaderElement}
      </div>
    );
  }

  // در غیر این صورت، فقط لودر را در محل خودش نمایش می‌دهیم
  return loaderElement;
};

export default Loader;