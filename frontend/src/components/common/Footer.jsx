// src/components/common/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  // سال جاری برای کپی‌رایت
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <p>
            &copy; {currentYear} سیستم پارکینگ هوشمند. تمامی حقوق محفوظ است.
          </p>
        </div>
        <div className="footer-right">
          <Link to="/about">درباره ما</Link>
          <Link to="/contact">تماس با ما</Link>
          <Link to="/terms">قوانین و مقررات</Link>
          <Link to="/privacy">حریم خصوصی</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;