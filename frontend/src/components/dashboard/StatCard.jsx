// src/components/dashboard/StatCard.jsx
import React from 'react';

const StatCard = ({ title, value, icon, color, change, changeType }) => {
  return (
    <div className={`stat-card bg-${color}`}>
      <div className="stat-card-icon">
        <i className={icon}></i>
      </div>
      <div className="stat-card-content">
        <h3 className="stat-card-title">{title}</h3>
        <div className="stat-card-value">{value}</div>
        {change && (
          <div className={`stat-card-change ${changeType === 'increase' ? 'positive' : 'negative'}`}>
            <i className={`fas fa-arrow-${changeType === 'increase' ? 'up' : 'down'}`}></i>
            {change}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;