// src/components/report/ReportView.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFinancialReportDetails, regenerateFinancialReport } from '../../api/report';
import { formatDate, formatPrice } from '../../utils/formatter';
import { useNotification } from '../../contexts/NotificationContext';
import RevenueChart from '../dashboard/RevenueChart';
import OccupancyChart from '../dashboard/OccupancyChart';

const ReportView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useNotification();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    fetchReportDetails();
  }, [id]);

  const fetchReportDetails = async () => {
    try {
      setLoading(true);
      const response = await getFinancialReportDetails(id);
      setReport(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching report details:', error);
      setError('خطا در بارگذاری جزئیات گزارش');
      notify.error('خطا در بارگذاری جزئیات گزارش');
      setLoading(false);
    }
  };

  const handleRegenerateReport = async () => {
    try {
      setRegenerating(true);
      await regenerateFinancialReport(id, {});
      notify.success('درخواست تولید مجدد گزارش با موفقیت ارسال شد');

      // به‌روزرسانی وضعیت گزارش
      setReport(prev => ({
        ...prev,
        status: 'pending'
      }));

      setRegenerating(false);
    } catch (error) {
      console.error('Error regenerating report:', error);
      notify.error('خطا در تولید مجدد گزارش');
      setRegenerating(false);
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
        <button onClick={() => navigate('/admin/reports')} className="btn btn-primary">
          بازگشت به لیست گزارش‌ها
        </button>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="not-found-container">
        <i className="fas fa-search"></i>
        <p>گزارش مورد نظر یافت نشد.</p>
        <button onClick={() => navigate('/admin/reports')} className="btn btn-primary">
          بازگشت به لیست گزارش‌ها
        </button>
      </div>
    );
  }

  // تعیین نوع نمودار بر اساس نوع گزارش
  const renderCharts = () => {
    if (report.status !== 'completed') {
      return (
        <div className="pending-report">
          <i className="fas fa-spinner fa-pulse"></i>
          <p>گزارش در حال پردازش است...</p>
        </div>
      );
    }

    if (report.financial_report_type) {
      // گزارش مالی
      if (report.financial_report_type === 'revenue') {
        // داده‌های نمودار درآمد
        const revenueData = {
          labels: report.data?.revenue_by_period?.map(item => item.period) || [],
          values: report.data?.revenue_by_period?.map(item => item.revenue) || [],
        };

        return <RevenueChart data={revenueData} period={report.report_type} />;
      } else if (report.financial_report_type === 'profit_loss') {
        // داده‌های نمودار سود و زیان
        const profitLossData = {
          labels: report.data?.profit_loss_by_period?.map(item => item.period) || [],
          datasets: [
            {
              label: 'درآمد',
              data: report.data?.profit_loss_by_period?.map(item => item.revenue) || [],
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
            },
            {
              label: 'هزینه',
              data: report.data?.profit_loss_by_period?.map(item => item.expenses) || [],
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 1)',
            },
            {
              label: 'سود خالص',
              data: report.data?.profit_loss_by_period?.map(item => item.profit) || [],
              backgroundColor: 'rgba(153, 102, 255, 0.2)',
              borderColor: 'rgba(153, 102, 255, 1)',
            },
          ],
        };

        return <RevenueChart data={profitLossData} period={report.report_type} />;
      }
    } else if (report.parking_report_type) {
      // گزارش پارکینگ
      if (report.parking_report_type === 'occupancy') {
        // داده‌های نمودار اشغال
        const occupancyData = {
          labels: report.data?.occupancy_by_period?.map(item => item.period) || [],
          totalCapacity: report.data?.occupancy_by_period?.map(item => item.total_capacity) || [],
          occupancy: report.data?.occupancy_by_period?.map(item => item.occupied) || [],
        };

        return <OccupancyChart data={occupancyData} />;
      } else if (report.parking_report_type === 'traffic') {
        // داده‌های نمودار ترافیک
        const trafficData = {
          labels: report.data?.traffic_by_period?.map(item => item.period) || [],
          values: report.data?.traffic_by_period?.map(item => item.count) || [],
        };

        return <RevenueChart data={trafficData} period={report.report_type} />;
      }
    }

    return (
      <div className="no-chart-data">
        <i className="fas fa-chart-area"></i>
        <p>نمودار برای این نوع گزارش در دسترس نیست.</p>
      </div>
    );
  };

  return (
    <div className="report-view">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">مشاهده گزارش</h2>
          <div className="card-actions">
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/admin/reports')}
            >
              <i className="fas fa-arrow-right"></i> بازگشت به لیست
            </button>
          </div>
        </div>
        <div className="card-body">
          <div className="report-header">
            <div className="report-title">
              <h3>
                {report.financial_report_type ? (
                  `گزارش مالی ${getReportTypeDisplay(report.financial_report_type)}`
                ) : report.parking_report_type ? (
                  `گزارش پارکینگ ${getReportTypeDisplay(report.parking_report_type)}`
                ) : (
                  'گزارش'
                )}
                {' - '}
                {getReportTypeDisplay(report.report_type)}
              </h3>
              <p className="report-period">
                از {formatDate(report.start_date)} تا {formatDate(report.end_date)}
              </p>
            </div>
            <div className="report-status">
              <span className={`badge badge-${getStatusBadgeClass(report.status)}`}>
                {getStatusDisplay(report.status)}
              </span>
            </div>
          </div>

          {report.status === 'completed' && (
            <div className="report-summary">
              {report.financial_report_type && (
                <div className="summary-cards">
                  <div className="summary-card">
                    <div className="summary-title">درآمد کل</div>
                    <div className="summary-value">{formatPrice(report.total_revenue || 0)}</div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-title">هزینه کل</div>
                    <div className="summary-value">{formatPrice(report.total_expenses || 0)}</div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-title">سود خالص</div>
                    <div className="summary-value">{formatPrice(report.net_profit || 0)}</div>
                  </div>
                </div>
              )}

              {report.parking_report_type && report.data && (
                <div className="summary-cards">
                  <div className="summary-card">
                    <div className="summary-title">کل جلسات پارک</div>
                    <div className="summary-value">{report.data.total_sessions || 0}</div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-title">میانگین اشغال</div>
                    <div className="summary-value">{report.data.average_occupancy || 0}%</div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-title">درآمد کل</div>
                    <div className="summary-value">{formatPrice(report.data.total_revenue || 0)}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="report-charts">
            {renderCharts()}
          </div>

          {report.status === 'completed' && report.data && (
            <div className="report-details">
              <h3>جزئیات گزارش</h3>

              {report.financial_report_type === 'revenue' && (
                <div className="detail-section">
                  <h4>جزئیات درآمد</h4>
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>دوره</th>
                          <th>مبلغ</th>
                          <th>تعداد تراکنش</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.data.revenue_by_period?.map((item, index) => (
                          <tr key={index}>
                            <td>{item.period}</td>
                            <td>{formatPrice(item.revenue)}</td>
                            <td>{item.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {report.financial_report_type === 'profit_loss' && (
                <div className="detail-section">
                  <h4>جزئیات سود و زیان</h4>
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>دوره</th>
                          <th>درآمد</th>
                          <th>هزینه</th>
                          <th>سود خالص</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.data.profit_loss_by_period?.map((item, index) => (
                          <tr key={index}>
                            <td>{item.period}</td>
                            <td>{formatPrice(item.revenue)}</td>
                            <td>{formatPrice(item.expenses)}</td>
                            <td>{formatPrice(item.profit)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {report.parking_report_type === 'occupancy' && (
                <div className="detail-section">
                  <h4>جزئیات اشغال پارکینگ</h4>
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>دوره</th>
                          <th>ظرفیت کل</th>
                          <th>اشغال شده</th>
                          <th>درصد اشغال</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.data.occupancy_by_period?.map((item, index) => (
                          <tr key={index}>
                            <td>{item.period}</td>
                            <td>{item.total_capacity}</td>
                            <td>{item.occupied}</td>
                            <td>{((item.occupied / item.total_capacity) * 100).toFixed(2)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {report.parking_report_type === 'traffic' && (
                <div className="detail-section">
                  <h4>جزئیات ترافیک پارکینگ</h4>
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>دوره</th>
                          <th>تعداد ورود</th>
                          <th>تعداد خروج</th>
                          <th>مجموع</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.data.traffic_by_period?.map((item, index) => (
                          <tr key={index}>
                            <td>{item.period}</td>
                            <td>{item.entries}</td>
                            <td>{item.exits}</td>
                            <td>{item.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="report-actions">
            {report.status === 'completed' && (
              <>
                {report.file && (
                  <a
                    href={report.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-success"
                  >
                    <i className="fas fa-download"></i> دانلود گزارش
                  </a>
                )}
                <button
                  className="btn btn-warning mr-2"
                  onClick={handleRegenerateReport}
                  disabled={regenerating}
                >
                  {regenerating ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> در حال پردازش...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sync"></i> تولید مجدد گزارش
                    </>
                  )}
                </button>
                <button className="btn btn-secondary mr-2">
                  <i className="fas fa-print"></i> چاپ گزارش
                </button>
              </>
            )}

            {report.status === 'pending' && (
              <div className="alert alert-info">
                <i className="fas fa-spinner fa-spin"></i>
                گزارش در حال پردازش است. لطفاً صبر کنید...
              </div>
            )}

            {report.status === 'failed' && (
              <>
                <div className="alert alert-danger">
                  <i className="fas fa-exclamation-triangle"></i>
                  تولید گزارش با خطا مواجه شد.
                </div>
                <button
                  className="btn btn-warning"
                  onClick={handleRegenerateReport}
                  disabled={regenerating}
                >
                  {regenerating ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> در حال پردازش...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sync"></i> تلاش مجدد
                    </>
                  )}
                </button>
              </>
            )}
          </div>
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

export default ReportView;