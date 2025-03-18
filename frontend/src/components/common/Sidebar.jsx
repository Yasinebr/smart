// src/components/common/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useSidebar } from '../../contexts/SidebarContext';

const Sidebar = () => {
  const { currentUser } = useAuth();
  const { isOpen, closeSidebar } = useSidebar();

  if (!currentUser) return null;

  // تعریف منوهای مختلف بر اساس نقش کاربر
  const adminMenuItems = [
    { path: '/admin/dashboard', icon: 'fas fa-tachometer-alt', label: 'داشبورد' },
    { path: '/admin/users', icon: 'fas fa-users', label: 'مدیریت کاربران' },
    { path: '/admin/parking-lots', icon: 'fas fa-parking', label: 'مدیریت پارکینگ‌ها' },
    { path: '/admin/reports', icon: 'fas fa-chart-bar', label: 'گزارشات' },
    { path: '/ai/plate-recognition', icon: 'fas fa-camera', label: 'تشخیص پلاک' },
    { path: '/ai/face-verification', icon: 'fas fa-user-check', label: 'تشخیص چهره' },
  ];

  const managerMenuItems = [
    { path: '/manager/dashboard', icon: 'fas fa-tachometer-alt', label: 'داشبورد' },
    { path: '/parking-lots', icon: 'fas fa-parking', label: 'پارکینگ‌ها' },
    { path: '/manager/entry-exit', icon: 'fas fa-exchange-alt', label: 'ورود و خروج' },
    { path: '/reservations', icon: 'fas fa-calendar-check', label: 'رزروها' },
    { path: '/sessions', icon: 'fas fa-history', label: 'جلسات پارک' },
    { path: '/ai/plate-recognition', icon: 'fas fa-camera', label: 'تشخیص پلاک' },
  ];

  const customerMenuItems = [
    { path: '/dashboard', icon: 'fas fa-tachometer-alt', label: 'داشبورد' },
    { path: '/parking-lots', icon: 'fas fa-parking', label: 'پارکینگ‌ها' },
    { path: '/vehicles', icon: 'fas fa-car', label: 'خودروهای من' },
    { path: '/reservations', icon: 'fas fa-calendar-check', label: 'رزروهای من' },
    { path: '/sessions', icon: 'fas fa-history', label: 'تاریخچه پارک' },
    { path: '/payments', icon: 'fas fa-money-bill', label: 'پرداخت‌ها' },
    { path: '/invoices', icon: 'fas fa-file-invoice', label: 'فاکتورها' },
  ];

  // انتخاب منو بر اساس نقش کاربر
  let menuItems;
  switch (currentUser.role) {
    case 'admin':
      menuItems = adminMenuItems;
      break;
    case 'parking_manager':
      menuItems = managerMenuItems;
      break;
    default:
      menuItems = customerMenuItems;
  }

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <img src="/assets/images/logo.svg" alt="Smart Parking System" />
          <span>پارکینگ هوشمند</span>
        </div>
        <button className="sidebar-close" onClick={closeSidebar}>
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className="sidebar-user">
        <img
          src={currentUser.profile_image || '/assets/images/user-placeholder.png'}
          alt={`${currentUser.first_name} ${currentUser.last_name}`}
          className="avatar"
        />
        <div className="user-info">
          <div className="user-name">{currentUser.first_name} {currentUser.last_name}</div>
          <div className="user-role">
            {currentUser.role === 'admin' && 'مدیر سیستم'}
            {currentUser.role === 'parking_manager' && 'مدیر پارکینگ'}
            {currentUser.role === 'customer' && 'مشتری'}
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item, index) => (
            <li key={index}>
              <NavLink
                to={item.path}
                className={({ isActive }) => isActive ? 'active' : ''}
                onClick={closeSidebar}
              >
                <i className={item.icon}></i>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/settings" onClick={closeSidebar}>
          <i className="fas fa-cog"></i>
          <span>تنظیمات</span>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;