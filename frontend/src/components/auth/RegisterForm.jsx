// src/components/auth/RegisterForm.jsx
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';
import Alert from '../common/Alert';
import Button from '../common/Button';
import FormInput from '../common/FormInput';
import { Mail, Lock, User, Phone } from 'lucide-react';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    password: '',
    confirm_password: '',
    role: 'customer' // پیش‌فرض: مشتری عادی
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('');

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const validate = () => {
    const newErrors = {};

    // ایمیل
    if (!formData.email) {
      newErrors.email = 'ایمیل الزامی است';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'فرمت ایمیل صحیح نیست';
    }

    // نام
    if (!formData.first_name) {
      newErrors.first_name = 'نام الزامی است';
    }

    // نام خانوادگی
    if (!formData.last_name) {
      newErrors.last_name = 'نام خانوادگی الزامی است';
    }

    // شماره تلفن
    if (formData.phone_number && !/^(?:\+98|0)?9\d{9}$/.test(formData.phone_number)) {
      newErrors.phone_number = 'شماره موبایل معتبر نیست (مثال: 09123456789)';
    }

    // رمز عبور
    if (!formData.password) {
      newErrors.password = 'رمز عبور الزامی است';
    } else if (formData.password.length < 8) {
      newErrors.password = 'رمز عبور باید حداقل 8 کاراکتر باشد';
    }

    // تأیید رمز عبور
    if (!formData.confirm_password) {
      newErrors.confirm_password = 'تأیید رمز عبور الزامی است';
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'رمز عبور و تأیید آن مطابقت ندارند';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    setAlertMessage('');

    try {
      await register(formData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);

      // نمایش خطاهای API
      if (error.response?.data) {
        const apiErrors = error.response.data;
        const errorFields = {};

        // پردازش خطاهای فیلد به فیلد
        for (const [key, value] of Object.entries(apiErrors)) {
          if (Array.isArray(value)) {
            errorFields[key] = value[0];
          } else if (typeof value === 'string') {
            errorFields[key] = value;
          }
        }

        if (Object.keys(errorFields).length > 0) {
          setErrors(errorFields);
        } else {
          setAlertType('error');
          setAlertMessage(error.response.data.detail || 'خطا در ثبت‌نام');
        }
      } else {
        setAlertType('error');
        setAlertMessage('خطا در ثبت‌نام. لطفاً دوباره تلاش کنید.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
      <h2 className="text-2xl font-bold text-center mb-6">ثبت‌نام در سیستم</h2>

      {alertMessage && (
        <Alert
          type={alertType}
          message={alertMessage}
          onClose={() => setAlertMessage('')}
          className="mb-4"
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ایمیل */}
        <FormInput
          label="ایمیل"
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="ایمیل خود را وارد کنید"
          error={errors.email}
          icon={<Mail size={20} />}
          required
        />

        {/* نام */}
        <FormInput
          label="نام"
          type="text"
          id="first_name"
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
          placeholder="نام خود را وارد کنید"
          error={errors.first_name}
          icon={<User size={20} />}
          required
        />

        {/* نام خانوادگی */}
        <FormInput
          label="نام خانوادگی"
          type="text"
          id="last_name"
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
          placeholder="نام خانوادگی خود را وارد کنید"
          error={errors.last_name}
          icon={<User size={20} />}
          required
        />

        {/* شماره تلفن */}
        <FormInput
          label="شماره موبایل"
          type="tel"
          id="phone_number"
          name="phone_number"
          value={formData.phone_number}
          onChange={handleChange}
          placeholder="شماره موبایل خود را وارد کنید"
          error={errors.phone_number}
          icon={<Phone size={20} />}
        />

        {/* رمز عبور */}
        <FormInput
          label="رمز عبور"
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="رمز عبور خود را وارد کنید"
          error={errors.password}
          icon={<Lock size={20} />}
          required
        />

        {/* تأیید رمز عبور */}
        <FormInput
          label="تأیید رمز عبور"
          type="password"
          id="confirm_password"
          name="confirm_password"
          value={formData.confirm_password}
          onChange={handleChange}
          placeholder="رمز عبور خود را مجدداً وارد کنید"
          error={errors.confirm_password}
          icon={<Lock size={20} />}
          required
        />

        {/* قوانین و مقررات */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="accept_terms"
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            required
          />
          <label htmlFor="accept_terms" className="mr-2 text-sm text-gray-600">
            <span>من با </span>
            <Link to="/terms" className="text-blue-600 hover:text-blue-800">
              قوانین و مقررات
            </Link>
            <span> موافقم</span>
          </label>
        </div>

        <Button
          type="submit"
          fullWidth
          loading={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white mt-6"
        >
          ثبت‌نام
        </Button>
      </form>

      <div className="text-center mt-6">
        <p className="text-gray-600">
          قبلاً ثبت‌نام کرده‌اید؟{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-800">
            ورود به سیستم
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;