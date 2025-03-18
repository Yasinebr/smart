// src/utils/constants.js
// وضعیت‌های رزرو
export const RESERVATION_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CHECKED_IN: 'checked_in',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// ترجمه وضعیت‌های رزرو
export const RESERVATION_STATUS_DISPLAY = {
  [RESERVATION_STATUS.PENDING]: 'در انتظار تایید',
  [RESERVATION_STATUS.CONFIRMED]: 'تایید شده',
  [RESERVATION_STATUS.CHECKED_IN]: 'ورود انجام شده',
  [RESERVATION_STATUS.COMPLETED]: 'تکمیل شده',
  [RESERVATION_STATUS.CANCELLED]: 'لغو شده'
};

// وضعیت‌های جلسه پارک
export const PARKING_SESSION_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  EXPIRED: 'expired'
};

// ترجمه وضعیت‌های جلسه پارک
export const PARKING_SESSION_STATUS_DISPLAY = {
  [PARKING_SESSION_STATUS.ACTIVE]: 'فعال',
  [PARKING_SESSION_STATUS.COMPLETED]: 'تکمیل شده',
  [PARKING_SESSION_STATUS.EXPIRED]: 'منقضی شده'
};

// انواع خودرو
export const VEHICLE_TYPES = {
  SEDAN: 'sedan',
  SUV: 'suv',
  HATCHBACK: 'hatchback',
  PICKUP: 'pickup',
  VAN: 'van',
  TRUCK: 'truck',
  MOTORCYCLE: 'motorcycle'
};

// ترجمه انواع خودرو
export const VEHICLE_TYPE_DISPLAY = {
  [VEHICLE_TYPES.SEDAN]: 'سدان',
  [VEHICLE_TYPES.SUV]: 'شاسی بلند',
  [VEHICLE_TYPES.HATCHBACK]: 'هاچبک',
  [VEHICLE_TYPES.PICKUP]: 'وانت',
  [VEHICLE_TYPES.VAN]: 'ون',
  [VEHICLE_TYPES.TRUCK]: 'کامیون',
  [VEHICLE_TYPES.MOTORCYCLE]: 'موتورسیکلت'
};

// نقش‌های کاربران
export const USER_ROLES = {
  ADMIN: 'admin',
  PARKING_MANAGER: 'parking_manager',
  CUSTOMER: 'customer'
};

// ترجمه نقش‌های کاربران
export const USER_ROLE_DISPLAY = {
  [USER_ROLES.ADMIN]: 'مدیر سیستم',
  [USER_ROLES.PARKING_MANAGER]: 'مدیر پارکینگ',
  [USER_ROLES.CUSTOMER]: 'مشتری'
};

// وضعیت‌های پرداخت
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

// ترجمه وضعیت‌های پرداخت
export const PAYMENT_STATUS_DISPLAY = {
  [PAYMENT_STATUS.PENDING]: 'در انتظار پرداخت',
  [PAYMENT_STATUS.COMPLETED]: 'پرداخت شده',
  [PAYMENT_STATUS.FAILED]: 'ناموفق',
  [PAYMENT_STATUS.REFUNDED]: 'برگشت داده شده'
};

// وضعیت‌های جای پارک
export const PARKING_SLOT_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  RESERVED: 'reserved',
  UNAVAILABLE: 'unavailable'
};

// ترجمه وضعیت‌های جای پارک
export const PARKING_SLOT_STATUS_DISPLAY = {
  [PARKING_SLOT_STATUS.AVAILABLE]: 'آزاد',
  [PARKING_SLOT_STATUS.OCCUPIED]: 'اشغال شده',
  [PARKING_SLOT_STATUS.RESERVED]: 'رزرو شده',
  [PARKING_SLOT_STATUS.UNAVAILABLE]: 'غیرقابل استفاده'
};

// انواع زون پارکینگ
export const PARKING_ZONE_TYPES = {
  REGULAR: 'regular',
  VIP: 'vip',
  DISABLED: 'disabled'
};

// ترجمه انواع زون پارکینگ
export const PARKING_ZONE_TYPE_DISPLAY = {
  [PARKING_ZONE_TYPES.REGULAR]: 'معمولی',
  [PARKING_ZONE_TYPES.VIP]: 'ویژه',
  [PARKING_ZONE_TYPES.DISABLED]: 'معلولین'
};
