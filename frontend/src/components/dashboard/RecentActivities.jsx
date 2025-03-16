// src/components/dashboard/RecentActivities.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

const RecentActivities = ({ activities = [], title = "فعالیت‌های اخیر", viewAllLink = "/activities" }) => {
  // تبدیل زمان به فرمت مناسب
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);

    // اگر امروز است
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return `امروز ${date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`;
    }

    // اگر دیروز است
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `دیروز ${date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`;
    }

    // در غیر این صورت
    return `${date.toLocaleDateString('fa-IR')} ${date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <Card
      title={title}
      icon={<Clock className="h-6 w-6 text-blue-600" />}
      actions={
        <Link to={viewAllLink}>
          <Button variant="outline" size="sm">مشاهده همه</Button>
        </Link>
      }
    >
      {activities.length > 0 ? (
        <div className="divide-y divide-gray-200">
          {activities.map((activity, index) => (
            <div key={index} className="py-3 first:pt-0 last:pb-0">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${activity.iconBg || 'bg-blue-100'}`}>
                    {activity.icon || <Calendar className={`h-5 w-5 ${activity.iconColor || 'text-blue-600'}`} />}
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-500">{formatDate(activity.date)}</p>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{activity.description}</p>

                  {activity.link && (
                    <Link
                      to={activity.link}
                      className="mt-2 inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-800"
                    >
                      جزئیات بیشتر
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-gray-500">
          <p>در حال حاضر فعالیتی وجود ندارد.</p>
        </div>
      )}
    </Card>
  );
};

export default RecentActivities;