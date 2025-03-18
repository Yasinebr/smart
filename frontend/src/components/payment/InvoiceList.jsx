// src/components/payment/InvoiceList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getInvoices } from '../../api/payment';
import { formatDate, formatPrice } from '../../utils/formatter';
import useAuth from '../../hooks/useAuth';
import { useNotification } from '../../contexts/NotificationContext';

const InvoiceList = () => {
  const { currentUser } = useAuth();
  const { notify } = useNotification();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPaidFilter, setIsPaidFilter] = useState('all');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await getInvoices();

      // اگر کاربر مدیر نیست، فقط فاکتورهای خودش را ببیند
      let filteredInvoices = response.data.results;
      if (currentUser && currentUser.role !== 'admin') {
        filteredInvoices = filteredInvoices.filter(
          invoice => invoice.user === currentUser.id
        );
      }

      setInvoices(filteredInvoices);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setError('خطا در بارگذاری لیست فاکتورها');
      notify.error('خطا در بارگذاری لیست فاکتورها');
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleIsPaidFilterChange = (e) => {
    setIsPaidFilter(e.target.value);
  };

  // فیلتر بر اساس جستجو و وضعیت پرداخت
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch =
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.total_amount.toString().includes(searchTerm);

    const matchesIsPaid =
      isPaidFilter === 'all' ||
      (isPaidFilter === 'paid' && invoice.is_paid) ||
      (isPaidFilter === 'unpaid' && !invoice.is_paid);

    return matchesSearch && matchesIsPaid;
  });

  return (
    <div className="invoice-list">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">لیست فاکتورها</h2>
          <div className="card-actions">
            <div className="search-box">
              <input
                type="text"
                placeholder="جستجو..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="form-control"
              />
              <i className="fas fa-search"></i>
            </div>
            <select
              className="form-control mr-2 status-filter"
              value={isPaidFilter}
              onChange={handleIsPaidFilterChange}
            >
              <option value="all">همه فاکتورها</option>
              <option value="paid">پرداخت شده</option>
              <option value="unpaid">پرداخت نشده</option>
            </select>
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
              <button onClick={fetchInvoices} className="btn btn-primary">
                تلاش مجدد
              </button>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="empty-container">
              <i className="fas fa-file-invoice"></i>
              <p>هیچ فاکتوری یافت نشد.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>شماره فاکتور</th>
                    <th>مبلغ کل</th>
                    <th>مالیات</th>
                    <th>تخفیف</th>
                    <th>تاریخ صدور</th>
                    <th>موعد پرداخت</th>
                    <th>وضعیت</th>
                    <th>عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice, index) => (
                    <tr key={invoice.id}>
                      <td>{index + 1}</td>
                      <td>{invoice.invoice_number}</td>
                      <td>{formatPrice(invoice.total_amount)}</td>
                      <td>{formatPrice(invoice.tax_amount)}</td>
                      <td>{formatPrice(invoice.discount_amount)}</td>
                      <td>{formatDate(invoice.created_at)}</td>
                      <td>{invoice.due_date ? formatDate(invoice.due_date) : '---'}</td>
                      <td>
                        <span className={`badge badge-${invoice.is_paid ? 'success' : 'danger'}`}>
                          {invoice.is_paid ? 'پرداخت شده' : 'پرداخت نشده'}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group">
                          <Link to={`/invoices/${invoice.id}`} className="btn btn-sm btn-info">
                            <i className="fas fa-eye"></i>
                          </Link>
                          {!invoice.is_paid && (
                            <Link to={`/payments/create?invoice=${invoice.id}`} className="btn btn-sm btn-success">
                              <i className="fas fa-credit-card"></i> پرداخت
                            </Link>
                          )}
                          <button className="btn btn-sm btn-secondary">
                            <i className="fas fa-print"></i> چاپ
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
      </div>
    </div>
  );
};

export default InvoiceList;