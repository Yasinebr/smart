// src/components/user/ProfileForm.jsx
import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { getUserProfile, updateUser } from '../../api/auth';
import useAuth from '../../hooks/useAuth';
import { useNotification } from '../../contexts/NotificationContext';

// طرح اعتبارسنجی فرم پروفایل
const ProfileSchema = Yup.object().shape({
  first_name: Yup.string()
    .required('نام الزامی است')
    .max(150, 'نام نمی‌تواند بیشتر از ۱۵۰ کاراکتر باشد'),
  last_name: Yup.string()
    .required('نام خانوادگی الزامی است')
    .max(150, 'نام خانوادگی نمی‌تواند بیشتر از ۱۵۰ کاراکتر باشد'),
  phone_number: Yup.string()
    .max(15, 'شماره تلفن نمی‌تواند بیشتر از ۱۵ کاراکتر باشد'),
  current_password: Yup.string()
    .when('change_password', {
      is: true,
      then: Yup.string().required('رمز عبور فعلی الزامی است'),
    }),
  new_password: Yup.string()
    .when('change_password', {
      is: true,
      then: Yup.string()
        .required('رمز عبور جدید الزامی است')
        .min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد'),
    }),
  confirm_password: Yup.string()
    .when('new_password', {
      is: (val) => val && val.length > 0,
      then: Yup.string()
        .required('تکرار رمز عبور الزامی است')
        .oneOf([Yup.ref('new_password')], 'رمز عبور و تکرار آن باید یکسان باشند'),
    }),
  national_id: Yup.string()
    .max(20, 'کد ملی نمی‌تواند بیشتر از ۲۰ کاراکتر باشد'),
  date_of_birth: Yup.date()
    .nullable(),
  address: Yup.string(),
});

