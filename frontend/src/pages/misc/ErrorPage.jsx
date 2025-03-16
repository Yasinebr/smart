// src/pages/misc/ErrorPage.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, RefreshCw, AlertTriangle } from 'lucide-react';
import Button from '../../components/common/Button';

const ErrorPage = () => {
  const location = useLocation();
  const error = location.state?.error;

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-red-100 p-4">
            <AlertTriangle className="h-16 w-16 text-red-600" />
          </div>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900">خطایی رخ داده است</h1>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 font-medium">{error.message || 'خطای ناشناخته'}</p>
            {error.stack && process.env.NODE_ENV === 'development' && (
              <details className="mt-2 text-left">
                <summary className="text-sm text-gray-500 cursor-pointer">جزئیات خطا</summary>
                <pre className="mt-2 text-xs text-red-800 bg-gray-100 p-2 rounded overflow-x-auto">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        )}

        <p className="mt-4 text-gray-600">
          متأسفانه خطایی در سیستم رخ داده است. لطفاً صفحه را بارگیری مجدد کنید یا بعداً دوباره تلاش کنید.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Link to="/">
            <Button
              variant="primary"
              icon={<Home size={20} />}
            >
              بازگشت به صفحه اصلی
            </Button>
          </Link>
          <Button
            onClick={handleRefresh}
            variant="outline"
            icon={<RefreshCw size={20} />}
          >
            بارگیری مجدد
          </Button>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          اگر با این مشکل مجدداً مواجه شدید، لطفاً با
          <Link to="/contact" className="text-blue-600 hover:text-blue-500 mr-1">
            پشتیبانی ما
          </Link>
          تماس بگیرید.
        </p>
      </div>
    </div>
  );
};

export default ErrorPage;
