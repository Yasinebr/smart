// src/pages/dashboard/ManagerDashboard.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Car, Calendar, CreditCard, MapPin, Clock, Info, Users, BarChart2, Download } from 'lucide-react';
import AuthContext from '../../contexts/AuthContext';
import NotificationContext from '../../contexts/NotificationContext';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import ParkingService from '../../api/parking';
import ReportService from '../../api/report';

const ManagerDashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const { error } = useContext(NotificationContext);

  const [loading, setLoading] = useState(true);
  const [parkingLots, setParkingLots] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [todayReservations, setTodayReservations] = useState([]);
  const [dailyRevenue, setDailyRevenue] = useState(0);
  const [occupancyRate, setOccupancyRate] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // دریافت پارکینگ‌های تحت مدیریت کاربر
        const parkingLotsRes = await ParkingService.getParkingLots({ manager: currentUser.id });
        const lots = parkingLotsRes.data.results || parkingLotsRes.data;
        setParkingLots(lots);

        if (lots.length === 0) {
          setLoading(false);
          return;
        }

        // جلسات فعال در همه پارکینگ‌های مدیر
        const lotIds = lots.map(lot => lot.id);
        const sessionsPromises = lotIds.map(id =>
          ParkingService.getParkingSessions({ parking_lot: id, status: 'active' })
        );

        // رزروهای امروز
        const today = new Date().toISOString().split('T')[0];
        const reservationsPromises = lotIds.map(id =>
          ParkingService.getReservations({
            parking: id,
            status: 'confirmed',
            reservation_start__date: today
          })
        );

        // دریافت همه داده‌ها به صورت موازی
        const responses = await Promise.all([
          ...sessionsPromises,
          ...reservationsPromises
        ]);

        // پردازش جلسات فعال
        const allSessions = responses.slice(0, lotIds.length)
          .flatMap(res => res.data.results || res.data);
        setActiveSessions(allSessions);

        // پردازش رزروهای امروز
        const allReservations = responses.slice(lotIds.length)
          .flatMap(res => res.data.results || res.data);
        setTodayReservations(allReservations);

        // محاسبه درآمد امروز (از جلسات پایان یافته امروز)
        const todaySessionsRes = await Promise.all(
          lotIds.map(id =>
            ParkingService.getParkingSessions({
              parking_lot: id,
              status: 'completed',
              exit_time__date: today
            })
          )
        );

        const todaySessions = todaySessionsRes
          .flatMap(res => res.data.results || res.data);

        const totalRevenue = todaySessions.reduce(
          (sum, session) => sum + (parseFloat(session.amount_due) || 0),
          0
        );
        setDailyRevenue(totalRevenue);

        // محاسبه نرخ اشغال
        const totalCapacity = lots.reduce((sum, lot) => sum + lot.total_capacity, 0);
        const totalOccupied = lots.reduce((sum, lot) => sum + lot.current_occupancy, 0);

        if (totalCapacity > 0) {
          setOccupancyRate((totalOccupied / totalCapacity) * 100);
        }

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        error('خطا در دریافت اطلاعات داشبورد');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser.id, error]);

  // دریافت گزارش درآمد
  const generateRevenueReport = async () => {
    try {
      const today = new Date();
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      const reportData = {
        report_type: 'monthly',
        financial_report_type: 'revenue',
        start_date: lastMonth.toISOString().split('T')[0],
        end_date: today.toISOString().split('T')[0],
        created_by: currentUser.id
      };

      const response = await ReportService.createFinancialReport(reportData);

      if (response.data && response.data.id) {
        window.open(`/reports/financial-reports/${response.data.id}`, '_blank');
      }
    } catch (err) {
      console.error('Error generating report:', err);
      error('خطا در ایجاد گزارش درآمد');
    }
  };

  // کارت‌های خلاصه آمار
  const statCards = [
    {
      title: 'پارکینگ‌های شما',
      value: parkingLots.length,
      icon: <MapPin className="h-8 w-8 text-blue-600" />,
      link: '/parkings',
      color: 'bg-blue-100 text-blue-800',
    },
    {
      title: 'جلسات فعال',
      value: activeSessions.length,
      icon: <Clock className="h-8 w-8 text-green-600" />,
      link: '/sessions',
      color: 'bg-green-100 text-green-800',
    },
    {
      title: 'رزروهای امروز',
      value: todayReservations.length,
      icon: <Calendar className="h-8 w-8 text-purple-600" />,
      link: '/reservations',
      color: 'bg-purple-100 text-purple-800',
    },
    {
      title: 'درآمد امروز',
      value: `${dailyRevenue.toLocaleString()} تومان`,
      icon: <CreditCard className="h-8 w-8 text-orange-600" />,
      link: '/reports',
      color: 'bg-orange-100 text-orange-800',
    },
  ];

  if (loading) {
    return <Loader fullScreen text="در حال بارگذاری داشبورد..." />;
  }

  // اگر هیچ پارکینگی تحت مدیریت کاربر نباشد
  if (parkingLots.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6">
        <PageHeader
          title={`خوش آمدید، ${currentUser.first_name}`}
          subtitle="داشبورد مدیریت پارکینگ"
        />

        <Card className="text-center py-8">
          <Info className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">هیچ پارکینگی تحت مدیریت شما نیست</h2>
          <p className="text-gray-600 mb-6">
            برای شروع مدیریت پارکینگ، با مدیر سیستم تماس بگیرید تا پارکینگی را به شما اختصاص دهد.
          </p>
          <Link to="/contact">
            <Button variant="primary">تماس با ما</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title={`خوش آمدید، ${currentUser.first_name}`}
        subtitle="داشبورد مدیریت پارکینگ"
        actions={
          <Button
            onClick={generateRevenueReport}
            variant="outline"
            icon={<Download className="h-5 w-5" />}
          >
            گزارش درآمد
          </Button>
        }
      />

      {/* کارت‌های آمار */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statCards.map((stat, index) => (
          <Link key={index} to={stat.link} className="block">
            <Card className="h-full transition-transform hover:shadow-md hover:-translate-y-1">
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${stat.color}`}>
                  {stat.icon}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-semibold">{stat.value}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* نمودار میزان اشغال */}
      <div className="mb-6">
        <Card
          title="میزان اشغال پارکینگ"
          icon={<BarChart2 className="h-6 w-6 text-blue-600" />}
        >
          <div className="h-8 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium"
              style={{ width: `${Math.min(occupancyRate, 100)}%` }}
            >
              {occupancyRate.toFixed(1)}%
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {parkingLots.map(lot => (
              <div key={lot.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">{lot.name}</h3>
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {(lot.occupancy_percentage || 0).toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600"
                    style={{ width: `${lot.occupancy_percentage || 0}%` }}
                  />
                </div>
                <div className="mt-2 text-sm text-gray-500 flex justify-between">
                  <span>{lot.current_occupancy} / {lot.total_capacity}</span>
                  <Link to={`/parkings/${lot.id}`} className="text-blue-600 hover:underline">مشاهده جزئیات</Link>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* جلسات فعال */}
        <Card
          title="جلسات فعال"
          icon={<Clock className="h-6 w-6 text-green-600" />}
          actions={
            <Link to="/sessions">
              <Button variant="outline" size="sm">مشاهده همه</Button>
            </Link>
          }
        >
          {activeSessions.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {activeSessions.slice(0, 5).map((session) => (
                <div key={session.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{session.vehicle_plate}</p>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{session.parking_lot_name}</span>
                        {session.spot_number && (
                          <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                            جایگاه {session.spot_number}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {new Date(session.entry_time).toLocaleTimeString('fa-IR')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(session.entry_time).toLocaleDateString('fa-IR')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Info className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p>در حال حاضر هیچ جلسه فعالی وجود ندارد.</p>
            </div>
          )}
        </Card>

        {/* رزروهای امروز */}
        <Card
          title="رزروهای امروز"
          icon={<Calendar className="h-6 w-6 text-purple-600" />}
          actions={
            <Link to="/reservations">
              <Button variant="outline" size="sm">مشاهده همه</Button>
            </Link>
          }
        >
          {todayReservations.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {todayReservations.slice(0, 5).map((reservation) => (
                <div key={reservation.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <p className="font-medium">{reservation.vehicle_plate}</p>
                        <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          {reservation.status_display}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{reservation.user_email}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {new Date(reservation.reservation_start).toLocaleTimeString('fa-IR')}
                        {' - '}
                        {new Date(reservation.reservation_end).toLocaleTimeString('fa-IR')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Info className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p>امروز هیچ رزروی ثبت نشده است.</p>
            </div>
          )}
        </Card>
      </div>

      {/* اقدامات سریع */}
      <div className="mt-6">
        <Card title="اقدامات سریع" icon={<Info className="h-6 w-6 text-green-600" />}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link to="/plate-recognition">
              <Button variant="primary" icon={<Car className="h-5 w-5" />} fullWidth>
                تشخیص پلاک
              </Button>
            </Link>
            <Link to="/entry-exit">
              <Button variant="outline" icon={<Clock className="h-5 w-5" />} fullWidth>
                ثبت ورود و خروج
              </Button>
            </Link>
            <Link to="/reports">
              <Button variant="outline" icon={<BarChart2 className="h-5 w-5" />} fullWidth>
                گزارش‌ها
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ManagerDashboard;
