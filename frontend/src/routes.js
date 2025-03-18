// src/routes.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/common/PrivateRoute';
import AdminRoute from './components/common/AdminRoute';
import ManagerRoute from './components/common/ManagerRoute';

// صفحات عمومی
import HomePage from './pages/misc/HomePage';
import AboutPage from './pages/misc/AboutPage';
import ContactPage from './pages/misc/ContactPage';
import FAQPage from './pages/misc/FAQPage';
import NotFoundPage from './pages/misc/NotFoundPage';

// صفحات احراز هویت
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// داشبوردها
import AdminDashboard from './pages/dashboard/AdminDashboard';
import ManagerDashboard from './pages/dashboard/ManagerDashboard';
import UserDashboard from './pages/dashboard/UserDashboard';

// صفحات کاربران
import UserListPage from './pages/user/UserListPage';
import UserCreatePage from './pages/user/UserCreatePage';
import UserEditPage from './pages/user/UserEditPage';
import UserDetailPage from './pages/user/UserDetailPage';
import ProfilePage from './pages/user/ProfilePage';

// صفحات پارکینگ
import ParkingListPage from './pages/parking/ParkingListPage';
import ParkingCreatePage from './pages/parking/ParkingCreatePage';
import ParkingEditPage from './pages/parking/ParkingEditPage';
import ParkingDetailPage from './pages/parking/ParkingDetailPage';
import ReservationListPage from './pages/parking/ReservationListPage';
import ReservationCreatePage from './pages/parking/ReservationCreatePage';

// صفحات خودرو
import VehicleListPage from './pages/vehicle/VehicleListPage';
import VehicleCreatePage from './pages/vehicle/VehicleCreatePage';
import VehicleEditPage from './pages/vehicle/VehicleEditPage';
import VehicleDetailPage from './pages/vehicle/VehicleDetailPage';
import EntryExitPage from './pages/vehicle/EntryExitPage';
import SessionListPage from './pages/vehicle/SessionListPage';

// صفحات پرداخت
import PaymentListPage from './pages/payment/PaymentListPage';
import PaymentDetailPage from './pages/payment/PaymentDetailPage';
import InvoiceListPage from './pages/payment/InvoiceListPage';
import InvoiceDetailPage from './pages/payment/InvoiceDetailPage';

// صفحات گزارش
import ReportListPage from './pages/report/ReportListPage';
import ReportCreatePage from './pages/report/ReportCreatePage';
import ReportViewPage from './pages/report/ReportViewPage';

// صفحات هوش مصنوعی
import PlateRecognitionPage from './pages/ai/PlateRecognitionPage';
import FaceVerificationPage from './pages/ai/FaceVerificationPage';

// صفحات تنظیمات
import GeneralSettings from './pages/settings/GeneralSettings';

// مسیرهای برنامه
const AppRoutes = () => {
  return (
    <Routes>
      {/* مسیرهای عمومی */}
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/faq" element={<FAQPage />} />

      {/* مسیرهای احراز هویت */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      {/* داشبوردها */}
      <Route path="/dashboard" element={<PrivateRoute><UserDashboard /></PrivateRoute>} />
      <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/manager/dashboard" element={<ManagerRoute><ManagerDashboard /></ManagerRoute>} />

      {/* مسیرهای کاربر */}
      <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
      <Route path="/admin/users" element={<AdminRoute><UserListPage /></AdminRoute>} />
      <Route path="/admin/users/create" element={<AdminRoute><UserCreatePage /></AdminRoute>} />
      <Route path="/admin/users/:id/edit" element={<AdminRoute><UserEditPage /></AdminRoute>} />
      <Route path="/admin/users/:id" element={<AdminRoute><UserDetailPage /></AdminRoute>} />

      {/* مسیرهای پارکینگ */}
      <Route path="/parking-lots" element={<PrivateRoute><ParkingListPage /></PrivateRoute>} />
      <Route path="/admin/parking-lots/create" element={<AdminRoute><ParkingCreatePage /></AdminRoute>} />
      <Route path="/admin/parking-lots/:id/edit" element={<AdminRoute><ParkingEditPage /></AdminRoute>} />
      <Route path="/parking-lots/:id" element={<PrivateRoute><ParkingDetailPage /></PrivateRoute>} />
      <Route path="/reservations" element={<PrivateRoute><ReservationListPage /></PrivateRoute>} />
      <Route path="/reservations/create" element={<PrivateRoute><ReservationCreatePage /></PrivateRoute>} />

      {/* مسیرهای خودرو */}
      <Route path="/vehicles" element={<PrivateRoute><VehicleListPage /></PrivateRoute>} />
      <Route path="/vehicles/create" element={<PrivateRoute><VehicleCreatePage /></PrivateRoute>} />
      <Route path="/vehicles/:id/edit" element={<PrivateRoute><VehicleEditPage /></PrivateRoute>} />
      <Route path="/vehicles/:id" element={<PrivateRoute><VehicleDetailPage /></PrivateRoute>} />
      <Route path="/manager/entry-exit" element={<ManagerRoute><EntryExitPage /></ManagerRoute>} />
      <Route path="/sessions" element={<PrivateRoute><SessionListPage /></PrivateRoute>} />

      {/* مسیرهای پرداخت */}
      <Route path="/payments" element={<PrivateRoute><PaymentListPage /></PrivateRoute>} />
      <Route path="/payments/:id" element={<PrivateRoute><PaymentDetailPage /></PrivateRoute>} />
      <Route path="/invoices" element={<PrivateRoute><InvoiceListPage /></PrivateRoute>} />
      <Route path="/invoices/:id" element={<PrivateRoute><InvoiceDetailPage /></PrivateRoute>} />

      {/* مسیرهای گزارش */}
      <Route path="/admin/reports" element={<AdminRoute><ReportListPage /></AdminRoute>} />
      <Route path="/admin/reports/create" element={<AdminRoute><ReportCreatePage /></AdminRoute>} />
      <Route path="/admin/reports/:id" element={<AdminRoute><ReportViewPage /></AdminRoute>} />

      {/* مسیرهای هوش مصنوعی */}
      <Route path="/ai/plate-recognition" element={<PrivateRoute><PlateRecognitionPage /></PrivateRoute>} />
      <Route path="/ai/face-verification" element={<PrivateRoute><FaceVerificationPage /></PrivateRoute>} />

      {/* مسیرهای تنظیمات */}
      <Route path="/settings" element={<PrivateRoute><GeneralSettings /></PrivateRoute>} />

      {/* مسیر صفحه 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;