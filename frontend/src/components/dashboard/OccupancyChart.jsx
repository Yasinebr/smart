// src/components/dashboard/OccupancyChart.jsx
import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Clock, Loader } from 'lucide-react';
import Card from '../common/Card';

const OccupancyChart = ({
  data = [],
  title = "نمودار اشغال پارکینگ",
  loading = false,
  currentOccupancy = 0,
  totalCapacity = 0,
  period = "امروز"
}) => {
  const [activeFilter, setActiveFilter] = useState(period);

  // درصد اشغال
  const occupancyPercentage = totalCapacity > 0 ? Math.round((currentOccupancy / totalCapacity) * 100) : 0;

  // تغییر فیلتر زمانی
  const handleFilterChange = (newFilter) => {
    setActiveFilter(newFilter);
    // اینجا می‌توانید یک کال‌بک به کامپوننت والد داشته باشید
  };

  // فرمت‌دهی تولتیپ‌های نمودار
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-md rounded border border-gray-200">
          <p className="font-bold text-gray-800">{label}</p>
          <p className="text-sm text-blue-600">
            اشغال شده: {payload[0].value} مورد
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card
      title={title}
      icon={<Clock className="h-6 w-6 text-blue-600" />}
      actions={
        <div className="flex space-x-2 space-x-reverse">
          <button
            className={`px-3 py-1 text-xs rounded-md ${activeFilter === 'امروز' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
            onClick={() => handleFilterChange('امروز')}
          >
            امروز
          </button>
          <button
            className={`px-3 py-1 text-xs rounded-md ${activeFilter === 'هفته' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
            onClick={() => handleFilterChange('هفته')}
          >
            این هفته
          </button>
          <button
            className={`px-3 py-1 text-xs rounded-md ${activeFilter === 'ماه' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
            onClick={() => handleFilterChange('ماه')}
          >
            این ماه
          </button>
        </div>
      }
    >
      {/* نمایش اطلاعات کلی اشغال */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="text-sm text-gray-500">اشغال فعلی</div>
          <div className="text-2xl font-bold">{currentOccupancy} / {totalCapacity}</div>
        </div>
        <div className="relative w-24 h-24">
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="3"
              strokeDasharray="100, 100"
            />
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={occupancyPercentage > 80 ? '#EF4444' : (occupancyPercentage > 50 ? '#F59E0B' : '#10B981')}
              strokeWidth="3"
              strokeDasharray={`${occupancyPercentage}, 100`}
            />
            <text x="18" y="20.5" textAnchor="middle" className="text-lg font-medium fill-current text-gray-800">
              {occupancyPercentage}%
            </text>
          </svg>
        </div>
      </div>

      {/* نمودار */}
      {loading ? (
        <div className="h-80 flex items-center justify-center">
          <Loader className="h-8 w-8 text-blue-600 animate-spin" />
        </div>
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 5,
                left: 5,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#E5E7EB' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="اشغال" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};

export default OccupancyChart;