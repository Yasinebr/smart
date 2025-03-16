// src/api/payment.js
import api from './index';

const PaymentService = {
  // دریافت لیست پرداخت‌ها
  getPayments: (params) => {
    return api.get('/payments/payments/', { params });
  },

  // دریافت جزئیات یک پرداخت
  getPayment: (paymentId) => {
    return api.get(`/payments/payments/${paymentId}/`);
  },

  // ایجاد پرداخت جدید
  createPayment: (paymentData) => {
    return api.post('/payments/payments/', paymentData);
  },

  // پردازش پرداخت
  processPayment: (paymentId) => {
    return api.post(`/payments/payments/${paymentId}/process/`);
  },

  // بازگشت وجه
  refundPayment: (paymentId) => {
    return api.post(`/payments/payments/${paymentId}/refund/`);
  },

  // دریافت لیست فاکتورها
  getInvoices: (params) => {
    return api.get('/payments/invoices/', { params });
  },

  // دریافت جزئیات یک فاکتور
  getInvoice: (invoiceId) => {
    return api.get(`/payments/invoices/${invoiceId}/`);
  },

  // ایجاد فاکتور جدید
  createInvoice: (invoiceData) => {
    return api.post('/payments/invoices/', invoiceData);
  },

  // دریافت لیست اشتراک‌های پرداخت
  getSubscriptions: (params) => {
    return api.get('/payments/subscriptions/', { params });
  },

  // دریافت جزئیات یک اشتراک پرداخت
  getSubscription: (subscriptionId) => {
    return api.get(`/payments/subscriptions/${subscriptionId}/`);
  },

  // ایجاد اشتراک پرداخت جدید
  createSubscription: (subscriptionData) => {
    return api.post('/payments/subscriptions/', subscriptionData);
  },

  // تمدید اشتراک پرداخت
  renewSubscription: (subscriptionId) => {
    return api.post(`/payments/subscriptions/${subscriptionId}/renew/`);
  },

  // لغو تمدید خودکار اشتراک پرداخت
  cancelAutoRenew: (subscriptionId) => {
    return api.post(`/payments/subscriptions/${subscriptionId}/cancel_auto_renew/`);
  }
};

export default PaymentService;