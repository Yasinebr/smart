// src/components/dashboard/OccupancyChart.jsx
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// ثبت کامپوننت‌های مورد نیاز برای چارت
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const OccupancyChart = ({ data }) => {
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
            label: 'ظرفیت کل',
            data: data.totalCapacity || [],
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
          },
          {
            label: 'اشغال شده',
            data: data.occupancy || [],
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
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
            text: 'نمودار اشغال پارکینگ',
            font: {
              size: 16,
            },
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
          },
        },
      });
    }
  }, [data]);

  return (
    <div className="occupancy-chart">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">نمودار اشغال پارکینگ</h3>
        </div>
        <div className="card-body">
          <div className="chart-container">
            {data ? (
              <Bar data={chartData} options={chartOptions} />
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

export default OccupancyChart;