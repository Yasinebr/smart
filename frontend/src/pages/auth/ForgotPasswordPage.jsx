// src/pages/auth/ForgotPasswordPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNotification } from '../../contexts/NotificationContext';

// طرح اعتبارسنجی فرم فراموشی رمز عبور
const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('ایمیل وارد شده معتبر نیست')
    .required('لطفاً ایمیل خود را وارد کنید'),
});

const ForgotPasswordPage = () => {
  const { notify } = useNotification();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ارسال فرم فراموشی رمز عبور
  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    setIsLoading(true);
    try {
      // در اینجا باید API مربوط به فراموشی رمز عبور فراخوانی شود
      // فرض می‌کنیم موفقیت‌آمیز بوده است
      setTimeout(() => {
        setIsSubmitted(true);
        notify.success('لینک بازیابی رمز عبور به ایمیل شما ارسال شد.');
      }, 1500);
    } catch (error) {
      setErrors({ general: 'خطا در ارسال ایمیل بازیابی رمز عبور' });
      notify.error('خطا در ارسال ایمیل بازیابی رمز عبور');
    } finally {
      setSubmitting(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-image">
          <img src="/assets/images/login-bg.jpg" alt="Parking System" />
        </div>
        <div className="auth-form">
          <div className="forgot-password-form-container">
            <div className="forgot-password-form-header">
              <img src="/assets/images/logo.svg" alt="Smart Parking System Logo" />
              <h2>بازیابی رمز عبور</h2>
            </div>

            {isSubmitted ? (
              <div className="forgot-password-success">
                <div className="alert alert-success">
                  لینک بازیابی رمز عبور به ایمیل شما ارسال شد. لطفاً ایمیل خود را بررسی کنید.
                </div>
                <Link to="/login" className="btn btn-primary">
                  بازگشت به صفحه ورود
                </Link>
              </div>
            ) : (
              <Formik
                initialValues={{ email: '' }}
                validationSchema={ForgotPasswordSchema}
                onSubmit={handleSubmit}
              >
                {({ errors, touched, isSubmitting }) => (
                  <Form className="forgot-password-form">
                    {errors.general && (
                      <div className="alert alert-danger">{errors.general}</div>
                    )}

                    <div className="form-group">
                      <label htmlFor="email">ایمیل</label>
                      <Field
                        type="email"
                        name="email"
                        id="email"
                        className={`form-control ${errors.email && touched.email ? 'is-invalid' : ''}`}
                        placeholder="ایمیل خود را وارد کنید"
                      />
                      <ErrorMessage name="email" component="div" className="invalid-feedback" />
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
                          'ارسال لینک بازیابی'
                        )}
                      </button>
                    </div>

                    <div className="forgot-password-form-footer">
                      <Link to="/login" className="back-to-login-link">
                        بازگشت به صفحه ورود
                      </Link>
                    </div>
                  </Form>
                )}
              </Formik>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;