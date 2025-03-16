// src/components/common/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 border-t border-gray-200 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* لوگو و متن کپی‌رایت */}
          <div className="mb-4 md:mb-0">
            <div className="flex items-center justify-center md:justify-start">
              <Link to="/" className="text-xl font-bold text-gray-800">
                سیستم پارکینگ هوشمند
              </Link>
            </div>
            <p className="text-sm text-gray-600 mt-2 text-center md:text-right">
              &copy; {currentYear} تمامی حقوق محفوظ است
            </p>
          </div>

          {/* لینک‌های مهم */}
          <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2">
            <Link to="/about" className="text-sm text-gray-600 hover:text-blue-600">
              درباره ما
            </Link>
            <Link to="/contact" className="text-sm text-gray-600 hover:text-blue-600">
              تماس با ما
            </Link>
            <Link to="/privacy" className="text-sm text-gray-600 hover:text-blue-600">
              حریم خصوصی
            </Link>
            <Link to="/terms" className="text-sm text-gray-600 hover:text-blue-600">
              قوانین استفاده
            </Link>
          </div>
        </div>

        {/* خط جدا کننده */}
        <hr className="my-4 border-gray-200" />

        {/* پیام سازنده */}
        <div className="text-sm text-gray-500 flex items-center justify-center">
          <span>با</span>
          <Heart className="mx-1 h-4 w-4 text-red-500" />
          <span>ساخته شده برای مدیریت هوشمند پارکینگ‌ها</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;