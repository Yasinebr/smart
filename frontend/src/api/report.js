// src/api/report.js
import api from './index';

const ReportService = {
  // دریافت لیست گزارش‌ها
  getReports: (params) => {
    return api.get('/reports/reports/', { params });
  },

  // دریافت جزئیات یک گزارش
  getReport: (reportId) => {
    return api.get(`/reports/reports/${reportId}/`);
  },

  // ایجاد گزارش جدید
  createReport: (reportData) => {
    return api.post('/reports/reports/', reportData);
  },

  // تولید مجدد گزارش
  regenerateReport: (reportId) => {
    return api.post(`/reports/reports/${reportId}/regenerate/`);
  },

  // دریافت لیست گزارش‌های پارکینگ
  getParkingReports: (params) => {
    return api.get('/reports/parking-reports/', { params });
  },

  // دریافت جزئیات یک گزارش پارکینگ
  getParkingReport: (reportId) => {
    return api.get(`/reports/parking-reports/${reportId}/`);
  },

  // ایجاد گزارش پارکینگ جدید
  createParkingReport: (reportData) => {
    return api.post('/reports/parking-reports/', reportData);
  },

  // تولید مجدد گزارش پارکینگ
  regenerateParkingReport: (reportId) => {
    return api.post(`/reports/parking-reports/${reportId}/regenerate/`);
  },

  // دریافت لیست گزارش‌های مالی
  getFinancialReports: (params) => {
    return api.get('/reports/financial-reports/', { params });
  },

  // دریافت جزئیات یک گزارش مالی
  getFinancialReport: (reportId) => {
    return api.get(`/reports/financial-reports/${reportId}/`);
  },

  // ایجاد گزارش مالی جدید
  createFinancialReport: (reportData) => {
    return api.post('/reports/financial-reports/', reportData);
  },

  // تولید مجدد گزارش مالی
  regenerateFinancialReport: (reportId) => {
    return api.post(`/reports/financial-reports/${reportId}/regenerate/`);
  }
};

export default ReportService;