// src/components/dashboard/ParkingMap.jsx
import React, { useState, useEffect } from 'react';

const ParkingMap = ({ parkingData }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // شبیه‌سازی بارگذاری داده‌ها
    const loadParkingData = async () => {
      try {
        // در اینجا می‌توان درخواست API برای دریافت داده‌های پارکینگ را ارسال کرد
        setTimeout(() => {
          setLoading(false);
        }, 1500);
      } catch (error) {
        setError('خطا در بارگذاری نقشه پارکینگ');
        setLoading(false);
      }
    };

    if (!parkingData) {
      loadParkingData();
    } else {
      setLoading(false);
    }
  }, [parkingData]);

  if (loading) {
    return (
      <div className="parking-map-loading">
        <i className="fas fa-spinner fa-spin"></i>
        <p>در حال بارگذاری نقشه پارکینگ...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="parking-map-error">
        <i className="fas fa-exclamation-triangle"></i>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="parking-map-container">
      <div className="parking-map-header">
        <h3>نقشه پارکینگ</h3>
        <div className="legend">
          <div className="legend-item">
            <div className="legend-color available"></div>
            <span>آزاد</span>
          </div>
          <div className="legend-item">
            <div className="legend-color occupied"></div>
            <span>اشغال شده</span>
          </div>
          <div className="legend-item">
            <div className="legend-color reserved"></div>
            <span>رزرو شده</span>
          </div>
          <div className="legend-item">
            <div className="legend-color unavailable"></div>
            <span>غیرقابل استفاده</span>
          </div>
        </div>
      </div>
      <div className="parking-map">
        {/* نمایش پارکینگ به صورت گرافیکی */}
        <div className="parking-zones">
          {parkingData && parkingData.zones ? (
            parkingData.zones.map((zone, zoneIndex) => (
              <div key={zoneIndex} className={`zone zone-${zone.type}`}>
                <div className="zone-header">
                  <h4>{zone.name}</h4>
                  <span className="zone-status">
                    {zone.available}/{zone.total} آزاد
                  </span>
                </div>
                <div className="parking-slots">
                  {zone.slots.map((slot, slotIndex) => (
                    <div
                      key={slotIndex}
                      className={`parking-slot ${slot.status}`}
                      title={`جایگاه ${slot.number}: ${
                        slot.status === 'available'
                          ? 'آزاد'
                          : slot.status === 'occupied'
                          ? 'اشغال شده'
                          : slot.status === 'reserved'
                          ? 'رزرو شده'
                          : 'غیرقابل استفاده'
                      }`}
                    >
                      <div className="slot-number">{slot.number}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="no-data">
              <i className="fas fa-parking"></i>
              <p>اطلاعات پارکینگ موجود نیست</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParkingMap;