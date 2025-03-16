// // src/routes.js
// import React from 'react';
// import { Navigate } from 'react-router-dom';
//
// // صفحات احراز هویت
// import LoginPage from './pages/auth/LoginPage';
// import RegisterPage from './pages/auth/RegisterPage';
// import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
// import ResetPasswordPage from './pages/auth/ResetPasswordPage';
//
// // داشبورد
// import AdminDashboard from './pages/dashboard/AdminDashboard';
// import ManagerDashboard from './pages/dashboard/ManagerDashboard';
// import UserDashboard from './pages/dashboard/UserDashboard';
//
// // مدیریت کاربران
// import UserListPage from './pages/user/UserListPage';
// import UserDetailPage from './pages/user/UserDetailPage';
// import ProfilePage from './pages/user/ProfilePage';
//
// // مدیریت پارکینگ
// import ParkingListPage from './pages/parking/ParkingListPage';
// import ParkingDetailPage from './pages/parking/ParkingDetailPage';
// import ParkingCreatePage from './pages/parking/ParkingCreatePage';
// import ParkingEditPage from './pages/parking/ParkingEditPage';
// import ReservationListPage from './pages/parking/ReservationListPage';
// import ReservationCreatePage from './pages/parking/ReservationCreatePage';
//
// // مدیریت خودروها
// import VehicleListPage from './pages/vehicle/VehicleListPage';
// import VehicleDetailPage from './pages/vehicle/VehicleDetailPage';
// import VehicleCreatePage from './pages/vehicle/VehicleCreatePage';
// import EntryExitPage from './pages/vehicle/EntryExitPage';
//
// // تشخیص هوشمند
// import PlateRecognitionPage from './pages/ai/PlateRecognitionPage';
// import FaceVerificationPage from './pages/ai/FaceVerificationPage';
//
// // پرداخت
// import PaymentListPage from './pages/payment/PaymentListPage';
// import PaymentDetailPage from './pages/payment/PaymentDetailPage';
//
// // صفحات متفرقه
// import HomePage from './pages/misc/HomePage';
// import NotFoundPage from './pages/misc/NotFoundPage';
// import ErrorPage from './pages/misc/ErrorPage';
// import AboutPage from './pages/misc/AboutPage';
// import ContactPage from './pages/misc/ContactPage';
//
// // تعریف مسیرها به همراه محافظ احراز هویت و سطح دسترسی
// const routes = [
//   // مسیر اصلی
//   {
//     path: '/',
//     element: <HomePage />,
//   },
//
//   // مسیرهای احراز هویت (بدون نیاز به لاگین)
//   {
//     path: '/login',
//     element: <LoginPage />,
//     meta: { requiresAuth: false },
//   },
//   {
//     path: '/register',
//     element: <RegisterPage />,
//     meta: { requiresAuth: false },
//   },
//   {
//     path: '/forgot-password',
//     element: <ForgotPasswordPage />,
//     meta: { requiresAuth: false },
//   },
//   {
//     path: '/reset-password/:token',
//     element: <ResetPasswordPage />,
//     meta: { requiresAuth: false },
//   },
//
//   // داشبورد (با توجه به نقش کاربر)
//   {
//     path: '/dashboard',
//     element: <UserDashboard />,
//     meta: {
//       requiresAuth: true,
//       roles: ['admin', 'parking_manager', 'customer'],
//     },
//   },
//   {
//     path: '/admin/dashboard',
//     element: <AdminDashboard />,
//     meta: {
//       requiresAuth: true,
//       roles: ['admin'],
//     },
//   },
//   {
//     path: '/manager/dashboard',
//     element: <ManagerDashboard />,
//     meta: {
//       requiresAuth: true,
//       roles: ['parking_manager'],
//     },
//   },
//
//   // مدیریت کاربران
//   {
//     path: '/users',
//     element: <UserListPage />,
//     meta: {
//       requiresAuth: true,
//       roles: ['admin'],
//     },
//   },
//   {
//     path: '/users/:id',
//     element: <UserDetailPage />,
//     meta: {
//       requiresAuth: true,
//       roles: ['admin'],
//     },
//   },
//   {
//     path: '/profile',
//     element: <ProfilePage />,
//     meta: {
//       requiresAuth: true,
//       roles: ['admin', 'parking_manager', 'customer'],
//     },
//   },
//
//   // مدیریت پارکینگ
//   {
//     path: '/parkings',
//     element: <ParkingListPage />,
//     meta: {
//       requiresAuth: true,
//       roles: ['admin', 'parking_manager', 'customer'],
//     },
//   },
//   {
//     path: '/parkings/create',
//     element: <ParkingCreatePage />,
//     meta: {
//       requiresAuth: true,
//       roles: ['admin', 'parking_manager'],
//     },
//   },
//   {
//     path: '/parkings/:id',
//     element: <ParkingDetailPage />,
//     meta: {
//       requiresAuth: true,
//       roles: ['admin', 'parking_manager', 'customer'],
//     },
//   },
//   {
//     path: '/parkings/:id/edit',
//     element: <ParkingEditPage />,
//     meta: {
//       requiresAuth: true,
//       roles: ['admin', 'parking_manager'],
//     },
//   },
//   {
//     path: '/reservations',
//     element: <ReservationListPage />,
//     meta: {
//       requiresAuth: true,
//       roles: ['admin', 'parking_manager', 'customer'],
//     },
//   },
//   {
//     path: '/reservations/create',
//     element: <ReservationCreatePage />,
//     meta: {
//       requiresAuth: true,
//       roles: ['admin', 'parking_manager', 'customer'],
//     },
//   },
//
//   // مدیریت خودروها
//   {
//     path: '/vehicles',
//     element: <VehicleListPage />,
//     meta: {
//       requiresAuth: true,
//       roles: ['admin', 'parking_manager', 'customer'],
//     },
//   },
//   {
//     path: '/vehicles/create',
//     element: <VehicleCreatePage />,
//     meta: {
//       requiresAuth: true,
//       roles: ['admin', 'parking_manager', 'customer'],
//     },
//   },
//   {
//     path: '/vehicles/:id',
//     element: <VehicleDetailPage />,
//     meta: {
//       requiresAuth: true,
//       roles: ['admin', 'parking_manager', 'customer'],
//     },
//   },
//   {
//     path: '/entry-exit',
//     element: <EntryExitPage />,
//     meta: {
//       requiresAuth: true,
//       roles: ['admin', 'parking_manager'],
//     },
//   },
//
//   // تشخیص هوشمند
//   {
//     path: '/plate-recognition',
//     element: <PlateRecognitionPage />,
//     meta: {
//       requiresAuth: true,
//       roles: ['admin', 'parking_manager'],
//     },
//   },
//   {
//     path: '/face-verification',
//     element: <FaceVerificationPage />,
//     meta: {
//       requiresAuth: true,
//       roles: ['admin', 'parking_manager'],
//     },
//   },
//
//   // پرداخت
//   {
//     path: '/payments',
//     element: <PaymentListPage />,
//     meta: {
//       requiresAuth: true,
//       roles: ['admin', 'parking_manager', 'customer'],
//     },
//   },
//   {
//     path: '/payments/:id',
//     element: <PaymentDetailPage />,
//     meta: {
//       requiresAuth: true,
//       roles: ['admin', 'parking_manager', 'customer'],
//     },
//   },
//
//   // صفحات متفرقه
//   {
//     path: '/about',
//     element: <AboutPage />,
//   },
//   {
//     path: '/contact',
//     element: <ContactPage />,
//   },
//   {
//     path: '/error',
//     element: <ErrorPage />,
//   },
//   {
//     path: '*',
//     element: <NotFoundPage />,
//   }
// ];
//
// export default routes;