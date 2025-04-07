'use client';

import { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Chip,
  Grid,
  Paper,
  Button,
  TextField,
  Avatar,
  Tab,
  Tabs,
  IconButton,
  Divider,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListItemIcon,
} from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import useApi from '@/hooks/useApi';
import useAuth from '@/hooks/useAuth';
import api from '@/utils/api';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import EditIcon from '@mui/icons-material/Edit';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';
import { fa } from 'date-fns/locale';
import { useForm, Controller } from 'react-hook-form';

export default function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isVehicleDialogOpen, setIsVehicleDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const { data: userVehicles, loading: loadingVehicles, execute: fetchUserVehicles } = useApi(
    () => api.getUserVehicles(user?.id),
    !!user
  );

  const { data: parkingReservations, loading: loadingReservations, execute: fetchReservations } = useApi(
    () => api.getParkingReservations({ user: user?.id }),
    !!user
  );

  const { data: parkingSessions, loading: loadingSessions, execute: fetchSessions } = useApi(
    () => api.getParkingSessions({ user: user?.id }),
    !!user
  );

  const { data: invoices, loading: loadingInvoices, execute: fetchInvoices } = useApi(
    () => api.getInvoices({ user: user?.id }),
    !!user
  );

  const { data: subscriptions, loading: loadingSubscriptions, execute: fetchSubscriptions } = useApi(
    () => api.getSubscriptions({ user: user?.id }),
    !!user
  );

  const { execute: updateUserProfile } = useApi(
    (id, data) => api.updateUser(id, data)
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      first_name: '',
      last_name: '',
      phone_number: '',
      email: '',
      date_of_birth: '',
      national_id: '',
      address: '',
    },
  });

  // Set form default values when user data is available
  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone_number: user.phone_number || '',
        email: user.email || '',
        date_of_birth: user.date_of_birth || '',
        national_id: user.national_id || '',
        address: user.address || '',
      });
    }
  }, [user, reset]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSaveProfile = async (data) => {
    if (!user) return;

    try {
      setSaving(true);
      setError(null);

      // Remove email as it shouldn't be updated
      const { email, ...updateData } = data;

      await updateUserProfile(user.id, updateData);

      setSuccessMessage('اطلاعات پروفایل با موفقیت بروزرسانی شد.');
      setIsEditMode(false);

      // In a real app, we'd refresh the user data in the auth context
      // For now, we'll just wait and hide the success message
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('خطا در بروزرسانی اطلاعات. لطفاً دوباره تلاش کنید.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = (data) => {
    // In a real app, implement password change functionality
    console.log('Change password data:', data);
    setIsPasswordDialogOpen(false);
  };

  const handleAddVehicle = (data) => {
    // In a real app, implement add vehicle functionality
    console.log('Add vehicle data:', data);
    setIsVehicleDialogOpen(false);
    fetchUserVehicles();
  };

  return (
    <DashboardLayout>
      <Box className="mb-6">
        <Typography variant="h4" className="font-bold">
          پروفایل کاربری
        </Typography>
        <Typography variant="body1" color="text.secondary">
          مشاهده و ویرایش اطلاعات شخصی، خودروها، و سوابق پارکینگ
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Profile sidebar */}
        <Grid item xs={12} md={4}>
          <Paper className="p-6 text-center">
            <Box className="relative inline-block mb-4">
              <Avatar
                src={user?.profile_image}
                alt={user?.first_name}
                className="w-32 h-32 mx-auto border-4 border-white shadow-lg"
                sx={{ width: 128, height: 128 }}
              >
                {user?.first_name?.charAt(0) || 'U'}
              </Avatar>
              <IconButton
                className="absolute bottom-0 right-0 bg-white shadow"
                size="small"
              >
                <CameraAltIcon fontSize="small" />
              </IconButton>
            </Box>

            <Typography variant="h5" className="font-bold">
              {user ? `${user.first_name} ${user.last_name}` : 'کاربر'}
            </Typography>
            <Typography variant="body1" color="text.secondary" className="mb-4">
              {user?.email || 'بدون ایمیل'}
            </Typography>

            <Chip
              icon={<CardMembershipIcon />}
              label={user?.role === 'admin' ? 'مدیر سیستم' : user?.role === 'parking_manager' ? 'مدیر پارکینگ' : 'مشتری'}
              color={user?.role === 'admin' ? 'error' : user?.role === 'parking_manager' ? 'primary' : 'default'}
              className="mb-4"
            />

            <Divider className="my-4" />

            <Box className="text-center">
              <Typography variant="body2" color="text.secondary" className="mb-1">
                تاریخ عضویت
              </Typography>
              <Typography variant="body1">
                {user?.created_at
                  ? format(new Date(user.created_at), 'yyyy/MM/dd', { locale: fa })
                  : 'نامشخص'}
              </Typography>
            </Box>

            <Divider className="my-4" />

            <Box className="space-y-2">
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                onClick={() => setIsPasswordDialogOpen(true)}
              >
                تغییر رمز عبور
              </Button>

              {!isEditMode ? (
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditMode(true)}
                >
                  ویرایش پروفایل
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  onClick={() => {
                    setIsEditMode(false);
                    // Reset form to original values
                    if (user) {
                      reset({
                        first_name: user.first_name || '',
                        last_name: user.last_name || '',
                        phone_number: user.phone_number || '',
                        email: user.email || '',
                        date_of_birth: user.date_of_birth || '',
                        national_id: user.national_id || '',
                        address: user.address || '',
                      });
                    }
                  }}
                >
                  انصراف
                </Button>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Profile content */}
        <Grid item xs={12} md={8}>
          <Paper className="p-6">
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              className="mb-4"
            >
              <Tab label="اطلاعات شخصی" />
              <Tab label="خودروهای من" />
              <Tab label="سوابق پارکینگ" />
              <Tab label="اشتراک‌ها" />
              <Tab label="فاکتورها" />
            </Tabs>

            {/* Personal Info Tab */}
            {activeTab === 0 && (
              <Box>
                {successMessage && (
                  <Alert severity="success" className="mb-4">
                    {successMessage}
                  </Alert>
                )}

                {error && (
                  <Alert severity="error" className="mb-4">
                    {error}
                  </Alert>
                )}

                <form onSubmit={handleSubmit(handleSaveProfile)}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="first_name"
                        control={control}
                        rules={{ required: 'نام الزامی است' }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="نام"
                            fullWidth
                            disabled={!isEditMode || saving}
                            error={!!errors.first_name}
                            helperText={errors.first_name?.message}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="last_name"
                        control={control}
                        rules={{ required: 'نام خانوادگی الزامی است' }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="نام خانوادگی"
                            fullWidth
                            disabled={!isEditMode || saving}
                            error={!!errors.last_name}
                            helperText={errors.last_name?.message}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="ایمیل"
                            fullWidth
                            disabled={true} // Email cannot be changed
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="phone_number"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="شماره تلفن"
                            fullWidth
                            disabled={!isEditMode || saving}
                            error={!!errors.phone_number}
                            helperText={errors.phone_number?.message}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="national_id"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="کد ملی"
                            fullWidth
                            disabled={!isEditMode || saving}
                            error={!!errors.national_id}
                            helperText={errors.national_id?.message}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="date_of_birth"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="تاریخ تولد"
                            type="date"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            disabled={!isEditMode || saving}
                            error={!!errors.date_of_birth}
                            helperText={errors.date_of_birth?.message}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Controller
                        name="address"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="آدرس"
                            fullWidth
                            multiline
                            rows={3}
                            disabled={!isEditMode || saving}
                            error={!!errors.address}
                            helperText={errors.address?.message}
                          />
                        )}
                      />
                    </Grid>

                    {isEditMode && (
                      <Grid item xs={12} className="flex justify-end">
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          disabled={saving}
                          startIcon={saving ? <CircularProgress size={20} /> : null}
                        >
                          ذخیره تغییرات
                        </Button>
                      </Grid>
                    )}
                  </Grid>
                </form>
              </Box>
            )}

            {/* Vehicles Tab */}
            {activeTab === 1 && (
              <Box>
                <Box className="flex justify-between items-center mb-4">
                  <Typography variant="h6">خودروهای من</Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<DirectionsCarIcon />}
                    onClick={() => setIsVehicleDialogOpen(true)}
                  >
                    افزودن خودرو
                  </Button>
                </Box>

                {loadingVehicles ? (
                  <Box className="py-8 text-center">
                    <CircularProgress />
                  </Box>
                ) : userVehicles?.results?.length > 0 ? (
                  <Grid container spacing={3}>
                    {userVehicles.results.map((vehicle) => (
                      <Grid item xs={12} sm={6} key={vehicle.id}>
                        <Card>
                          <CardContent>
                            <Box className="flex items-center mb-2">
                              <DirectionsCarIcon className="ml-2" color="primary" />
                              <Typography variant="h6">
                                {vehicle.make} {vehicle.model}
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" className="mb-1">
                              پلاک: {vehicle.license_plate}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" className="mb-1">
                              رنگ: {vehicle.color || 'نامشخص'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              سال: {vehicle.year || 'نامشخص'}
                            </Typography>

                            <Box className="mt-2">
                              {vehicle.is_verified ? (
                                <Chip
                                  label="تأیید شده"
                                  color="success"
                                  size="small"
                                />
                              ) : (
                                <Chip
                                  label="در انتظار تأیید"
                                  variant="outlined"
                                  color="warning"
                                  size="small"
                                />
                              )}
                            </Box>
                          </CardContent>
                          <CardActions>
                            <Button size="small" startIcon={<EditIcon />}>
                              ویرایش
                            </Button>
                            <Button size="small" color="error" startIcon={<DeleteIcon />}>
                              حذف
                            </Button>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box className="py-8 text-center bg-gray-50 rounded">
                    <DirectionsCarIcon fontSize="large" color="disabled" />
                    <Typography className="mt-2" color="text.secondary">
                      هیچ خودرویی ثبت نشده است. خودروی خود را اضافه کنید.
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            {/* Parking History Tab */}
            {activeTab === 2 && (
              <Box>
                <Typography variant="h6" className="mb-4">سوابق پارکینگ</Typography>

                <Box className="mb-6">
                  <Typography variant="subtitle1" className="mb-3">
                    رزروهای اخیر
                  </Typography>

                  {loadingReservations ? (
                    <Box className="py-4 text-center">
                      <CircularProgress size={30} />
                    </Box>
                  ) : parkingReservations?.results?.length > 0 ? (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>پارکینگ</TableCell>
                            <TableCell>تاریخ</TableCell>
                            <TableCell>وضعیت</TableCell>
                            <TableCell>مبلغ</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {parkingReservations.results.slice(0, 5).map((reservation) => (
                            <TableRow key={reservation.id}>
                              <TableCell>{reservation.parking_name}</TableCell>
                              <TableCell>
                                {format(new Date(reservation.reservation_start), 'yyyy/MM/dd', { locale: fa })}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={
                                    reservation.status === 'completed' ? 'تکمیل شده' :
                                    reservation.status === 'confirmed' ? 'تأیید شده' :
                                    reservation.status === 'pending' ? 'در انتظار تأیید' :
                                    reservation.status === 'cancelled' ? 'لغو شده' :
                                    reservation.status
                                  }
                                  color={
                                    reservation.status === 'completed' ? 'success' :
                                    reservation.status === 'confirmed' ? 'primary' :
                                    reservation.status === 'pending' ? 'warning' :
                                    reservation.status === 'cancelled' ? 'error' :
                                    'default'
                                  }
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                {reservation.amount_paid
                                  ? `${Number(reservation.amount_paid).toLocaleString()} تومان`
                                  : 'پرداخت نشده'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Box className="py-4 text-center bg-gray-50 rounded">
                      <Typography color="text.secondary">
                        هیچ سابقه رزروی یافت نشد.
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Divider className="my-4" />

                <Box>
                  <Typography variant="subtitle1" className="mb-3">
                    جلسات پارک اخیر
                  </Typography>

                  {loadingSessions ? (
                    <Box className="py-4 text-center">
                      <CircularProgress size={30} />
                    </Box>
                  ) : parkingSessions?.results?.length > 0 ? (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>پارکینگ</TableCell>
                            <TableCell>تاریخ ورود</TableCell>
                            <TableCell>تاریخ خروج</TableCell>
                            <TableCell>مدت توقف</TableCell>
                            <TableCell>مبلغ</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {parkingSessions.results.slice(0, 5).map((session) => (
                            <TableRow key={session.id}>
                              <TableCell>{session.parking_lot_name}</TableCell>
                              <TableCell>
                                {format(new Date(session.entry_time), 'yyyy/MM/dd HH:mm', { locale: fa })}
                              </TableCell>
                              <TableCell>
                                {session.exit_time
                                  ? format(new Date(session.exit_time), 'yyyy/MM/dd HH:mm', { locale: fa })
                                  : 'هنوز خارج نشده'}
                              </TableCell>
                              <TableCell>{session.duration || '-'}</TableCell>
                              <TableCell>
                                {session.amount_due
                                  ? `${Number(session.amount_due).toLocaleString()} تومان`
                                  : '-'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Box className="py-4 text-center bg-gray-50 rounded">
                      <Typography color="text.secondary">
                        هیچ سابقه پارکی یافت نشد.
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            )}

            {/* Subscriptions Tab */}
            {activeTab === 3 && (
              <Box>
                <Typography variant="h6" className="mb-4">اشتراک‌های من</Typography>

                {loadingSubscriptions ? (
                  <Box className="py-8 text-center">
                    <CircularProgress />
                  </Box>
                ) : subscriptions?.results?.length > 0 ? (
                  <Grid container spacing={3}>
                    {subscriptions.results.map((subscription) => (
                      <Grid item xs={12} sm={6} key={subscription.id}>
                        <Card className={subscription.is_active ? 'border-2 border-green-500' : ''}>
                          <CardContent>
                            <Box className="flex justify-between items-start mb-2">
                              <Box className="flex items-center">
                                <CardMembershipIcon className="ml-2" color="primary" />
                                <Typography variant="h6">
                                  اشتراک {
                                    subscription.subscription_type === 'basic' ? 'پایه' :
                                    subscription.subscription_type === 'premium' ? 'ویژه' :
                                    subscription.subscription_type === 'vip' ? 'VIP' :
                                    subscription.subscription_type
                                  }
                                </Typography>
                              </Box>
                              <Chip
                                label={subscription.is_active ? 'فعال' : 'غیرفعال'}
                                color={subscription.is_active ? 'success' : 'default'}
                                size="small"
                              />
                            </Box>

                            <Typography variant="body2" color="text.secondary" className="mb-1">
                              دوره: {
                                subscription.period === 'monthly' ? 'ماهانه' :
                                subscription.period === 'quarterly' ? 'سه ماهه' :
                                subscription.period === 'yearly' ? 'سالانه' :
                                subscription.period
                              }
                            </Typography>

                            <Box className="flex justify-between mt-3">
                              <Typography variant="body2" color="text.secondary">
                                تاریخ شروع
                              </Typography>
                              <Typography variant="body2">
                                {format(new Date(subscription.start_date), 'yyyy/MM/dd', { locale: fa })}
                              </Typography>
                            </Box>

                            <Box className="flex justify-between">
                              <Typography variant="body2" color="text.secondary">
                                تاریخ پایان
                              </Typography>
                              <Typography variant="body2">
                                {format(new Date(subscription.end_date), 'yyyy/MM/dd', { locale: fa })}
                              </Typography>
                            </Box>

                            <Box className="flex justify-between">
                              <Typography variant="body2" color="text.secondary">
                                مبلغ
                              </Typography>
                              <Typography variant="body2">
                                {Number(subscription.amount).toLocaleString()} تومان
                              </Typography>
                            </Box>

                            <Box className="flex justify-between">
                              <Typography variant="body2" color="text.secondary">
                                تمدید خودکار
                              </Typography>
                              <Typography variant="body2">
                                {subscription.auto_renew ? 'فعال' : 'غیرفعال'}
                              </Typography>
                            </Box>
                          </CardContent>

                          <CardActions>
                            {subscription.is_active && (
                              <Button size="small" color="primary">
                                تمدید
                              </Button>
                            )}
                            {subscription.auto_renew && (
                              <Button size="small" color="warning">
                                لغو تمدید خودکار
                              </Button>
                            )}
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box className="py-8 text-center bg-gray-50 rounded">
                    <CardMembershipIcon fontSize="large" color="disabled" />
                    <Typography className="mt-2" color="text.secondary">
                      هیچ اشتراک فعالی ندارید. اشتراک جدید تهیه کنید.
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      className="mt-3"
                      onClick={() => window.location.href = '/payments/subscriptions'}
                    >
                      مشاهده طرح‌های اشتراک
                    </Button>
                  </Box>
                )}
              </Box>
            )}

            {/* Invoices Tab */}
            {activeTab === 4 && (
              <Box>
                <Typography variant="h6" className="mb-4">فاکتورهای من</Typography>

                {loadingInvoices ? (
                  <Box className="py-8 text-center">
                    <CircularProgress />
                  </Box>
                ) : invoices?.results?.length > 0 ? (
                  <List className="p-0">
                    {invoices.results.map((invoice) => (
                      <Paper key={invoice.id} className="mb-3">
                        <ListItem>
                          <ListItemIcon>
                            <ReceiptIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={`فاکتور شماره ${invoice.invoice_number}`}
                            secondary={
                              <Box className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-1">
                                <Typography variant="body2" component="span">
                                  تاریخ: {format(new Date(invoice.created_at), 'yyyy/MM/dd', { locale: fa })}
                                </Typography>
                                <Typography variant="body2" component="span" className="font-bold">
                                  مبلغ: {Number(invoice.total_amount).toLocaleString()} تومان
                                </Typography>
                              </Box>
                            }
                          />
                          <ListItemSecondaryAction>
                            <Box className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                              <Chip
                                label={invoice.is_paid ? 'پرداخت شده' : 'پرداخت نشده'}
                                color={invoice.is_paid ? 'success' : 'warning'}
                                size="small"
                              />
                              <Button
                                size="small"
                                startIcon={<ReceiptIcon />}
                                onClick={() => alert('مشاهده فاکتور')}
                              >
                                مشاهده
                              </Button>
                            </Box>
                          </ListItemSecondaryAction>
                        </ListItem>
                      </Paper>
                    ))}
                  </List>
                ) : (
                  <Box className="py-8 text-center bg-gray-50 rounded">
                    <ReceiptIcon fontSize="large" color="disabled" />
                    <Typography className="mt-2" color="text.secondary">
                      هیچ فاکتوری یافت نشد.
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Password Change Dialog */}
      <Dialog
        open={isPasswordDialogOpen}
        onClose={() => setIsPasswordDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>تغییر رمز عبور</DialogTitle>
        <DialogContent>
          <Box className="mt-2">
            <TextField
              label="رمز عبور فعلی"
              type="password"
              fullWidth
              className="mb-4"
            />
            <TextField
              label="رمز عبور جدید"
              type="password"
              fullWidth
              className="mb-4"
            />
            <TextField
              label="تأیید رمز عبور جدید"
              type="password"
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsPasswordDialogOpen(false)}>
            انصراف
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleChangePassword}
          >
            تغییر رمز عبور
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Vehicle Dialog */}
      <Dialog
        open={isVehicleDialogOpen}
        onClose={() => setIsVehicleDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>افزودن خودرو جدید</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} className="mt-1">
            <Grid item xs={12} sm={6}>
              <TextField
                label="شماره پلاک"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="نوع خودرو"
                select
                fullWidth
                defaultValue="sedan"
              >
                <MenuItem value="sedan">سواری</MenuItem>
                <MenuItem value="suv">شاسی بلند</MenuItem>
                <MenuItem value="hatchback">هاچبک</MenuItem>
                <MenuItem value="pickup">وانت</MenuItem>
                <MenuItem value="van">ون</MenuItem>
                <MenuItem value="truck">کامیون</MenuItem>
                <MenuItem value="motorcycle">موتورسیکلت</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="سازنده"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="مدل"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="سال تولید"
                fullWidth
                type="number"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="رنگ"
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsVehicleDialogOpen(false)}>
            انصراف
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DirectionsCarIcon />}
            onClick={handleAddVehicle}
          >
            افزودن خودرو
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}