// src/components/user/UserForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { createUser, getUserDetails, updateUser } from '../../api/user';
import { USER_ROLE_DISPLAY } from '../../utils/constants';
import { useNotification } from '../../contexts/NotificationContext';

// طرح اعتبارسنجی فرم کاربر
const UserSchema = Yup.object().shape({
  email: Yup.string()
    .email('ایمیل وارد شده معتبر نیست')
    .required('ایمیل الزامی است'),
  first_name: Yup.string()
    .required('نام الزامی است')
    .max(150, 'نام نمی‌تواند بیشتر از ۱۵۰ کاراکتر باشد'),
  last_name: Yup.string()
    .required('نام خانوادگی الزامی است')
    .max(150, 'نام خانوادگی نمی‌تواند بیشتر از ۱۵۰ کاراکتر باشد'),
  phone_number: Yup.string()
    .max(15, 'شماره تلفن نمی‌تواند بیشتر از ۱۵ کاراکتر باشد'),
  role: Yup.string()
    .required('نقش کاربر الزامی است'),
  password: Yup.string()
    .when('_isNew', {
      is: true,
      then: Yup.string().required('رمز عبور الزامی است').min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد'),
      otherwise: Yup.string().min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد'),
    }),
  confirm_password: Yup.string()
    .when('password', {
      is: (val) => val && val.length > 0,
      then: Yup.string()
        .required('تکرار رمز عبور الزامی است')
        .oneOf([Yup.ref('password')], 'رمز عبور و تکرار آن باید یکسان باشند'),
    }),
  national_id: Yup.string()
    .max(20, 'کد ملی نمی‌تواند بیشتر از ۲۰ کاراکتر باشد'),
  date_of_birth: Yup.date()
    .nullable(),
  address: Yup.string(),
});

