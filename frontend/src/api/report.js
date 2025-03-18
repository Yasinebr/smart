// src/api/report.js
import api from './index';

export const getFinancialReports = () => {
  return api.get('/reports/financial-reports/');
};

export const createFinancialReport = (reportData) => {
  return api.post('/reports/financial-reports/', reportData);
};

export const regenerateFinancialReport = (id, data) => {
  return api.post(`/reports/financial-reports/${id}/regenerate/`, data);
};

export const getParkingReports = () => {
  return api.get('/reports/parking-reports/');
};

export const createParkingReport = (reportData) => {
  return api.post('/reports/parking-reports/', reportData);
};

export const regenerateParkingReport = (id, data) => {
  return api.post(`/reports/parking-reports/${id}/regenerate/`, data);
};