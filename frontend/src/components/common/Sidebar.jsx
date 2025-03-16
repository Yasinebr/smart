// src/components/common/Sidebar.jsx
import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SidebarContext } from '../../contexts/SidebarContext';
import AuthContext from '../../contexts/AuthContext';
import {
  Home,
  User,
  Car,
  CreditCard,
  FileText,
  Settings,
  ParkingCircle,
  Calendar,
  BarChart2,
  ScanLine,
  Users,
  LogOut,
  X
} from 'lucide-react';

const Sidebar = () => {
  const { isOpen, toggleSidebar } = useContext(SidebarContext);
  const { currentUser, logout } = useContext(AuthContext);
  const location = useLocation();

  // اگر کاربر لاگین نکرده باشد، سایدبار نمایش داده نمی‌شود
  if (!currentUser) {
    return null;
  }

  const isActiveLink = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const menuItems = [
    {
      title: 'داشبورد',
      icon: <Home size={20} />,
      link: '/dashboard',
      roles: ['admin', 'parking_manager', 'customer']
    },
    {
      title: 'کاربران',
      icon: <Users size={20} />,
      link: '/users',
      roles: ['admin']
    },
    {
      title: 'پارکینگ‌ها',
      icon: <ParkingCircle size={20} />,
      link: '/parkings',
      roles: ['admin', 'parking_manager', 'customer']
    },
    {
      title: 'رزروها',
      icon: <Calendar size={20} />,
      link: '/reservations',
      roles: ['admin', 'parking_manager', 'customer']
    },
    {
      title: 'خودروها',
      icon: <Car size={20} />,
      link: '/vehicles',
      roles: ['admin', 'parking_manager', 'customer']
    },
    {
      title: 'تشخیص پلاک',
      icon: <ScanLine size={20} />,
      link: '/plate-recognition',
      roles: ['admin', 'parking_manager']
    },
    {
      title: 'تشخیص چهره',
      icon: <ScanLine size={20} />,
      link: '/face-verification',
      roles: ['admin', 'parking_manager']
    },
    {
      title: 'پرداخت‌ها',
      icon: <CreditCard size={20} />,
      link: '/payments',
      roles: ['admin', 'parking_manager', 'customer']
    },
    {
      title: 'گزارش‌ها',
      icon: <BarChart2 size={20} />,
      link: '/reports',
      roles: ['admin', 'parking_manager']
    },
    {
      title: 'تنظیمات',
      icon: <Settings size={20} />,
      link: '/settings',
      roles: ['admin', 'parking_manager', 'customer']
    }
  ];

  const filteredMenuItems = menuItems.filter(item =>
    item.roles.includes(currentUser.role)
  );

  return (
    <>
      {/* Background overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 z-30 h-full w-64 bg-gray-800 text-white transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        } lg:static lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <Link to="/" className="text-xl font-bold">سیستم پارکینگ</Link>
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-md hover:bg-gray-700 lg:hidden"
            >
              <X size={20} />
            </button>
          </div>

          {/* User info */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center">
              {currentUser.profile_image ? (
                <img
                  src={currentUser.profile_image}
                  alt="Profile"
                  className="h-10 w-10 rounded-full mr-3"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center mr-3">
                  <User size={20} />
                </div>
              )}
              <div>
                <div className="font-medium">{`${currentUser.first_name} ${currentUser.last_name}`}</div>
                <div className="text-sm text-gray-400">{currentUser.email}</div>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {filteredMenuItems.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.link}
                    className={`flex items-center px-4 py-2 rounded-md ${
                      isActiveLink(item.link)
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={logout}
              className="flex items-center w-full px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-md"
            >
              <LogOut size={20} className="mr-3" />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;