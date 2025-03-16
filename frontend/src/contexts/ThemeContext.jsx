// src/contexts/ThemeContext.jsx
import React, { createContext, useState, useEffect } from 'react';

// تعریف تم‌های موجود
const themes = {
  light: {
    name: 'light',
    backgroundColor: 'bg-white',
    textColor: 'text-gray-900',
    primaryColor: 'text-blue-600',
    secondaryColor: 'text-purple-600',
  },
  dark: {
    name: 'dark',
    backgroundColor: 'bg-gray-900',
    textColor: 'text-gray-100',
    primaryColor: 'text-blue-400',
    secondaryColor: 'text-purple-400',
  },
  // می‌توانید تم‌های بیشتری نیز اضافه کنید
};

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // دریافت تم ذخیره شده در localStorage یا استفاده از تم پیش‌فرض
  const [currentTheme, setCurrentTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme && themes[savedTheme] ? savedTheme : 'light';
  });

  // تغییر تم فعال
  const changeTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
      localStorage.setItem('theme', themeName);
    }
  };

  // تغییر خودکار به حالت تاریک بر اساس تنظیمات سیستم عامل
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e) => {
      const systemPreference = e.matches ? 'dark' : 'light';
      // فقط اگر کاربر تم را به صورت دستی تغییر نداده باشد، تم سیستم را اعمال می‌کنیم
      if (!localStorage.getItem('theme')) {
        setCurrentTheme(systemPreference);
      }
    };

    // اعمال اولیه
    if (!localStorage.getItem('theme')) {
      handleChange(mediaQuery);
    }

    // لیسنر برای تغییرات
    mediaQuery.addEventListener('change', handleChange);

    // پاکسازی لیسنر
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // تغییر بین حالت روشن و تاریک
  const toggleTheme = () => {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    changeTheme(newTheme);
  };

  // دریافت تمام ویژگی‌های تم فعلی
  const theme = themes[currentTheme];

  return (
    <ThemeContext.Provider value={{ theme, currentTheme, changeTheme, toggleTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;