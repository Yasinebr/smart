// src/components/user/UserList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUsers, deleteUser } from '../../api/user';
import { formatDate } from '../../utils/formatter';
import { USER_ROLE_DISPLAY } from '../../utils/constants';
import { useNotification } from '../../contexts/NotificationContext';

const UserList = () => {
  const { notify } = useNotification();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      setUsers(response.data.results);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('خطا در بارگذاری لیست کاربران');
      notify.error('خطا در بارگذاری لیست کاربران');
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
  };

  const handleDeleteConfirm = (id) => {
    setConfirmDeleteId(id);
  };

  const handleDeleteUser = async (id) => {
    try {
      await deleteUser(id);
      notify.success('کاربر با موفقیت حذف شد');

      // به‌روزرسانی لیست کاربران
      setUsers(prevUsers => prevUsers.filter(user => user.id !== id));

      setConfirmDeleteId(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      notify.error('خطا در حذف کاربر');
    }
  };

  // فیلتر بر اساس جستجو و نقش
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone_number && user.phone_number.includes(searchTerm));

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="user-list">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">لیست کاربران</h2>
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
              className="form-control mr-2 role-filter"
              value={roleFilter}
              onChange={handleRoleFilterChange}
            >
              <option value="all">همه نقش‌ها</option>
              <option value="admin">مدیر سیستم</option>
              <option value="parking_manager">مدیر پارکینگ</option>
              <option value="customer">مشتری</option>
            </select>
            <Link to="/admin/users/create" className="btn btn-primary">
              <i className="fas fa-plus"></i> افزودن کاربر
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
              <button onClick={fetchUsers} className="btn btn-primary">
                تلاش مجدد
              </button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="empty-container">
              <i className="fas fa-users"></i>
              <p>هیچ کاربری یافت نشد.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>نام و نام خانوادگی</th>
                    <th>ایمیل</th>
                    <th>شماره تلفن</th>
                    <th>نقش</th>
                    <th>تاریخ ثبت‌نام</th>
                    <th>عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <tr key={user.id}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="user-cell">
                          <img
                            src={user.profile_image || '/assets/images/user-placeholder.png'}
                            alt={`${user.first_name} ${user.last_name}`}
                            className="user-avatar"
                          />
                          <span>{user.first_name} {user.last_name}</span>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>{user.phone_number || '---'}</td>
                      <td>
                        <span className={`badge badge-${getRoleBadgeClass(user.role)}`}>
                          {USER_ROLE_DISPLAY[user.role] || user.role}
                        </span>
                      </td>
                      <td>{formatDate(user.created_at)}</td>
                      <td>
                        <div className="btn-group">
                          <Link to={`/admin/users/${user.id}`} className="btn btn-sm btn-info">
                            <i className="fas fa-eye"></i>
                          </Link>
                          <Link to={`/admin/users/${user.id}/edit`} className="btn btn-sm btn-warning">
                            <i className="fas fa-edit"></i>
                          </Link>
                          {confirmDeleteId === user.id ? (
                            <>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <i className="fas fa-check"></i> تایید
                              </button>
                              <button
                                className="btn btn-sm btn-secondary"
                                onClick={() => setConfirmDeleteId(null)}
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </>
                          ) : (
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDeleteConfirm(user.id)}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
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

export default UserList;