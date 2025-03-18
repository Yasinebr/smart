// src/components/vehicle/VehicleList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {getUserVehicles, getVehicles} from '../../api/vehicle';
import useAuth from '../../hooks/useAuth';
import { useNotification } from '../../contexts/NotificationContext';

const VehicleList = () => {
  const { currentUser } = useAuth();
  const { notify } = useNotification();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await getVehicles();
      const allVehicles = response.data.results;

      // اگر کاربر مدیر سیستم نیست، فقط خودروهای مربوط به کاربر نمایش داده شود
      if (currentUser && currentUser.role !== 'admin') {
        const userVehiclesResponse = await getUserVehicles(currentUser.id);
        const userVehicleIds = userVehiclesResponse.data.map(vehicle => vehicle.id);
        const filteredVehicles = allVehicles.filter(vehicle => userVehicleIds.includes(vehicle.id));
        setVehicles(filteredVehicles);
      } else {
        setVehicles(allVehicles);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setError('خطا در بارگذاری لیست خودروها');
      notify.error('خطا در بارگذاری لیست خودروها');
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="vehicle-list">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">لیست خودروها</h2>
          <div className="card-actions">
            <div className="search-box">
              <input
                type="text"
                placeholder="جستجو..."
                value={searchTerm}
                onChange={handleSearch}
                className="form-control"
              />
              <i className="fas fa-search"></i>
            </div>
            <Link to="/vehicles/create" className="btn btn-primary">
              <i className="fas fa-plus"></i> افزودن خودرو
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
              <button onClick={fetchVehicles} className="btn btn-primary">
                تلاش مجدد
              </button>
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="empty-container">
              <i className="fas fa-car"></i>
              <p>هیچ خودرویی یافت نشد.</p>
            </div>
          ) : (
            <div className="vehicle-grid">
              {filteredVehicles.map((vehicle) => (
                <div key={vehicle.id} className="vehicle-card">
                  <div className="vehicle-card-image">
                    <img
                      src={vehicle.vehicle_image || '/assets/images/car-placeholder.svg'}
                      alt={`${vehicle.make} ${vehicle.model}`}
                    />
                    {vehicle.is_verified && (
                      <div className="verified-badge" title="تایید شده">
                        <i className="fas fa-check-circle"></i>
                      </div>
                    )}
                  </div>
                  <div className="vehicle-card-content">
                    <h3 className="vehicle-card-title">{vehicle.make} {vehicle.model}</h3>
                    <div className="vehicle-card-details">
                      <div className="vehicle-card-detail">
                        <i className="fas fa-credit-card"></i>
                        <span>{vehicle.license_plate}</span>
                      </div>
                      {vehicle.year && (
                        <div className="vehicle-card-detail">
                          <i className="fas fa-calendar"></i>
                          <span>{vehicle.year}</span>
                        </div>
                      )}
                      {vehicle.color && (
                        <div className="vehicle-card-detail">
                          <i className="fas fa-palette"></i>
                          <span>{vehicle.color}</span>
                        </div>
                      )}
                      <div className="vehicle-card-detail">
                        <i className="fas fa-car"></i>
                        <span>{getVehicleTypeDisplay(vehicle.vehicle_type)}</span>
                      </div>
                    </div>
                    <div className="vehicle-card-actions">
                      <Link to={`/vehicles/${vehicle.id}`} className="btn btn-sm btn-info">
                        <i className="fas fa-eye"></i> مشاهده
                      </Link>
                      <Link to={`/vehicles/${vehicle.id}/edit`} className="btn btn-sm btn-warning">
                        <i className="fas fa-edit"></i> ویرایش
                      </Link>
                      <button className="btn btn-sm btn-danger">
                        <i className="fas fa-trash"></i> حذف
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// تبدیل نوع خودرو به نام فارسی
const getVehicleTypeDisplay = (type) => {
  const types = {
    sedan: 'سدان',
    suv: 'شاسی بلند',
    hatchback: 'هاچبک',
    pickup: 'وانت',
    van: 'ون',
    truck: 'کامیون',
    motorcycle: 'موتورسیکلت',
  };
  return types[type] || type;
};

export default VehicleList;