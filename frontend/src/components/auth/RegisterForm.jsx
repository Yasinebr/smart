// src/components/auth/RegisterForm.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { registerUser } from '../../api/auth';
import { useNotification } from '../../contexts/NotificationContext';

// طرح اعتبارسنجی فرم ثبت‌نام
const RegisterSchema = Yup.object().shape({
  email: Yup.string()
    .email('ایمیل وارد شده معتبر نیست')
    .required('لطفاً ایمیل خود را وارد کنید'),
  password: Yup.string()
    .min(8, 'رمز عبور باید حداقل 8 کاراکتر باشد')
    .required('لطفاً رمز عبور خود را وارد کنید'),
  confirm_password: Yup.string()
    .oneOf([Yup.ref('password'), null], 'رمزهای عبور مطابقت ندارند')
    .required('لطفاً تکرار رمز عبور را وارد کنید'),
  first_name: Yup.string()
    .required('لطفاً نام خود را وارد کنید'),
  last_name: Yup.string()
    .required('لطفاً نام خانوادگی خود را وارد کنید'),
  phone_number: Yup.string()
    .matches(/^[0-9]{11}$/, 'شماره تلفن باید 11 رقم باشد'),
});

const RegisterForm = () => {
  const navigate = useNavigate();
  const { notify } = useNotification();
  const [isLoading, setIsLoading] = useState(false);

  // ارسال فرم ثبت‌نام
  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    setIsLoading(true);
    try {
      const userData = {
        ...values,
        role: 'customer', // نقش پیش‌فرض برای کاربران جدید
      };

      const response = await registerUser(userData);
      if (response.data) {
        notify.success('ثبت‌نام با موفقیت انجام شد. لطفاً وارد شوید.');
        navigate('/login');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'خطا در ثبت‌نام';
      setErrors({ general: errorMessage });
      notify.error(errorMessage);
    } finally {
      setSubmitting(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="register-form-container">
      <div className="register-form-header">
        <img src="/assets/images/logo.svg" alt="Smart Parking System Logo" />
        <h2>ثبت‌نام در سیستم پارکینگ هوشمند</h2>
      </div>

      <Formik
        initialValues={{
          email: '',
          password: '',
          confirm_password: '',
          first_name: '',
          last_name: '',
          phone_number: '',
        }}
        validationSchema={RegisterSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form className="register-form">
            {errors.general && (
              <div className="alert alert-danger">{errors.general}</div>
            )}

            <div className="form-row">
              <div className="form-group col-md-6">
                <label htmlFor="first_name">نام</label>
                <Field
                  type="text"
                  name="first_name"
                  id="first_name"
                  className={`form-control ${errors.first_name && touched.first_name ? 'is-invalid' : ''}`}
                  placeholder="نام خود را وارد کنید"
                />
                <ErrorMessage name="first_name" component="div" className="invalid-feedback" />
              </div>

              <div className="form-group col-md-6">
                <label htmlFor="last_name">نام خانوادگی</label>
                <Field
                  type="text"
                  name="last_name"
                  id="last_name"
                  className={`form-control ${errors.last_name && touched.last_name ? 'is-invalid' : ''}`}
                  placeholder="نام خانوادگی خود را وارد کنید"
                />
                <ErrorMessage name="last_name" component="div" className="invalid-feedback" />
              </div>
            </div>

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
              <label htmlFor="phone_number">شماره تلفن</label>
              <Field
                type="text"
                name="phone_number"
                id="phone_number"
                className={`form-control ${errors.phone_number && touched.phone_number ? 'is-invalid' : ''}`}
                placeholder="شماره تلفن خود را وارد کنید"
              />
              <ErrorMessage name="phone_number" component="div" className="invalid-feedback" />
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

            <div className="form-group">
              <label htmlFor="confirm_password">تکرار رمز عبور</label>
              <Field
                type="password"
                name="confirm_password"
                id="confirm_password"
                className={`form-control ${errors.confirm_password && touched.confirm_password ? 'is-invalid' : ''}`}
                placeholder="رمز عبور خود را مجدداً وارد کنید"
              />
              <ErrorMessage name="confirm_password" component="div" className="invalid-feedback" />
            </div>

            <div className="form-group form-check">
              <Field type="checkbox" name="terms" id="terms" className="form-check-input" />
              <label className="form-check-label" htmlFor="terms">
                با <Link to="/terms">قوانین و مقررات</Link> موافقم
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
                  'ثبت‌نام'
                )}
              </button>
            </div>

            <div className="register-form-footer">
              <div className="login-link">
                قبلاً ثبت‌نام کرده‌اید؟ <Link to="/login">ورود</Link>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default RegisterForm;