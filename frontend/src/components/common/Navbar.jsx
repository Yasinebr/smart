// src/components/common/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { useSidebar } from '../../contexts/SidebarContext';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const { toggleTheme, isDarkMode } = useTheme();
  const { toggleSidebar } = useSidebar();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            <i className="fas fa-bars"></i>
          </button>
          <Link to="/" className="navbar-brand">
            <img
              src={`/assets/images/${isDarkMode ? 'logo-white.svg' : 'logo.svg'}`}
              alt="Smart Parking System"
            />
            <span>سیستم پارکینگ هوشمند</span>
          </Link>
        </div>

        <div className="navbar-right">
          <button className="theme-toggle" onClick={toggleTheme}>
            <i className={`fas fa-${isDarkMode ? 'sun' : 'moon'}`}></i>
          </button>

          {currentUser ? (
            <div className="dropdown user-dropdown">
              <button className="dropdown-toggle">
                <img
                  src={currentUser.profile_image || '/assets/images/user-placeholder.png'}
                  alt={`${currentUser.first_name} ${currentUser.last_name}`}
                  className="avatar"
                />
                <span>{currentUser.first_name} {currentUser.last_name}</span>
              </button>
              <div className="dropdown-menu">
                <Link to="/profile" className="dropdown-item">
                  <i className="fas fa-user"></i> پروفایل
                </Link>
                <Link to="/settings" className="dropdown-item">
                  <i className="fas fa-cog"></i> تنظیمات
                </Link>
                <div className="dropdown-divider"></div>
                <button onClick={logout} className="dropdown-item">
                  <i className="fas fa-sign-out-alt"></i> خروج
                </button>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-primary btn-sm">
                ورود
              </Link>
              <Link to="/register" className="btn btn-outline-primary btn-sm">
                ثبت‌نام
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;