// src/components/dashboard/VehicleTypeChart.jsx
import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { Car, Loader } from 'lucide-react';
import Card from '../common/Card';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const VehicleTypeChart = ({
  data = [],
  title = "نوع خودروها",
  loading = false,
  totalVehicles = 0
}) => {

  // فرمت‌دهی تولتیپ‌های نمودار
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      return (
        <div className="bg-white p-3 shadow-md rounded border border-gray-200">
          <p className="font-bold text-gray-800">{item.name}</p>
          <p className="text-sm" style={{ color: item.color }}>
            {item.value} خودرو ({Math.round((item.value / totalVehicles) * 100)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // نمایش تعداد کل خودروها در وسط دایره
  const renderCustomizedLabel = () => {
    return (
      <>
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-4xl font-bold fill-gray-800">
          {totalVehicles}
        </text>
        <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" className="text-xs fill-gray-500">
          خودرو
        </text>
      </>
    );
  };

  return (
    <Card
      title={title}
      icon={<Car className="h-6 w-6 text-blue-600" />}
    >
      {loading ? (
        <div className="h-72 flex items-center justify-center">
          <Loader className="h-8 w-8 text-blue-600 animate-spin" />
        </div>
      ) : data.length === 0 ? (
        <div className="h-72 flex items-center justify-center text-gray-500">
          <p>داده‌ای برای نمایش وجود ندارد</p>
        </div>
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                innerRadius={60}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              {renderCustomizedLabel()}
              <Tooltip content={<CustomTooltip />} />
              <Legend
                layout="vertical"
                verticalAlign="middle"
                align="right"
                wrapperStyle={{ paddingLeft: '20px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* نمایش اطلاعات بیشتر در مورد نوع خودروها */}
      <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
        {data.map((item, index) => (
          <div key={index} className="bg-gray-50 p-2 rounded-md">
            <div className="flex items-center">
              <div
                className="w-3 h-3 mr-2 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              ></div>
              <span className="text-xs text-gray-600">{item.name}</span>
            </div>
            <div className="mt-1">
              <span className="text-sm font-medium">{item.value}</span>
              <span className="text-xs text-gray-500"> ({Math.round((item.value / totalVehicles) * 100)}%)</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default VehicleTypeChart;