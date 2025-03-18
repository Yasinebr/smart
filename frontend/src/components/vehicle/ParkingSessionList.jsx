// src/components/vehicle/ParkingSessionList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getParkingSessions } from '../../api/vehicle';
import { formatDate, formatDuration, formatPrice } from '../../utils/formatter';
import useAuth from '../../hooks/useAuth';
import { useNotification } from '../../contexts/NotificationContext';

const ParkingSessionList = () => {
  const { currentUser } = useAuth();
  const { notify } = useNotification();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await getParkingSessions();

      // اگر کاربر مدیر نیست، فقط جلسات پارک خودش را ببیند
      let filteredSessions = response.data.results;
      if (currentUser && currentUser.role !== 'admin' && currentUser.role !== 'parking_manager') {
        filteredSessions = filteredSessions.filter(
          session => session.user === currentUser.id
        );
      }

      setSessions(filteredSessions);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching parking sessions:', error);
      setError('خطا در بارگذاری لیست جلسات پارک');
      notify.error('خطا در بارگذاری لیست جلسات پارک');
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  // فیلتر بر اساس جستجو و وضعیت
  const filteredSessions = sessions.filter(session => {
    const matchesSearch =
      session.parking_lot_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.vehicle_plate.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || session.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="session-list">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">تاریخچه پارک</h2>
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
              <option value="active">فعال</option>
              <option value="completed">تکمیل شده</option>
              <option value="expired">منقضی شده</option>
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
              <button onClick={fetchSessions} className="btn btn-primary">
                تلاش مجدد
              </button>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="empty-container">
              <i className="fas fa-car"></i>
              <p>هیچ تاریخچه پارکی یافت نشد.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>پارکینگ</th>
                    <th>خودرو</th>
                    <th>جایگاه</th>
                    <th>زمان ورود</th>
                    <th>زمان خروج</th>
                    <th>مدت</th>
                    <th>هزینه</th>
                    <th>وضعیت پرداخت</th>
                    <th>وضعیت</th>
                    <th>عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSessions.map((session, index) => (
                    <tr key={session.id}>
                      <td>{index + 1}</td>
                      <td>{session.parking_lot_name}</td>
                      <td>{session.vehicle_plate}</td>
                      <td>{session.spot_number || '---'}</td>
                      <td>{formatDate(session.entry_time)}</td>
                      <td>{session.exit_time ? formatDate(session.exit_time) : '---'}</td>
                      <td>{session.duration || '---'}</td>
                      <td>{formatPrice(session.amount_due)}</td>
                      <td>
                        <span className={`badge badge-${session.is_paid ? 'success' : 'danger'}`}>
                          {session.is_paid ? 'پرداخت شده' : 'پرداخت نشده'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${getStatusBadgeClass(session.status)}`}>
                          {session.status_display}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group">
                          <Link to={`/sessions/${session.id}`} className="btn btn-sm btn-info">
                            <i className="fas fa-eye"></i>
                          </Link>
                          {session.status === 'active' && !session.is_paid && (
                            <Link to={`/payments/create?session=${session.id}`} className="btn btn-sm btn-success">
                              <i className="fas fa-money-bill"></i> پرداخت
                            </Link>
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

// تعیین کلاس رنگ بر اساس وضعیت جلسه پارک
const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'active':
      return 'primary';
    case 'completed':
      return 'success';
    case 'expired':
      return 'danger';
    default:
      return 'secondary';
  }
};

export default ParkingSessionList;