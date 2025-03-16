// src/api/user.js
import api from './index';

const UserService = {
  // دریافت لیست کاربران
  getUsers: (params) => {
    return api.get('/users/', { params });
  },

  // دریافت اطلاعات یک کاربر خاص
  getUser: (userId) => {
    return api.get(`/users/${userId}/`);
  },

  // ایجاد کاربر جدید (برای مدیران)
  createUser: (userData) => {
    return api.post('/users/', userData);
  },

  // به‌روزرسانی اطلاعات کاربر
  updateUser: (userId, userData) => {
    return api.patch(`/users/${userId}/`, userData);
  },

  // حذف کاربر
  deleteUser: (userId) => {
    return api.delete(`/users/${userId}/`);
  },

  // دریافت پروفایل کاربر
  getProfile: () => {
    return api.get('/users/me/');
  },

  // به‌روزرسانی پروفایل کاربر
  updateProfile: (profileData) => {
    return api.patch('/users/me/', profileData);
  },

  // آپلود تصویر پروفایل
  uploadProfileImage: (imageFile) => {
    const formData = new FormData();
    formData.append('profile_image', imageFile);
    return api.post('/users/me/upload-image/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // دریافت خودروهای کاربر
  getUserVehicles: (userId) => {
    return api.get(`/users/${userId}/vehicles/`);
  },

  // افزودن خودرو به کاربر
  addUserVehicle: (vehicleData) => {
    return api.post('/user-vehicles/', vehicleData);
  },

  // حذف خودرو از کاربر
  removeUserVehicle: (userVehicleId) => {
    return api.delete(`/user-vehicles/${userVehicleId}/`);
  },

  // تنظیم خودرو اصلی
  setPrimaryVehicle: (userVehicleId) => {
    return api.patch(`/user-vehicles/${userVehicleId}/`, { is_primary: true });
  }
};

export default UserService;