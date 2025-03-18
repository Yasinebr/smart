// src/api/ai.js
import api from './index';

export const detectFace = (imageData) => {
  const formData = new FormData();
  formData.append('input_image', imageData);

  return api.post('/ai/face/detect/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const detectLicensePlate = (imageData) => {
  const formData = new FormData();
  formData.append('input_image', imageData);

  return api.post('/ai/license-plate/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};
