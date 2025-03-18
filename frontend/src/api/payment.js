// src/api/payment.js
import api from './index';

export const getInvoices = () => {
  return api.get('/payments/invoices/');
};

export const getInvoiceDetails = (id) => {
  return api.get(`/payments/invoices/${id}/`);
};

export const createInvoice = (invoiceData) => {
  return api.post('/payments/invoices/', invoiceData);
};

export const getPayments = () => {
  return api.get('/payments/payments/');
};

export const createPayment = (paymentData) => {
  return api.post('/payments/payments/', paymentData);
};

export const processPayment = (id, data) => {
  return api.post(`/payments/payments/${id}/process/`, data);
};

export const refundPayment = (id, data) => {
  return api.post(`/payments/payments/${id}/refund/`, data);
};

export const getSubscriptions = () => {
  return api.get('/payments/subscriptions/');
};

export const createSubscription = (subscriptionData) => {
  return api.post('/payments/subscriptions/', subscriptionData);
};

export const renewSubscription = (id, data) => {
  return api.post(`/payments/subscriptions/${id}/renew/`, data);
};

export const cancelAutoRenew = (id, data) => {
  return api.post(`/payments/subscriptions/${id}/cancel_auto_renew/`, data);
};