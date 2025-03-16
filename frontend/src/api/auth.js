// src/api/auth.js
import api from './index';

const AuthService = {
  // ورود کاربر
  login: (email, password) => {
    return api.post('/users/login/', { email, password });
  },

  // ثبت‌نام کاربر جدید
  register: (userData) => {
    return api.post('/users/register/', userData);
  },

  // دریافت اطلاعات کاربر فعلی
  getCurrentUser: () => {
    return api.get('/users/me/');
  },

  // رفرش توکن
  refreshToken: (refreshToken) => {
    return api.post('/users/token/refresh/', { refresh: refreshToken });
  },

  // ارسال درخواست بازیابی رمز عبور
  forgotPassword: (email) => {
    return api.post('/users/forgot-password/', { email });
  },

  // بازنشانی رمز عبور
  resetPassword: (token, password) => {
    return api.post(`/users/reset-password/${token}/`, { password });
  },

  // تغییر رمز عبور
  changePassword: (oldPassword, newPassword) => {
    return api.post('/users/change-password/', {
      old_password: oldPassword,
      new_password: newPassword
    });
  }
};

export default AuthService;