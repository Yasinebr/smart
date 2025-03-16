// src/components/dashboard/UpcomingReservations.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Car, Info, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

const UpcomingReservations = ({
  reservations = [],
  title = "رزروهای آینده",
  viewAllLink = "/reservations",
  loading = false,
  onCancelReservation = () => {},
  showStatus = true
}) => {

  // تبدیل زمان به فرمت مناسب
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);

    // اگر امروز است
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return `امروز ${date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`;
    }

    // اگر فردا است
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) {
      return `فردا ${date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`;
    }

    // در غیر این صورت
    return `${date.toLocaleDateString('fa-IR')} ${date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`;
  };

  // نمایش وضعیت رزرو
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <AlertCircle className="h-3 w-3 mr-1" />
          در انتظار تأیید
        </span>;
      case 'confirmed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          تأیید شده
        </span>;
      case 'cancelled':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="h-3 w-3 mr-1" />
          لغو شده
        </span>;
      case 'completed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          تکمیل شده
        </span>;
      default:
        return null;
    }
  };

  // محاسبه مدت زمان رزرو
  const calculateDuration = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate - startDate;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.round((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHrs === 0) {
      return `${diffMins} دقیقه`;
    } else if (diffMins === 0) {
      return `${diffHrs} ساعت`;
    } else {
      return `${diffHrs} ساعت و ${diffMins} دقیقه`;
    }
  };

  // لغو رزرو
  const handleCancelReservation = (id) => {
    if (window.confirm('آیا از لغو این رزرو اطمینان دارید؟')) {
      onCancelReservation(id);
    }
  };

  return (
    <Card
      title={title}
      icon={<Calendar className="h-6 w-6 text-purple-600" />}
      actions={
        <Link to={viewAllLink}>
          <Button variant="outline" size="sm">مشاهده همه</Button>
        </Link>
      }
    >
      {reservations.length > 0 ? (
        <div className="divide-y divide-gray-200">
          {reservations.map((reservation) => (
            <div key={reservation.id} className="py-4 first:pt-0 last:pb-0">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center mb-1">
                    <h3 className="font-medium text-gray-900">{reservation.parking_name}</h3>
                    {showStatus && (
                      <div className="mr-2">
                        {getStatusBadge(reservation.status)}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <Car className="h-4 w-4 mr-1 text-gray-400" />
                    <span>{reservation.vehicle_plate}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                    <span className="truncate max-w-xs">{reservation.spot_number ? `جایگاه ${reservation.spot_number}` : 'بدون جایگاه مشخص'}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1 text-gray-400" />
                    <span>{calculateDuration(reservation.reservation_start, reservation.reservation_end)}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-medium text-blue-600 mb-1">
                    {formatDate(reservation.reservation_start)}
                  </div>
                  <div className="text-sm text-gray-500">
                    تا {new Date(reservation.reservation_end).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                  </div>

                  {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
                    <button
                      onClick={() => handleCancelReservation(reservation.id)}
                      className="mt-2 text-xs text-red-600 hover:text-red-800"
                    >
                      لغو رزرو
                    </button>
                  )}
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
  );
};

export default UpcomingReservations;