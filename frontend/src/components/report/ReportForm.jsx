// src/components/report/ReportForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { createFinancialReport, createParkingReport } from '../../api/report';
import { getParkingLots } from '../../api/parking';
import { useNotification } from '../../contexts/NotificationContext';

// طرح اعتبارسنجی فرم گزارش
const ReportSchema = Yup.object().shape({
  report_type: Yup.string().required('انتخاب نوع گزارش الزامی است'),
  start_date: Yup.date().required('تاریخ شروع الزامی است'),
  end_date: Yup.date()
    .required('تاریخ پایان الزامی است')
    .min(Yup.ref('start_date'), 'تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد'),
  report_category: Yup.string().required('انتخاب دسته گزارش الزامی است'),
  parking_lot: Yup.number().when('report_category', {
    is: 'parking',
    then: Yup.number().required('انتخاب پارکینگ الزامی است'),
    otherwise: Yup.number().nullable(),
  }),
  financial_report_type: Yup.string().when('report_category', {
    is: 'financial',
    then: Yup.string().required('انتخاب نوع گزارش مالی الزامی است'),
    otherwise: Yup.string().nullable(),
  }),
  parking_report_type: Yup.string().when('report_category', {
    is: 'parking',
    then: Yup.string().required('انتخاب نوع گزارش پارکینگ الزامی است'),
    otherwise: Yup.string().nullable(),
  }),
});

const ReportForm = () => {
  const navigate = useNavigate();
  const { notify } = useNotification();
  const [parkingLots, setParkingLots] = useState([]);
  const [loading, setLoading] = useState(false);

  // دریافت لیست پارکینگ‌ها
  const fetchParkingLots = async () => {
    try {
      const response = await getParkingLots();
      setParkingLots(response.data.results);
    } catch (error) {
      console.error('Error fetching parking lots:', error);
      notify.error('خطا در بارگذاری لیست پارکینگ‌ها');
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setLoading(true);

      // بر اساس نوع گزارش، API مناسب را فراخوانی می‌کنیم
      if (values.report_category === 'financial') {
        const reportData = {
          report_type: values.report_type,
          start_date: values.start_date.toISOString().split('T')[0],
          end_date: values.end_date.toISOString().split('T')[0],
          financial_report_type: values.financial_report_type,
        };

        const response = await createFinancialReport(reportData);
        navigate(`/admin/reports/${response.data.id}`);

        notify.success('گزارش مالی با موفقیت ایجاد شد');
      } else if (values.report_category === 'parking') {
        const reportData = {
          report_type: values.report_type,
          start_date: values.start_date.toISOString().split('T')[0],
          end_date: values.end_date.toISOString().split('T')[0],
          parking_lot: values.parking_lot,
          parking_report_type: values.parking_report_type,
        };

        const response = await createParkingReport(reportData);
        navigate(`/admin/reports/${response.data.id}`);

        notify.success('گزارش پارکینگ با موفقیت ایجاد شد');
      }
    } catch (error) {
      console.error('Error creating report:', error);
      notify.error('خطا در ایجاد گزارش');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="report-form">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">ایجاد گزارش جدید</h2>
        </div>
        <div className="card-body">
          <Formik
            initialValues={{
              report_type: 'monthly',
              start_date: new Date(),
              end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)),
              report_category: 'financial',
              parking_lot: '',
              financial_report_type: 'revenue',
              parking_report_type: 'occupancy',
            }}
            validationSchema={ReportSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, values, setFieldValue }) => (
              <Form>
                <div className="form-group">
                  <label htmlFor="report_category">دسته گزارش</label>
                  <Field
                    as="select"
                    id="report_category"
                    name="report_category"
                    className="form-control"
                    onChange={(e) => {
                      const value = e.target.value;
                      setFieldValue('report_category', value);

                      // اگر دسته گزارش پارکینگ انتخاب شد، لیست پارکینگ‌ها را دریافت کنیم
                      if (value === 'parking') {
                        fetchParkingLots();
                      }
                    }}
                  >
                    <option value="financial">گزارش مالی</option>
                    <option value="parking">گزارش پارکینگ</option>
                  </Field>
                  <ErrorMessage name="report_category" component="div" className="invalid-feedback d-block" />
                </div>

                <div className="form-group">
                  <label htmlFor="report_type">نوع گزارش</label>
                  <Field
                    as="select"
                    id="report_type"
                    name="report_type"
                    className="form-control"
                  >
                    <option value="daily">روزانه</option>
                    <option value="weekly">هفتگی</option>
                    <option value="monthly">ماهانه</option>
                    <option value="custom">سفارشی</option>
                  </Field>
                  <ErrorMessage name="report_type" component="div" className="invalid-feedback d-block" />
                </div>

                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label htmlFor="start_date">تاریخ شروع</label>
                    <DatePicker
                      selected={values.start_date}
                      onChange={(date) => setFieldValue('start_date', date)}
                      className="form-control"
                      dateFormat="yyyy/MM/dd"
                    />
                    <ErrorMessage name="start_date" component="div" className="invalid-feedback d-block" />
                  </div>

                  <div className="form-group col-md-6">
                    <label htmlFor="end_date">تاریخ پایان</label>
                    <DatePicker
                      selected={values.end_date}
                      onChange={(date) => setFieldValue('end_date', date)}
                      className="form-control"
                      dateFormat="yyyy/MM/dd"
                      minDate={values.start_date}
                    />
                    <ErrorMessage name="end_date" component="div" className="invalid-feedback d-block" />
                  </div>
                </div>

                {values.report_category === 'financial' && (
                  <div className="form-group">
                    <label htmlFor="financial_report_type">نوع گزارش مالی</label>
                    <Field
                      as="select"
                      id="financial_report_type"
                      name="financial_report_type"
                      className="form-control"
                    >
                      <option value="revenue">درآمد</option>
                      <option value="expenses">هزینه‌ها</option>
                      <option value="profit_loss">سود و زیان</option>
                    </Field>
                    <ErrorMessage name="financial_report_type" component="div" className="invalid-feedback d-block" />
                  </div>
                )}

                {values.report_category === 'parking' && (
                  <>
                    <div className="form-group">
                      <label htmlFor="parking_lot">انتخاب پارکینگ</label>
                      <Field
                        as="select"
                        id="parking_lot"
                        name="parking_lot"
                        className="form-control"
                      >
                        <option value="">انتخاب پارکینگ...</option>
                        {parkingLots.map((parkingLot) => (
                          <option key={parkingLot.id} value={parkingLot.id}>
                            {parkingLot.name}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="parking_lot" component="div" className="invalid-feedback d-block" />
                    </div>

                    <div className="form-group">
                      <label htmlFor="parking_report_type">نوع گزارش پارکینگ</label>
                      <Field
                        as="select"
                        id="parking_report_type"
                        name="parking_report_type"
                        className="form-control"
                      >
                        <option value="occupancy">اشغال</option>
                        <option value="revenue">درآمد</option>
                        <option value="traffic">ترافیک</option>
                      </Field>
                      <ErrorMessage name="parking_report_type" component="div" className="invalid-feedback d-block" />
                    </div>
                  </>
                )}

                <div className="form-group mt-3">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting || loading}
                  >
                    {isSubmitting || loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i> در حال ایجاد گزارش...
                      </>
                    ) : (
                      'ایجاد گزارش'
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary mr-2"
                    onClick={() => navigate('/admin/reports')}
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

export default ReportForm;