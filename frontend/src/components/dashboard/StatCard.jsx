// src/components/dashboard/StatCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';

const StatCard = ({
  title,
  value,
  icon,
  color = 'bg-blue-100 text-blue-800',
  link,
  percentage,
  trend = 'up',
  description
}) => {
  return (
    <Link to={link || '#'} className="block">
      <Card className="h-full transition-transform hover:shadow-md hover:-translate-y-1">
        <div className="flex items-center">
          <div className={`p-3 rounded-full ${color}`}>
            {icon}
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <div className="flex items-center">
              <p className="text-2xl font-semibold">{value}</p>

              {percentage && (
                <span className={`ml-2 text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {trend === 'up' ? '+' : '-'}{percentage}%
                </span>
              )}
            </div>

            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default StatCard;