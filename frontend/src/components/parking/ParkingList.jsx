// src/components/parking/ParkingList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getParkingLots } from '../../api/parking';
import { useNotification } from '../../contexts/NotificationContext';

const ParkingList = () => {
  const { notify } = useNotification();
  const [parkingLots, setParkingLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchParkingLots();
  }, [currentPage]);

  const fetchParkingLots = async () => {
    try {
      setLoading(true);
      const response = await getParkingLots();
      setParkingLots(response.data.results);
      // محاسبه تعداد کل صفحات
      const total = response.data.count;
      const perPage = 10; // فرض کنید هر صفحه 10 آیتم دارد
      setTotalPages(Math.ceil(total / perPage));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching parking lots:', error);
      setError('خطا در بارگذاری لیست پارکینگ‌ها');
      notify.error('خطا در بارگذاری لیست پارکینگ‌ها');
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredParkingLots = parkingLots.filter(parkingLot =>
    parkingLot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parkingLot.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="parking-list">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">لیست پارکینگ‌ها</h2>
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
            <Link to="/admin/parking-lots/create" className="btn btn-primary">
              <i className="fas fa-plus"></i> افزودن پارکینگ
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
              <button onClick={fetchParkingLots} className="btn btn-primary">
                تلاش مجدد
              </button>
            </div>
          ) : filteredParkingLots.length === 0 ? (
            <div className="empty-container">
              <i className="fas fa-parking"></i>
              <p>هیچ پارکینگی یافت نشد.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>نام</th>
                    <th>آدرس</th>
                    <th>ظرفیت کل</th>
                    <th>میزان اشغال</th>
                    <th>نرخ ساعتی</th>
                    <th>امکانات</th>
                    <th>عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParkingLots.map((parkingLot, index) => (
                    <tr key={parkingLot.id}>
                      <td>{index + 1}</td>
                      <td>{parkingLot.name}</td>
                      <td>{parkingLot.address}</td>
                      <td>{parkingLot.total_capacity}</td>
                      <td>
                        <div className="progress">
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{ width: `${parkingLot.occupancy_percentage}%` }}
                            aria-valuenow={parkingLot.occupancy_percentage}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          >
                            {parkingLot.occupancy_percentage}%
                          </div>
                        </div>
                      </td>
                      <td>{parkingLot.hourly_rate} تومان</td>
                      <td>
                        {parkingLot.has_cctv && <i className="fas fa-video" title="دوربین مداربسته"></i>}
                        {parkingLot.has_elevator && <i className="fas fa-elevator" title="آسانسور"></i>}
                        {parkingLot.has_electric_charger && <i className="fas fa-charging-station" title="شارژر برقی"></i>}
                        {parkingLot.indoor && <i className="fas fa-home" title="سرپوشیده"></i>}
                        {parkingLot.is_24h && <i className="fas fa-clock" title="۲۴ ساعته"></i>}
                      </td>
                      <td>
                        <div className="btn-group">
                          <Link to={`/parking-lots/${parkingLot.id}`} className="btn btn-sm btn-info">
                            <i className="fas fa-eye"></i>
                          </Link>
                          <Link to={`/admin/parking-lots/${parkingLot.id}/edit`} className="btn btn-sm btn-warning">
                            <i className="fas fa-edit"></i>
                          </Link>
                          <button className="btn btn-sm btn-danger">
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="card-footer">
          <nav>
            <ul className="pagination">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  قبلی
                </button>
              </li>
              {[...Array(totalPages).keys()].map((page) => (
                <li
                  key={page + 1}
                  className={`page-item ${currentPage === page + 1 ? 'active' : ''}`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(page + 1)}
                  >
                    {page + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  بعدی
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default ParkingList;