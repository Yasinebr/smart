// src/components/payment/PaymentList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPayments, refundPayment } from '../../api/payment';
import { formatDate, formatPrice } from '../../utils/formatter';
import useAuth from '../../hooks/useAuth';
import { useNotification } from '../../contexts/NotificationContext';

const PaymentList = () => {
  const { currentUser } = useAuth();
  const { notify } = useNotification();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmRefundId, setConfirmRefundId] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await getPayments();

      // اگر کاربر مدیر نیست، فقط پرداخت‌های خودش را ببیند
      let filteredPayments = response.data.results;
      if (currentUser && currentUser.role !== 'admin') {
        filteredPayments = filteredPayments.filter(
          payment => payment.user === currentUser.id
        );
      }

      setPayments(filteredPayments);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setError('خطا در بارگذاری لیست پرداخت‌ها');
      notify.error('خطا در بارگذاری لیست پرداخت‌ها');
      setLoading(false);
    }
  };

  const handleRefundConfirm = (id) => {
    setConfirmRefundId(id);
  };

  const handleRefundPayment = async (id) => {
    try {
      await refundPayment(id, { status: 'refunded' });
      notify.success('درخواست استرداد با موفقیت ثبت شد');

      // به‌روزرسانی وضعیت پرداخت در لیست
      setPayments(prevPayments =>
        prevPayments.map(payment =>
          payment.id === id ? { ...payment, status: 'refunded', is_successful: false } : payment
        )
      );

      setConfirmRefundId(null);
    } catch (error) {
      console.error('Error refunding payment:', error);
      notify.error('خطا در درخواست استرداد');
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  // فیلتر بر اساس جستجو و وضعیت
  const filteredPayments = payments.filter(payment => {
    const matchesSearch =
      payment.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.payment_method?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.amount.toString().includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // محاسبه جمع مبالغ
  const totalAmount = filteredPayments
    .filter(payment => payment.status === 'completed')
    .reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

  return (
    <div className="payment-list">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">لیست پرداخت‌ها</h2>
          <div className="card-actions">
            <div className="search-box">
              <input
                type="text"
                placeholder="جستجو..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="form-control"
              />
              <i className="fas fa-search"></i>
            </div>
            <select
              className="form-control mr-2 status-filter"
              value={statusFilter}
              onChange={handleStatusFilterChange}
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="pending">در انتظار پرداخت</option>
              <option value="completed">پرداخت شده</option>
              <option value="failed">ناموفق</option>
              <option value="refunded">برگشت داده شده</option>
            </select>
          </div>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="loading-container">
              <i className="fas fa-spinner fa-spin"></i>
              <p>در حال بارگذاری...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <i className="fas fa-exclamation-triangle"></i>
              <p>{error}</p>
              <button onClick={fetchPayments} className="btn btn-primary">
                تلاش مجدد
              </button>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="empty-container">
              <i className="fas fa-money-bill-wave"></i>
              <p>هیچ پرداختی یافت نشد.</p>
            </div>
          ) : (
            <>
              <div className="summary-box mb-3">
                <div className="summary-item">
                  <div className="summary-label">تعداد کل تراکنش‌ها:</div>
                  <div className="summary-value">{filteredPayments.length}</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">مجموع پرداخت‌های موفق:</div>
                  <div className="summary-value">{formatPrice(totalAmount)}</div>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>شناسه تراکنش</th>
                      <th>نوع پرداخت</th>
                      <th>مبلغ</th>
                      <th>روش پرداخت</th>
                      <th>تاریخ</th>
                      <th>وضعیت</th>
                      <th>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((payment, index) => (
                      <tr key={payment.id}>
                        <td>{index + 1}</td>
                        <td>{payment.transaction_id || '---'}</td>
                        <td>
                          {payment.payment_type === 'parking_session' && 'جلسه پارک'}
                          {payment.payment_type === 'reservation' && 'رزرو'}
                          {payment.payment_type === 'subscription' && 'اشتراک'}
                        </td>
                        <td>{formatPrice(payment.amount)}</td>
                        <td>
                          {payment.payment_method === 'online' && 'درگاه آنلاین'}
                          {payment.payment_method === 'wallet' && 'کیف پول'}
                          {payment.payment_method === 'credit_card' && 'کارت اعتباری'}
                          {!payment.payment_method && '---'}
                        </td>
                        <td>{payment.payment_date ? formatDate(payment.payment_date) : '---'}</td>
                        <td>
                          <span className={`badge badge-${getStatusBadgeClass(payment.status)}`}>
                            {getStatusDisplay(payment.status)}
                          </span>
                        </td>
                        <td>
                          <div className="btn-group">
                            <Link to={`/payments/${payment.id}`} className="btn btn-sm btn-info">
                              <i className="fas fa-eye"></i>
                            </Link>
                            {payment.status === 'completed' && (
                              <>
                                {confirmRefundId === payment.id ? (
                                  <>
                                    <button
                                      className="btn btn-sm btn-danger"
                                      onClick={() => handleRefundPayment(payment.id)}
                                    >
                                      <i className="fas fa-check"></i> تایید
                                    </button>
                                    <button
                                      className="btn btn-sm btn-secondary"
                                      onClick={() => setConfirmRefundId(null)}
                                    >
                                      <i className="fas fa-times"></i>
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    className="btn btn-sm btn-warning"
                                    onClick={() => handleRefundConfirm(payment.id)}
                                  >
                                    <i className="fas fa-undo"></i> استرداد
                                  </button>
                                )}
                              </>
                            )}
                            {payment.status === 'pending' && (
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => navigate(`/payments/create?payment=${payment.id}`)}
                              >
                                <i className="fas fa-credit-card"></i> پرداخت
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// تعیین کلاس رنگ بر اساس وضعیت پرداخت
const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'completed':
      return 'success';
    case 'failed':
      return 'danger';
    case 'refunded':
      return 'info';
    default:
      return 'secondary';
  }
};

// ترجمه وضعیت‌های پرداخت
const getStatusDisplay = (status) => {
  switch (status) {
    case 'pending':
      return 'در انتظار پرداخت';
    case 'completed':
      return 'پرداخت شده';
    case 'failed':
      return 'ناموفق';
    case 'refunded':
      return 'برگشت داده شده';
    default:
      return status;
  }
};

export default PaymentList;