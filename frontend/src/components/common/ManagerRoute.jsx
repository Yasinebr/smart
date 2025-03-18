import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const ManagerRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="loading">در حال بارگذاری...</div>;
  }

  if (!currentUser || currentUser.role !== 'parking_manager') {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ManagerRoute;