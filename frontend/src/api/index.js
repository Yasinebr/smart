// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // بررسی وضعیت احراز هویت کاربر هنگام بارگذاری
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setIsAuthenticated(false);
        setCurrentUser(null);
        setLoading(false);
        return;
      }

      // تنظیم توکن در هدر درخواست‌ها
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // دریافت اطلاعات کاربر فعلی
      const response = await api.get('/users/me/');
      setCurrentUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error checking auth status:', error);
      // اگر توکن منقضی شده باشد، کاربر را خارج می‌کنیم
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/users/login/', { email, password });
      const { user, access, refresh } = response.data;

      // ذخیره توکن‌ها در localStorage
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      // تنظیم توکن در هدر درخواست‌ها
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;

      setCurrentUser(user);
      setIsAuthenticated(true);
      return user;
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.detail || 'خطا در ورود به سیستم');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/users/register/', userData);
      const { user, access, refresh } = response.data;

      // ذخیره توکن‌ها در localStorage
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      // تنظیم توکن در هدر درخواست‌ها
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;

      setCurrentUser(user);
      setIsAuthenticated(true);
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.detail || 'خطا در ثبت‌نام');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // حذف توکن‌ها از localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    // حذف هدر Authorization
    delete api.defaults.headers.common['Authorization'];

    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const refreshToken = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (!refresh) {
        logout();
        return false;
      }

      const response = await api.post('/users/token/refresh/', { refresh });
      const { access } = response.data;

      localStorage.setItem('access_token', access);
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;

      return true;
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout();
      return false;
    }
  };

  const updateProfile = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.patch(`/users/${currentUser.id}/`, userData);
      setCurrentUser(response.data);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      setError(error.response?.data?.detail || 'خطا در به‌روزرسانی پروفایل');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/users/change-password/`, {
        old_password: oldPassword,
        new_password: newPassword
      });
      return response.data;
    } catch (error) {
      console.error('Change password error:', error);
      setError(error.response?.data?.detail || 'خطا در تغییر رمز عبور');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/users/forgot-password/`, { email });
      return response.data;
    } catch (error) {
      console.error('Forgot password error:', error);
      setError(error.response?.data?.detail || 'خطا در بازیابی رمز عبور');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/users/reset-password/${token}/`, { password });
      return response.data;
    } catch (error) {
      console.error('Reset password error:', error);
      setError(error.response?.data?.detail || 'خطا در بازنشانی رمز عبور');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        loading,
        error,
        login,
        register,
        logout,
        refreshToken,
        updateProfile,
        changePassword,
        forgotPassword,
        resetPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;