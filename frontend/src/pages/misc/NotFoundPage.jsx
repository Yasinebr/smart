// src/pages/misc/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-container">
        <div className="not-found-image">
          <img src="/assets/images/not-found.svg" alt="صفحه یافت نشد" />
        </div>
        <div className="not-found-content">
          <h1>۴۰۴</h1>
          <h2>صفحه مورد نظر یافت نشد!</h2>
          <p>متأسفانه صفحه‌ای که به دنبال آن هستید وجود ندارد یا به آدرس دیگری منتقل شده است.</p>
          <div className="not-found-actions">
            <Link to="/" className="btn btn-primary">
              <i className="fas fa-home"></i> بازگشت به صفحه اصلی
            </Link>
            <Link to="/contact" className="btn btn-outline-primary">
              <i className="fas fa-envelope"></i> تماس با پشتیبانی
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;