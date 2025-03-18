// src/pages/auth/ResetPasswordPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNotification } from '../../contexts/NotificationContext';

// طرح اعتبارسنجی فرم تغییر رمز عبور
const ResetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, 'رمز عبور باید حداقل 8 کاراکتر باشد')
    .required('لطفاً رمز عبور جدید را وارد کنید'),
  confirm_password: Yup.string()
    .oneOf([Yup.ref('password'), null], 'رمزهای عبور مطابقت ندارند')
    .required('لطفاً تکرار رمز عبور را وارد کنید'),
});

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { notify } = useNotification();
  const [isTokenValid, setIsTokenValid] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // بررسی اعتبار توکن
  useEffect(() => {
    // در اینجا باید API مربوط به بررسی اعتبار توکن فراخوانی شود
    // برای نمونه فرض می‌کنیم توکن معتبر است
    setTimeout(() => {
      setIsTokenValid(true);
      setIsLoading(false);
    }, 1000);
  }, [token]);

  // ارسال فرم تغییر رمز عبور
  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    setIsLoading(true);
    try {
      // در اینجا باید API مربوط به تغییر رمز عبور فراخوانی شود
      // فرض می‌کنیم موفقیت‌آمیز بوده است
      setTimeout(() => {
        notify.success('رمز عبور با موفقیت تغییر یافت.');
        navigate('/login');
      }, 1500);
    } catch (error) {
      setErrors({ general: 'خطا در تغییر رمز عبور' });
      notify.error('خطا در تغییر رمز عبور');
    } finally {
      setSubmitting(false);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-page">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>در حال بررسی اعتبار لینک...</p>
        </div>
      </div>
    );
  }

  if (!isTokenValid) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-form">
            <div className="reset-password-form-container">
              <div className="reset-password-form-header">
                <img src="/assets/images/logo.svg" alt="Smart Parking System Logo" />
                <h2>خطا در بازیابی رمز عبور</h2>
              </div>
              <div className="alert alert-danger">
                لینک بازیابی رمز عبور نامعتبر یا منقضی شده است.
              </div>
              <Link to="/forgot-password" className="btn btn-primary">
                درخواست لینک جدید
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-image">
          <img src="/assets/images/login-bg.jpg" alt="Parking System" />
        </div>
        <div className="auth-form">
          <div className="reset-password-form-container">
            <div className="reset-password-form-header">
              <img src="/assets/images/logo.svg" alt="Smart Parking System Logo" />
              <h2>تغییر رمز عبور</h2>
            </div>

            <Formik
              initialValues={{ password: '', confirm_password: '' }}
              validationSchema={ResetPasswordSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, isSubmitting }) => (
                <Form className="reset-password-form">
                  {errors.general && (
                    <div className="alert alert-danger">{errors.general}</div>
                  )}

                  <div className="form-group">
                    <label htmlFor="password">رمز عبور جدید</label>
                    <Field
                      type="password"
                      name="password"
                      id="password"
                      className={`form-control ${errors.password && touched.password ? 'is-invalid' : ''}`}
                      placeholder="رمز عبور جدید را وارد کنید"
                    />
                    <ErrorMessage name="password" component="div" className="invalid-feedback" />
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirm_password">تکرار رمز عبور جدید</label>
                    <Field
                      type="password"
                      name="confirm_password"
                      id="confirm_password"
                      className={`form-control ${errors.confirm_password && touched.confirm_password ? 'is-invalid' : ''}`}
                      placeholder="رمز عبور جدید را مجدداً وارد کنید"
                    />
                    <ErrorMessage name="confirm_password" component="div" className="invalid-feedback" />
                  </div>

                  <div className="form-group">
                    <button
                      type="submit"
                      className="btn btn-primary btn-block"
                      disabled={isSubmitting || isLoading}
                    >
                      {isSubmitting || isLoading ? (
                        <span>
                          <i className="fas fa-spinner fa-spin"></i> در حال پردازش...
                        </span>
                      ) : (
                        'تغییر رمز عبور'
                      )}
                    </button>
                  </div>

                  <div className="reset-password-form-footer">
                    <Link to="/login" className="back-to-login-link">
                      بازگشت به صفحه ورود
                    </Link>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;