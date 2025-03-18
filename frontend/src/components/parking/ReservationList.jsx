// src/components/parking/ReservationList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getReservations, cancelReservation } from '../../api/parking';
import { formatDate } from '../../utils/formatter';
import useAuth from '../../hooks/useAuth';
import { useNotification } from '../../contexts/NotificationContext';

const ReservationList = () => {
  const { currentUser } = useAuth();
  const { notify } = useNotification();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmCancelId, setConfirmCancelId] = useState(null);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await getReservations();

      // اگر کاربر مدیر نیست، فقط رزروهای خودش را ببیند
      let filteredReservations = response.data.results;
      if (currentUser && currentUser.role !== 'admin' && currentUser.role !== 'parking_manager') {
        filteredReservations = filteredReservations.filter(
          reservation => reservation.user === currentUser.id
        );
      }

      setReservations(filteredReservations);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      setError('خطا در بارگذاری لیست رزروها');
      notify.error('خطا در بارگذاری لیست رزروها');
      setLoading(false);
    }
  };

  const handleCancelConfirm = (id) => {
    setConfirmCancelId(id);
  };

  const handleCancelReservation = async (id) => {
    try {
      await cancelReservation(id, { status: 'cancelled' });
      notify.success('رزرو با موفقیت لغو شد');

      // به‌روزرسانی وضعیت رزرو در لیست
      setReservations(prevReservations =>
        prevReservations.map(reservation =>
          reservation.id === id ? { ...reservation, status: 'cancelled', status_display: 'لغو شده' } : reservation
        )
      );

      setConfirmCancelId(null);
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      notify.error('خطا در لغو رزرو');
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  // فیلتر بر اساس جستجو و وضعیت
  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch =
      reservation.parking_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.vehicle_plate.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="reservation-list">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">لیست رزروها</h2>
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
              <option value="pending">در انتظار تایید</option>
              <option value="confirmed">تایید شده</option>
              <option value="checked_in">ورود انجام شده</option>
              <option value="completed">تکمیل شده</option>
              <option value="cancelled">لغو شده</option>
            </select>
            <Link to="/reservations/create" className="btn btn-primary">
              <i className="fas fa-plus"></i> رزرو جدید
            </Link>
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
              <button onClick={fetchReservations} className="btn btn-primary">
                تلاش مجدد
              </button>
            </div>
          ) : filteredReservations.length === 0 ? (
            <div className="empty-container">
              <i className="fas fa-calendar-times"></i>
              <p>هیچ رزروی یافت نشد.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>پارکینگ</th>
                    <th>خودرو</th>
                    <th>زمان شروع</th>
                    <th>زمان پایان</th>
                    <th>مدت</th>
                    <th>جایگاه</th>
                    <th>وضعیت</th>
                    <th>هزینه</th>
                    <th>عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations.map((reservation, index) => (
                    <tr key={reservation.id}>
                      <td>{index + 1}</td>
                      <td>{reservation.parking_name}</td>
                      <td>{reservation.vehicle_plate}</td>
                      <td>{formatDate(reservation.reservation_start)}</td>
                      <td>{formatDate(reservation.reservation_end)}</td>
                      <td>{reservation.duration}</td>
                      <td>{reservation.spot_number || '---'}</td>
                      <td>
                        <span className={`badge badge-${getStatusBadgeClass(reservation.status)}`}>
                          {reservation.status_display}
                        </span>
                      </td>
                      <td>{reservation.amount_paid || '---'}</td>
                      <td>
                        <div className="btn-group">
                          <Link to={`/reservations/${reservation.id}`} className="btn btn-sm btn-info">
                            <i className="fas fa-eye"></i>
                          </Link>
                          {['pending', 'confirmed'].includes(reservation.status) && (
                            <>
                              {confirmCancelId === reservation.id ? (
                                <>
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleCancelReservation(reservation.id)}
                                  >
                                    <i className="fas fa-check"></i> تایید
                                  </button>
                                  <button
                                    className="btn btn-sm btn-secondary"
                                    onClick={() => setConfirmCancelId(null)}
                                  >
                                    <i className="fas fa-times"></i>
                                  </button>
                                </>
                              ) : (
                                <button
                                  className="btn btn-sm btn-warning"
                                  onClick={() => handleCancelConfirm(reservation.id)}
                                >
                                  <i className="fas fa-times"></i> لغو
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// تعیین کلاس رنگ بر اساس وضعیت رزرو
const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'confirmed':
      return 'info';
    case 'checked_in':
      return 'primary';
    case 'completed':
      return 'success';
    case 'cancelled':
      return 'danger';
    default:
      return 'secondary';
  }
};

export default ReservationList;