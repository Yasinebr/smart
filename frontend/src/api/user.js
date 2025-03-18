import api from './index';

export const getUsers = () => {
  return api.get('/users/users/');
};

export const getUserDetails = (id) => {
  return api.get(`/users/users/${id}/`);
};

export const createUser = (userData) => {
  return api.post('/users/users/', userData);
};

export const updateUser = (id, userData) => {
  return api.put(`/users/users/${id}/`, userData);
};

export const deleteUser = (id) => {
  return api.delete(`/users/users/${id}/`);
};

export const getUserVehicleRelations = () => {
  return api.get('/users/user-vehicles/');
};

export const createUserVehicleRelation = (relationData) => {
  return api.post('/users/user-vehicles/', relationData);
};