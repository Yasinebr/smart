// src/components/report/ReportList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFinancialReports, regenerateFinancialReport } from '../../api/report';
import { formatDate } from '../../utils/formatter';
import { useNotification } from '../../contexts/NotificationContext';

const ReportList = () => {
  const { notify } = useNotification();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await getFinancialReports();
      setReports(response.data.results);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('خطا در بارگذاری لیست گزارش‌ها');
      notify.error('خطا در بارگذاری لیست گزارش‌ها');
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleTypeFilterChange = (e) => {
    setTypeFilter(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleRegenerateReport = async (id) => {
    try {
      await regenerateFinancialReport(id, {});
      notify.success('درخواست تولید مجدد گزارش با موفقیت ارسال شد');

      // به‌روزرسانی وضعیت گزارش در لیست
      setReports(prevReports =>
        prevReports.map(report =>
          report.id === id ? { ...report, status: 'pending' } : report
        )
      );
    } catch (error) {
      console.error('Error regenerating report:', error);
      notify.error('خطا در تولید مجدد گزارش');
    }
  };

  // فیلتر بر اساس جستجو و فیلترها
  const filteredReports = reports.filter(report => {
    const matchesSearch =
      report.id.toString().includes(searchTerm) ||
      (report.financial_report_type && getReportTypeDisplay(report.financial_report_type).toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = typeFilter === 'all' || report.report_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="report-list">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">لیست گزارش‌ها</h2>
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
              className="form-control mr-2 type-filter"
              value={typeFilter}
              onChange={handleTypeFilterChange}
            >
              <option value="all">همه انواع</option>
              <option value="daily">روزانه</option>
              <option value="weekly">هفتگی</option>
              <option value="monthly">ماهانه</option>
              <option value="custom">سفارشی</option>
            </select>
            <select
              className="form-control mr-2 status-filter"
              value={statusFilter}
              onChange={handleStatusFilterChange}
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="pending">در حال پردازش</option>
              <option value="completed">تکمیل شده</option>
              <option value="failed">ناموفق</option>
            </select>
            <Link to="/admin/reports/create" className="btn btn-primary">
              <i className="fas fa-plus"></i> گزارش جدید
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
              <button onClick={fetchReports} className="btn btn-primary">
                تلاش مجدد
              </button>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="empty-container">
              <i className="fas fa-chart-bar"></i>
              <p>هیچ گزارشی یافت نشد.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>نوع گزارش</th>
                    <th>دسته گزارش</th>
                    <th>از تاریخ</th>
                    <th>تا تاریخ</th>
                    <th>تاریخ ایجاد</th>
                    <th>وضعیت</th>
                    <th>عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report, index) => (
                    <tr key={report.id}>
                      <td>{index + 1}</td>
                      <td>{getReportTypeDisplay(report.report_type)}</td>
                      <td>
                        {report.financial_report_type ? (
                          getReportTypeDisplay(report.financial_report_type)
                        ) : report.parking_report_type ? (
                          getReportTypeDisplay(report.parking_report_type)
                        ) : (
                          '---'
                        )}
                      </td>
                      <td>{formatDate(report.start_date)}</td>
                      <td>{formatDate(report.end_date)}</td>
                      <td>{formatDate(report.created_at)}</td>
                      <td>
                        <span className={`badge badge-${getStatusBadgeClass(report.status)}`}>
                          {getStatusDisplay(report.status)}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group">
                          <Link to={`/admin/reports/${report.id}`} className="btn btn-sm btn-info">
                            <i className="fas fa-eye"></i>
                          </Link>
                          {report.status === 'completed' && (
                            <>
                              <button
                                className="btn btn-sm btn-warning"
                                onClick={() => handleRegenerateReport(report.id)}
                              >
                                <i className="fas fa-sync"></i>
                              </button>
                              {report.file && (
                                <a
                                  href={report.file}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-sm btn-success"
                                >
                                  <i className="fas fa-download"></i>
                                </a>
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

// تعیین نمایش نوع گزارش
const getReportTypeDisplay = (type) => {
  switch (type) {
    case 'daily':
      return 'روزانه';
    case 'weekly':
      return 'هفتگی';
    case 'monthly':
      return 'ماهانه';
    case 'custom':
      return 'سفارشی';
    case 'revenue':
      return 'درآمد';
    case 'expenses':
      return 'هزینه‌ها';
    case 'profit_loss':
      return 'سود و زیان';
    case 'occupancy':
      return 'اشغال';
    case 'traffic':
      return 'ترافیک';
    default:
      return type;
  }
};

// تعیین کلاس رنگ بر اساس وضعیت گزارش
const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'completed':
      return 'success';
    case 'failed':
      return 'danger';
    default:
      return 'secondary';
  }
};

// ترجمه وضعیت‌های گزارش
const getStatusDisplay = (status) => {
  switch (status) {
    case 'pending':
      return 'در حال پردازش';
    case 'completed':
      return 'تکمیل شده';
    case 'failed':
      return 'ناموفق';
    default:
      return status;
  }
};

export default ReportList;
