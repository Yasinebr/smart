// src/pages/auth/LoginPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../../components/auth/LoginForm';
import { Car } from 'lucide-react';

const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex flex-col lg:flex-row items-center w-full max-w-6xl mx-auto shadow-xl rounded-lg overflow-hidden">
        {/* بخش راست - فرم ورود */}
        <div className="w-full lg:w-1/2 px-4 py-12 bg-white flex items-center justify-center">
          <LoginForm />
        </div>

        {/* بخش چپ - تصویر و توضیحات */}
        <div className="w-full lg:w-1/2 bg-blue-600 text-white p-12 flex flex-col items-center justify-center">
          <div className="mb-8 flex items-center">
            <Car className="h-12 w-12 mr-2" />
            <h1 className="text-3xl font-bold">سیستم پارکینگ هوشمند</h1>
          </div>

          <h2 className="text-2xl font-semibold mb-6">خوش آمدید</h2>

          <p className="text-lg mb-8 text-center">
            وارد حساب کاربری خود شوید و از امکانات سیستم پارکینگ هوشمند بهره‌مند شوید.
            رزرو پارکینگ، مدیریت خودروها و پرداخت‌های آنلاین تنها بخشی از امکانات ماست.
          </p>

          <div className="space-y-4 mb-8 w-full max-w-md">
            <div className="flex items-center">
              <div className="bg-blue-500 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="mr-3">دسترسی آسان به پارکینگ‌ها</span>
            </div>
            <div className="flex items-center">
              <div className="bg-blue-500 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="mr-3">تشخیص هوشمند پلاک</span>
            </div>
            <div className="flex items-center">
              <div className="bg-blue-500 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="mr-3">مدیریت آسان پرداخت‌ها</span>
            </div>
          </div>

          <p className="text-sm">
            حساب کاربری ندارید؟{' '}
            <Link to="/register" className="text-white font-bold underline hover:text-blue-200">
              ثبت‌نام کنید
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;