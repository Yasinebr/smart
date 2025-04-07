import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

// Create an axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {

  },
});

// Add a request interceptor to include authentication token
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add a response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Handle 401 (Unauthorized) errors
      if (error.response.status === 401) {
        Cookies.remove('authToken');
        // Redirect to login page if we're in a browser environment
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  },
);

// Generic API functions
export const fetchData = async (endpoint, params = {}) => {
  try {
    const response = await apiClient.get(endpoint, { params });
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error);
    throw error;
  }
};

export const postData = async (endpoint, data) => {
  try {
    const response = await apiClient.post(endpoint, data);
    return response.data;
  } catch (error) {
    console.error(`Error posting data to ${endpoint}:`, error);
    throw error;
  }
};

export const updateData = async (endpoint, data) => {
  try {
    const response = await apiClient.put(endpoint, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating data at ${endpoint}:`, error);
    throw error;
  }
};

export const patchData = async (endpoint, data) => {
  try {
    const response = await apiClient.patch(endpoint, data);
    return response.data;
  } catch (error) {
    console.error(`Error patching data at ${endpoint}:`, error);
    throw error;
  }
};

export const deleteData = async (endpoint) => {
  try {
    const response = await apiClient.delete(endpoint);
    return response.data;
  } catch (error) {
    console.error(`Error deleting data at ${endpoint}:`, error);
    throw error;
  }
};
const token = Cookies.get('authToken');
console.log('Tooooooooooooken', token);
// API service object with all endpoints
const api = {
  // Auth
  login: (data) => postData('/users/login/', data),
  register: (data) => postData('/users/register/', data),


  // Users
  getCurrentUser: () => fetchData('/users/users/me/'),
  getUsers: (params) => fetchData('/users/users/', params),
  getUserById: (id) => fetchData(`/users/users/${id}/`),
  updateUser: (id, data) => updateData(`/users/users/${id}/`, data),
  getUserVehiclesWithoutParams: (id) => fetchData(`/users/users/${id}/vehicles/`),

  // Vehicles
  getVehicles: (params) => fetchData('/vehicles/vehicles/', params),
  getVehicleById: (id) => fetchData(`/vehicles/vehicles/${id}/`),
  createVehicle: (data) => postData('/vehicles/vehicles/', data),
  updateVehicle: (id, data) => updateData(`/vehicles/vehicles/${id}/`, data),
  deleteVehicle: (id) => deleteData(`/vehicles/vehicles/${id}/`),
  verifyVehicle: (id, data) => postData(`/vehicles/vehicles/${id}/verify/`, data),

  // Vehicle Categories
  getVehicleCategories: (params) => fetchData('/vehicles/categories/', params),
  getVehicleCategoryById: (id) => fetchData(`/vehicles/categories/${id}/`),
  createVehicleCategory: (data) => postData('/vehicles/categories/', data),
  updateVehicleCategory: (id, data) => updateData(`/vehicles/categories/${id}/`, data),
  deleteVehicleCategory: (id) => deleteData(`/vehicles/categories/${id}/`),

  // User Vehicles
  getUserVehicles: (params) => fetchData('/users/user-vehicles/', params),
  createUserVehicle: (data) => postData('/users/user-vehicles/', data),
  updateUserVehicle: (id, data) => updateData(`/users/user-vehicles/${id}/`, data),
  deleteUserVehicle: (id) => deleteData(`/users/user-vehicles/${id}/`),

  // Parking Lots
  getParkingLots: (params) => fetchData('/parking/parking-lots/', params),
  getParkingLotById: (id) => fetchData(`/parking/parking-lots/${id}/`),
  createParkingLot: (data) => postData('/parking/parking-lots/', data),
  updateParkingLot: (id, data) => updateData(`/parking/parking-lots/${id}/`, data),
  deleteParkingLot: (id) => deleteData(`/parking/parking-lots/${id}/`),
  getParkingLotAvailableSpots: (id) => fetchData(`/parking/parking-lots/${id}/available_spots/`),
  getParkingLotReservations: (id) => fetchData(`/parking/parking-lots/${id}/reservations/`),
  getParkingLotSessions: (id) => fetchData(`/parking/parking-lots/${id}/sessions/`),
  getParkingLotZones: (id) => fetchData(`/parking/parking-lots/${id}/zones/`),

  // Parking Zones
  getParkingZones: (params) => fetchData('/parking/zones/', params),
  getParkingZoneById: (id) => fetchData(`/parking/zones/${id}/`),
  createParkingZone: (data) => postData('/parking/zones/', data),
  updateParkingZone: (id, data) => updateData(`/parking/zones/${id}/`, data),
  deleteParkingZone: (id) => deleteData(`/parking/zones/${id}/`),
  getParkingZoneSpots: (id) => fetchData(`/parking/zones/${id}/spots/`),

  // Parking Spots
  getParkingSpots: (params) => fetchData('/parking/spots/', params),
  getParkingSpotById: (id) => fetchData(`/parking/spots/${id}/`),
  createParkingSpot: (data) => postData('/parking/spots/', data),
  updateParkingSpot: (id, data) => updateData(`/parking/spots/${id}/`, data),
  deleteParkingSpot: (id) => deleteData(`/parking/spots/${id}/`),
  changeParkingSpotStatus: (id, data) => postData(`/parking/spots/${id}/change_status/`, data),

  // Parking Reservations
  getParkingReservations: (params) => fetchData('/parking/reservations/', params),
  getParkingReservationById: (id) => fetchData(`/parking/reservations/${id}/`),
  createParkingReservation: (data) => postData('/parking/reservations/', data),
  updateParkingReservation: (id, data) => updateData(`/parking/reservations/${id}/`, data),
  deleteParkingReservation: (id) => deleteData(`/parking/reservations/${id}/`),
  cancelParkingReservation: (id, data) => postData(`/parking/reservations/${id}/cancel/`, data),
  completeParkingReservation: (id, data) => postData(`/parking/reservations/${id}/complete/`, data),
  confirmParkingReservation: (id, data) => postData(`/parking/reservations/${id}/confirm/`, data),

  // Parking Sessions
  getParkingSessions: (params) => fetchData('/parking/sessions/', params),
  getParkingSessionById: (id) => fetchData(`/parking/sessions/${id}/`),
  createParkingSession: (data) => postData('/parking/sessions/', data),
  updateParkingSession: (id, data) => updateData(`/parking/sessions/${id}/`, data),
  deleteParkingSession: (id) => deleteData(`/parking/sessions/${id}/`),
  registerVehicleEntry: (data) => postData('/parking/sessions/vehicle_entry/', data),
  registerVehicleExit: (data) => postData('/parking/sessions/vehicle_exit/', data),

  // AI - Face Detection
  getFaceDetections: (params) => fetchData('/ai/face/', params),
  getFaceDetectionById: (id) => fetchData(`/ai/face/${id}/`),
  createFaceDetection: (data) => postData('/ai/face/', data),
  updateFaceDetection: (id, data) => updateData(`/ai/face/${id}/`, data),
  deleteFaceDetection: (id) => deleteData(`/ai/face/${id}/`),
  detectFace: (data) => postData('/ai/face/detect/', data),

  // AI - License Plate Detection
  getLicensePlateDetections: (params) => fetchData('/ai/license-plate/', params),
  getLicensePlateDetectionById: (id) => fetchData(`/ai/license-plate/${id}/`),
  createLicensePlateDetection: (data) => postData('/ai/license-plate/', data),
  updateLicensePlateDetection: (id, data) => updateData(`/ai/license-plate/${id}/`, data),
  deleteLicensePlateDetection: (id) => deleteData(`/ai/license-plate/${id}/`),

  // Payments
  getPayments: (params) => fetchData('/payments/payments/', params),
  getPaymentById: (id) => fetchData(`/payments/payments/${id}/`),
  createPayment: (data) => postData('/payments/payments/', data),
  updatePayment: (id, data) => updateData(`/payments/payments/${id}/`, data),
  deletePayment: (id) => deleteData(`/payments/payments/${id}/`),
  processPayment: (id, data) => postData(`/payments/payments/${id}/process/`, data),
  refundPayment: (id, data) => postData(`/payments/payments/${id}/refund/`, data),

  // Invoices
  getInvoices: (params) => fetchData('/payments/invoices/', params),
  getInvoiceById: (id) => fetchData(`/payments/invoices/${id}/`),
  createInvoice: (data) => postData('/payments/invoices/', data),
  updateInvoice: (id, data) => updateData(`/payments/invoices/${id}/`, data),
  deleteInvoice: (id) => deleteData(`/payments/invoices/${id}/`),

  // Subscriptions
  getSubscriptions: (params) => fetchData('/payments/subscriptions/', params),
  getSubscriptionById: (id) => fetchData(`/payments/subscriptions/${id}/`),
  createSubscription: (data) => postData('/payments/subscriptions/', data),
  updateSubscription: (id, data) => updateData(`/payments/subscriptions/${id}/`, data),
  deleteSubscription: (id) => deleteData(`/payments/subscriptions/${id}/`),
  cancelSubscriptionAutoRenew: (id, data) => postData(`/payments/subscriptions/${id}/cancel_auto_renew/`, data),
  renewSubscription: (id, data) => postData(`/payments/subscriptions/${id}/renew/`, data),

  // Reports
  getReports: (params) => fetchData('/reports/reports/', params),
  getReportById: (id) => fetchData(`/reports/reports/${id}/`),

  // Financial Reports
  getFinancialReports: (params) => fetchData('/reports/financial-reports/', params),
  getFinancialReportById: (id) => fetchData(`/reports/financial-reports/${id}/`),
  createFinancialReport: (data) => postData('/reports/financial-reports/', data),
  updateFinancialReport: (id, data) => updateData(`/reports/financial-reports/${id}/`, data),
  deleteFinancialReport: (id) => deleteData(`/reports/financial-reports/${id}/`),
  regenerateFinancialReport: (id, data) => postData(`/reports/financial-reports/${id}/regenerate/`, data),

  // Parking Reports
  getParkingReports: (params) => fetchData('/reports/parking-reports/', params),
  getParkingReportById: (id) => fetchData(`/reports/parking-reports/${id}/`),
  createParkingReport: (data) => postData('/reports/parking-reports/', data),
  updateParkingReport: (id, data) => updateData(`/reports/parking-reports/${id}/`, data),
  deleteParkingReport: (id) => deleteData(`/reports/parking-reports/${id}/`),
  regenerateParkingReport: (id, data) => postData(`/reports/parking-reports/${id}/regenerate/`, data),
};

export default api;