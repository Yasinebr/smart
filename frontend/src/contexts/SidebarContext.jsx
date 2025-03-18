// src/contexts/SidebarContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

// ایجاد کانتکست سایدبار
const SidebarContext = createContext();

// ارائه دهنده کانتکست سایدبار
export const SidebarProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  // باز و بسته کردن سایدبار
  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  // بستن سایدبار
  const closeSidebar = () => {
    setIsOpen(false);
  };

  // باز کردن سایدبار
  const openSidebar = () => {
    setIsOpen(true);
  };

  // بستن سایدبار در نمایشگرهای کوچک با تغییر اندازه
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  const value = {
    isOpen,
    toggleSidebar,
    closeSidebar,
    openSidebar,
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
};

// هوک برای دسترسی به وضعیت سایدبار
export const useSidebar = () => {
  return useContext(SidebarContext);
};