import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserDetails, updateUser } from '../../api/user';
import { useNotification } from '../../contexts/NotificationContext';
import useAuth from '../../hooks/useAuth';
import UserForm from '../../components/user/UserForm';
import PageHeader from '../../components/common/PageHeader';

const UserEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useNotification();
  const { currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // فقط مدیران سیستم می‌توانند کاربران را ویرایش کنند
    if (currentUser && currentUser.role !== 'admin') {
      navigate('/dashboard');
      notify.warning('شما دسترسی لازم برای ویرایش کاربران را ندارید');
      return;
    }

    fetchUserData();
  }, [id, currentUser, navigate, notify]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await getUserDetails(id);
      setUser(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError('خطا در بارگذاری اطلاعات کاربر');
      notify.error('خطا در بارگذاری اطلاعات کاربر');
      setLoading(false);
    }
  };

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      setSaving(true);

      // اگر رمز عبور خالی است، آن را از درخواست حذف کنیم
      const userData = { ...values };
      if (!userData.password) {
        delete userData.password;
      }

      const response = await updateUser(id, userData);

      notify.success('اطلاعات کاربر با موفقیت به‌روزرسانی شد');
      navigate('/admin/users');
    } catch (error) {
      console.error('Error updating user:', error);
      const errorMessage = error.response?.data?.message || 'خطا در به‌روزرسانی اطلاعات کاربر';

      // اگر خطای اعتبارسنجی داریم، آن را به فرم ارسال کنیم
      if (error.response?.data?.errors) {
        const formErrors = {};
        Object.keys(error.response.data.errors).forEach(key => {
          formErrors[key] = error.response.data.errors[key][0];
        });
        setErrors(formErrors);
      }

      notify.error(errorMessage);
    } finally {
      setSaving(false);
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/users');
  };

  return (
    <div className="user-edit-page">
      <PageHeader
        title="ویرایش کاربر"
        breadcrumbs={[
          { title: 'خانه', link: '/' },
          { title: 'مدیریت کاربران', link: '/admin/users' },
          { title: 'ویرایش کاربر', active: true }
        ]}
      />

      <div className="container mt-4">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">ویرایش اطلاعات کاربر</h2>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="loading-container">
                <i className="fas fa-spinner fa-spin"></i>
                <p>در حال بارگذاری اطلاعات کاربر...</p>
              </div>
            ) : error ? (
              <div className="error-container">
                <i className="fas fa-exclamation-triangle"></i>
                <p>{error}</p>
                <button
                  onClick={fetchUserData}
                  className="btn btn-primary"
                >
                  تلاش مجدد
                </button>
              </div>
            ) : user ? (
              <UserForm
                initialValues={user}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isEdit={true}
                isSaving={saving}
              />
            ) : (
              <div className="error-container">
                <i className="fas fa-user-slash"></i>
                <p>کاربر مورد نظر یافت نشد.</p>
                <button
                  onClick={() => navigate('/admin/users')}
                  className="btn btn-primary"
                >
                  بازگشت به لیست کاربران
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserEditPage;

