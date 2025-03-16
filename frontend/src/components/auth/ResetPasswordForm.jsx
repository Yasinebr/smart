// src/components/auth/ResetPasswordForm.jsx
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle, ArrowLeft } from 'lucide-react';
import AuthContext from '../../contexts/AuthContext';
import Button from '../common/Button';
import FormInput from '../common/FormInput';
import Alert from '../common/Alert';

const ResetPasswordForm = ({ token }) => {
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { resetPassword } = useContext(AuthContext);

  const validate = () => {
    if (!password) {
      setError('لطفاً رمز عبور جدید را وارد کنید');
      return false;
    }

    if (password.length < 8) {
      setError('رمز عبور باید حداقل 8 کاراکتر باشد');
      return false;
    }

    if (password !== confirmPassword) {
      setError('رمز عبور و تکرار آن مطابقت ندارند');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      await resetPassword(token, password);
      setIsSubmitted(true);

      // بعد از 3 ثانیه به صفحه ورود هدایت می‌شود
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Error in reset password:', err);
      setError(
        err.response?.data?.detail ||
        'خطا در بازنشانی رمز عبور. ممکن است توکن معتبر نباشد یا منقضی شده باشد.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        <Alert
          type="error"
          message="توکن بازنشانی رمز عبور یافت نشد. لطفاً از لینک ارسال شده به ایمیل خود استفاده کنید."
        />
        <div className="mt-4 text-center">
          <Link
            to="/forgot-password"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 ml-1" />
            درخواست مجدد بازیابی رمز عبور
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
      <h2 className="text-2xl font-bold text-center mb-6">بازنشانی رمز عبور</h2>

      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError('')}
          className="mb-4"
        />
      )}

      {isSubmitted ? (
        <div className="bg-green-50 p-6 rounded-lg text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-green-800 mb-2">رمز عبور بازنشانی شد!</h3>
          <p className="text-sm text-green-700 mb-4">
            رمز عبور شما با موفقیت بازنشانی شد. در حال انتقال به صفحه ورود...
          </p>
          <Link
            to="/login"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 ml-1" />
            ورود به سیستم
          </Link>
        </div>
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <FormInput
              label="رمز عبور جدید"
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="رمز عبور جدید را وارد کنید"
              error={password.length > 0 && password.length < 8 ? 'رمز عبور باید حداقل 8 کاراکتر باشد' : ''}
              icon={<Lock size={20} />}
              required
            />

            <FormInput
              label="تکرار رمز عبور جدید"
              type="password"
              id="confirm_password"
              name="confirm_password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="رمز عبور جدید را مجدداً وارد کنید"
              error={confirmPassword.length > 0 && password !== confirmPassword ? 'رمز عبور و تکرار آن مطابقت ندارند' : ''}
              icon={<Lock size={20} />}
              required
            />
          </div>

          <Button
            type="submit"
            fullWidth
            loading={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            بازنشانی رمز عبور
          </Button>

          <div className="text-center mt-4">
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="h-4 w-4 ml-1" />
              بازگشت به صفحه ورود
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};

export default ResetPasswordForm;