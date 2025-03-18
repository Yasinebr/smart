// src/components/vehicle/PlateRecognition.jsx
import React, { useState, useRef } from 'react';
import { detectLicensePlate } from '../../api/ai';
import { getVehicles } from '../../api/vehicle';
import { useNotification } from '../../contexts/NotificationContext';

const PlateRecognition = () => {
  const { notify } = useNotification();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [result, setResult] = useState(null);
  const [vehicleInfo, setVehicleInfo] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
      setVehicleInfo(null);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
      setVehicleInfo(null);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDetect = async () => {
    if (!image) {
      notify.warning('لطفاً ابتدا تصویری را انتخاب کنید');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('input_image', image);

      const response = await detectLicensePlate(formData);
      const detectionResult = response.data;

      setResult(detectionResult);

      // جستجوی خودرو با پلاک شناسایی شده
      if (detectionResult.license_plate_text) {
        const vehiclesResponse = await getVehicles();
        const vehicles = vehiclesResponse.data.results;
        const matchedVehicle = vehicles.find(
          vehicle => vehicle.license_plate === detectionResult.license_plate_text
        );

        if (matchedVehicle) {
          setVehicleInfo(matchedVehicle);
        } else {
          setVehicleInfo(null);
        }
      }

      notify.success('تشخیص پلاک با موفقیت انجام شد');
    } catch (error) {
      console.error('Error detecting license plate:', error);
      notify.error('خطا در تشخیص پلاک');
    } finally {
      setLoading(false);
    }
  };

  const handleCaptureFromCamera = () => {
    // پیاده‌سازی دسترسی به دوربین
    // برای نمونه، می‌توان از input با نوع file و accept="image/*" و capture="camera" استفاده کرد
    fileInputRef.current.click();
  };

  const handleReset = () => {
    setImage(null);
    setImagePreview(null);
    setResult(null);
    setVehicleInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="plate-recognition">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">تشخیص پلاک خودرو</h2>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <div
                className="image-upload-area"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                {imagePreview ? (
                  <div className="image-preview">
                    <img src={imagePreview} alt="تصویر پلاک" className="img-fluid" />
                    <button onClick={handleReset} className="btn btn-sm btn-danger reset-btn">
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <i className="fas fa-camera"></i>
                    <p>تصویر پلاک را اینجا رها کنید یا کلیک کنید</p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="file-input"
                    />
                  </div>
                )}
              </div>
              <div className="actions mt-3">
                <button
                  onClick={handleCaptureFromCamera}
                  className="btn btn-info mr-2"
                  disabled={loading}
                >
                  <i className="fas fa-camera"></i> گرفتن عکس
                </button>
                <button
                  onClick={handleDetect}
                  className="btn btn-primary"
                  disabled={!image || loading}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> در حال تشخیص...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-search"></i> تشخیص پلاک
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="col-md-6">
              <div className="result-area">
                <h3>نتیجه تشخیص</h3>
                {loading ? (
                  <div className="loading-result">
                    <i className="fas fa-spinner fa-spin fa-3x"></i>
                    <p>در حال تشخیص پلاک...</p>
                  </div>
                ) : result ? (
                  <div className="detected-result">
                    <div className="result-item">
                      <strong>پلاک:</strong>
                      <span className="plate-text">{result.license_plate_text || 'نامشخص'}</span>
                    </div>
                    <div className="result-item">
                      <strong>اطمینان:</strong>
                      <span>{Math.round(result.confidence * 100)}%</span>
                    </div>
                    <div className="result-item">
                      <strong>زمان پردازش:</strong>
                      <span>{result.processing_time ? `${result.processing_time.toFixed(2)} ثانیه` : 'نامشخص'}</span>
                    </div>
                    {result.output_image && (
                      <div className="result-image mt-3">
                        <img src={result.output_image} alt="تصویر با پلاک شناسایی شده" className="img-fluid" />
                      </div>
                    )}

                    {vehicleInfo ? (
                      <div className="vehicle-info mt-3">
                        <h4>اطلاعات خودرو</h4>
                        <div className="vehicle-detail">
                          <strong>سازنده/مدل:</strong>
                          <span>{vehicleInfo.make} {vehicleInfo.model}</span>
                        </div>
                        {vehicleInfo.color && (
                          <div className="vehicle-detail">
                            <strong>رنگ:</strong>
                            <span>{vehicleInfo.color}</span>
                          </div>
                        )}
                        <div className="vehicle-detail">
                          <strong>نوع خودرو:</strong>
                          <span>{getVehicleTypeDisplay(vehicleInfo.vehicle_type)}</span>
                        </div>
                        <div className="vehicle-detail">
                          <strong>وضعیت تایید:</strong>
                          <span className={vehicleInfo.is_verified ? 'text-success' : 'text-warning'}>
                            {vehicleInfo.is_verified ? 'تایید شده' : 'در انتظار تایید'}
                          </span>
                        </div>
                      </div>
                    ) : result.license_plate_text ? (
                      <div className="no-vehicle-info mt-3">
                        <p className="text-warning">
                          <i className="fas fa-exclamation-triangle"></i>
                          خودرویی با این پلاک در سیستم ثبت نشده است.
                        </p>
                      </div>
                    ) : null}
                  </div>
                ) : imagePreview ? (
                  <div className="no-result">
                    <p>برای تشخیص پلاک، دکمه «تشخیص پلاک» را بزنید.</p>
                  </div>
                ) : (
                  <div className="no-image">
                    <p>لطفاً ابتدا تصویری را انتخاب کنید.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// تبدیل نوع خودرو به نام فارسی
const getVehicleTypeDisplay = (type) => {
  const types = {
    sedan: 'سدان',
    suv: 'شاسی بلند',
    hatchback: 'هاچبک',
    pickup: 'وانت',
    van: 'ون',
    truck: 'کامیون',
    motorcycle: 'موتورسیکلت',
  };
  return types[type] || type;
};

export default PlateRecognition;