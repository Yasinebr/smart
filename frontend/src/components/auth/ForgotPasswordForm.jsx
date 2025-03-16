// src/components/auth/ForgotPasswordForm.jsx
import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import AuthContext from '../../contexts/AuthContext';
import Button from '../common/Button';
import FormInput from '../common/FormInput';
import Alert from '../common/Alert';

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { forgotPassword } = useContext(AuthContext);

  const validate = () => {
    if (!email) {
      setError('لطفاً ایمیل خود را وارد کنید');
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('ایمیل وارد شده معتبر نیست');
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
      await forgotPassword(email);
      setIsSubmitted(true);
    } catch (err) {
      console.error('Error in forgot password:', err);
      setError(err.response?.data?.detail || 'خطا در ارسال درخواست بازیابی رمز عبور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
      <h2 className="text-2xl font-bold text-center mb-6">بازیابی رمز عبور</h2>

      <p className="text-center text-gray-600 mb-6">
        {isSubmitted
          ? 'لینک بازیابی رمز عبور برای شما ارسال شد'
          : 'ایمیل خود را وارد کنید تا لینک بازیابی رمز عبور برای شما ارسال شود'
        }
      </p>

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
          <h3 className="text-lg font-medium text-green-800 mb-2">درخواست ارسال شد!</h3>
          <p className="text-sm text-green-700 mb-4">
            لینک بازیابی رمز عبور به ایمیل {email} ارسال شد.
            لطفاً صندوق ورودی ایمیل خود را بررسی کنید.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 ml-1" />
            بازگشت به صفحه ورود
          </Link>
        </div>
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit}>
          <FormInput
            label="ایمیل"
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ایمیل خود را وارد کنید"
            required
            icon={<Mail size={20} />}
          />

          <Button
            type="submit"
            fullWidth
            loading={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            ارسال لینک بازیابی
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

export default ForgotPasswordForm;