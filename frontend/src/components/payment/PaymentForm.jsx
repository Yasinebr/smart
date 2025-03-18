// src/components/payment/PaymentForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { createPayment, processPayment } from '../../api/payment';
import { getParkingSessions } from '../../api/vehicle';
import { getReservations } from '../../api/parking';
import { formatPrice } from '../../utils/formatter';
import useAuth from '../../hooks/useAuth';
import { useNotification } from '../../contexts/NotificationContext';

// طرح اعتبارسنجی فرم پرداخت
const PaymentSchema = Yup.object().shape({
  payment_type: Yup.string().required('انتخاب نوع پرداخت الزامی است'),
  amount: Yup.number()
    .required('مبلغ پرداخت الزامی است')
    .min(1000, 'حداقل مبلغ پرداخت ۱۰۰۰ تومان است'),
  payment_method: Yup.string().required('انتخاب روش پرداخت الزامی است'),
});

const PaymentForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { notify } = useNotification();
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [relatedItems, setRelatedItems] = useState({
    sessions: [],
    reservations: [],
  });
  const [selectedItem, setSelectedItem] = useState(null);
  const [initialValues, setInitialValues] = useState({
    payment_type: '',
    amount: '',
    payment_method: 'online',
  });

  // دریافت پارامترهای URL
  const queryParams = new URLSearchParams(location.search);
  const sessionId = queryParams.get('session');
  const reservationId = queryParams.get('reservation');

  useEffect(() => {
    const fetchRelatedItems = async () => {
      try {
        setLoading(true);

        // دریافت جلسات پارک کاربر
        const sessionsResponse = await getParkingSessions();
        const userSessions = sessionsResponse.data.results.filter(
          session => session.user === currentUser.id && !session.is_paid && session.status === 'active'
        );

        // دریافت رزروهای کاربر
        const reservationsResponse = await getReservations();
        const userReservations = reservationsResponse.data.results.filter(
          reservation => reservation.user === currentUser.id &&
          ['confirmed', 'checked_in'].includes(reservation.status)
        );

        setRelatedItems({
          sessions: userSessions,
          reservations: userReservations,
        });

        // اگر شناسه جلسه پارک یا رزرو در URL موجود باشد، انتخاب خودکار آن
        if (sessionId) {
          const session = userSessions.find(s => s.id.toString() === sessionId);
          if (session) {
            handleItemSelect('parking_session', session);
          }
        } else if (reservationId) {
          const reservation = userReservations.find(r => r.id.toString() === reservationId);
          if (reservation) {
            handleItemSelect('reservation', reservation);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching related items:', error);
        notify.error('خطا در بارگذاری اطلاعات');
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchRelatedItems();
    }
  }, [currentUser, sessionId, reservationId, notify]);

  const handleItemSelect = (type, item) => {
    setSelectedItem({
      type,
      item,
    });

    setInitialValues({
      payment_type: type === 'parking_session' ? 'parking_session' : 'reservation',
      amount: item.amount_due || item.amount_paid || '0',
      payment_method: 'online',
    });
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setPaymentLoading(true);

      // ایجاد پرداخت
      const paymentData = {
        ...values,
        user: currentUser.id,
      };

      if (selectedItem) {
        if (selectedItem.type === 'parking_session') {
          paymentData.parking_session = selectedItem.item.id;
        } else if (selectedItem.type === 'reservation') {
          paymentData.reservation = selectedItem.item.id;
        }
      }

      const response = await createPayment(paymentData);
      const paymentId = response.data.id;

      // هدایت به درگاه پرداخت (شبیه‌سازی)
      setTimeout(async () => {
        try {
          // پردازش پرداخت (شبیه‌سازی پرداخت موفق)
          await processPayment(paymentId, {
            status: 'completed',
            transaction_id: `TRX-${Date.now()}`,
            payment_date: new Date().toISOString(),
          });

          notify.success('پرداخت با موفقیت انجام شد');
          navigate('/payments');
        } catch (error) {
          console.error('Error processing payment:', error);
          notify.error('خطا در پردازش پرداخت');
        } finally {
          setPaymentLoading(false);
          setSubmitting(false);
        }
      }, 2000);
    } catch (error) {
      console.error('Error creating payment:', error);
      notify.error('خطا در ایجاد پرداخت');
      setPaymentLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="payment-form">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">پرداخت</h2>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="loading-container">
              <i className="fas fa-spinner fa-spin"></i>
              <p>در حال بارگذاری...</p>
            </div>
          ) : (
            <>
              {(relatedItems.sessions.length === 0 && relatedItems.reservations.length === 0) ? (
                <div className="alert alert-info">
                  <p>در حال حاضر هیچ جلسه پارک یا رزرو نیازمند پرداختی ندارید.</p>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="btn btn-primary mt-2"
                  >
                    بازگشت به داشبورد
                  </button>
                </div>
              ) : (
                <>
                  <div className="payment-items">
                    <h3>انتخاب مورد پرداخت</h3>

                    {relatedItems.sessions.length > 0 && (
                      <div className="payment-section">
                        <h4>جلسات پارک فعال</h4>
                        <div className="items-list">
                          {relatedItems.sessions.map((session) => (
                            <div
                              key={session.id}
                              className={`payment-item ${selectedItem && selectedItem.type === 'parking_session' && selectedItem.item.id === session.id ? 'selected' : ''}`}
                              onClick={() => handleItemSelect('parking_session', session)}
                            >
                              <div className="item-icon">
                                <i className="fas fa-car"></i>
                              </div>
                              <div className="item-details">
                                <h5>{session.parking_lot_name}</h5>
                                <p>خودرو: {session.vehicle_plate}</p>
                                <p>زمان ورود: {session.entry_time}</p>
                                <p>مدت: {session.duration || 'در حال محاسبه'}</p>
                                <div className="item-price">
                                  {formatPrice(session.amount_due)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {relatedItems.reservations.length > 0 && (
                      <div className="payment-section">
                        <h4>رزروهای فعال</h4>
                        <div className="items-list">
                          {relatedItems.reservations.map((reservation) => (
                            <div
                              key={reservation.id}
                              className={`payment-item ${selectedItem && selectedItem.type === 'reservation' && selectedItem.item.id === reservation.id ? 'selected' : ''}`}
                              onClick={() => handleItemSelect('reservation', reservation)}
                            >
                              <div className="item-icon">
                                <i className="fas fa-calendar-check"></i>
                              </div>
                              <div className="item-details">
                                <h5>{reservation.parking_name}</h5>
                                <p>خودرو: {reservation.vehicle_plate}</p>
                                <p>زمان: {reservation.reservation_start} تا {reservation.reservation_end}</p>
                                <p>مدت: {reservation.duration}</p>
                                <div className="item-price">
                                  {formatPrice(reservation.amount_paid)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedItem && (
                    <div className="payment-form-container mt-3">
                      <h3>اطلاعات پرداخت</h3>
                      <Formik
                        initialValues={initialValues}
                        validationSchema={PaymentSchema}
                        onSubmit={handleSubmit}
                        enableReinitialize
                      >
                        {({ isSubmitting, values }) => (
                          <Form>
                            <div className="form-group" style={{ display: 'none' }}>
                              <label htmlFor="payment_type">نوع پرداخت</label>
                              <Field
                                as="select"
                                id="payment_type"
                                name="payment_type"
                                className="form-control"
                              >
                                <option value="">انتخاب نوع پرداخت...</option>
                                <option value="parking_session">جلسه پارک</option>
                                <option value="reservation">رزرو</option>
                                <option value="subscription">اشتراک</option>
                              </Field>
                              <ErrorMessage name="payment_type" component="div" className="invalid-feedback d-block" />
                            </div>

                            <div className="form-group">
                              <label htmlFor="amount">مبلغ (تومان)</label>
                              <Field
                                type="number"
                                id="amount"
                                name="amount"
                                className="form-control"
                                min="1000"
                              />
                              <ErrorMessage name="amount" component="div" className="invalid-feedback d-block" />
                            </div>

                            <div className="form-group">
                              <label htmlFor="payment_method">روش پرداخت</label>
                              <Field
                                as="select"
                                id="payment_method"
                                name="payment_method"
                                className="form-control"
                              >
                                <option value="online">درگاه آنلاین</option>
                                <option value="wallet">کیف پول</option>
                                <option value="credit_card">کارت اعتباری</option>
                              </Field>
                              <ErrorMessage name="payment_method" component="div" className="invalid-feedback d-block" />
                            </div>

                            {values.payment_method === 'online' && (
                              <div className="payment-gateways">
                                <h4>انتخاب درگاه پرداخت</h4>
                                <div className="gateway-options">
                                  <div className="gateway-option selected">
                                    <img src="/assets/images/zarinpal.png" alt="زرین‌پال" />
                                    <span>زرین‌پال</span>
                                  </div>
                                  <div className="gateway-option">
                                    <img src="/assets/images/mellat.png" alt="به پرداخت ملت" />
                                    <span>به پرداخت ملت</span>
                                  </div>
                                  <div className="gateway-option">
                                    <img src="/assets/images/saman.png" alt="سامان" />
                                    <span>سامان</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="payment-summary">
                              <h4>خلاصه پرداخت</h4>
                              <div className="summary-item">
                                <span>مبلغ قابل پرداخت:</span>
                                <span>{formatPrice(values.amount)}</span>
                              </div>
                              <div className="summary-item">
                                <span>روش پرداخت:</span>
                                <span>
                                  {values.payment_method === 'online' && 'درگاه آنلاین'}
                                  {values.payment_method === 'wallet' && 'کیف پول'}
                                  {values.payment_method === 'credit_card' && 'کارت اعتباری'}
                                </span>
                              </div>
                              <div className="summary-item">
                                <span>مورد پرداخت:</span>
                                <span>
                                  {selectedItem.type === 'parking_session' ? 'جلسه پارک' : 'رزرو'}
                                  {' - '}{selectedItem.type === 'parking_session' ? selectedItem.item.parking_lot_name : selectedItem.item.parking_name}
                                </span>
                              </div>
                            </div>

                            <div className="form-group mt-3">
                              <button
                                type="submit"
                                className="btn btn-primary btn-block"
                                disabled={isSubmitting || paymentLoading}
                              >
                                {isSubmitting || paymentLoading ? (
                                  <>
                                    <i className="fas fa-spinner fa-spin"></i> در حال پردازش پرداخت...
                                  </>
                                ) : (
                                  <>
                                    <i className="fas fa-credit-card"></i> پرداخت
                                  </>
                                )}
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary btn-block mt-2"
                                onClick={() => navigate(-1)}
                                disabled={isSubmitting || paymentLoading}
                              >
                                انصراف
                              </button>
                            </div>
                          </Form>
                        )}
                      </Formik>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;