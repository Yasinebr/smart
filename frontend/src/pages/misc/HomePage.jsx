// src/pages/misc/HomePage.jsx
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Car, Calendar, CreditCard, User, Check, MapPin } from 'lucide-react';
import AuthContext from '../../contexts/AuthContext';
import Button from '../../components/common/Button';

const HomePage = () => {
  const { isAuthenticated } = useContext(AuthContext);

  // بخش‌های اصلی صفحه
  const features = [
    {
      title: 'تشخیص هوشمند پلاک',
      description: 'با استفاده از هوش مصنوعی، پلاک خودروها را به صورت خودکار تشخیص می‌دهیم',
      icon: <Car className="h-8 w-8 text-blue-600" />,
    },
    {
      title: 'رزرو آنلاین پارکینگ',
      description: 'به راحتی جای پارک خود را رزرو کنید و از گشتن به دنبال پارکینگ خلاص شوید',
      icon: <Calendar className="h-8 w-8 text-blue-600" />,
    },
    {
      title: 'پرداخت الکترونیکی',
      description: 'پرداخت‌های شما به صورت امن و آنلاین انجام می‌شود',
      icon: <CreditCard className="h-8 w-8 text-blue-600" />,
    },
    {
      title: 'مدیریت حساب کاربری',
      description: 'تمام اطلاعات رزروها، پرداخت‌ها و خودروهای خود را در یک جا مدیریت کنید',
      icon: <User className="h-8 w-8 text-blue-600" />,
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:w-full lg:max-w-2xl lg:pb-28 xl:pb-32">
            <main className="mx-auto mt-10 max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-right">
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">مدیریت پارکینگ هوشمند</span>
                  <span className="block text-blue-600">به‌راحتی و سرعت</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mx-auto sm:mt-5 sm:max-w-xl sm:text-lg md:mt-5 md:text-xl lg:mx-0">
                  با سیستم هوشمند پارکینگ، مدیریت ورود و خروج خودروها، رزرو آنلاین و پرداخت‌های الکترونیکی را به راحتی انجام دهید.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  {isAuthenticated ? (
                    <div className="rounded-md shadow">
                      <Link
                        to="/dashboard"
                        className="flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-8 py-3 text-base font-medium text-white hover:bg-blue-700 md:py-4 md:px-10 md:text-lg"
                      >
                        داشبورد من
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="rounded-md shadow">
                        <Link
                          to="/register"
                          className="flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-8 py-3 text-base font-medium text-white hover:bg-blue-700 md:py-4 md:px-10 md:text-lg"
                        >
                          شروع کنید
                        </Link>
                      </div>
                      <div className="mt-3 sm:mt-0 sm:mr-3">
                        <Link
                          to="/login"
                          className="flex w-full items-center justify-center rounded-md border border-blue-600 bg-white px-8 py-3 text-base font-medium text-blue-600 hover:bg-gray-50 md:py-4 md:px-10 md:text-lg"
                        >
                          ورود
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:left-0 lg:h-full lg:w-1/2">
          <img
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:h-full lg:w-full"
            src="/assets/images/parking-illustration.svg"
            alt="پارکینگ هوشمند"
          />
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">ویژگی‌ها</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              راهکار هوشمند برای مدیریت پارکینگ
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              با استفاده از تکنولوژی‌های پیشرفته، تجربه‌ای متفاوت در مدیریت پارکینگ داشته باشید.
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <div key={index} className="pt-6">
                  <div className="flow-root bg-white rounded-lg px-6 pb-8 border border-gray-200">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                          {feature.icon}
                        </span>
                      </div>
                      <h3 className="mt-5 text-lg font-medium text-gray-900 tracking-tight">{feature.title}</h3>
                      <p className="mt-2 text-base text-gray-500">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Benefits section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center">
            چرا سیستم پارکینگ هوشمند؟
          </h2>
          <div className="mt-12 space-y-10 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3 lg:gap-x-8">
            {[
              "صرفه‌جویی در زمان و کاهش ترافیک",
              "افزایش امنیت و نظارت دقیق",
              "کاهش هزینه‌های عملیاتی",
              "راحتی در یافتن جای پارک",
              "مدیریت بهینه فضای پارکینگ",
              "گزارش‌های دقیق و تحلیلی"
            ].map((benefit, index) => (
              <div key={index} className="flex">
                <Check className="flex-shrink-0 h-6 w-6 text-green-500" />
                <div className="mr-3">
                  <p className="text-lg font-medium text-gray-900">{benefit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-blue-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">آماده استفاده از سیستم هستید؟</span>
            <span className="block text-blue-100">همین امروز شروع کنید.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                to={isAuthenticated ? "/dashboard" : "/register"}
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
              >
                {isAuthenticated ? "ورود به داشبورد" : "ثبت‌نام رایگان"}
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-800 hover:bg-blue-700"
              >
                اطلاعات بیشتر
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
