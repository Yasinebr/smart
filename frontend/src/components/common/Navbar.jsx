// src/components/common/Navbar.jsx
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';
import { SidebarContext } from '../../contexts/SidebarContext';
import { Car, Bell, Menu, User, LogOut } from 'lucide-react';

const Navbar = () => {
  const { currentUser, isAuthenticated, logout } = useContext(AuthContext);
  const { toggleSidebar } = useContext(SidebarContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* لوگو و نام برنامه */}
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="mr-2 p-1 rounded-md hover:bg-blue-700 lg:hidden"
            >
              <Menu size={24} />
            </button>
            <Link to="/" className="flex items-center">
              <Car className="h-8 w-8 mr-2" />
              <span className="text-xl font-bold">سیستم پارکینگ هوشمند</span>
            </Link>
          </div>

          {/* منوی ناوبری */}
          <nav className="hidden md:block">
            <ul className="flex space-x-4">
              {isAuthenticated ? (
                <>
                  <li>
                    <Link to="/dashboard" className="px-3 py-2 rounded-md hover:bg-blue-700">
                      داشبورد
                    </Link>
                  </li>
                  <li>
                    <Link to="/parkings" className="px-3 py-2 rounded-md hover:bg-blue-700">
                      پارکینگ‌ها
                    </Link>
                  </li>
                  <li>
                    <Link to="/vehicles" className="px-3 py-2 rounded-md hover:bg-blue-700">
                      خودروها
                    </Link>
                  </li>
                  {(currentUser?.role === 'admin' || currentUser?.role === 'parking_manager') && (
                    <li>
                      <Link to="/plate-recognition" className="px-3 py-2 rounded-md hover:bg-blue-700">
                        تشخیص پلاک
                      </Link>
                    </li>
                  )}
                </>
              ) : (
                <>
                  <li>
                    <Link to="/about" className="px-3 py-2 rounded-md hover:bg-blue-700">
                      درباره ما
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="px-3 py-2 rounded-md hover:bg-blue-700">
                      تماس با ما
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>

          {/* بخش کاربر */}
          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {/* آیکون اعلان‌ها */}
                <button className="p-1 rounded-full hover:bg-blue-700 relative">
                  <Bell size={20} />
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* منوی کشویی پروفایل */}
                <div className="relative group">
                  <button className="flex items-center">
                    {currentUser.profile_image ? (
                      <img
                        src={currentUser.profile_image}
                        alt="Profile"
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-blue-800 flex items-center justify-center">
                        <User size={16} />
                      </div>
                    )}
                    <span className="mx-2">{`${currentUser.first_name} ${currentUser.last_name}`}</span>
                  </button>

                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                    >
                      پروفایل
                    </Link>
                    {currentUser.role === 'admin' && (
                      <Link
                        to="/admin/dashboard"
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                      >
                        پنل ادمین
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-right block px-4 py-2 text-gray-800 hover:bg-gray-100"
                    >
                      خروج
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-md bg-white text-blue-600 hover:bg-gray-100"
                >
                  ورود
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-md border border-white hover:bg-blue-700"
                >
                  ثبت‌نام
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;