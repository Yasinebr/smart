// src/components/user/UserDetails.jsx
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getUserDetails, deleteUser } from '../../api/user';
import { getUserVehicles } from '../../api/vehicle';
import { formatDate } from '../../utils/formatter';
import { USER_ROLE_DISPLAY } from '../../utils/constants';
import { useNotification } from '../../contexts/NotificationContext';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useNotification();
  const [user, setUser] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);

      // دریافت اطلاعات کاربر
      const userResponse = await getUserDetails(id);
      setUser(userResponse.data);

      // دریافت خودروهای کاربر
      const vehiclesResponse = await getUserVehicles(id);
      setVehicles(vehiclesResponse.data);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError('خطا در بارگذاری اطلاعات کاربر');
      notify.error('خطا در بارگذاری اطلاعات کاربر');
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser(id);
      notify.success('کاربر با موفقیت حذف شد');
      navigate('/admin/users');
    } catch (error) {
      console.error('Error deleting user:', error);
      notify.error('خطا در حذف کاربر');
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
        <button onClick={() => navigate('/admin/users')} className="btn btn-primary">
          بازگشت به لیست کاربران
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="not-found-container">
        <i className="fas fa-search"></i>
        <p>کاربر مورد نظر یافت نشد.</p>
        <button onClick={() => navigate('/admin/users')} className="btn btn-primary">
          بازگشت به لیست کاربران
        </button>
      </div>
    );
  }

  return (
    <div className="user-details">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">جزئیات کاربر</h2>
          <div className="card-actions">
            <Link to={`/admin/users/${id}/edit`} className="btn btn-warning">
              <i className="fas fa-edit"></i> ویرایش
            </Link>
            {!showDeleteConfirm ? (
              <button
                className="btn btn-danger mr-2"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <i className="fas fa-trash"></i> حذف
              </button>
            ) : (
              <div className="btn-group mr-2">
                <button
                  className="btn btn-danger"
                  onClick={handleDelete}
                >
                  <i className="fas fa-check"></i> تایید حذف
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  <i className="fas fa-times"></i> انصراف
                </button>
              </div>
            )}
            <button
              className="btn btn-secondary mr-2"
              onClick={() => navigate('/admin/users')}
            >
              <i className="fas fa-arrow-right"></i> بازگشت به لیست
            </button>
          </div>
        </div>
        <div className="card-body">
          <div className="user-profile-header">
            <div className="user-profile-image">
              <img
                src={user.profile_image || '/assets/images/user-placeholder.png'}
                alt={`${user.first_name} ${user.last_name}`}
                className="profile-image"
              />
            </div>
            <div className="user-profile-info">
              <h1 className="user-name">{user.first_name} {user.last_name}</h1>
              <div className="user-role">
                <span className={`badge badge-${getRoleBadgeClass(user.role)}`}>
                  {USER_ROLE_DISPLAY[user.role] || user.role}
                </span>
              </div>
              <div className="user-email">
                <i className="fas fa-envelope"></i> {user.email}
              </div>
              {user.phone_number && (
                <div className="user-phone">
                  <i className="fas fa-phone"></i> {user.phone_number}
                </div>
              )}
            </div>
          </div>

          <div className="user-details-section">
            <h3>اطلاعات شخصی</h3>
            <div className="details-grid">
              <div className="detail-item">
                <div className="detail-label">نام و نام خانوادگی:</div>
                <div className="detail-value">{user.first_name} {user.last_name}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">ایمیل:</div>
                <div className="detail-value">{user.email}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">شماره تلفن:</div>
                <div className="detail-value">{user.phone_number || '---'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">کد ملی:</div>
                <div className="detail-value">{user.national_id || '---'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">تاریخ تولد:</div>
                <div className="detail-value">{user.date_of_birth ? formatDate(user.date_of_birth) : '---'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">آدرس:</div>
                <div className="detail-value">{user.address || '---'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">تاریخ ثبت‌نام:</div>
                <div className="detail-value">{formatDate(user.created_at)}</div>
              </div>
            </div>
          </div>

          <div className="user-vehicles-section">
            <h3>خودروهای کاربر</h3>
            {vehicles.length === 0 ? (
              <div className="no-items">
                <p>این کاربر هیچ خودرویی ثبت نکرده است.</p>
              </div>
            ) : (
              <div className="vehicles-grid">
                {vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="vehicle-card">
                    <div className="vehicle-image">
                      <img
                        src={vehicle.vehicle_image || '/assets/images/car-placeholder.svg'}
                        alt={`${vehicle.make} ${vehicle.model}`}
                      />
                      {vehicle.is_primary && (
                        <div className="primary-badge" title="خودروی اصلی">
                          <i className="fas fa-star"></i>
                        </div>
                      )}
                    </div>
                    <div className="vehicle-content">
                      <h4>{vehicle.make} {vehicle.model}</h4>
                      <div className="vehicle-detail">
                        <i className="fas fa-credit-card"></i>
                        <span>{vehicle.license_plate}</span>
                      </div>
                      {vehicle.color && (
                        <div className="vehicle-detail">
                          <i className="fas fa-palette"></i>
                          <span>{vehicle.color}</span>
                        </div>
                      )}
                      {vehicle.year && (
                        <div className="vehicle-detail">
                          <i className="fas fa-calendar"></i>
                          <span>{vehicle.year}</span>
                        </div>
                      )}
                      <Link to={`/vehicles/${vehicle.id}`} className="btn btn-sm btn-outline-primary mt-2">
                        مشاهده جزئیات
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* بخش‌های دیگر مانند رزروها، پرداخت‌ها و غیره را می‌توان اضافه کرد */}
        </div>
      </div>
    </div>
  );
};

// تعیین کلاس رنگ بر اساس نقش کاربر
const getRoleBadgeClass = (role) => {
  switch (role) {
    case 'admin':
      return 'danger';
    case 'parking_manager':
      return 'warning';
    case 'customer':
      return 'success';
    default:
      return 'info';
  }
};

export default UserDetails;
