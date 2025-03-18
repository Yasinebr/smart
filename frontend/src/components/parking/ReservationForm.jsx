// src/components/parking/ReservationForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getParkingLots, getParkingLotAvailableSpots } from '../../api/parking';
import { getUserVehicles } from '../../api/vehicle';
import { createReservation } from '../../api/parking';
import useAuth from '../../hooks/useAuth';
import { useNotification } from '../../contexts/NotificationContext';

// طرح اعتبارسنجی فرم رزرو
const ReservationSchema = Yup.object().shape({
  parking: Yup.number().required('انتخاب پارکینگ الزامی است'),
  vehicle: Yup.number().required('انتخاب خودرو الزامی است'),
  reservation_start: Yup.date().required('زمان شروع رزرو الزامی است'),
  reservation_end: Yup.date().required('زمان پایان رزرو الزامی است')
    .min(Yup.ref('reservation_start'), 'زمان پایان نمی‌تواند قبل از زمان شروع باشد'),
  parking_slot: Yup.number().nullable(),
});

const ReservationForm = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { notify } = useNotification();
  const [loading, setLoading] = useState(true);
  const [parkingLots, setParkingLots] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [availableSpots, setAvailableSpots] = useState([]);
  const [selectedParkingLot, setSelectedParkingLot] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        setLoading(true);

        // دریافت لیست پارکینگ‌ها
        const parkingResponse = await getParkingLots();
        setParkingLots(parkingResponse.data.results);

        // دریافت خودروهای کاربر
        if (currentUser) {
          const vehiclesResponse = await getUserVehicles(currentUser.id);
          setVehicles(vehiclesResponse.data);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching form data:', error);
        setError('خطا در بارگذاری اطلاعات فرم');
        notify.error('خطا در بارگذاری اطلاعات فرم');
        setLoading(false);
      }
    };

    fetchFormData();
  }, [currentUser, notify]);

  const fetchAvailableSpots = async (parkingId, startTime, endTime) => {
    if (!parkingId || !startTime || !endTime) return;

    try {
      const response = await getParkingLotAvailableSpots(parkingId);
      setAvailableSpots(response.data);
    } catch (error) {
      console.error('Error fetching available spots:', error);
      notify.error('خطا در بارگذاری جاهای پارک آزاد');
    }
  };

  const handleParkingChange = async (e, setFieldValue) => {
    const parkingId = parseInt(e.target.value);
    setFieldValue('parking', parkingId);
    setFieldValue('parking_slot', '');

    if (parkingId) {
      const selected = parkingLots.find(lot => lot.id === parkingId);
      setSelectedParkingLot(selected);

      const startTime = setFieldValue.values?.reservation_start;
      const endTime = setFieldValue.values?.reservation_end;

      if (startTime && endTime) {
        fetchAvailableSpots(parkingId, startTime, endTime);
      }
    } else {
      setSelectedParkingLot(null);
      setAvailableSpots([]);
    }
  };

  const handleDateChange = (field, value, setFieldValue, values) => {
    setFieldValue(field, value);

    if (values.parking && values.reservation_start && values.reservation_end) {
      fetchAvailableSpots(values.parking, values.reservation_start, values.reservation_end);
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await createReservation({
        ...values,
        user: currentUser.id,
        status: 'pending'
      });

      notify.success('رزرو با موفقیت ثبت شد');
      navigate('/reservations');
    } catch (error) {
      console.error('Error creating reservation:', error);
      notify.error(error.response?.data?.message || 'خطا در ثبت رزرو');
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
        <button onClick={() => navigate('/reservations')} className="btn btn-primary">
          بازگشت به لیست رزروها
        </button>
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="alert alert-warning">
        <p>شما هیچ خودرویی ثبت نکرده‌اید. برای رزرو پارکینگ، ابتدا باید خودروی خود را ثبت کنید.</p>
        <button onClick={() => navigate('/vehicles/create')} className="btn btn-primary mt-2">
          ثبت خودرو
        </button>
      </div>
    );
  }

  return (
    <div className="reservation-form">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">رزرو پارکینگ</h2>
        </div>
        <div className="card-body">
          <Formik
            initialValues={{
              parking: '',
              vehicle: '',
              reservation_start: new Date(),
              reservation_end: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), // 2 ساعت بعد
              parking_slot: '',
            }}
            validationSchema={ReservationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, setFieldValue, values }) => (
              <Form>
                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label htmlFor="parking">انتخاب پارکینگ</label>
                    <Field
                      as="select"
                      id="parking"
                      name="parking"
                      className="form-control"
                      onChange={(e) => handleParkingChange(e, setFieldValue)}
                    >
                      <option value="">انتخاب پارکینگ...</option>
                      {parkingLots.map((parkingLot) => (
                        <option key={parkingLot.id} value={parkingLot.id}>
                          {parkingLot.name} - {parkingLot.address}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage name="parking" component="div" className="invalid-feedback d-block" />
                  </div>

                  <div className="form-group col-md-6">
                    <label htmlFor="vehicle">انتخاب خودرو</label>
                    <Field
                      as="select"
                      id="vehicle"
                      name="vehicle"
                      className="form-control"
                    >
                      <option value="">انتخاب خودرو...</option>
                      {vehicles.map((vehicle) => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.make} {vehicle.model} - {vehicle.license_plate}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage name="vehicle" component="div" className="invalid-feedback d-block" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label htmlFor="reservation_start">زمان شروع</label>
                    <DatePicker
                      selected={values.reservation_start}
                      onChange={(date) => handleDateChange('reservation_start', date, setFieldValue, values)}
                      showTimeSelect
                      dateFormat="yyyy/MM/dd HH:mm"
                      className="form-control"
                      id="reservation_start"
                      minDate={new Date()}
                    />
                    <ErrorMessage name="reservation_start" component="div" className="invalid-feedback d-block" />
                  </div>

                  <div className="form-group col-md-6">
                    <label htmlFor="reservation_end">زمان پایان</label>
                    <DatePicker
                      selected={values.reservation_end}
                      onChange={(date) => handleDateChange('reservation_end', date, setFieldValue, values)}
                      showTimeSelect
                      dateFormat="yyyy/MM/dd HH:mm"
                      className="form-control"
                      id="reservation_end"
                      minDate={values.reservation_start || new Date()}
                    />
                    <ErrorMessage name="reservation_end" component="div" className="invalid-feedback d-block" />
                  </div>
                </div>

                {selectedParkingLot && (
                  <div className="parking-info alert alert-info">
                    <h4>اطلاعات پارکینگ</h4>
                    <div className="parking-details">
                      <div className="parking-detail">
                        <strong>ظرفیت کل:</strong>
                        <span>{selectedParkingLot.total_capacity}</span>
                      </div>
                      <div className="parking-detail">
                        <strong>نرخ ساعتی:</strong>
                        <span>{selectedParkingLot.hourly_rate} تومان</span>
                      </div>
                      <div className="parking-detail">
                        <strong>نرخ روزانه:</strong>
                        <span>{selectedParkingLot.daily_rate} تومان</span>
                      </div>
                      <div className="parking-detail">
                        <strong>ساعت کاری:</strong>
                        <span>
                          {selectedParkingLot.is_24h ? '۲۴ ساعته' : `${selectedParkingLot.opening_time} تا ${selectedParkingLot.closing_time}`}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {availableSpots.length > 0 && (
                  <div className="form-group">
                    <label htmlFor="parking_slot">انتخاب جای پارک (اختیاری)</label>
                    <Field
                      as="select"
                      id="parking_slot"
                      name="parking_slot"
                      className="form-control"
                    >
                      <option value="">انتخاب جای پارک...</option>
                      {availableSpots.map((spot) => (
                        <option key={spot.id} value={spot.id}>
                          {spot.slot_number}
                        </option>
                      ))}
                    </Field>
                    <small className="form-text text-muted">
                      انتخاب جای پارک اختیاری است. در صورت عدم انتخاب، سیستم به صورت خودکار یک جای پارک را اختصاص می‌دهد.
                    </small>
                    <ErrorMessage name="parking_slot" component="div" className="invalid-feedback d-block" />
                  </div>
                )}

                <div className="form-group mt-3">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting || !values.parking || !values.vehicle}
                  >
                    {isSubmitting ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i> در حال ثبت رزرو...
                      </>
                    ) : (
                      'ثبت رزرو'
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary mr-2"
                    onClick={() => navigate('/reservations')}
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

export default ReservationForm;