// src/components/auth/LoginForm.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import useAuth from '../../hooks/useAuth';
import { useNotification } from '../../contexts/NotificationContext';

// طرح اعتبارسنجی فرم ورود
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('ایمیل وارد شده معتبر نیست')
    .required('لطفاً ایمیل خود را وارد کنید'),
  password: Yup.string()
    .required('لطفاً رمز عبور خود را وارد کنید'),
});

const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { notify } = useNotification();
  const [isLoading, setIsLoading] = useState(false);

  // ارسال فرم ورود
  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    setIsLoading(true);
    try {
      const result = await login(values.email, values.password);
      if (result.success) {
        notify.success('ورود موفقیت‌آمیز بود!');
        navigate('/dashboard');
      } else {
        setErrors({ general: result.error });
        notify.error(result.error || 'خطا در ورود به سیستم');
      }
    } catch (error) {
      setErrors({ general: 'خطا در ارتباط با سرور' });
      notify.error('خطا در ارتباط با سرور');
    } finally {
      setSubmitting(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="login-form-container">
      <div className="login-form-header">
        <img src="/assets/images/logo.svg" alt="Smart Parking System Logo" />
        <h2>ورود به سیستم پارکینگ هوشمند</h2>
      </div>

      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={LoginSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form className="login-form">
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
              <label htmlFor="password">رمز عبور</label>
              <Field
                type="password"
                name="password"
                id="password"
                className={`form-control ${errors.password && touched.password ? 'is-invalid' : ''}`}
                placeholder="رمز عبور خود را وارد کنید"
              />
              <ErrorMessage name="password" component="div" className="invalid-feedback" />
            </div>

            <div className="form-group form-check">
              <Field type="checkbox" name="remember" id="remember" className="form-check-input" />
              <label className="form-check-label" htmlFor="remember">
                مرا به خاطر بسپار
              </label>
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
                  'ورود'
                )}
              </button>
            </div>

            <div className="login-form-footer">
              <Link to="/forgot-password" className="forgot-password-link">
                رمز عبور خود را فراموش کرده‌اید؟
              </Link>
              <div className="register-link">
                حساب کاربری ندارید؟ <Link to="/register">ثبت‌نام</Link>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default LoginForm;