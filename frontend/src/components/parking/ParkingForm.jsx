// src/components/parking/ParkingForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { createParkingLot, getParkingLotDetails, updateParkingLot } from '../../api/parking';
import { getUsers } from '../../api/user';
import { useNotification } from '../../contexts/NotificationContext';

// طرح اعتبارسنجی فرم پارکینگ
const ParkingSchema = Yup.object().shape({
  name: Yup.string()
    .required('نام پارکینگ الزامی است'),
  address: Yup.string()
    .required('آدرس پارکینگ الزامی است'),
  total_capacity: Yup.number()
    .min(1, 'ظرفیت باید حداقل 1 باشد')
    .required('ظرفیت کل الزامی است'),
  hourly_rate: Yup.number()
    .min(0, 'نرخ ساعتی نمی‌تواند منفی باشد')
    .required('نرخ ساعتی الزامی است'),
  daily_rate: Yup.number()
    .min(0, 'نرخ روزانه نمی‌تواند منفی باشد')
    .required('نرخ روزانه الزامی است'),
  monthly_rate: Yup.number()
    .min(0, 'نرخ ماهانه نمی‌تواند منفی باشد')
    .required('نرخ ماهانه الزامی است'),
});

const ParkingForm = ({ isEdit = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { notify } = useNotification();
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState(null);
  const [managers, setManagers] = useState([]);
  const [initialValues, setInitialValues] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    total_capacity: 0,
    hourly_rate: 0,
    daily_rate: 0,
    monthly_rate: 0,
    has_cctv: false,
    has_elevator: false,
    has_electric_charger: false,
    indoor: false,
    opening_time: '',
    closing_time: '',
    is_24h: false,
    manager: '',
  });

  useEffect(() => {
    // دریافت لیست مدیران
    const fetchManagers = async () => {
      try {
        const response = await getUsers();
        const parkingManagers = response.data.results.filter(
          (user) => user.role === 'parking_manager'
        );
        setManagers(parkingManagers);
      } catch (error) {
        console.error('Error fetching managers:', error);
        notify.error('خطا در بارگذاری لیست مدیران');
      }
    };

    // دریافت اطلاعات پارکینگ در حالت ویرایش
    const fetchParkingLot = async () => {
      try {
        setLoading(true);
        const response = await getParkingLotDetails(id);
        const parkingLot = response.data;
        setInitialValues({
          name: parkingLot.name,
          address: parkingLot.address,
          latitude: parkingLot.latitude || '',
          longitude: parkingLot.longitude || '',
          total_capacity: parkingLot.total_capacity,
          hourly_rate: parkingLot.hourly_rate,
          daily_rate: parkingLot.daily_rate,
          monthly_rate: parkingLot.monthly_rate,
          has_cctv: parkingLot.has_cctv,
          has_elevator: parkingLot.has_elevator,
          has_electric_charger: parkingLot.has_electric_charger,
          indoor: parkingLot.indoor,
          opening_time: parkingLot.opening_time || '',
          closing_time: parkingLot.closing_time || '',
          is_24h: parkingLot.is_24h,
          manager: parkingLot.manager || '',
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching parking lot details:', error);
        setError('خطا در بارگذاری اطلاعات پارکینگ');
        notify.error('خطا در بارگذاری اطلاعات پارکینگ');
        setLoading(false);
      }
    };

    fetchManagers();

    if (isEdit && id) {
      fetchParkingLot();
    }
  }, [isEdit, id, notify]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (isEdit) {
        await updateParkingLot(id, values);
        notify.success('پارکینگ با موفقیت به‌روزرسانی شد');
      } else {
        await createParkingLot(values);
        notify.success('پارکینگ با موفقیت ایجاد شد');
      }
      navigate('/admin/parking-lots');
    } catch (error) {
      console.error('Error saving parking lot:', error);
      notify.error(error.response?.data?.message || 'خطا در ذخیره اطلاعات پارکینگ');
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
        <button onClick={() => navigate('/admin/parking-lots')} className="btn btn-primary">
          بازگشت به لیست پارکینگ‌ها
        </button>
      </div>
    );
  }

  return (
    <div className="parking-form">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            {isEdit ? 'ویرایش پارکینگ' : 'افزودن پارکینگ جدید'}
          </h2>
        </div>
        <div className="card-body">
          <Formik
            initialValues={initialValues}
            validationSchema={ParkingSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting, values, setFieldValue }) => (
              <Form>
                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label htmlFor="name">نام پارکینگ</label>
                    <Field
                      type="text"
                      id="name"
                      name="name"
                      className="form-control"
                      placeholder="نام پارکینگ را وارد کنید"
                    />
                    <ErrorMessage name="name" component="div" className="invalid-feedback d-block" />
                  </div>

                  <div className="form-group col-md-6">
                    <label htmlFor="manager">مدیر پارکینگ</label>
                    <Field as="select" id="manager" name="manager" className="form-control">
                      <option value="">انتخاب مدیر...</option>
                      {managers.map((manager) => (
                        <option key={manager.id} value={manager.id}>
                          {manager.first_name} {manager.last_name} ({manager.email})
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage name="manager" component="div" className="invalid-feedback d-block" />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="address">آدرس</label>
                  <Field
                    type="text"
                    id="address"
                    name="address"
                    className="form-control"
                    placeholder="آدرس پارکینگ را وارد کنید"
                  />
                  <ErrorMessage name="address" component="div" className="invalid-feedback d-block" />
                </div>

                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label htmlFor="latitude">عرض جغرافیایی</label>
                    <Field
                      type="text"
                      id="latitude"
                      name="latitude"
                      className="form-control"
                      placeholder="عرض جغرافیایی (اختیاری)"
                    />
                    <ErrorMessage name="latitude" component="div" className="invalid-feedback d-block" />
                  </div>

                  <div className="form-group col-md-6">
                    <label htmlFor="longitude">طول جغرافیایی</label>
                    <Field
                      type="text"
                      id="longitude"
                      name="longitude"
                      className="form-control"
                      placeholder="طول جغرافیایی (اختیاری)"
                    />
                    <ErrorMessage name="longitude" component="div" className="invalid-feedback d-block" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group col-md-3">
                    <label htmlFor="total_capacity">ظرفیت کل</label>
                    <Field
                      type="number"
                      id="total_capacity"
                      name="total_capacity"
                      className="form-control"
                      min="1"
                    />
                    <ErrorMessage name="total_capacity" component="div" className="invalid-feedback d-block" />
                  </div>

                  <div className="form-group col-md-3">
                    <label htmlFor="hourly_rate">نرخ ساعتی (تومان)</label>
                    <Field
                      type="number"
                      id="hourly_rate"
                      name="hourly_rate"
                      className="form-control"
                      min="0"
                    />
                    <ErrorMessage name="hourly_rate" component="div" className="invalid-feedback d-block" />
                  </div>

                  <div className="form-group col-md-3">
                    <label htmlFor="daily_rate">نرخ روزانه (تومان)</label>
                    <Field
                      type="number"
                      id="daily_rate"
                      name="daily_rate"
                      className="form-control"
                      min="0"
                    />
                    <ErrorMessage name="daily_rate" component="div" className="invalid-feedback d-block" />
                  </div>

                  <div className="form-group col-md-3">
                    <label htmlFor="monthly_rate">نرخ ماهانه (تومان)</label>
                    <Field
                      type="number"
                      id="monthly_rate"
                      name="monthly_rate"
                      className="form-control"
                      min="0"
                    />
                    <ErrorMessage name="monthly_rate" component="div" className="invalid-feedback d-block" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label htmlFor="opening_time">ساعت شروع کار</label>
                    <Field
                      type="time"
                      id="opening_time"
                      name="opening_time"
                      className="form-control"
                      disabled={values.is_24h}
                    />
                    <ErrorMessage name="opening_time" component="div" className="invalid-feedback d-block" />
                  </div>

                  <div className="form-group col-md-6">
                    <label htmlFor="closing_time">ساعت پایان کار</label>
                    <Field
                      type="time"
                      id="closing_time"
                      name="closing_time"
                      className="form-control"
                      disabled={values.is_24h}
                    />
                    <ErrorMessage name="closing_time" component="div" className="invalid-feedback d-block" />
                  </div>
                </div>

                <div className="form-group">
                  <div className="form-check">
                    <Field
                      type="checkbox"
                      id="is_24h"
                      name="is_24h"
                      className="form-check-input"
                      onChange={(e) => {
                        setFieldValue('is_24h', e.target.checked);
                        if (e.target.checked) {
                          setFieldValue('opening_time', '');
                          setFieldValue('closing_time', '');
                        }
                      }}
                    />
                    <label className="form-check-label" htmlFor="is_24h">
                      ۲۴ ساعته
                    </label>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group col-md-3">
                    <div className="form-check">
                      <Field
                        type="checkbox"
                        id="has_cctv"
                        name="has_cctv"
                        className="form-check-input"
                      />
                      <label className="form-check-label" htmlFor="has_cctv">
                        دوربین مداربسته
                      </label>
                    </div>
                  </div>

                  <div className="form-group col-md-3">
                    <div className="form-check">
                      <Field
                        type="checkbox"
                        id="has_elevator"
                        name="has_elevator"
                        className="form-check-input"
                      />
                      <label className="form-check-label" htmlFor="has_elevator">
                        آسانسور
                      </label>
                    </div>
                  </div>

                  <div className="form-group col-md-3">
                    <div className="form-check">
                      <Field
                        type="checkbox"
                        id="has_electric_charger"
                        name="has_electric_charger"
                        className="form-check-input"
                      />
                      <label className="form-check-label" htmlFor="has_electric_charger">
                        شارژر برقی
                      </label>
                    </div>
                  </div>

                  <div className="form-group col-md-3">
                    <div className="form-check">
                      <Field
                        type="checkbox"
                        id="indoor"
                        name="indoor"
                        className="form-check-input"
                      />
                      <label className="form-check-label" htmlFor="indoor">
                        سرپوشیده
                      </label>
                    </div>
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
                      'به‌روزرسانی پارکینگ'
                    ) : (
                      'ایجاد پارکینگ'
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary mr-2"
                    onClick={() => navigate('/admin/parking-lots')}
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

export default ParkingForm;