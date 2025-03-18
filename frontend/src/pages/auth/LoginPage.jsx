// src/pages/auth/LoginPage.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import LoginForm from '../../components/auth/LoginForm';
import useAuth from '../../hooks/useAuth';

const LoginPage = () => {
  const { currentUser, loading } = useAuth();

  // اگر کاربر قبلا وارد شده است، به صفحه داشبورد هدایت می‌شود
  if (loading) {
    return <div className="loading-page">در حال بارگذاری...</div>;
  }

  if (currentUser) {
    // هدایت به داشبورد متناسب با نقش کاربر
    switch (currentUser.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'parking_manager':
        return <Navigate to="/manager/dashboard" replace />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-image">
          <img src="/assets/images/login-bg.jpg" alt="Parking System" />
        </div>
        <div className="auth-form">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;