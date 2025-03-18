// src/pages/dashboard/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../../components/dashboard/StatCard';
import RecentActivities from '../../components/dashboard/RecentActivities';
import RevenueChart from '../../components/dashboard/RevenueChart';
import OccupancyChart from '../../components/dashboard/OccupancyChart';
import ParkingMap from '../../components/dashboard/ParkingMap';
import { getParkingLots } from '../../api/parking';
import { getUsers } from '../../api/user';
import { getPayments } from '../../api/payment';
import { getParkingSessions } from '../../api/vehicle';
import { getFinancialReports } from '../../api/report';
import { formatPrice, formatNumber } from '../../utils/formatter';
import useAuth from '../../hooks/useAuth';
import { useNotification } from '../../contexts/NotificationContext';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const { notify } = useNotification();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalParkingLots: 0,
    totalUsers: 0,
    totalRevenue: 0,
    totalSessions: 0,
    totalReservations: 0,
    totalVehicles: 0,
    availableSpots: 0,
    occupiedSpots: 0,
  });
  const [revenueData, setRevenueData] = useState(null);
  const [occupancyData, setOccupancyData] = useState(null);
  const [trafficData, setTrafficData] = useState(null);
  const [parkingData, setParkingData] = useState(null);
  const [activities, setActivities] = useState([]);
  const [timeRange, setTimeRange] = useState('monthly');
  const [loadingCharts, setLoadingCharts] = useState(false);

  // نمونه‌ای از داده‌های فعالیت‌های اخیر
  const sampleActivities = [
    {
      type: 'parking',
      icon: 'fas fa-car',
      title: 'رزرو جدید',
      description: 'کاربر علی محمدی پارکینگ ولیعصر را رزرو کرد.',
      time: '۱۵ دقیقه پیش',
    },
    {
      type: 'payment',
      icon: 'fas fa-money-bill',
      title: 'پرداخت جدید',
      description: 'پرداخت جدید به مبلغ ۵۰،۰۰۰ تومان انجام شد.',
      time: '۳۰ دقیقه پیش',
    },
    {
      type: 'user',
      icon: 'fas fa-user',
      title: 'کاربر جدید',
      description: 'سارا احمدی در سیستم ثبت‌نام کرد.',
      time: '۱ ساعت پیش',
    },
    {
      type: 'vehicle',
      icon: 'fas fa-car-side',
      title: 'ثبت خودرو',
      description: 'خودرو جدید با پلاک ۲۳ ایران ۵۵۵ د ۷۷ ثبت شد.',
      time: '۳ ساعت پیش',
    },
    {
      type: 'report',
      icon: 'fas fa-chart-bar',
      title: 'گزارش جدید',
      description: 'گزارش مالی ماهانه تولید شد.',
      time: '۵ ساعت پیش',
    },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchChartData(timeRange);
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // دریافت تعداد پارکینگ‌ها
      const parkingLotsResponse = await getParkingLots();
      const parkingLots = parkingLotsResponse.data.results;
      const totalParkingLots = parkingLotsResponse.data.count;

      // دریافت تعداد کاربران
      const usersResponse = await getUsers();
      const totalUsers = usersResponse.data.count;

      // دریافت اطلاعات پرداخت‌ها
      const paymentsResponse = await getPayments();
      const payments = paymentsResponse.data.results;
      const totalRevenue = payments
        .filter(payment => payment.status === 'completed')
        .reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

      // دریافت جلسات پارک
      const sessionsResponse = await getParkingSessions();
      const sessions = sessionsResponse.data.results;
      const totalSessions = sessionsResponse.data.count;

      // محاسبه تعداد جاهای پارک آزاد و اشغال شده
      let availableSpots = 0;
      let occupiedSpots = 0;

      parkingLots.forEach(parkingLot => {
        availableSpots += parseInt(parkingLot.available_capacity);
        occupiedSpots += parkingLot.current_occupancy;
      });

      // دریافت آمار رزروها و خودروها (فرضی)
      const totalReservations = 45;
      const totalVehicles = 120;

      setStats({
        totalParkingLots,
        totalUsers,
        totalRevenue,
        totalSessions,
        totalReservations,
        totalVehicles,
        availableSpots,
        occupiedSpots,
      });

      // نمودارها
      fetchChartData(timeRange);

      // فعالیت‌های اخیر
      setActivities(sampleActivities);

      // اطلاعات پارکینگ برای نقشه
      if (parkingLots.length > 0) {
        const parkingZones = [
          {
            name: 'زون A',
            type: 'regular',
            total: 20,
            available: 8,
            slots: Array(20).fill().map((_, i) => ({
              number: `A${i + 1}`,
              status: i < 8 ? 'available' : i < 15 ? 'occupied' : i < 18 ? 'reserved' : 'unavailable',
            })),
          },
          {
            name: 'زون B',
            type: 'vip',
            total: 15,
            available: 5,
            slots: Array(15).fill().map((_, i) => ({
              number: `B${i + 1}`,
              status: i < 5 ? 'available' : i < 12 ? 'occupied' : i < 14 ? 'reserved' : 'unavailable',
            })),
          },
          {
            name: 'زون C',
            type: 'disabled',
            total: 5,
            available: 3,
            slots: Array(5).fill().map((_, i) => ({
              number: `C${i + 1}`,
              status: i < 3 ? 'available' : 'occupied',
            })),
          },
        ];

        setParkingData({
          name: parkingLots[0].name,
          address: parkingLots[0].address,
          zones: parkingZones,
        });
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      notify.error('خطا در بارگذاری اطلاعات داشبورد');
      setLoading(false);
    }
  };

  const fetchChartData = async (range) => {
    try {
      setLoadingCharts(true);

      // داده‌های نمودار درآمد (فرضی - در پروژه واقعی باید از API دریافت شود)
      let labels = [];
      let revenueValues = [];

      if (range === 'daily') {
        labels = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];
        revenueValues = [350000, 420000, 380000, 500000, 450000, 610000, 320000];
      } else if (range === 'weekly') {
        labels = ['هفته اول', 'هفته دوم', 'هفته سوم', 'هفته چهارم'];
        revenueValues = [1800000, 2200000, 1950000, 2400000];
      } else if (range === 'monthly') {
        labels = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
        revenueValues = [1200000, 1500000, 1800000, 2000000, 1900000, 2200000, 2400000, 2300000, 2100000, 2500000, 2800000, 3000000];
      } else if (range === 'yearly') {
        labels = ['1400', '1401', '1402', '1403', '1404'];
        revenueValues = [15000000, 20000000, 25000000, 30000000, 32000000];
      }

      setRevenueData({
        labels,
        values: revenueValues,
      });

      // داده‌های نمودار اشغال (فرضی)
      const occupancyLabels = range === 'daily'
        ? ['8:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00']
        : labels;

      const totalCapacity = Array(occupancyLabels.length).fill(100);
      const occupancy = range === 'daily'
        ? [25, 45, 75, 85, 70, 90, 50]
        : labels.map(() => Math.floor(Math.random() * 50) + 40); // 40-90

      setOccupancyData({
        labels: occupancyLabels,
        totalCapacity,
        occupancy,
      });

      // داده‌های نمودار ترافیک (فرضی)
      const trafficLabels = range === 'daily'
        ? ['8:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00']
        : labels;

      const entries = trafficLabels.map(() => Math.floor(Math.random() * 20) + 10); // 10-30
      const exits = trafficLabels.map(() => Math.floor(Math.random() * 20) + 5); // 5-25

      setTrafficData({
        labels: trafficLabels,
        entries,
        exits,
        totalEntries: entries.reduce((sum, val) => sum + val, 0),
        totalExits: exits.reduce((sum, val) => sum + val, 0),
      });

      setLoadingCharts(false);
    } catch (error) {
      console.error('Error fetching chart data:', error);
      notify.error('خطا در بارگذاری داده‌های نمودار');
      setLoadingCharts(false);
    }
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1 className="page-title">داشبورد مدیریت</h1>
        <div className="dashboard-actions">
          <button
            className="btn btn-outline-secondary"
            onClick={() => fetchDashboardData()}
          >
            <i className="fas fa-sync"></i> به‌روزرسانی
          </button>
          <Link to="/admin/reports/create" className="btn btn-primary">
            <i className="fas fa-chart-bar"></i> گزارش جدید
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <i className="fas fa-spinner fa-spin fa-3x"></i>
          <p>در حال بارگذاری داشبورد...</p>
        </div>
      ) : (
        <>
          <div className="stats-container">
            <StatCard
              title="کل پارکینگ‌ها"
              value={formatNumber(stats.totalParkingLots)}
              icon="fas fa-parking"
              color="primary"
            />
            <StatCard
              title="کاربران"
              value={formatNumber(stats.totalUsers)}
              icon="fas fa-users"
              color="success"
              change="۱۵٪"
              changeType="increase"
            />
            <StatCard
              title="درآمد کل"
              value={formatPrice(stats.totalRevenue)}
              icon="fas fa-money-bill-wave"
              color="info"
              change="۲۰٪"
              changeType="increase"
            />
            <StatCard
              title="جلسات پارک"
              value={formatNumber(stats.totalSessions)}
              icon="fas fa-car"
              color="warning"
              change="۵٪"
              changeType="increase"
            />
          </div>

          <div className="stats-container">
            <StatCard
              title="رزروهای فعال"
              value={formatNumber(stats.totalReservations)}
              icon="fas fa-calendar-check"
              color="success"
            />
            <StatCard
              title="خودروهای ثبت شده"
              value={formatNumber(stats.totalVehicles)}
              icon="fas fa-car-side"
              color="warning"
            />
            <StatCard
              title="جاهای پارک آزاد"
              value={formatNumber(stats.availableSpots)}
              icon="fas fa-check-circle"
              color="primary"
            />
            <StatCard
              title="جاهای پارک اشغال شده"
              value={formatNumber(stats.occupiedSpots)}
              icon="fas fa-ban"
              color="danger"
            />
          </div>

          <div className="charts-container">
            <div className="chart-filters">
              <h2>نمودارها و تحلیل‌ها</h2>
              <div className="btn-group">
                <button
                  className={`btn ${timeRange === 'daily' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleTimeRangeChange('daily')}
                >
                  روزانه
                </button>
                <button
                  className={`btn ${timeRange === 'weekly' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleTimeRangeChange('weekly')}
                >
                  هفتگی
                </button>
                <button
                  className={`btn ${timeRange === 'monthly' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleTimeRangeChange('monthly')}
                >
                  ماهانه
                </button>
                <button
                  className={`btn ${timeRange === 'yearly' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleTimeRangeChange('yearly')}
                >
                  سالانه
                </button>
              </div>
            </div>

            {loadingCharts ? (
              <div className="loading-container">
                <i className="fas fa-spinner fa-spin"></i>
                <p>در حال بارگذاری نمودارها...</p>
              </div>
            ) : (
              <>
                <div className="chart-row">
                  <div className="chart-col">
                    <div className="card">
                      <div className="card-header">
                        <h3 className="card-title">نمودار درآمد</h3>
                      </div>
                      <div className="card-body">
                        <RevenueChart data={revenueData} period={timeRange} />
                      </div>
                    </div>
                  </div>
                  <div className="chart-col">
                    <div className="card">
                      <div className="card-header">
                        <h3 className="card-title">نمودار اشغال پارکینگ</h3>
                      </div>
                      <div className="card-body">
                        <OccupancyChart data={occupancyData} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="chart-row">
                  <div className="chart-col">
                    <div className="card">
                      <div className="card-header">
                        <h3 className="card-title">آمار ورود و خروج</h3>
                      </div>
                      <div className="card-body">
                        {trafficData && (
                          <div className="traffic-stats">
                            <div className="traffic-summary">
                              <div className="traffic-item">
                                <div className="traffic-label">کل ورودی‌ها:</div>
                                <div className="traffic-value">{formatNumber(trafficData.totalEntries)}</div>
                              </div>
                              <div className="traffic-item">
                                <div className="traffic-label">کل خروجی‌ها:</div>
                                <div className="traffic-value">{formatNumber(trafficData.totalExits)}</div>
                              </div>
                            </div>
                            <div className="traffic-chart">
                              <div className="chart-container" style={{ height: '250px' }}>
                                <canvas id="trafficChart"></canvas>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="chart-col">
                    <RecentActivities activities={activities} />
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="parking-map-section">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">نقشه پارکینگ</h3>
                <div className="card-actions">
                  <select className="form-control parking-select">
                    <option value="1">پارکینگ مرکزی</option>
                    <option value="2">پارکینگ شمالی</option>
                    <option value="3">پارکینگ غربی</option>
                  </select>
                </div>
              </div>
              <div className="card-body">
                <ParkingMap parkingData={parkingData} />
              </div>
            </div>
          </div>

          <div className="quick-actions-section">
            <h2>دسترسی سریع</h2>
            <div className="quick-actions">
              <Link to="/admin/parking-lots/create" className="quick-action-card">
                <div className="quick-action-icon">
                  <i className="fas fa-plus-circle"></i>
                </div>
                <div className="quick-action-title">افزودن پارکینگ</div>
              </Link>
              <Link to="/admin/users/create" className="quick-action-card">
                <div className="quick-action-icon">
                  <i className="fas fa-user-plus"></i>
                </div>
                <div className="quick-action-title">افزودن کاربر</div>
              </Link>
              <Link to="/admin/reports/create" className="quick-action-card">
                <div className="quick-action-icon">
                  <i className="fas fa-chart-pie"></i>
                </div>
                <div className="quick-action-title">ایجاد گزارش</div>
              </Link>
              <Link to="/ai/plate-recognition" className="quick-action-card">
                <div className="quick-action-icon">
                  <i className="fas fa-camera"></i>
                </div>
                <div className="quick-action-title">تشخیص پلاک</div>
              </Link>
              <Link to="/settings" className="quick-action-card">
                <div className="quick-action-icon">
                  <i className="fas fa-cog"></i>
                </div>
                <div className="quick-action-title">تنظیمات</div>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;