// src/components/vehicle/VehicleForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { createVehicle, getVehicleDetails, updateVehicle } from '../../api/vehicle';
import useAuth from '../../hooks/useAuth';
import { useNotification } from '../../contexts/NotificationContext';

// طرح اعتبارسنجی فرم خودرو
const VehicleSchema = Yup.object().shape({
  license_plate: Yup.string()
    .required('شماره پلاک الزامی است')
    .max(20, 'شماره پلاک نمی‌تواند بیشتر از ۲۰ کاراکتر باشد'),
  make: Yup.string()
    .required('سازنده خودرو الزامی است')
    .max(50, 'نام سازنده نمی‌تواند بیشتر از ۵۰ کاراکتر باشد'),
  model: Yup.string()
    .required('مدل خودرو الزامی است')
    .max(50, 'نام مدل نمی‌تواند بیشتر از ۵۰ کاراکتر باشد'),
  vehicle_type: Yup.string()
    .required('نوع خودرو الزامی است'),
  year: Yup.number()
    .nullable()
    .typeError('سال باید عدد باشد')
    .positive('سال باید مثبت باشد')
    .integer('سال باید عدد صحیح باشد')
    .max(new Date().getFullYear(), `سال نمی‌تواند بیشتر از ${new Date().getFullYear()} باشد`),
  color: Yup.string()
    .max(30, 'رنگ نمی‌تواند بیشتر از ۳۰ کاراکتر باشد'),
});

