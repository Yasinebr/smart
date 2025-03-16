// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { SidebarProvider } from './contexts/SidebarContext';

// صفحات اصلی
import HomePage from './pages/misc/HomePage';
import NotFoundPage from './pages/misc/NotFoundPage';
import ErrorPage from './pages/misc/ErrorPage';

// صفحات احراز هویت
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// داشبورد
import AdminDashboard from './pages/dashboard/AdminDashboard';
import ManagerDashboard from './pages/dashboard/ManagerDashboard';
import UserDashboard from './pages/dashboard/UserDashboard';

// مدیریت کاربران
import UserListPage from './pages/user/UserListPage';
import UserDetailPage from './pages/user/UserDetailPage';
import ProfilePage from './pages/user/ProfilePage';

// مدیریت پارکینگ
import ParkingListPage from './pages/parking/ParkingListPage';
import ParkingDetailPage from './pages/parking/ParkingDetailPage';
import ParkingCreatePage from './pages/parking/ParkingCreatePage';
import ParkingEditPage from './pages/parking/ParkingEditPage';
import ReservationListPage from './pages/parking/ReservationListPage';
import ReservationCreatePage from './pages/parking/ReservationCreatePage';

// مدیریت خودروها
import VehicleListPage from './pages/vehicle/VehicleListPage';
import VehicleDetailPage from './pages/vehicle/VehicleDetailPage';
import VehicleCreatePage from './pages/vehicle/VehicleCreatePage';
import EntryExitPage from './pages/vehicle/EntryExitPage';

// تشخیص هوشمند
import PlateRecognitionPage from './pages/ai/PlateRecognitionPage';
import FaceVerificationPage from './pages/ai/FaceVerificationPage';

// پرداخت
import PaymentListPage from './pages/payment/PaymentListPage';
import PaymentDetailPage from './pages/payment/PaymentDetailPage';

// کامپوننت‌های عمومی
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import Footer from './components/common/Footer';
import Loader from './components/common/Loader';
import Alert from './components/common/Alert';
import AuthContext from "./contexts/AuthContext";
// حفاظت مسیر برای کاربران لاگین شده
const PrivateRoute = ({ children, requiredRoles = [] }) => {
  const { currentUser, isAuthenticated } = React.useContext(AuthContext);
  //
  // if (!isAuthenticated) {
  //   return <Navigate to="/login" />;
  // }
  //
  // if (requiredRoles.length > 0 && !requiredRoles.includes(currentUser.role)) {
  //   return <Navigate to="/unauthorized" />;
  // }

  return children;
};

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // شبیه‌سازی بارگذاری اولیه
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <SidebarProvider>
            <Router>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <div className="flex flex-1">
                  <Sidebar />
                  <main className="flex-1 p-4 bg-gray-100">
                    <Routes>
                      {/* صفحه اصلی */}
                      <Route path="/" element={<HomePage />} />

                      {/* صفحات احراز هویت */}
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

                      {/* داشبورد */}
                      <Route path="/dashboard" element={
                        <PrivateRoute>
                          <UserDashboard />
                        </PrivateRoute>
                      } />
                      <Route path="/admin/dashboard" element={
                        <PrivateRoute requiredRoles={['admin']}>
                          <AdminDashboard />
                        </PrivateRoute>
                      } />
                      <Route path="/manager/dashboard" element={
                        <PrivateRoute requiredRoles={['parking_manager']}>
                          <ManagerDashboard />
                        </PrivateRoute>
                      } />

                      {/* مدیریت کاربران */}
                      <Route path="/users" element={
                        <PrivateRoute requiredRoles={['admin']}>
                          <UserListPage />
                        </PrivateRoute>
                      } />
                      <Route path="/users/:id" element={
                        <PrivateRoute>
                          <UserDetailPage />
                        </PrivateRoute>
                      } />
                      <Route path="/profile" element={
                        <PrivateRoute>
                          <ProfilePage />
                        </PrivateRoute>
                      } />

                      {/* مدیریت پارکینگ */}
                      <Route path="/parkings" element={
                        <PrivateRoute>
                          <ParkingListPage />
                        </PrivateRoute>
                      } />
                      <Route path="/parkings/create" element={
                        <PrivateRoute requiredRoles={['admin', 'parking_manager']}>
                          <ParkingCreatePage />
                        </PrivateRoute>
                      } />
                      <Route path="/parkings/:id" element={
                        <PrivateRoute>
                          <ParkingDetailPage />
                        </PrivateRoute>
                      } />
                      <Route path="/parkings/:id/edit" element={
                        <PrivateRoute requiredRoles={['admin', 'parking_manager']}>
                          <ParkingEditPage />
                        </PrivateRoute>
                      } />
                      <Route path="/reservations" element={
                        <PrivateRoute>
                          <ReservationListPage />
                        </PrivateRoute>
                      } />
                      <Route path="/reservations/create" element={
                        <PrivateRoute>
                          <ReservationCreatePage />
                        </PrivateRoute>
                      } />

                      {/* مدیریت خودروها */}
                      <Route path="/vehicles" element={
                        <PrivateRoute>
                          <VehicleListPage />
                        </PrivateRoute>
                      } />
                      <Route path="/vehicles/create" element={
                        <PrivateRoute>
                          <VehicleCreatePage />
                        </PrivateRoute>
                      } />
                      <Route path="/vehicles/:id" element={
                        <PrivateRoute>
                          <VehicleDetailPage />
                        </PrivateRoute>
                      } />
                      <Route path="/entry-exit" element={
                        <PrivateRoute requiredRoles={['admin', 'parking_manager']}>
                          <EntryExitPage />
                        </PrivateRoute>
                      } />

                      {/* تشخیص هوشمند */}
                      <Route path="/plate-recognition" element={
                        <PrivateRoute requiredRoles={['admin', 'parking_manager']}>
                          <PlateRecognitionPage />
                        </PrivateRoute>
                      } />
                      <Route path="/face-verification" element={
                        <PrivateRoute requiredRoles={['admin', 'parking_manager']}>
                          <FaceVerificationPage />
                        </PrivateRoute>
                      } />

                      {/* پرداخت */}
                      <Route path="/payments" element={
                        <PrivateRoute>
                          <PaymentListPage />
                        </PrivateRoute>
                      } />
                      <Route path="/payments/:id" element={
                        <PrivateRoute>
                          <PaymentDetailPage />
                        </PrivateRoute>
                      } />

                      {/* صفحات خطا */}
                      <Route path="/error" element={<ErrorPage />} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </main>
                </div>
                <Footer />
              </div>
            </Router>
          </SidebarProvider>
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;