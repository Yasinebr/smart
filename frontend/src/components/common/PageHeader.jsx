// src/components/common/PageHeader.jsx
import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';

const PageHeader = ({
  title,
  subtitle,
  icon,
  breadcrumbs = [],
  actions,
  backButton = false,
  backUrl,
  onBack,
  className = ''
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backUrl) {
      navigate(backUrl);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={`mb-6 ${className}`}>
      {/* خرده نان */}
      {breadcrumbs.length > 0 && (
        <nav className="flex mb-2">
          <ol className="flex flex-wrap items-center text-sm text-gray-500">
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && (
                  <li className="mx-2">
                    <span>/</span>
                  </li>
                )}
                <li>
                  {item.path ? (
                    <a
                      href={item.path}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <span className="text-gray-700">{item.label}</span>
                  )}
                </li>
              </React.Fragment>
            ))}
          </ol>
        </nav>
      )}

      {/* هدر اصلی */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div className="flex items-center mb-4 sm:mb-0">
          {backButton && (
            <button
              onClick={handleBack}
              className="p-1 mr-3 rounded-full hover:bg-gray-100"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          {icon && <div className="mr-3">{icon}</div>}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
        </div>

        {/* دکمه‌های عملیات */}
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
};

export default PageHeader;