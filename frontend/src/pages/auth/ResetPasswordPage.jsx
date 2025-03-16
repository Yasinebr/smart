// src/pages/auth/ResetPasswordPage.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import ResetPasswordForm from '../../components/auth/ResetPasswordForm';

const ResetPasswordPage = () => {
  const { token } = useParams();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex justify-center">
          <img
            className="h-12 w-auto"
            src="/assets/images/logo.svg"
            alt="سیستم پارکینگ هوشمند"
          />
        </div>

        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
};

export default ResetPasswordPage;