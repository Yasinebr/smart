// src/api/vehicle.js
import api from './index';

export const getVehicles = () => {
  return api.get('/vehicles/vehicles/');
};

export const getVehicleDetails = (id) => {
  return api.get(`/vehicles/vehicles/${id}/`);
};

export const createVehicle = (vehicleData) => {
  return api.post('/vehicles/vehicles/', vehicleData);
};

export const updateVehicle = (id, vehicleData) => {
  return api.put(`/vehicles/vehicles/${id}/`, vehicleData);
};

export const deleteVehicle = (id) => {
  return api.delete(`/vehicles/vehicles/${id}/`);
};

export const verifyVehicle = (id, data) => {
  return api.post(`/vehicles/vehicles/${id}/verify/`, data);
};

export const getUserVehicles = (userId) => {
  return api.get(`/users/users/${userId}/vehicles/`);
};

export const getParkingSessions = () => {
  return api.get('/parking/sessions/');
};

export const createParkingSession = (sessionData) => {
  return api.post('/parking/sessions/', sessionData);
};

export const vehicleEntry = (data) => {
  return api.post('/parking/sessions/vehicle_entry/', data);
};

export const vehicleExit = (data) => {
  return api.post('/parking/sessions/vehicle_exit/', data);
};