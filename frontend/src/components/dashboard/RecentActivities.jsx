// src/components/dashboard/RecentActivities.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const RecentActivities = ({ activities }) => {
  return (
    <div className="recent-activities">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">فعالیت‌های اخیر</h3>
        </div>
        <div className="card-body">
          {activities && activities.length > 0 ? (
            <ul className="activity-list">
              {activities.map((activity, index) => (
                <li key={index} className="activity-item">
                  <div className={`activity-icon ${activity.type}`}>
                    <i className={activity.icon}></i>
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">{activity.title}</div>
                    <div className="activity-description">{activity.description}</div>
                    <div className="activity-time">{activity.time}</div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-activities">
              <i className="fas fa-history"></i>
              <p>هیچ فعالیتی یافت نشد.</p>
            </div>
          )}
        </div>
        <div className="card-footer">
          <Link to="/activities" className="btn btn-link">
            مشاهده همه فعالیت‌ها
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RecentActivities;