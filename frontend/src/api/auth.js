// src/api/auth.js
import api from './index';

export const loginUser = (credentials) => {
  return api.post('/users/login/', credentials);
};

export const registerUser = (userData) => {
  return api.post('/users/register/', userData);
};

export const getUserProfile = () => {
  return api.get('/users/users/');
};