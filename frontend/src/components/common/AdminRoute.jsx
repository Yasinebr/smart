// src/components/common/AdminRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const AdminRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="loading">در حال بارگذاری...</div>;
  }

  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/login" />;
  }

  return children;
};

export default AdminRoute;