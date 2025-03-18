// src/api/parking.js
import api from './index';

export const getParkingLots = () => {
  return api.get('/parking/parking-lots/');
};

export const getParkingLotDetails = (id) => {
  return api.get(`/parking/parking-lots/${id}/`);
};

export const getParkingLotAvailableSpots = (id) => {
  return api.get(`/parking/parking-lots/${id}/available_spots/`);
};

export const createParkingLot = (parkingData) => {
  return api.post('/parking/parking-lots/', parkingData);
};

export const updateParkingLot = (id, parkingData) => {
  return api.put(`/parking/parking-lots/${id}/`, parkingData);
};

export const deleteParkingLot = (id) => {
  return api.delete(`/parking/parking-lots/${id}/`);
};

export const getReservations = () => {
  return api.get('/parking/reservations/');
};

export const createReservation = (reservationData) => {
  return api.post('/parking/reservations/', reservationData);
};

export const confirmReservation = (id, data) => {
  return api.post(`/parking/reservations/${id}/confirm/`, data);
};

export const cancelReservation = (id, data) => {
  return api.post(`/parking/reservations/${id}/cancel/`, data);
};

export const getParkingZones = () => {
  return api.get('/parking/zones/');
};

export const getParkingSlots = () => {
  return api.get('/parking/spots/');
};

export const changeParkingSlotStatus = (id, data) => {
  return api.post(`/parking/spots/${id}/change_status/`, data);
};