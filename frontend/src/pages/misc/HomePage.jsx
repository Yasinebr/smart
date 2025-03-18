// src/pages/misc/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const HomePage = () => {
  const { currentUser, isAuthenticated } = useAuth();

  return (
    <div className="home-page">
      {/* هدر */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>سیستم هوشمند مدیریت پارکینگ</h1>
          <p>با استفاده از فناوری‌های هوش مصنوعی و اینترنت اشیاء، مدیریت پارکینگ را ساده کنید</p>
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary btn-lg">
              <i className="fas fa-tachometer-alt"></i> رفتن به داشبورد
            </Link>
          ) : (
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-primary btn-lg">
                <i className="fas fa-user-plus"></i> ثبت‌نام
              </Link>
              <Link to="/login" className="btn btn-outline-primary btn-lg">
                <i className="fas fa-sign-in-alt"></i> ورود
              </Link>
            </div>
          )}
        </div>
        <div className="hero-image">
          <img src="/assets/images/parking-illustration.svg" alt="سیستم پارکینگ هوشمند" />
        </div>
      </div>

      {/* بخش ویژگی‌ها */}
      <div className="features-section">
        <div className="section-title">
          <h2>ویژگی‌های سیستم</h2>
          <p>راه‌حل‌های هوشمند برای مدیریت پارکینگ</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-video"></i>
            </div>
            <h3>تشخیص پلاک خودکار</h3>
            <p>با استفاده از فناوری تشخیص تصویر، پلاک خودروها به صورت خودکار شناسایی می‌شوند.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-mobile-alt"></i>
            </div>
            <h3>رزرو آنلاین</h3>
            <p>امکان رزرو آنلاین جای پارک از طریق وب‌سایت یا اپلیکیشن موبایل با چند کلیک ساده.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-map-marker-alt"></i>
            </div>
            <h3>مدیریت فضای پارکینگ</h3>
            <p>نمایش آنلاین وضعیت اشغال پارکینگ و مدیریت هوشمند فضای پارک.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-money-bill-wave"></i>
            </div>
            <h3>پرداخت آنلاین</h3>
            <p>امکان پرداخت هزینه پارکینگ به صورت آنلاین و بدون نیاز به پرداخت نقدی.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <h3>گزارش‌گیری پیشرفته</h3>
            <p>ارائه گزارش‌های آماری و تحلیلی از وضعیت پارکینگ برای مدیران.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-clock"></i>
            </div>
            <h3>دسترسی ۲۴ ساعته</h3>
            <p>امکان استفاده از سیستم به صورت شبانه‌روزی و در تمام روزهای هفته.</p>
          </div>
        </div>
      </div>

      {/* بخش نحوه کار */}
      <div className="how-it-works-section">
        <div className="section-title">
          <h2>نحوه کار</h2>
          <p>استفاده از سیستم پارکینگ هوشمند به سادگی ۱، ۲، ۳!</p>
        </div>
        <div className="steps-container">
          <div className="step-item">
            <div className="step-number">۱</div>
            <div className="step-icon">
              <i className="fas fa-user-plus"></i>
            </div>
            <h3>ثبت‌نام کنید</h3>
            <p>در سیستم ثبت‌نام کرده و خودروهای خود را در پروفایل خود ثبت کنید.</p>
          </div>
          <div className="step-item">
            <div className="step-number">۲</div>
            <div className="step-icon">
              <i className="fas fa-calendar-check"></i>
            </div>
            <h3>رزرو کنید</h3>
            <p>پارکینگ مورد نظر خود را انتخاب کرده و برای زمان موردنظر رزرو کنید.</p>
          </div>
          <div className="step-item">
            <div className="step-number">۳</div>
            <div className="step-icon">
              <i className="fas fa-parking"></i>
            </div>
            <h3>پارک کنید</h3>
            <p>در زمان مقرر به پارکینگ مراجعه کرده و از جای پارک خود استفاده کنید.</p>
          </div>
        </div>
      </div>

      {/* بخش پارکینگ‌های محبوب */}
      <div className="popular-parkings-section">
        <div className="section-title">
          <h2>پارکینگ‌های محبوب</h2>
          <p>پرطرفدارترین پارکینگ‌های موجود در سیستم</p>
        </div>
        <div className="parkings-grid">
          <div className="parking-card">
            <div className="parking-image">
              <img src="/assets/images/parking1.jpg" alt="پارکینگ مرکزی" />
              <div className="parking-status available">فضای آزاد: ۲۵</div>
            </div>
            <div className="parking-content">
              <h3>پارکینگ مرکزی</h3>
              <p className="parking-address">خیابان ولیعصر، نرسیده به میدان ونک</p>
              <div className="parking-features">
                <span title="دوربین مداربسته"><i className="fas fa-video"></i></span>
                <span title="آسانسور"><i className="fas fa-elevator"></i></span>
                <span title="۲۴ ساعته"><i className="fas fa-clock"></i></span>
              </div>
              <div className="parking-price">
                <span>از ۱۰,۰۰۰ تومان / ساعت</span>
              </div>
              <Link to="/parking-lots/1" className="btn btn-outline-primary btn-block">
                مشاهده جزئیات
              </Link>
            </div>
          </div>
          <div className="parking-card">
            <div className="parking-image">
              <img src="/assets/images/parking2.jpg" alt="پارکینگ شمال" />
              <div className="parking-status full">فضای آزاد: ۰</div>
            </div>
            <div className="parking-content">
              <h3>پارکینگ شمال</h3>
              <p className="parking-address">بلوار آفریقا، خیابان گلفام</p>
              <div className="parking-features">
                <span title="دوربین مداربسته"><i className="fas fa-video"></i></span>
                <span title="شارژر برقی"><i className="fas fa-charging-station"></i></span>
                <span title="سرپوشیده"><i className="fas fa-home"></i></span>
              </div>
              <div className="parking-price">
                <span>از ۱۵,۰۰۰ تومان / ساعت</span>
              </div>
              <Link to="/parking-lots/2" className="btn btn-outline-primary btn-block">
                مشاهده جزئیات
              </Link>
            </div>
          </div>
          <div className="parking-card">
            <div className="parking-image">
              <img src="/assets/images/parking3.jpg" alt="پارکینگ غرب" />
              <div className="parking-status available">فضای آزاد: ۱۸</div>
            </div>
            <div className="parking-content">
              <h3>پارکینگ غرب</h3>
              <p className="parking-address">بلوار اشرفی اصفهانی، تقاطع مرزداران</p>
              <div className="parking-features">
                <span title="دوربین مداربسته"><i className="fas fa-video"></i></span>
                <span title="آسانسور"><i className="fas fa-elevator"></i></span>
                <span title="۲۴ ساعته"><i className="fas fa-clock"></i></span>
              </div>
              <div className="parking-price">
                <span>از ۸,۰۰۰ تومان / ساعت</span>
              </div>
              <Link to="/parking-lots/3" className="btn btn-outline-primary btn-block">
                مشاهده جزئیات
              </Link>
            </div>
          </div>
        </div>
        <div className="view-all-container">
          <Link to="/parking-lots" className="btn btn-primary">
            مشاهده همه پارکینگ‌ها
          </Link>
        </div>
      </div>

      {/* بخش نظرات مشتریان */}
      <div className="testimonials-section">
        <div className="section-title">
          <h2>نظرات مشتریان</h2>
          <p>کاربران درباره سیستم پارکینگ هوشمند چه می‌گویند</p>
        </div>
        <div className="testimonials-slider">
          <div className="testimonial-item">
            <div className="testimonial-content">
              <p>«استفاده از این سیستم زمان زیادی برای من صرفه‌جویی کرد. دیگر نگران پیدا کردن جای پارک نیستم.»</p>
            </div>
            <div className="testimonial-author">
              <img src="/assets/images/user1.jpg" alt="علی محمدی" />
              <div className="author-info">
                <h4>علی محمدی</h4>
                <p>کاربر سیستم</p>
              </div>
            </div>
          </div>
          <div className="testimonial-item">
            <div className="testimonial-content">
              <p>«به عنوان مدیر یک پارکینگ بزرگ، این سیستم به من کمک کرد تا بتوانم به راحتی پارکینگ را مدیریت کنم.»</p>
            </div>
            <div className="testimonial-author">
              <img src="/assets/images/user2.jpg" alt="مریم حسینی" />
              <div className="author-info">
                <h4>مریم حسینی</h4>
                <p>مدیر پارکینگ</p>
              </div>
            </div>
          </div>
          <div className="testimonial-item">
            <div className="testimonial-content">
              <p>«امکان رزرو آنلاین و پرداخت اینترنتی بسیار کاربردی است. دیگر مشکل پول خرد ندارم!»</p>
            </div>
            <div className="testimonial-author">
              <img src="/assets/images/user3.jpg" alt="رضا کریمی" />
              <div className="author-info">
                <h4>رضا کریمی</h4>
                <p>کاربر سیستم</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* بخش تماس با ما */}
      <div className="contact-section">
        <div className="section-title">
          <h2>تماس با ما</h2>
          <p>در صورت نیاز به پشتیبانی با ما در ارتباط باشید</p>
        </div>
        <div className="contact-container">
          <div className="contact-info">
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
          </div>
          <div className="contact-form">
            <form>
              <div className="form-row">
                <div className="form-group col-md-6">
                  <input type="text" className="form-control" placeholder="نام و نام خانوادگی" />
                </div>
                <div className="form-group col-md-6">
                  <input type="email" className="form-control" placeholder="ایمیل" />
                </div>
              </div>
              <div className="form-group">
                <input type="text" className="form-control" placeholder="موضوع" />
              </div>
              <div className="form-group">
                <textarea className="form-control" rows="5" placeholder="پیام شما"></textarea>
              </div>
              <button type="submit" className="btn btn-primary">ارسال پیام</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;