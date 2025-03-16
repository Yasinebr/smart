// src/components/dashboard/RevenueChart.jsx
import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, Loader } from 'lucide-react';
import Card from '../common/Card';

const RevenueChart = ({
  data = [],
  title = "نمودار درآمد",
  period = "ماهانه",
  loading = false,
  totalRevenue = 0,
  percentageChange = 0,
  comparisonPeriod = "نسبت به ماه قبل"
}) => {
  const [activeFilter, setActiveFilter] = useState(period);

  // فرمت‌دهی اعداد
  const formatMoney = (amount) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

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
          <p className="text-sm text-green-600">
            درآمد: {formatMoney(payload[0].value)} تومان
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card
      title={title}
      actions={
        <div className="flex space-x-2 space-x-reverse">
          <button
            className={`px-3 py-1 text-xs rounded-md ${activeFilter === 'هفتگی' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
            onClick={() => handleFilterChange('هفتگی')}
          >
            هفتگی
          </button>
          <button
            className={`px-3 py-1 text-xs rounded-md ${activeFilter === 'ماهانه' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
            onClick={() => handleFilterChange('ماهانه')}
          >
            ماهانه
          </button>
          <button
            className={`px-3 py-1 text-xs rounded-md ${activeFilter === 'سالانه' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
            onClick={() => handleFilterChange('سالانه')}
          >
            سالانه
          </button>
        </div>
      }
    >
      {/* نمایش درآمد کل و درصد تغییرات */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="text-sm text-gray-500">درآمد کل</div>
          <div className="text-2xl font-bold">{formatMoney(totalRevenue)} تومان</div>
        </div>
        <div className={`flex items-center ${percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {percentageChange >= 0 ?
            <ArrowUpRight className="h-5 w-5 mr-1" /> :
            <ArrowDownRight className="h-5 w-5 mr-1" />
          }
          <span className="font-medium">{Math.abs(percentageChange)}%</span>
          <span className="text-xs text-gray-500 mr-1">{comparisonPeriod}</span>
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
            <LineChart
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
                tickFormatter={(value) => `${value / 1000}K`}
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="درآمد"
                stroke="#3B82F6"
                strokeWidth={2}
                activeDot={{ r: 8 }}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};

export default RevenueChart;