const ProfileForm = () => {
  const { currentUser } = useAuth();
  const { notify } = useNotification();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [initialValues, setInitialValues] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    change_password: false,
    current_password: '',
    new_password: '',
    confirm_password: '',
    national_id: '',
    date_of_birth: '',
    address: '',
  });

  useEffect(() => {
    // اگر اطلاعات کاربر موجود است، مقادیر اولیه را تنظیم می‌کنیم
    if (currentUser) {
      setInitialValues({
        first_name: currentUser.first_name || '',
        last_name: currentUser.last_name || '',
        phone_number: currentUser.phone_number || '',
        change_password: false,
        current_password: '',
        new_password: '',
        confirm_password: '',
        national_id: currentUser.national_id || '',
        date_of_birth: currentUser.date_of_birth || '',
        address: currentUser.address || '',
      });

      if (currentUser.profile_image) {
        setProfileImagePreview(currentUser.profile_image);
      }

      setLoading(false);
    } else {
      // اگر اطلاعات کاربر موجود نیست، آن را از سرور دریافت می‌کنیم
      fetchUserProfile();
    }
  }, [currentUser]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await getUserProfile();
      const userProfile = response.data;

      setInitialValues({
        first_name: userProfile.first_name || '',
        last_name: userProfile.last_name || '',
        phone_number: userProfile.phone_number || '',
        change_password: false,
        current_password: '',
        new_password: '',
        confirm_password: '',
        national_id: userProfile.national_id || '',
        date_of_birth: userProfile.date_of_birth || '',
        address: userProfile.address || '',
      });

      if (userProfile.profile_image) {
        setProfileImagePreview(userProfile.profile_image);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('خطا در بارگذاری اطلاعات پروفایل');
      notify.error('خطا در بارگذاری اطلاعات پروفایل');
      setLoading(false);
    }
  };

  const handleProfileImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileImage(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // ایجاد فرم‌دیتا برای ارسال فایل‌ها
      const formData = new FormData();

      // حذف فیلدهای اضافی
      const { change_password, current_password, new_password, confirm_password, ...userData } = values;

      // افزودن فیلدها به فرم‌دیتا
      Object.keys(userData).forEach(key => {
        formData.append(key, userData[key]);
      });

      // اگر تغییر رمز عبور درخواست شده، آن را به فرم‌دیتا اضافه می‌کنیم
      if (change_password) {
        formData.append('current_password', current_password);
        formData.append('password', new_password);
      }

      // افزودن تصویر پروفایل در صورت وجود
      if (profileImage) {
        formData.append('profile_image', profileImage);
      }

      // ارسال درخواست به‌روزرسانی پروفایل
      await updateUser(currentUser.id, formData);
      notify.success('پروفایل با موفقیت به‌روزرسانی شد');
    } catch (error) {
      console.error('Error updating profile:', error);
      notify.error(error.response?.data?.message || 'خطا در به‌روزرسانی پروفایل');
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
        <button onClick={fetchUserProfile} className="btn btn-primary">
          تلاش مجدد
        </button>
      </div>
    );
  }

  return (
    <div className="profile-form">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">ویرایش پروفایل</h2>
        </div>
        <div className="card-body">
          <Formik
            initialValues={initialValues}
            validationSchema={ProfileSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting, values, setFieldValue }) => (
              <Form>
                <div className="profile-image-section">
                  <div className="profile-image-container">
                    <img
                      src={profileImagePreview || '/assets/images/user-placeholder.png'}
                      alt="تصویر پروفایل"
                      className="profile-image"
                    />
                    <div className="profile-image-overlay">
                      <label htmlFor="profile_image" className="image-upload-label">
                        <i className="fas fa-camera"></i>
                        <span>تغییر تصویر</span>
                      </label>
                      <input
                        type="file"
                        id="profile_image"
                        name="profile_image"
                        className="image-upload-input"
                        onChange={handleProfileImageChange}
                        accept="image/*"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label htmlFor="first_name">نام</label>
                    <Field
                      type="text"
                      id="first_name"
                      name="first_name"
                      className="form-control"
                      placeholder="نام خود را وارد کنید"
                    />
                    <ErrorMessage name="first_name" component="div" className="invalid-feedback d-block" />
                  </div>

                  <div className="form-group col-md-6">
                    <label htmlFor="last_name">نام خانوادگی</label>
                    <Field
                      type="text"
                      id="last_name"
                      name="last_name"
                      className="form-control"
                      placeholder="نام خانوادگی خود را وارد کنید"
                    />
                    <ErrorMessage name="last_name" component="div" className="invalid-feedback d-block" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label htmlFor="phone_number">شماره تلفن</label>
                    <Field
                      type="text"
                      id="phone_number"
                      name="phone_number"
                      className="form-control"
                      placeholder="شماره تلفن خود را وارد کنید"
                    />
                    <ErrorMessage name="phone_number" component="div" className="invalid-feedback d-block" />
                  </div>

                  <div className="form-group col-md-6">
                    <label htmlFor="national_id">کد ملی</label>
                    <Field
                      type="text"
                      id="national_id"
                      name="national_id"
                      className="form-control"
                      placeholder="کد ملی خود را وارد کنید (اختیاری)"
                    />
                    <ErrorMessage name="national_id" component="div" className="invalid-feedback d-block" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label htmlFor="date_of_birth">تاریخ تولد</label>
                    <Field
                      type="date"
                      id="date_of_birth"
                      name="date_of_birth"
                      className="form-control"
                    />
                    <ErrorMessage name="date_of_birth" component="div" className="invalid-feedback d-block" />
                  </div>

                  <div className="form-group col-md-6">
                    <label htmlFor="email">ایمیل</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="form-control"
                      value={currentUser.email}
                      disabled
                    />
                    <small className="form-text text-muted">
                      ایمیل قابل تغییر نیست.
                    </small>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="address">آدرس</label>
                  <Field
                    as="textarea"
                    id="address"
                    name="address"
                    className="form-control"
                    placeholder="آدرس خود را وارد کنید (اختیاری)"
                    rows="3"
                  />
                  <ErrorMessage name="address" component="div" className="invalid-feedback d-block" />
                </div>

                <div className="form-group">
                  <div className="form-check">
                    <Field
                      type="checkbox"
                      id="change_password"
                      name="change_password"
                      className="form-check-input"
                    />
                    <label className="form-check-label" htmlFor="change_password">
                      تغییر رمز عبور
                    </label>
                  </div>
                </div>

                {values.change_password && (
                  <div className="password-change-section">
                    <div className="form-group">
                      <label htmlFor="current_password">رمز عبور فعلی</label>
                      <Field
                        type="password"
                        id="current_password"
                        name="current_password"
                        className="form-control"
                        placeholder="رمز عبور فعلی خود را وارد کنید"
                      />
                      <ErrorMessage name="current_password" component="div" className="invalid-feedback d-block" />
                    </div>

                    <div className="form-row">
                      <div className="form-group col-md-6">
                        <label htmlFor="new_password">رمز عبور جدید</label>
                        <Field
                          type="password"
                          id="new_password"
                          name="new_password"
                          className="form-control"
                          placeholder="رمز عبور جدید را وارد کنید"
                        />
                        <ErrorMessage name="new_password" component="div" className="invalid-feedback d-block" />
                      </div>

                      <div className="form-group col-md-6">
                        <label htmlFor="confirm_password">تکرار رمز عبور جدید</label>
                        <Field
                          type="password"
                          id="confirm_password"
                          name="confirm_password"
                          className="form-control"
                          placeholder="رمز عبور جدید را مجدداً وارد کنید"
                        />
                        <ErrorMessage name="confirm_password" component="div" className="invalid-feedback d-block" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i> در حال ذخیره...
                      </>
                    ) : (
                      'ذخیره تغییرات'
                    )}
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

export default ProfileForm;