const VehicleForm = ({ isEdit = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentUser } = useAuth();
  const { notify } = useNotification();
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState(null);
  const [vehicleImage, setVehicleImage] = useState(null);
  const [licensePlateImage, setLicensePlateImage] = useState(null);
  const [vehicleImagePreview, setVehicleImagePreview] = useState(null);
  const [licensePlateImagePreview, setLicensePlateImagePreview] = useState(null);
  const [initialValues, setInitialValues] = useState({
    license_plate: '',
    vehicle_type: 'sedan',
    make: '',
    model: '',
    year: '',
    color: '',
  });

  useEffect(() => {
    // دریافت اطلاعات خودرو در حالت ویرایش
    const fetchVehicleDetails = async () => {
      try {
        setLoading(true);
        const response = await getVehicleDetails(id);
        const vehicle = response.data;
        setInitialValues({
          license_plate: vehicle.license_plate,
          vehicle_type: vehicle.vehicle_type,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year || '',
          color: vehicle.color || '',
        });

        if (vehicle.vehicle_image) {
          setVehicleImagePreview(vehicle.vehicle_image);
        }

        if (vehicle.license_plate_image) {
          setLicensePlateImagePreview(vehicle.license_plate_image);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching vehicle details:', error);
        setError('خطا در بارگذاری اطلاعات خودرو');
        notify.error('خطا در بارگذاری اطلاعات خودرو');
        setLoading(false);
      }
    };

    if (isEdit && id) {
      fetchVehicleDetails();
    }
  }, [isEdit, id, notify]);

  const handleVehicleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setVehicleImage(file);
      setVehicleImagePreview(URL.createObjectURL(file));
    }
  };

  const handleLicensePlateImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setLicensePlateImage(file);
      setLicensePlateImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // ایجاد فرم‌دیتا برای ارسال فایل‌ها
      const formData = new FormData();

      // افزودن فیلدها به فرم‌دیتا
      Object.keys(values).forEach(key => {
        formData.append(key, values[key]);
      });

      // افزودن تصاویر در صورت وجود
      if (vehicleImage) {
        formData.append('vehicle_image', vehicleImage);
      }

      if (licensePlateImage) {
        formData.append('license_plate_image', licensePlateImage);
      }

      if (isEdit) {
        // ارسال درخواست به‌روزرسانی خودرو
        await updateVehicle(id, formData);
        notify.success('خودرو با موفقیت به‌روزرسانی شد');
      } else {
        // ارسال درخواست ایجاد خودرو جدید
        await createVehicle(formData);
        notify.success('خودرو با موفقیت ایجاد شد');
      }

      navigate('/vehicles');
    } catch (error) {
      console.error('Error saving vehicle:', error);
      notify.error(error.response?.data?.message || 'خطا در ذخیره اطلاعات خودرو');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <i className="fas fa-spinner fa-spin"></i>
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <i className="fas fa-exclamation-triangle"></i>
        <p>{error}</p>
        <button onClick={() => navigate('/vehicles')} className="btn btn-primary">
          بازگشت به لیست خودروها
        </button>
      </div>
    );
  }

  return (
    <div className="vehicle-form">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            {isEdit ? 'ویرایش خودرو' : 'افزودن خودرو جدید'}
          </h2>
        </div>
        <div className="card-body">
          <Formik
            initialValues={initialValues}
            validationSchema={VehicleSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label htmlFor="license_plate">شماره پلاک</label>
                    <Field
                      type="text"
                      id="license_plate"
                      name="license_plate"
                      className="form-control"
                      placeholder="مثال: ۱۲ ایران ۳۴۵ ب ۶۷"
                    />
                    <ErrorMessage name="license_plate" component="div" className="invalid-feedback d-block" />
                  </div>

                  <div className="form-group col-md-6">
                    <label htmlFor="vehicle_type">نوع خودرو</label>
                    <Field as="select" id="vehicle_type" name="vehicle_type" className="form-control">
                      <option value="sedan">سدان</option>
                      <option value="suv">شاسی بلند</option>
                      <option value="hatchback">هاچبک</option>
                      <option value="pickup">وانت</option>
                      <option value="van">ون</option>
                      <option value="truck">کامیون</option>
                      <option value="motorcycle">موتورسیکلت</option>
                    </Field>
                    <ErrorMessage name="vehicle_type" component="div" className="invalid-feedback d-block" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label htmlFor="make">سازنده</label>
                    <Field
                      type="text"
                      id="make"
                      name="make"
                      className="form-control"
                      placeholder="مثال: پژو، سمند، تویوتا"
                    />
                    <ErrorMessage name="make" component="div" className="invalid-feedback d-block" />
                  </div>

                  <div className="form-group col-md-6">
                    <label htmlFor="model">مدل</label>
                    <Field
                      type="text"
                      id="model"
                      name="model"
                      className="form-control"
                      placeholder="مثال: ۲۰۶، پارس، کمری"
                    />
                    <ErrorMessage name="model" component="div" className="invalid-feedback d-block" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label htmlFor="year">سال تولید</label>
                    <Field
                      type="number"
                      id="year"
                      name="year"
                      className="form-control"
                      placeholder="مثال: ۱۴۰۰"
                    />
                    <ErrorMessage name="year" component="div" className="invalid-feedback d-block" />
                  </div>

                  <div className="form-group col-md-6">
                    <label htmlFor="color">رنگ</label>
                    <Field
                      type="text"
                      id="color"
                      name="color"
                      className="form-control"
                      placeholder="مثال: سفید، مشکی، نقره‌ای"
                    />
                    <ErrorMessage name="color" component="div" className="invalid-feedback d-block" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label htmlFor="vehicle_image">تصویر خودرو</label>
                    <div className="custom-file">
                      <input
                        type="file"
                        id="vehicle_image"
                        name="vehicle_image"
                        className="custom-file-input"
                        onChange={handleVehicleImageChange}
                        accept="image/*"
                      />
                      <label className="custom-file-label" htmlFor="vehicle_image">
                        {vehicleImage ? vehicleImage.name : 'انتخاب فایل...'}
                      </label>
                    </div>
                    <small className="form-text text-muted">
                      تصویر کلی خودرو برای شناسایی بهتر (اختیاری)
                    </small>
                    {vehicleImagePreview && (
                      <div className="image-preview mt-2">
                        <img src={vehicleImagePreview} alt="پیش‌نمایش تصویر خودرو" className="img-thumbnail" />
                      </div>
                    )}
                  </div>

                  <div className="form-group col-md-6">
                    <label htmlFor="license_plate_image">تصویر پلاک</label>
                    <div className="custom-file">
                      <input
                        type="file"
                        id="license_plate_image"
                        name="license_plate_image"
                        className="custom-file-input"
                        onChange={handleLicensePlateImageChange}
                        accept="image/*"
                      />
                      <label className="custom-file-label" htmlFor="license_plate_image">
                        {licensePlateImage ? licensePlateImage.name : 'انتخاب فایل...'}
                      </label>
                    </div>
                    <small className="form-text text-muted">
                      تصویر پلاک برای تشخیص خودکار (اختیاری)
                    </small>
                    {licensePlateImagePreview && (
                      <div className="image-preview mt-2">
                        <img src={licensePlateImagePreview} alt="پیش‌نمایش تصویر پلاک" className="img-thumbnail" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i> در حال ذخیره...
                      </>
                    ) : isEdit ? (
                      'به‌روزرسانی خودرو'
                    ) : (
                      'ثبت خودرو'
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary mr-2"
                    onClick={() => navigate('/vehicles')}
                  >
                    انصراف
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default VehicleForm;