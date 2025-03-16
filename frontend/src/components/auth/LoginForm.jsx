// src/components/auth/LoginForm.jsx
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';
import Alert from '../common/Alert';
import Button from '../common/Button';
import FormInput from '../common/FormInput';
import { Mail, Lock } from 'lucide-react';

export default function LoginForm  ()  {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('');

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = 'ایمیل الزامی است';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'ایمیل معتبر نیست';
    }

    if (!password) {
      newErrors.password = 'رمز عبور الزامی است';
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
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setAlertType('error');
      setAlertMessage(
        error.response?.data?.detail ||
        'خطا در ورود به سیستم. لطفاً دوباره تلاش کنید.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
      <h2 className="text-2xl font-bold text-center mb-6">ورود به سیستم</h2>

      {alertMessage && (
        <Alert
          type={alertType}
          message={alertMessage}
          onClose={() => setAlertMessage('')}
          className="mb-4"
        />
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <FormInput
            label="ایمیل"
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ایمیل خود را وارد کنید"
            error={errors.email}
            icon={<Mail size={20} />}
            required
          />
        </div>

        <div className="mb-6">
          <FormInput
            label="رمز عبور"
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="رمز عبور خود را وارد کنید"
            error={errors.password}
            icon={<Lock size={20} />}
            required
          />
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="remember" className="mr-2 text-sm text-gray-600">
              مرا به خاطر بسپار
            </label>
          </div>
          <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
            رمز عبور را فراموش کرده‌اید؟
          </Link>
        </div>

        <Button
          type="submit"
          fullWidth
          loading={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          ورود
        </Button>
      </form>

      <div className="text-center mt-6">
        <p className="text-gray-600">
          حساب کاربری ندارید؟{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-800">
            ثبت‌نام کنید
          </Link>
        </p>
      </div>
    </div>
  );
};
