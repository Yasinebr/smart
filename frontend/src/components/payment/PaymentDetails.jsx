// src/components/payment/PaymentDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPaymentDetails, refundPayment } from '../../api/payment';
import { formatDate, formatPrice } from '../../utils/formatter';
import useAuth from '../../hooks/useAuth';
import { useNotification } from '../../contexts/NotificationContext';

const PaymentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { notify } = useNotification();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRefundConfirm, setShowRefundConfirm] = useState(false);

  useEffect(() => {
    fetchPaymentDetails();
  }, [id]);

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);
      const response = await getPaymentDetails(id);
      setPayment(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching payment details:', error);
      setError('خطا در بارگذاری جزئیات پرداخت');
      notify.error('خطا در بارگذاری جزئیات پرداخت');
      setLoading(false);
    }
  };

  const handleRefund = async () => {
    try {
      await refundPayment(id, { status: 'refunded' });
      notify.success('درخواست استرداد با موفقیت ثبت شد');

      // به‌روزرسانی وضعیت پرداخت
      setPayment(prev => ({
        ...prev,
        status: 'refunded',
        is_successful: false
      }));

      setShowRefundConfirm(false);
    } catch (error) {
      console.error('Error refunding payment:', error);
      notify.error('خطا در درخواست استرداد');
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
        <button onClick={() => navigate('/payments')} className="btn btn-primary">
          بازگشت به لیست پرداخت‌ها
        </button>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="not-found-container">
        <i className="fas fa-search"></i>
        <p>پرداخت مورد نظر یافت نشد.</p>
        <button onClick={() => navigate('/payments')} className="btn btn-primary">
          بازگشت به لیست پرداخت‌ها
        </button>
      </div>
    );
  }

  return (
    <div className="payment-detail">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">جزئیات پرداخت</h2>
          <div className="card-actions">
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/payments')}
            >
              <i className="fas fa-arrow-right"></i> بازگشت به لیست
            </button>
          </div>
        </div>
        <div className="card-body">
          <div className="payment-status-header">
            <div className={`status-badge ${payment.status}`}>
              {payment.status === 'pending' && 'در انتظار پرداخت'}
              {payment.status === 'completed' && 'پرداخت شده'}
              {payment.status === 'failed' && 'ناموفق'}
              {payment.status === 'refunded' && 'برگشت داده شده'}
            </div>
            <div className="payment-amount">
              {formatPrice(payment.amount)}
            </div>
          </div>

          <div className="detail-section">
            <h3>اطلاعات پرداخت</h3>
            <div className="details-grid">
              <div className="detail-item">
                <div className="detail-label">شناسه پرداخت:</div>
                <div className="detail-value">{payment.id}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">شناسه تراکنش:</div>
                <div className="detail-value">{payment.transaction_id || '---'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">نوع پرداخت:</div>
                <div className="detail-value">
                  {payment.payment_type === 'parking_session' && 'جلسه پارک'}
                  {payment.payment_type === 'reservation' && 'رزرو'}
                  {payment.payment_type === 'subscription' && 'اشتراک'}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">تاریخ پرداخت:</div>
                <div className="detail-value">{payment.payment_date ? formatDate(payment.payment_date) : '---'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">روش پرداخت:</div>
                <div className="detail-value">
                  {payment.payment_method === 'online' && 'درگاه آنلاین'}
                  {payment.payment_method === 'wallet' && 'کیف پول'}
                  {payment.payment_method === 'credit_card' && 'کارت اعتباری'}
                  {!payment.payment_method && '---'}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">درگاه پرداخت:</div>
                <div className="detail-value">{payment.payment_gateway || '---'}</div>
              </div>
            </div>
          </div>

          {/* اطلاعات مربوط به مورد پرداخت */}
          {payment.payment_type === 'parking_session' && payment.parking_session && (
            <div className="detail-section">
              <h3>اطلاعات جلسه پارک</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <div className="detail-label">پارکینگ:</div>
                  <div className="detail-value">{payment.parking_session.parking_lot_name}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">خودرو:</div>
                  <div className="detail-value">{payment.parking_session.vehicle_plate}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">زمان ورود:</div>
                  <div className="detail-value">{formatDate(payment.parking_session.entry_time)}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">زمان خروج:</div>
                  <div className="detail-value">
                    {payment.parking_session.exit_time ? formatDate(payment.parking_session.exit_time) : '---'}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">مدت:</div>
                  <div className="detail-value">{payment.parking_session.duration || '---'}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">جایگاه:</div>
                  <div className="detail-value">{payment.parking_session.spot_number || '---'}</div>
                </div>
              </div>
              <div className="detail-action">
                <Link to={`/sessions/${payment.parking_session.id}`} className="btn btn-info">
                  <i className="fas fa-eye"></i> مشاهده جلسه پارک
                </Link>
              </div>
            </div>
          )}

          {payment.payment_type === 'reservation' && payment.reservation && (
            <div className="detail-section">
              <h3>اطلاعات رزرو</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <div className="detail-label">پارکینگ:</div>
                  <div className="detail-value">{payment.reservation.parking_name}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">خودرو:</div>
                  <div className="detail-value">{payment.reservation.vehicle_plate}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">زمان شروع:</div>
                  <div className="detail-value">{formatDate(payment.reservation.reservation_start)}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">زمان پایان:</div>
                  <div className="detail-value">{formatDate(payment.reservation.reservation_end)}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">مدت:</div>
                  <div className="detail-value">{payment.reservation.duration}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">وضعیت:</div>
                  <div className="detail-value">{payment.reservation.status_display}</div>
                </div>
              </div>
              <div className="detail-action">
                <Link to={`/reservations/${payment.reservation.id}`} className="btn btn-info">
                  <i className="fas fa-eye"></i> مشاهده رزرو
                </Link>
              </div>
            </div>
          )}

          {/* کارت رسید پرداخت */}
          {payment.status === 'completed' && (
            <div className="receipt-card">
              <div className="receipt-header">
                <img src="/assets/images/logo.svg" alt="Smart Parking System" />
                <h3>رسید پرداخت</h3>
              </div>
              <div className="receipt-body">
                <div className="receipt-item">
                  <div className="receipt-label">شماره پیگیری:</div>
                  <div className="receipt-value">{payment.transaction_id}</div>
                </div>
                <div className="receipt-item">
                  <div className="receipt-label">تاریخ پرداخت:</div>
                  <div className="receipt-value">{formatDate(payment.payment_date)}</div>
                </div>
                <div className="receipt-item">
                  <div className="receipt-label">نوع پرداخت:</div>
                  <div className="receipt-value">
                    {payment.payment_type === 'parking_session' && 'جلسه پارک'}
                    {payment.payment_type === 'reservation' && 'رزرو'}
                    {payment.payment_type === 'subscription' && 'اشتراک'}
                  </div>
                </div>
                <div className="receipt-item">
                  <div className="receipt-label">روش پرداخت:</div>
                  <div className="receipt-value">
                    {payment.payment_method === 'online' && 'درگاه آنلاین'}
                    {payment.payment_method === 'wallet' && 'کیف پول'}
                    {payment.payment_method === 'credit_card' && 'کارت اعتباری'}
                  </div>
                </div>
                <div className="receipt-item">
                  <div className="receipt-label">مبلغ پرداختی:</div>
                  <div className="receipt-value">{formatPrice(payment.amount)}</div>
                </div>
              </div>
              <div className="receipt-footer">
                <p>با تشکر از پرداخت شما</p>
                <p>سیستم پارکینگ هوشمند</p>
              </div>
              <div className="receipt-actions">
                <button className="btn btn-outline-primary">
                  <i className="fas fa-print"></i> چاپ رسید
                </button>
                <button className="btn btn-outline-secondary">
                  <i className="fas fa-download"></i> دانلود رسید
                </button>
              </div>
            </div>
          )}

          {/* دکمه‌های عملیات */}
          <div className="action-buttons">
            {payment.status === 'completed' && !showRefundConfirm && (
              <button
                className="btn btn-warning"
                onClick={() => setShowRefundConfirm(true)}
              >
                <i className="fas fa-undo"></i> درخواست استرداد
              </button>
            )}

            {showRefundConfirm && (
              <div className="confirm-action-box">
                <p>آیا از درخواست استرداد این پرداخت اطمینان دارید؟</p>
                <div className="confirm-buttons">
                  <button
                    className="btn btn-danger"
                    onClick={handleRefund}
                  >
                    بله، استرداد شود
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowRefundConfirm(false)}
                  >
                    انصراف
                  </button>
                </div>
              </div>
            )}

            {payment.status === 'pending' && (
              <button
                className="btn btn-success"
                onClick={() => navigate(`/payments/create?payment=${payment.id}`)}
              >
                <i className="fas fa-credit-card"></i> پرداخت
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetail;