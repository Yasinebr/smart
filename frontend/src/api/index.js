// src/api/index.js
import axios from 'axios';
import { getToken, removeToken } from '../utils/auth';

// تنظیمات پایه Axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// تنظیم توکن برای تمام درخواست‌ها
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Basic ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// بررسی پاسخ‌ها برای خطای 401 (احراز هویت)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // حذف توکن و هدایت به صفحه ورود در صورت نامعتبر بودن توکن
      removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;