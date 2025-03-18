// src/pages/user/UserCreatePage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { createUser } from '../../api/user';
import { useNotification } from '../../contexts/NotificationContext';
import PageHeader from '../../components/common/PageHeader';

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
    .matches(/^[0-9]{11}$/, 'شماره تلفن باید ۱۱ رقم باشد'),
  role: Yup.string()
    .required('نقش کاربر الزامی است'),
  password: Yup.string()
    .min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد')
    .required('رمز عبور الزامی است'),
  confirm_password: Yup.string()
    .oneOf([Yup.ref('password'), null], 'رمزهای عبور مطابقت ندارند')
    .required('تکرار رمز عبور الزامی است'),
  national_id: Yup.string()
    .max(20, 'کد ملی نمی‌تواند بیشتر از ۲۰ کاراکتر باشد'),
  date_of_birth: Yup.date()
    .nullable(),
  address: Yup.string()
    .nullable(),
});

const UserCreatePage = () => {
  const navigate = useNavigate();
  const { notify } = useNotification();
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  const initialValues = {
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
      setLoading(true);

      // ایجاد آبجکت FormData برای ارسال فایل
      const formData = new FormData();

      // افزودن فیلدهای فرم به FormData
      Object.keys(values).forEach(key => {
        if (key !== 'confirm_password' && values[key] !== null && values[key] !== '') {
          formData.append(key, values[key]);
        }
      });

      // افزودن تصویر پروفایل
      if (profileImage) {
        formData.append('profile_image', profileImage);
      }

      // ارسال درخواست به API
      await createUser(formData);

      notify.success('کاربر با موفقیت ایجاد شد');
      navigate('/admin/users');
    } catch (error) {
      console.error('Error creating user:', error);
      notify.error(error.response?.data?.message || 'خطا در ایجاد کاربر');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="user-create-page">
      <PageHeader
        title="افزودن کاربر جدید"
        breadcrumbs={[
          { title: 'داشبورد', to: '/admin/dashboard' },
          { title: 'کاربران', to: '/admin/users' },
          { title: 'افزودن کاربر جدید', to: '/admin/users/create' },
        ]}
      />

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">اطلاعات کاربر جدید</h2>
        </div>
        <div className="card-body">
          <Formik
            initialValues={initialValues}
            validationSchema={UserSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form>
                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label htmlFor="first_name">نام</label>
                    <Field
                      type="text"
                      id="first_name"
                      name="first_name"
                      className={`form-control ${errors.first_name && touched.first_name ? 'is-invalid' : ''}`}
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
                      className={`form-control ${errors.last_name && touched.last_name ? 'is-invalid' : ''}`}
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
                      className={`form-control ${errors.email && touched.email ? 'is-invalid' : ''}`}
                      placeholder="ایمیل کاربر را وارد کنید"
                    />
                    <ErrorMessage name="email" component="div" className="invalid-feedback d-block" />
                  </div>

                  <div className="form-group col-md-6">
                    <label htmlFor="phone_number">شماره تلفن</label>
                    <Field
                      type="text"
                      id="phone_number"
                      name="phone_number"
                      className={`form-control ${errors.phone_number && touched.phone_number ? 'is-invalid' : ''}`}
                      placeholder="شماره تلفن کاربر را وارد کنید"
                    />
                    <ErrorMessage name="phone_number" component="div" className="invalid-feedback d-block" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label htmlFor="password">رمز عبور</label>
                    <Field
                      type="password"
                      id="password"
                      name="password"
                      className={`form-control ${errors.password && touched.password ? 'is-invalid' : ''}`}
                      placeholder="رمز عبور را وارد کنید"
                    />
                    <ErrorMessage name="password" component="div" className="invalid-feedback d-block" />
                  </div>

                  <div className="form-group col-md-6">
                    <label htmlFor="confirm_password">تکرار رمز عبور</label>
                    <Field
                      type="password"
                      id="confirm_password"
                      name="confirm_password"
                      className={`form-control ${errors.confirm_password && touched.confirm_password ? 'is-invalid' : ''}`}
                      placeholder="رمز عبور را مجدداً وارد کنید"
                    />
                    <ErrorMessage name="confirm_password" component="div" className="invalid-feedback d-block" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label htmlFor="role">نقش کاربر</label>
                    <Field
                      as="select"
                      id="role"
                      name="role"
                      className={`form-control ${errors.role && touched.role ? 'is-invalid' : ''}`}
                    >
                      <option value="admin">مدیر سیستم</option>
                      <option value="parking_manager">مدیر پارکینگ</option>
                      <option value="customer">مشتری</option>
                    </Field>
                    <ErrorMessage name="role" component="div" className="invalid-feedback d-block" />
                  </div>

                  <div className="form-group col-md-6">
                    <label htmlFor="national_id">کد ملی</label>
                    <Field
                      type="text"
                      id="national_id"
                      name="national_id"
                      className={`form-control ${errors.national_id && touched.national_id ? 'is-invalid' : ''}`}
                      placeholder="کد ملی کاربر را وارد کنید"
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
                      className={`form-control ${errors.date_of_birth && touched.date_of_birth ? 'is-invalid' : ''}`}
                    />
                    <ErrorMessage name="date_of_birth" component="div" className="invalid-feedback d-block" />
                  </div>

                  <div className="form-group col-md-6">
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
                    {profileImagePreview && (
                      <div className="image-preview mt-2">
                        <img src={profileImagePreview} alt="پیش‌نمایش تصویر پروفایل" className="img-thumbnail" style={{ maxHeight: '150px' }} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="address">آدرس</label>
                  <Field
                    as="textarea"
                    id="address"
                    name="address"
                    className={`form-control ${errors.address && touched.address ? 'is-invalid' : ''}`}
                    placeholder="آدرس کاربر را وارد کنید"
                    rows="3"
                  />
                  <ErrorMessage name="address" component="div" className="invalid-feedback d-block" />
                </div>

                <div className="form-group">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting || loading}
                  >
                    {isSubmitting || loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i> در حال ذخیره...
                      </>
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

export default UserCreatePage;
