// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { loginUser, getUserProfile } from '../api/auth';
import { setToken, getToken, removeToken } from '../utils/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // بررسی وضعیت احراز هویت کاربر در هنگام بارگذاری برنامه
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          const response = await getUserProfile();
          if (response.data && response.data.results && response.data.results.length > 0) {
            setCurrentUser(response.data.results[0]);
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
          removeToken();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // تابع ورود کاربر
  const login = async (email, password) => {
    setError(null);
    try {
      const response = await loginUser({ email, password });
      if (response.data && response.data.token) {
        setToken(response.data.token);
        const userResponse = await getUserProfile();
        if (userResponse.data && userResponse.data.results && userResponse.data.results.length > 0) {
          setCurrentUser(userResponse.data.results[0]);
        }
        return { success: true };
      }
    } catch (err) {
      setError(err.response?.data?.message || 'خطا در ورود به سیستم');
      return { success: false, error: err.response?.data?.message || 'خطا در ورود به سیستم' };
    }
  };

  // تابع خروج کاربر
  const logout = () => {
    removeToken();
    setCurrentUser(null);
  };

  // مقادیری که در context قرار می‌گیرند
  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
