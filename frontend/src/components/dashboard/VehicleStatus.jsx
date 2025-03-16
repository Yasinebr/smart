// src/components/dashboard/VehicleStatus.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Clock, MapPin, Plus, Info, CheckCircle } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

const VehicleStatus = ({
  vehicles = [],
  title = "وضعیت خودروها",
  viewAllLink = "/vehicles",
  loading = false
}) => {
  // وضعیت پارک خودرو
  const getVehicleStatus = (vehicle) => {
    if (vehicle.active_session) {
      return {
        status: 'parked',
        label: 'پارک شده',
        color: 'bg-green-100 text-green-800',
        icon: <CheckCircle className="h-3 w-3 mr-1" />
      };
    } else if (vehicle.upcoming_reservation) {
      return {
        status: 'reserved',
        label: 'رزرو شده',
        color: 'bg-blue-100 text-blue-800',
        icon: <Clock className="h-3 w-3 mr-1" />
      };
    } else {
      return {
        status: 'available',
        label: 'در دسترس',
        color: 'bg-gray-100 text-gray-800',
        icon: <Car className="h-3 w-3 mr-1" />
      };
    }
  };

  return (
    <Card
      title={title}
      icon={<Car className="h-6 w-6 text-blue-600" />}
      actions={
        <Link to={viewAllLink}>
          <Button variant="outline" size="sm">مشاهده همه</Button>
        </Link>
      }
    >
      {vehicles.length > 0 ? (
        <div className="space-y-4">
          {vehicles.map((vehicle) => {
            const status = getVehicleStatus(vehicle);
            return (
              <Link
                key={vehicle.id}
                to={`/vehicles/${vehicle.id}`}
                className="block border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center mb-2">
                      <h3 className="font-medium text-gray-900">{vehicle.license_plate}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color} mr-2`}>
                        {status.icon}
                        {status.label}
                      </span>
                    </div>

                    <div className="text-sm text-gray-500 mb-1">
                      {vehicle.make} {vehicle.model} {vehicle.year && `(${vehicle.year})`}
                    </div>

                    {vehicle.active_session && (
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center text-xs text-gray-500">
                          <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                          <span>{vehicle.active_session.parking_lot_name}</span>
                          {vehicle.active_session.spot_number && (
                            <span className="mr-1">- جایگاه {vehicle.active_session.spot_number}</span>
                          )}
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1 text-gray-400" />
                          <span>از {new Date(vehicle.active_session.entry_time).toLocaleTimeString('fa-IR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                          <span className="mr-1">({vehicle.active_session.duration})</span>
                        </div>
                      </div>
                    )}

                    {vehicle.upcoming_reservation && (
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center text-xs text-gray-500">
                          <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                          <span>{vehicle.upcoming_reservation.parking_name}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1 text-gray-400" />
                          <span>
                            {new Date(vehicle.upcoming_reservation.reservation_start).toLocaleDateString('fa-IR')} {' '}
                            {new Date(vehicle.upcoming_reservation.reservation_start).toLocaleTimeString('fa-IR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {vehicle.is_primary && (
                    <div className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md">
                      خودروی اصلی
                    </div>
                  )}
                </div>
              </Link>
            );
          })}

          <Link to="/vehicles/create" className="block border border-dashed rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex flex-col items-center justify-center text-center py-3">
              <div className="rounded-full bg-blue-100 p-2 mb-2">
                <Plus className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-blue-600">افزودن خودروی جدید</h3>
              <p className="text-sm text-gray-500 mt-1">ثبت خودروی دیگر در سیستم</p>
            </div>
          </Link>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Info className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p>شما هیچ خودرویی ثبت نکرده‌اید.</p>
          <Link to="/vehicles/create">
            <Button variant="primary" className="mt-4" size="sm">افزودن خودرو</Button>
          </Link>
        </div>
      )}
    </Card>
  );
};

export default VehicleStatus;