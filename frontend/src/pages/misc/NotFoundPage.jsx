// src/pages/misc/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import Button from '../../components/common/Button';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <img
            src="/assets/images/not-found.svg"
            alt="صفحه یافت نشد"
            className="h-48 w-auto"
          />
        </div>
        <h1 className="text-9xl font-extrabold text-blue-600">404</h1>
        <h2 className="mt-2 text-3xl font-bold text-gray-900">صفحه یافت نشد</h2>
        <p className="mt-4 text-gray-600">
          متأسفیم، صفحه‌ای که به دنبال آن هستید وجود ندارد یا به آدرس دیگری منتقل شده است.
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
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            بازگشت به صفحه قبل
          </button>
        </div>
        <p className="mt-6 text-sm text-gray-500">
          اگر فکر می‌کنید این یک اشتباه است، لطفاً با
          <Link to="/contact" className="text-blue-600 hover:text-blue-500 mr-1">
            پشتیبانی ما
          </Link>
          تماس بگیرید.
        </p>
      </div>
    </div>
  );
};

export default NotFoundPage;
