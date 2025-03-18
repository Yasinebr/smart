// src/pages/misc/ContactPage.jsx
import React, { useState } from 'react';
import { useNotification } from '../../contexts/NotificationContext';

const ContactPage = () => {
  const { notify } = useNotification();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // بررسی اعتبار فرم
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      notify.warning('لطفاً تمامی فیلدها را پر کنید.');
      return;
    }

    // ارسال پیام
    setLoading(true);

    // شبیه‌سازی ارسال پیام به سرور
    setTimeout(() => {
      notify.success('پیام شما با موفقیت ارسال شد. به زودی با شما تماس خواهیم گرفت.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="contact-page">
      <div className="page-header">
        <h1>تماس با ما</h1>
        <p>ما آماده پاسخگویی به سوالات شما هستیم</p>
      </div>

      <div className="contact-container">
        <div className="contact-info">
          <h2>اطلاعات تماس</h2>
          <div className="contact-item">
            <div className="contact-icon">
              <i className="fas fa-map-marker-alt"></i>
            </div>
            <div className="contact-text">
              <h3>آدرس</h3>
              <p>تهران، خیابان ولیعصر، بالاتر از میدان ونک، پلاک ۱۲۳</p>
            </div>
          </div>
          <div className="contact-item">
            <div className="contact-icon">
              <i className="fas fa-phone"></i>
            </div>
            <div className="contact-text">
              <h3>تلفن</h3>
              <p>۰۲۱-۱۲۳۴۵۶۷۸</p>
            </div>
          </div>
          <div className="contact-item">
            <div className="contact-icon">
              <i className="fas fa-envelope"></i>
            </div>
            <div className="contact-text">
              <h3>ایمیل</h3>
              <p>info@smartparking.com</p>
            </div>
          </div>
          <div className="contact-item">
            <div className="contact-icon">
              <i className="fas fa-clock"></i>
            </div>
            <div className="contact-text">
              <h3>ساعات کاری</h3>
              <p>شنبه تا چهارشنبه: ۸ الی ۱۷</p>
              <p>پنجشنبه: ۸ الی ۱۲</p>
              <p>جمعه: تعطیل</p>
            </div>
          </div>
          <div className="social-media">
            <h3>ما را در شبکه‌های اجتماعی دنبال کنید</h3>
            <div className="social-icons">
              <a href="#" className="social-icon"><i className="fab fa-instagram"></i></a>
              <a href="#" className="social-icon"><i className="fab fa-telegram"></i></a>
              <a href="#" className="social-icon"><i className="fab fa-twitter"></i></a>
              <a href="#" className="social-icon"><i className="fab fa-linkedin"></i></a>
            </div>
          </div>
        </div>
        <div className="contact-form-container">
          <h2>ارسال پیام</h2>
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group col-md-6">
                <label htmlFor="name">نام و نام خانوادگی</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-control"
                  placeholder="نام و نام خانوادگی خود را وارد کنید"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group col-md-6">
                <label htmlFor="email">ایمیل</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                  placeholder="ایمیل خود را وارد کنید"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="subject">موضوع</label>
              <input
                type="text"
                id="subject"
                name="subject"
                className="form-control"
                placeholder="موضوع پیام خود را وارد کنید"
                value={formData.subject}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="message">پیام</label>
              <textarea
                id="message"
                name="message"
                className="form-control"
                rows="6"
                placeholder="پیام خود را بنویسید..."
                value={formData.message}
                onChange={handleChange}
              ></textarea>
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> در حال ارسال...
                </>
              ) : (
                'ارسال پیام'
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="map-section">
        <h2>موقعیت ما روی نقشه</h2>
        <div className="map-container">
          {/* اینجا نقشه قرار می‌گیرد - برای نمونه از تصویر استفاده شده */}
          <img src="/assets/images/map.jpg" alt="موقعیت ما روی نقشه" className="map-image" />
        </div>
      </div>

      <div className="faq-section">
        <h2>سوالات متداول</h2>
        <div className="faq-items">
          <div className="faq-item">
            <h3>چگونه می‌توانم در سیستم ثبت‌نام کنم؟</h3>
            <p>
              برای ثبت‌نام در سیستم، روی گزینه «ثبت‌نام» در منوی اصلی کلیک کنید و فرم ثبت‌نام را تکمیل کنید.
              پس از تایید ایمیل، حساب کاربری شما فعال خواهد شد.
            </p>
          </div>
          <div className="faq-item">
            <h3>آیا باید هزینه اشتراک پرداخت کنم؟</h3>
            <p>
              استفاده از سیستم برای کاربران عادی رایگان است. تنها هزینه‌ای که پرداخت می‌کنید، هزینه رزرو
              پارکینگ است که به صورت آنلاین پرداخت می‌شود.
            </p>
          </div>
          <div className="faq-item">
            <h3>چگونه می‌توانم یک پارکینگ رزرو کنم؟</h3>
            <p>
              پس از ورود به حساب کاربری، از منوی «رزرو پارکینگ» می‌توانید پارکینگ مورد نظر خود را انتخاب
              کرده و برای زمان مورد نظر رزرو کنید.
            </p>
          </div>
          <div className="faq-item">
            <h3>آیا امکان لغو رزرو وجود دارد؟</h3>
            <p>
              بله، تا ۲ ساعت قبل از زمان رزرو می‌توانید رزرو خود را لغو کنید و هزینه پرداختی به حساب شما
              برگشت داده می‌شود.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
