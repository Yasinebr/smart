// src/components/dashboard/ParkingMap.jsx
import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Loader, Maximize, Minimize } from 'lucide-react';
import Card from '../common/Card';

const ParkingMap = ({
  parkingLots = [],
  title = "نقشه پارکینگ‌ها",
  loading = false,
  defaultCenter = { lat: 35.6892, lng: 51.3890 }, // تهران
  defaultZoom = 12
}) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [fullscreen, setFullscreen] = useState(false);

  // بارگذاری نقشه
  useEffect(() => {
    // بررسی اینکه آیا Leaflet در دسترس است
    if (!window.L) {
      // لود کردن Leaflet از CDN اگر موجود نیست
      const linkEl = document.createElement('link');
      linkEl.rel = 'stylesheet';
      linkEl.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
      document.head.appendChild(linkEl);

      const scriptEl = document.createElement('script');
      scriptEl.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
      scriptEl.onload = initMap;
      document.head.appendChild(scriptEl);
    } else {
      initMap();
    }

    return () => {
      // پاکسازی مارکرها
      if (markers.length > 0) {
        markers.forEach(marker => marker.remove());
      }

      // پاکسازی نقشه
      if (map) {
        map.remove();
      }
    };
  }, []);

  // اضافه کردن مارکرها به نقشه
  useEffect(() => {
    if (map && parkingLots.length > 0 && !loading) {
      // پاکسازی مارکرهای قبلی
      markers.forEach(marker => marker.remove());
      const newMarkers = [];

      // اضافه کردن مارکرهای جدید
      parkingLots.forEach(parking => {
        // ایجاد آیکون سفارشی بر اساس میزان اشغال
        const occupancyPercentage = Math.round((parking.current_occupancy / parking.total_capacity) * 100);
        const markerColor = occupancyPercentage > 80 ? 'red' : (occupancyPercentage > 50 ? 'orange' : 'green');

        const icon = window.L.divIcon({
          className: 'custom-marker-icon',
          html: `
            <div style="background-color: ${markerColor}; width: 30px; height: 30px; border-radius: 50%; display: flex; justify-content: center; align-items: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
              <span style="color: white; font-weight: bold; font-size: 10px;">${occupancyPercentage}%</span>
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        // ایجاد مارکر
        const marker = window.L.marker([parking.latitude, parking.longitude], { icon })
          .addTo(map)
          .bindPopup(`
            <div>
              <h3 style="font-weight: bold; margin-bottom: 5px;">${parking.name}</h3>
              <p>ظرفیت: ${parking.current_occupancy} / ${parking.total_capacity}</p>
              <p>آدرس: ${parking.address}</p>
              <a href="/parkings/${parking.id}" style="color: blue; text-decoration: underline;">مشاهده جزئیات</a>
            </div>
          `);

        newMarkers.push(marker);
      });

      setMarkers(newMarkers);

      // تنظیم محدوده نقشه بر اساس مارکرها
      if (newMarkers.length > 0) {
        const bounds = window.L.featureGroup(newMarkers).getBounds();
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [map, parkingLots, loading]);

  // تغییر اندازه نقشه در صورت تغییر حالت تمام‌صفحه
  useEffect(() => {
    if (map) {
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }
  }, [fullscreen, map]);

  // راه‌اندازی نقشه
  const initMap = () => {
    if (!mapRef.current || map) return;

    const leafletMap = window.L.map(mapRef.current).setView(
      [defaultCenter.lat, defaultCenter.lng],
      defaultZoom
    );

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(leafletMap);

    setMap(leafletMap);
  };

  // تغییر حالت تمام‌صفحه
  const toggleFullscreen = () => {
    setFullscreen(prev => !prev);
  };

  return (
    <Card
      title={title}
      icon={<MapPin className="h-6 w-6 text-blue-600" />}
      actions={
        <button
          onClick={toggleFullscreen}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          {fullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>
      }
      className={fullscreen ? 'fixed inset-0 z-50 m-4 rounded-xl' : ''}
    >
      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <Loader className="h-8 w-8 text-blue-600 animate-spin" />
        </div>
      ) : (
        <div
          ref={mapRef}
          className={`w-full ${fullscreen ? 'h-[calc(100vh-8rem)]' : 'h-96'} rounded-lg overflow-hidden`}
        ></div>
      )}

      {/* راهنمای نقشه */}
      <div className="mt-4 flex items-center space-x-4 space-x-reverse justify-center">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
          <span className="text-xs">خلوت (&lt;50%)</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-orange-500 rounded-full mr-2"></div>
          <span className="text-xs">نیمه‌پر (50-80%)</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
          <span className="text-xs">شلوغ (&gt;80%)</span>
        </div>
      </div>
    </Card>
  );
};

export default ParkingMap;