'use client';

import { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Avatar,
  CircularProgress,
  Tooltip
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import PaymentIcon from '@mui/icons-material/Payment';
import PeopleIcon from '@mui/icons-material/People';
import RefreshIcon from '@mui/icons-material/Refresh';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import DashboardLayout from '@/components/layout/DashboardLayout';
import useApi from '@/hooks/useApi';
import api from '@/utils/api';

// Sample data (would be replaced with real API data)
const revenueData = [
  { month: 'فروردین', amount: 4500 },
  { month: 'اردیبهشت', amount: 5200 },
  { month: 'خرداد', amount: 4800 },
  { month: 'تیر', amount: 6200 },
  { month: 'مرداد', amount: 7000 },
  { month: 'شهریور', amount: 6800 },
];

const occupancyData = [
  { time: '09:00', rate: 28 },
  { time: '10:00', rate: 45 },
  { time: '11:00', rate: 59 },
  { time: '12:00', rate: 67 },
  { time: '13:00', rate: 70 },
  { time: '14:00', rate: 75 },
  { time: '15:00', rate: 78 },
  { time: '16:00', rate: 85 },
  { time: '17:00', rate: 92 },
  { time: '18:00', rate: 78 },
  { time: '19:00', rate: 62 },
  { time: '20:00', rate: 45 },
];

const sessionTypeData = [
  { name: 'روزانه', value: 350 },
  { name: 'ساعتی', value: 520 },
  { name: 'رزرو آنلاین', value: 280 },
  { name: 'اشتراک', value: 150 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function DashboardPage() {
  const { data: parkingLots, loading: loadingParkingLots, execute: fetchParkingLots } = useApi(api.getParkingLots, true);
  const { data: vehicles, loading: loadingVehicles, execute: fetchVehicles } = useApi(api.getVehicles, true);
  const { data: reservations, loading: loadingReservations, execute: fetchReservations } = useApi(api.getParkingReservations, true);
  const { data: users, loading: loadingUsers, execute: fetchUsers } = useApi(api.getUsers, true);

  const [stats, setStats] = useState({
    parkingLotCount: 0,
    vehicleCount: 0,
    reservationCount: 0,
    userCount: 0,
    activeSessionCount: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    // Update stats when data is loaded
    if (parkingLots) {
      setStats(prev => ({ ...prev, parkingLotCount: parkingLots.count || 0 }));
    }
    if (vehicles) {
      setStats(prev => ({ ...prev, vehicleCount: vehicles.count || 0 }));
    }
    if (reservations) {
      setStats(prev => ({ ...prev, reservationCount: reservations.count || 0 }));
    }
    if (users) {
      setStats(prev => ({ ...prev, userCount: users.count || 0 }));
    }
  }, [parkingLots, vehicles, reservations, users]);

  const refreshData = () => {
    fetchParkingLots();
    fetchVehicles();
    fetchReservations();
    fetchUsers();
  };

  return (
    <DashboardLayout>
      <Box className="mb-6 flex justify-between items-center">
        <Typography variant="h4" className="font-bold">
          داشبورد
        </Typography>
        <Tooltip title="بارگذاری مجدد">
          <IconButton onClick={refreshData}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} className="mb-6">
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="p-4 h-full">
            <Box className="flex justify-between items-center">
              <Typography variant="h6" color="text.secondary">
                پارکینگ‌ها
              </Typography>
              <Avatar className="bg-primary">
                <LocalParkingIcon />
              </Avatar>
            </Box>
            {loadingParkingLots ? (
              <CircularProgress size={24} className="my-2" />
            ) : (
              <Typography variant="h4" className="mt-2 font-bold">
                {stats.parkingLotCount}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary">
              مجموع پارکینگ‌های فعال
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper className="p-4 h-full">
            <Box className="flex justify-between items-center">
              <Typography variant="h6" color="text.secondary">
                خودروها
              </Typography>
              <Avatar className="bg-secondary">
                <DirectionsCarIcon />
              </Avatar>
            </Box>
            {loadingVehicles ? (
              <CircularProgress size={24} className="my-2" />
            ) : (
              <Typography variant="h4" className="mt-2 font-bold">
                {stats.vehicleCount}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary">
              مجموع خودروهای ثبت شده
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper className="p-4 h-full">
            <Box className="flex justify-between items-center">
              <Typography variant="h6" color="text.secondary">
                رزروها
              </Typography>
              <Avatar className="bg-success-light">
                <PaymentIcon />
              </Avatar>
            </Box>
            {loadingReservations ? (
              <CircularProgress size={24} className="my-2" />
            ) : (
              <Typography variant="h4" className="mt-2 font-bold">
                {stats.reservationCount}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary">
              مجموع رزروهای ثبت شده
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper className="p-4 h-full">
            <Box className="flex justify-between items-center">
              <Typography variant="h6" color="text.secondary">
                کاربران
              </Typography>
              <Avatar className="bg-warning-light">
                <PeopleIcon />
              </Avatar>
            </Box>
            {loadingUsers ? (
              <CircularProgress size={24} className="my-2" />
            ) : (
              <Typography variant="h4" className="mt-2 font-bold">
                {stats.userCount}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary">
              مجموع کاربران ثبت شده
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader
              title="درآمد ماهانه"
              action={
                <IconButton>
                  <MoreVertIcon />
                </IconButton>
              }
            />
            <CardContent>
              <Box className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={revenueData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip formatter={(value) => `${value.toLocaleString()} تومان`} />
                    <Legend />
                    <Bar dataKey="amount" name="درآمد (تومان)" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader
              title="نوع جلسات پارک"
              action={
                <IconButton>
                  <MoreVertIcon />
                </IconButton>
              }
            />
            <CardContent>
              <Box className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sessionTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sessionTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip formatter={(value) => `${value} جلسه`} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="نرخ اشغال پارکینگ‌ها"
              action={
                <IconButton>
                  <MoreVertIcon />
                </IconButton>
              }
            />
            <CardContent>
              <Box className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={occupancyData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <ChartTooltip formatter={(value) => `${value}%`} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="rate"
                      name="درصد اشغال"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
}