const UserForm = ({ isEdit = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { notify } = useNotification();
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [initialValues, setInitialValues] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    role: 'customer',
    password: '',
    confirm_password: '',
    national_id: '',
    date_of_birth: '',
    address: '',
    _isNew: !isEdit,
  });

  useEffect(() => {
    // در حالت ویرایش، اطلاعات کاربر را دریافت می‌کنیم
    if (isEdit && id) {
      fetchUserDetails();
    }
  }, [isEdit, id]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await getUserDetails(id);
      const user = response.data;

      setInitialValues({
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone_number: user.phone_number || '',
        role: user.role,
        password: '',
        confirm_password: '',
        national_id: user.national_id || '',
        date_of_birth: user.date_of_birth || '',
        address: user.address || '',
        _isNew: false,
      });

      if (user.profile_image) {
        setProfileImagePreview(user.profile_image);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError('خطا در بارگذاری اطلاعات کاربر');
      notify.error('خطا در بارگذاری اطلاعات کاربر');
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

      // حذف فیلدهای داخلی و اضافی
      const { confirm_password, _isNew, ...userData } = values;

      // اگر رمز عبور تغییر نکرده، آن را از داده‌ها حذف می‌کنیم
      if (!values.password && !_isNew) {
        delete userData.password;
      }

      // افزودن فیلدها به فرم‌دیتا
      Object.keys(userData).forEach(key => {
        formData.append(key, userData[key]);
      });

      // افزودن تصویر پروفایل در صورت وجود
      if (profileImage) {
        formData.append('profile_image', profileImage);
      }

      if (isEdit) {
        // ارسال درخواست به‌روزرسانی کاربر
        await updateUser(id, formData);
        notify.success('کاربر با موفقیت به‌روزرسانی شد');
      } else {
        // ارسال درخواست ایجاد کاربر جدید
        await createUser(formData);
        notify.success('کاربر با موفقیت ایجاد شد');
      }

      navigate('/admin/users');
    } catch (error) {
      console.error('Error saving user:', error);
      notify.error(error.response?.data?.message || 'خطا در ذخیره اطلاعات کاربر');
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
        <button onClick={() => navigate('/admin/users')} className="btn btn-primary">
          بازگشت به لیست کاربران
        </button>
      </div>
    );
  }

  return (
    <div className="user-form">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            {isEdit ? 'ویرایش کاربر' : 'افزودن کاربر جدید'}
          </h2>
        </div>
        <div className="card-body">
          <Formik
            initialValues={initialValues}
            validationSchema={UserSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting, values }) => (
              <Form>
                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label htmlFor="first_name">نام</label>
                    <Field
                      type="text"
                      id="first_name"
                      name="first_name"
                      className="form-control"
                      placeholder="نام کاربر را وارد کنید"
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
                      placeholder="نام خانوادگی کاربر را وارد کنید"
                    />
                    <ErrorMessage name="last_name" component="div" className="invalid-feedback d-block" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label htmlFor="email">ایمیل</label>
                    <Field
                      type="email"
                      id="email"
                      name="email"
                      className="form-control"
                      placeholder="ایمیل کاربر را وارد کنید"
                      disabled={isEdit} // در حالت ویرایش، ایمیل نباید تغییر کند
                    />
                    <ErrorMessage name="email" component="div" className="invalid-feedback d-block" />
                  </div>

                  <div className="form-group col-md-6">
                    <label htmlFor="phone_number">شماره تلفن</label>
                    <Field
                      type="text"
                      id="phone_number"
                      name="phone_number"
                      className="form-control"
                      placeholder="شماره تلفن کاربر را وارد کنید"
                    />
                    <ErrorMessage name="phone_number" component="div" className="invalid-feedback d-block" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label htmlFor="role">نقش کاربر</label>
                    <Field
                      as="select"
                      id="role"
                      name="role"
                      className="form-control"
                    >
                      {Object.entries(USER_ROLE_DISPLAY).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage name="role" component="div" className="invalid-feedback d-block" />
                  </div>

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
                </div>

                <div className="form-group">
                  <label htmlFor="national_id">کد ملی</label>
                  <Field
                    type="text"
                    id="national_id"
                    name="national_id"
                    className="form-control"
                    placeholder="کد ملی کاربر را وارد کنید (اختیاری)"
                  />
                  <ErrorMessage name="national_id" component="div" className="invalid-feedback d-block" />
                </div>

                <div className="form-group">
                  <label htmlFor="address">آدرس</label>
                  <Field
                    as="textarea"
                    id="address"
                    name="address"
                    className="form-control"
                    placeholder="آدرس کاربر را وارد کنید (اختیاری)"
                    rows="3"
                  />
                  <ErrorMessage name="address" component="div" className="invalid-feedback d-block" />
                </div>

                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label htmlFor="password">{isEdit ? 'رمز عبور جدید (در صورت تغییر)' : 'رمز عبور'}</label>
                    <Field
                      type="password"
                      id="password"
                      name="password"
                      className="form-control"
                      placeholder={isEdit ? 'رمز عبور جدید را وارد کنید (اختیاری)' : 'رمز عبور را وارد کنید'}
                    />
                    <ErrorMessage name="password" component="div" className="invalid-feedback d-block" />
                  </div>

                  <div className="form-group col-md-6">
                    <label htmlFor="confirm_password">تکرار رمز عبور</label>
                    <Field
                      type="password"
                      id="confirm_password"
                      name="confirm_password"
                      className="form-control"
                      placeholder="رمز عبور را مجدداً وارد کنید"
                      disabled={!values.password}
                    />
                    <ErrorMessage name="confirm_password" component="div" className="invalid-feedback d-block" />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="profile_image">تصویر پروفایل</label>
                  <div className="custom-file">
                    <input
                      type="file"
                      id="profile_image"
                      name="profile_image"
                      className="custom-file-input"
                      onChange={handleProfileImageChange}
                      accept="image/*"
                    />
                    <label className="custom-file-label" htmlFor="profile_image">
                      {profileImage ? profileImage.name : 'انتخاب فایل...'}
                    </label>
                  </div>
                  <small className="form-text text-muted">
                    تصویر پروفایل کاربر (اختیاری)
                  </small>
                  {profileImagePreview && (
                    <div className="image-preview mt-2">
                      <img src={profileImagePreview} alt="پیش‌نمایش تصویر پروفایل" className="img-thumbnail" style={{ maxWidth: '200px' }} />
                    </div>
                  )}
                </div>

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
                    ) : isEdit ? (
                      'به‌روزرسانی کاربر'
                    ) : (
                      'ایجاد کاربر'
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary mr-2"
                    onClick={() => navigate('/admin/users')}
                  >
                    انصراف
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

export default UserForm;