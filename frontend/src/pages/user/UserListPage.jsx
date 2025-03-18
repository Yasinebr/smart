// src/pages/user/UserListPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUsers, deleteUser } from '../../api/user';
import { useNotification } from '../../contexts/NotificationContext';
import { USER_ROLE_DISPLAY } from '../../utils/constants';

const UserListPage = () => {
  const { notify } = useNotification();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      setUsers(response.data.results);

      // محاسبه تعداد کل صفحات
      const total = response.data.count;
      const perPage = 10; // فرض کنید هر صفحه 10 آیتم دارد
      setTotalPages(Math.ceil(total / perPage));

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

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await deleteUser(userToDelete.id);
      setUsers(users.filter(user => user.id !== userToDelete.id));
      notify.success('کاربر با موفقیت حذف شد');
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      notify.error('خطا در حذف کاربر');
    }
  };

  // فیلتر کاربران بر اساس جستجو و نقش
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
    <div className="user-list-page">
      <div className="page-header">
        <h1>مدیریت کاربران</h1>
        <p>لیست کاربران سیستم و مدیریت آن‌ها</p>
      </div>

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
              <i className="fas fa-plus"></i> افزودن کاربر جدید
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
                    <th>نام</th>
                    <th>ایمیل</th>
                    <th>شماره تماس</th>
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
                        <div className="user-name">
                          {user.profile_image && (
                            <img
                              src={user.profile_image}
                              alt={`${user.first_name} ${user.last_name}`}
                              className="user-avatar"
                            />
                          )}
                          {user.first_name} {user.last_name}
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>{user.phone_number || '---'}</td>
                      <td>
                        <span className={`badge badge-${getRoleBadgeClass(user.role)}`}>
                          {USER_ROLE_DISPLAY[user.role] || user.role}
                        </span>
                      </td>
                      <td>{new Date(user.created_at).toLocaleDateString('fa-IR')}</td>
                      <td>
                        <div className="btn-group">
                          <Link to={`/admin/users/${user.id}`} className="btn btn-sm btn-info">
                            <i className="fas fa-eye"></i>
                          </Link>
                          <Link to={`/admin/users/${user.id}/edit`} className="btn btn-sm btn-warning">
                            <i className="fas fa-edit"></i>
                          </Link>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteClick(user)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* پیمایش صفحات */}
          {!loading && !error && totalPages > 1 && (
            <div className="pagination-container">
              <nav>
                <ul className="pagination">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      قبلی
                    </button>
                  </li>
                  {[...Array(totalPages).keys()].map((page) => (
                    <li
                      key={page + 1}
                      className={`page-item ${currentPage === page + 1 ? 'active' : ''}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(page + 1)}
                      >
                        {page + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      بعدی
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* مودال تایید حذف */}
      {userToDelete && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">تایید حذف</h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => setUserToDelete(null)}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <p>
                  آیا از حذف کاربر {userToDelete.first_name} {userToDelete.last_name} اطمینان دارید؟
                </p>
                <p className="text-danger">
                  <i className="fas fa-exclamation-triangle"></i> این عملیات غیرقابل بازگشت است.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setUserToDelete(null)}
                >
                  انصراف
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleConfirmDelete}
                >
                  حذف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
      return 'info';
    default:
      return 'secondary';
  }
};

export default UserListPage;
