// src/components/dashboard/RevenueChart.jsx
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// ثبت کامپوننت‌های مورد نیاز برای چارت
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const RevenueChart = ({ data, period = 'monthly' }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  const [chartOptions, setChartOptions] = useState({});

  useEffect(() => {
    if (data) {
      // تنظیم داده‌های چارت بر اساس داده‌های دریافتی
      setChartData({
        labels: data.labels || [],
        datasets: [
          {
            label: 'درآمد',
            data: data.values || [],
            fill: false,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            tension: 0.4,
          },
        ],
      });

      // تنظیمات چارت
      setChartOptions({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: {
              boxWidth: 15,
              usePointStyle: true,
              font: {
                size: 12,
              },
            },
          },
          title: {
            display: true,
            text: 'نمودار درآمد',
            font: {
              size: 16,
            },
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat('fa-IR', {
                    style: 'currency',
                    currency: 'IRR',
                    minimumFractionDigits: 0,
                  }).format(context.parsed.y);
                }
                return label;
              }
            }
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
            },
            ticks: {
              callback: function(value) {
                return new Intl.NumberFormat('fa-IR', {
                  style: 'currency',
                  currency: 'IRR',
                  minimumFractionDigits: 0,
                }).format(value);
              }
            }
          },
        },
      });
    }
  }, [data, period]);

  return (
    <div className="revenue-chart">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">نمودار درآمد</h3>
          <div className="card-actions">
            <div className="btn-group">
              <button className={`btn ${period === 'weekly' ? 'btn-primary' : 'btn-outline-primary'}`}>
                هفتگی
              </button>
              <button className={`btn ${period === 'monthly' ? 'btn-primary' : 'btn-outline-primary'}`}>
                ماهانه
              </button>
              <button className={`btn ${period === 'yearly' ? 'btn-primary' : 'btn-outline-primary'}`}>
                سالانه
              </button>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="chart-container">
            {data ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <div className="loading-chart">
                <i className="fas fa-spinner fa-spin"></i>
                <p>در حال بارگذاری نمودار...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;