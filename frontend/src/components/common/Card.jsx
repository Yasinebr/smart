// src/components/common/Card.jsx
import React from 'react';

const Card = ({
  children,
  title,
  subtitle,
  icon,
  actions,
  footer,
  className = '',
  bodyClassName = '',
  headerClassName = '',
  footerClassName = '',
  noPadding = false,
  border = true
}) => {
  return (
    <div
      className={`
        bg-white rounded-lg shadow-sm overflow-hidden
        ${border ? 'border border-gray-200' : ''}
        ${className}
      `}
    >
      {/* کارت هدر */}
      {(title || icon || actions) && (
        <div className={`flex items-center justify-between px-6 py-4 border-b border-gray-200 ${headerClassName}`}>
          <div className="flex items-center">
            {icon && <div className="mr-3">{icon}</div>}
            <div>
              {title && <h3 className="text-lg font-medium text-gray-800">{title}</h3>}
              {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="flex items-center space-x-2">{actions}</div>}
        </div>
      )}

      {/* کارت بدنه */}
      <div className={`${noPadding ? '' : 'p-6'} ${bodyClassName}`}>
        {children}
      </div>

      {/* کارت فوتر */}
      {footer && (
        <div className={`px-6 py-4 bg-gray-50 border-t border-gray-200 ${footerClassName}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;