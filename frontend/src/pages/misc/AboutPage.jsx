// src/pages/misc/AboutPage.jsx
import React from 'react';

const AboutPage = () => {
  return (
    <div className="about-page">
      <div className="page-header">
        <h1>درباره ما</h1>
        <p>آشنایی با سیستم پارکینگ هوشمند</p>
      </div>

      <div className="about-section">
        <div className="about-content">
          <h2>سیستم پارکینگ هوشمند چیست؟</h2>
          <p>
            سیستم پارکینگ هوشمند یک راه‌حل جامع برای مدیریت پارکینگ‌ها با استفاده از فناوری‌های نوین است.
            این سیستم با بهره‌گیری از هوش مصنوعی، اینترنت اشیاء و تکنولوژی‌های تشخیص تصویر، مدیریت پارکینگ را
            ساده‌تر، کارآمدتر و هوشمندتر می‌کند.
          </p>
          <p>
            هدف ما ارائه یک پلتفرم یکپارچه برای مدیران پارکینگ‌ها و کاربران است که بتوانند به راحتی
            پارکینگ‌ها را مدیریت کرده و از آن‌ها استفاده کنند. این سیستم مشکلات رایج در مدیریت پارکینگ مانند
            تشخیص پلاک، مدیریت فضای پارکینگ، رزرو آنلاین و پرداخت الکترونیکی را حل می‌کند.
          </p>
        </div>
        <div className="about-image">
          <img src="/assets/images/about-image.jpg" alt="سیستم پارکینگ هوشمند" />
        </div>
      </div>

      <div className="mission-section">
        <div className="mission-content">
          <h2>ماموریت ما</h2>
          <p>
            ماموریت ما ساده‌سازی فرآیند مدیریت پارکینگ و استفاده از آن برای همه افراد است. ما به دنبال
            ارائه راه‌حلی هستیم که زمان و هزینه را برای مدیران پارکینگ و کاربران صرفه‌جویی کند و تجربه‌ای
            بهتر از پارک خودرو را فراهم آورد.
          </p>
        </div>
        <div className="vision-content">
          <h2>چشم‌انداز ما</h2>
          <p>
            چشم‌انداز ما ایجاد یک شبکه جهانی از پارکینگ‌های هوشمند متصل به هم است که به کاربران امکان می‌دهد
            در هر زمان و مکانی به راحتی جای پارک خود را پیدا کنند. ما می‌خواهیم استرس پیدا کردن جای پارک را
            از زندگی شهری حذف کنیم و به مدیریت بهتر منابع و کاهش ترافیک شهری کمک کنیم.
          </p>
        </div>
      </div>

      <div className="team-section">
        <h2>تیم ما</h2>
        <p>
          تیم ما متشکل از متخصصان باتجربه در زمینه‌های مختلف از جمله هوش مصنوعی، نرم‌افزار، سخت‌افزار،
          طراحی تجربه کاربری و مدیریت پروژه است. ما با تکیه بر دانش و تخصص تیم خود، بهترین راه‌حل‌ها را
          برای مشکلات مدیریت پارکینگ ارائه می‌دهیم.
        </p>

        <div className="team-members">
          <div className="team-member">
            <img src="/assets/images/team1.jpg" alt="حسین محمدی" />
            <h3>حسین محمدی</h3>
            <p>مدیرعامل و بنیان‌گذار</p>
          </div>
          <div className="team-member">
            <img src="/assets/images/team2.jpg" alt="فاطمه کریمی" />
            <h3>فاطمه کریمی</h3>
            <p>مدیر فنی</p>
          </div>
          <div className="team-member">
            <img src="/assets/images/team3.jpg" alt="علی رضایی" />
            <h3>علی رضایی</h3>
            <p>مدیر محصول</p>
          </div>
          <div className="team-member">
            <img src="/assets/images/team4.jpg" alt="نیلوفر احمدی" />
            <h3>نیلوفر احمدی</h3>
            <p>مدیر تحقیق و توسعه</p>
          </div>
        </div>
      </div>

      <div className="history-section">
        <h2>تاریخچه</h2>
        <div className="timeline">
          <div className="timeline-item">
            <div className="timeline-year">۱۳۹۸</div>
            <div className="timeline-content">
              <h3>شروع کار</h3>
              <p>شرکت سیستم پارکینگ هوشمند در سال ۱۳۹۸ با هدف حل مشکلات مدیریت پارکینگ تاسیس شد.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-year">۱۳۹۹</div>
            <div className="timeline-content">
              <h3>اولین نسخه</h3>
              <p>اولین نسخه از سیستم پارکینگ هوشمند با قابلیت‌های اولیه تشخیص پلاک و مدیریت فضای پارکینگ راه‌اندازی شد.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-year">۱۴۰۰</div>
            <div className="timeline-content">
              <h3>توسعه سیستم</h3>
              <p>قابلیت‌های رزرو آنلاین و پرداخت الکترونیکی به سیستم اضافه شد.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-year">۱۴۰۱</div>
            <div className="timeline-content">
              <h3>گسترش بازار</h3>
              <p>همکاری با بیش از ۱۰۰ پارکینگ در سراسر کشور و راه‌اندازی اپلیکیشن موبایل.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-year">۱۴۰۲</div>
            <div className="timeline-content">
              <h3>نسخه جدید</h3>
              <p>راه‌اندازی نسخه جدید سیستم با قابلیت‌های پیشرفته هوش مصنوعی و گزارش‌گیری.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
