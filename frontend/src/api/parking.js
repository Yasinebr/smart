// src/api/parking.js
import api from './index';

const ParkingService = {
  // دریافت لیست پارکینگ‌ها
  getParkingLots: (params) => {
    return api.get('/parking/parking-lots/', { params });
  },

  // دریافت اطلاعات یک پارکینگ خاص
  getParkingLot: (parkingId) => {
    return api.get(`/parking/parking-lots/${parkingId}/`);
  },

  // ایجاد پارکینگ جدید
  createParkingLot: (parkingData) => {
    return api.post('/parking/parking-lots/', parkingData);
  },

  // به‌روزرسانی اطلاعات پارکینگ
  updateParkingLot: (parkingId, parkingData) => {
    return api.patch(`/parking/parking-lots/${parkingId}/`, parkingData);
  },

  // حذف پارکینگ
  deleteParkingLot: (parkingId) => {
    return api.delete(`/parking/parking-lots/${parkingId}/`);
  },

  // دریافت زون‌های یک پارکینگ
  getParkingZones: (parkingId) => {
    return api.get(`/parking/parking-lots/${parkingId}/zones/`);
  },

  // دریافت جاهای پارک موجود در یک پارکینگ
  getAvailableSpots: (parkingId) => {
    return api.get(`/parking/parking-lots/${parkingId}/available_spots/`);
  },

  // دریافت لیست جلسات پارک
  getParkingSessions: (params) => {
    return api.get('/parking/sessions/', { params });
  },

  // دریافت جزئیات یک جلسه پارک
  getParkingSession: (sessionId) => {
    return api.get(`/parking/sessions/${sessionId}/`);
  },

  // ثبت ورود خودرو به پارکینگ
  vehicleEntry: (entryData) => {
    const formData = new FormData();
    formData.append('parking_lot', entryData.parkingLotId);
    if (entryData.spotId) {
      formData.append('spot', entryData.spotId);
    }
    formData.append('image', entryData.image);

    return api.post('/parking/sessions/vehicle_entry/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // ثبت خروج خودرو از پارکینگ
  vehicleExit: (exitData) => {
    const formData = new FormData();
    formData.append('parking_lot', exitData.parkingLotId);
    formData.append('image', exitData.image);

    return api.post('/parking/sessions/vehicle_exit/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // دریافت لیست رزروها
  getReservations: (params) => {
    return api.get('/parking/reservations/', { params });
  },

  // دریافت جزئیات یک رزرو
  getReservation: (reservationId) => {
    return api.get(`/parking/reservations/${reservationId}/`);
  },

  // ایجاد رزرو جدید
  createReservation: (reservationData) => {
    return api.post('/parking/reservations/', reservationData);
  },

  // تأیید رزرو (برای مدیران پارکینگ)
  confirmReservation: (reservationId) => {
    return api.post(`/parking/reservations/${reservationId}/confirm/`);
  },

  // لغو رزرو
  cancelReservation: (reservationId) => {
    return api.post(`/parking/reservations/${reservationId}/cancel/`);
  },

  // تکمیل رزرو
  completeReservation: (reservationId) => {
    return api.post(`/parking/reservations/${reservationId}/complete/`);
  },

  // دریافت لیست اشتراک‌ها
  getSubscriptions: (params) => {
    return api.get('/parking/subscriptions/', { params });
  },

  // دریافت جزئیات یک اشتراک
  getSubscription: (subscriptionId) => {
    return api.get(`/parking/subscriptions/${subscriptionId}/`);
  },

  // ایجاد اشتراک جدید
  createSubscription: (subscriptionData) => {
    return api.post('/parking/subscriptions/', subscriptionData);
  },

  // تمدید اشتراک
  renewSubscription: (subscriptionId) => {
    return api.post(`/parking/subscriptions/${subscriptionId}/renew/`);
  },

  // لغو تمدید خودکار اشتراک
  cancelAutoRenew: (subscriptionId) => {
    return api.post(`/parking/subscriptions/${subscriptionId}/cancel-auto-renew/`);
  },

  // دریافت لیست جایگاه‌های پارک
  getParkingSlots: (params) => {
    return api.get('/parking/spots/', { params });
  },

  // دریافت جزئیات یک جایگاه پارک
  getParkingSlot: (slotId) => {
    return api.get(`/parking/spots/${slotId}/`);
  },

  // تغییر وضعیت جایگاه پارک
  changeParkingSlotStatus: (slotId, statusData) => {
    return api.post(`/parking/spots/${slotId}/change_status/`, statusData);
  },

  // ایجاد جایگاه پارک جدید
  createParkingSlot: (slotData) => {
    return api.post('/parking/spots/', slotData);
  },

  // به‌روزرسانی اطلاعات جایگاه پارک
  updateParkingSlot: (slotId, slotData) => {
    return api.patch(`/parking/spots/${slotId}/`, slotData);
  },

  // دریافت نرخ‌های پارکینگ
  getParkingRates: (params) => {
    return api.get('/parking/rates/', { params });
  },

  // دریافت جزئیات یک نرخ پارکینگ
  getParkingRate: (rateId) => {
    return api.get(`/parking/rates/${rateId}/`);
  },

  // ایجاد نرخ پارکینگ جدید
  createParkingRate: (rateData) => {
    return api.post('/parking/rates/', rateData);
  },

  // به‌روزرسانی نرخ پارکینگ
  updateParkingRate: (rateId, rateData) => {
    return api.patch(`/parking/rates/${rateId}/`, rateData);
  }
};

export default ParkingService;