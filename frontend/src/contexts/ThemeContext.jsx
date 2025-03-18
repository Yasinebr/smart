// src/contexts/ThemeContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

// ایجاد کانتکست تم
const ThemeContext = createContext();

// ارائه دهنده کانتکست تم
export const ThemeProvider = ({ children }) => {
  // بررسی ترجیح کاربر از localStorage
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // بررسی ترجیح سیستم کاربر
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  const [isDarkMode, setIsDarkMode] = useState(getInitialTheme);

  // تغییر وضعیت تم
  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  // ذخیره تم در localStorage و اعمال کلاس به html
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark-mode', isDarkMode);
  }, [isDarkMode]);

  const value = {
    isDarkMode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// هوک برای دسترسی به تم
export const useTheme = () => {
  return useContext(ThemeContext);
};