// src/api/ai.js
import api from './index';

const AIService = {
  // تشخیص پلاک خودرو
  detectLicensePlate: (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    return api.post('/ai/license-plate/detect/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // ذخیره نتیجه تشخیص پلاک
  saveLicensePlateDetection: (detectionData) => {
    const formData = new FormData();
    formData.append('input_image', detectionData.image);

    if (detectionData.vehicleId) {
      formData.append('vehicle', detectionData.vehicleId);
    }

    if (detectionData.parkingSessionId) {
      formData.append('parking_session', detectionData.parkingSessionId);
    }

    return api.post('/ai/license-plate/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // دریافت لیست تشخیص‌های پلاک
  getLicensePlateDetections: (params) => {
    return api.get('/ai/license-plate/', { params });
  },

  // دریافت جزئیات یک تشخیص پلاک
  getLicensePlateDetection: (detectionId) => {
    return api.get(`/ai/license-plate/${detectionId}/`);
  },

  // تشخیص چهره
  detectFace: (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    return api.post('/ai/face/detect/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // ذخیره نتیجه تشخیص چهره
  saveFaceDetection: (detectionData) => {
    const formData = new FormData();
    formData.append('input_image', detectionData.image);

    if (detectionData.userId) {
      formData.append('user', detectionData.userId);
    }

    if (detectionData.parkingSessionId) {
      formData.append('parking_session', detectionData.parkingSessionId);
    }

    return api.post('/ai/face/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // دریافت لیست تشخیص‌های چهره
  getFaceDetections: (params) => {
    return api.get('/ai/face/', { params });
  },

  // دریافت جزئیات یک تشخیص چهره
  getFaceDetection: (detectionId) => {
    return api.get(`/ai/face/${detectionId}/`);
  }
};

export default AIService;