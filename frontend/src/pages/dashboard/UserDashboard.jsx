// src/pages/dashboard/UserDashboard.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Car, Calendar, CreditCard, MapPin, Clock, Info } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import VehicleService from '../../api/vehicle';
import ParkingService from '../../api/parking';
import PaymentService from '../../api/payment';

const UserDashboard = () => {
  const { currentUser = {} } = useContext(AuthContext);
  const { error } = useContext(useNotification);

  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // دریافت داده‌های مختلف به صورت موازی
        const [vehiclesRes, sessionsRes, reservationsRes, paymentsRes] = await Promise.all([
          VehicleService.getUserVehicles(currentUser?.id),
          ParkingService.getParkingSessions({ status: 'active', user: currentUser?.id }),
          ParkingService.getReservations({ user: currentUser?.id, status: 'confirmed' }),
          PaymentService.getPayments({ user: currentUser?.id, limit: 5 })
        ]);

        setVehicles(vehiclesRes.data.results || vehiclesRes.data);
        setActiveSessions(sessionsRes.data.results || sessionsRes.data);
        setReservations(reservationsRes.data.results || reservationsRes.data);
        setRecentPayments(paymentsRes.data.results || paymentsRes.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        error('خطا در دریافت اطلاعات داشبورد');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser?.id, error]);

  // کارت‌های خلاصه آمار
  const statCards = [
    {
      title: 'خودروهای شما',
      value: vehicles.length,
      icon: <Car className="h-8 w-8 text-blue-600" />,
      link: '/vehicles',
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
      title: 'رزروهای آینده',
      value: reservations.length,
      icon: <Calendar className="h-8 w-8 text-purple-600" />,
      link: '/reservations',
      color: 'bg-purple-100 text-purple-800',
    },
    {
      title: 'پرداخت‌های اخیر',
      value: recentPayments.length,
      icon: <CreditCard className="h-8 w-8 text-orange-600" />,
      link: '/payments',
      color: 'bg-orange-100 text-orange-800',
    },
  ];

  if (loading) {
    return <Loader fullScreen text="در حال بارگذاری داشبورد..." />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title={`خوش آمدید، ${currentUser?.first_name}`}
        subtitle="داشبورد مدیریت خودرو و پارکینگ"
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* جلسات فعال پارکینگ */}
        <Card
          title="جلسات فعال پارکینگ"
          icon={<Clock className="h-6 w-6 text-blue-600" />}
          actions={
            <Link to="/sessions">
              <Button variant="outline" size="sm">مشاهده همه</Button>
            </Link>
          }
        >
          {activeSessions.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {activeSessions.slice(0, 3).map((session) => (
                <div key={session.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{session.vehicle_plate}</p>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{session.parking_lot_name}</span>
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
              <p>شما در حال حاضر جلسه پارک فعالی ندارید.</p>
            </div>
          )}
        </Card>

        {/* رزروهای آینده */}
        <Card
          title="رزروهای آینده"
          icon={<Calendar className="h-6 w-6 text-purple-600" />}
          actions={
            <Link to="/reservations">
              <Button variant="outline" size="sm">مشاهده همه</Button>
            </Link>
          }
        >
          {reservations.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {reservations.slice(0, 3).map((reservation) => (
                <div key={reservation.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{reservation.parking_name}</p>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Car className="h-4 w-4 mr-1" />
                        <span>{reservation.vehicle_plate}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {new Date(reservation.reservation_start).toLocaleDateString('fa-IR')}
                      </div>
                      <div className="text-sm text-gray-500">
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
              <p>شما رزرو آینده‌ای ندارید.</p>
              <Link to="/reservations/create">
                <Button variant="primary" className="mt-4" size="sm">رزرو جدید</Button>
              </Link>
            </div>
          )}
        </Card>
      </div>

      {/* اقدامات سریع */}
      <div className="mt-6">
        <Card title="اقدامات سریع" icon={<Info className="h-6 w-6 text-green-600" />}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link to="/reservations/create">
              <Button variant="primary" icon={<Calendar className="h-5 w-5" />} fullWidth>
                رزرو جدید
              </Button>
            </Link>
            <Link to="/vehicles/create">
              <Button variant="outline" icon={<Car className="h-5 w-5" />} fullWidth>
                افزودن خودرو
              </Button>
            </Link>
            <Link to="/payments">
              <Button variant="outline" icon={<CreditCard className="h-5 w-5" />} fullWidth>
                مشاهده پرداخت‌ها
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboard;
