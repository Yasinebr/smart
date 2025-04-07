'use client';

import { useState } from 'react';
import {
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import PaymentIcon from '@mui/icons-material/Payment';
import BackupIcon from '@mui/icons-material/Backup';
import SecurityIcon from '@mui/icons-material/Security';
import LanguageIcon from '@mui/icons-material/Language';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SmsIcon from '@mui/icons-material/Sms';
import DataSaverOnIcon from '@mui/icons-material/DataSaverOn';
import useAuth from '@/hooks/useAuth';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [isBackupDialogOpen, setIsBackupDialogOpen] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [testSmsNumber, setTestSmsNumber] = useState('');
  const [smsSent, setSmsSent] = useState(false);

  // General system settings
  const [generalSettings, setGeneralSettings] = useState({
    systemName: 'سیستم پارکینگ هوشمند',
    adminEmail: 'admin@example.com',
    supportEmail: 'support@example.com',
    supportPhone: '021-12345678',
    language: 'fa',
    timezone: 'Asia/Tehran',
    maintenanceMode: false,
  });

  // Parking settings
  const [parkingSettings, setParkingtings] = useState({
    allowOvertime: true,
    overtimeFee: 10, // درصد
    reservationCancellationFee: 10, // درصد
    slotReservationTimeout: 30, // دقیقه
    enableZoneBasedPricing: true,
    defaultHourlyRate: 10000, // تومان
    defaultDailyRate: 50000, // تومان
    defaultMonthlyRate: 1000000, // تومان
    taxRate: 9, // درصد
  });

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    requireEmailVerification: true,
    passwordMinLength: 8,
    passwordRequireSpecialChars: true,
    passwordRequireNumbers: true,
    sessionTimeout: 120, // دقیقه
    maxLoginAttempts: 5,
    twoFactorAuth: false,
    apiKey: 'sk_live_51KjJkwL6brTpB7XgvRmdBGxhg0V8vXCMmQVCNa9ZQ0nCOvTAqSH1J8Yjy',
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: false,
    adminNotifyNewReservations: true,
    adminNotifyPayments: true,
    userNotifyReservationConfirmation: true,
    userNotifyReservationReminder: true,
    userNotifyPaymentConfirmation: true,
    reminderTimeBeforeReservation: 60, // دقیقه
  });

  // Payment gateway settings
  const [paymentSettings, setPaymentSettings] = useState({
    paymentGateway: 'zarinpal',
    merchantId: 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX',
    currencyCode: 'IRR',
    autoConfirmPayments: true,
    paymentExpiryMinutes: 30,
    allowPartialPayments: false,
  });

  // Backup settings
  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily', // daily, weekly, monthly
    backupTime: '03:00',
    backupRetentionDays: 30,
    backupLocation: 'local', // local, cloud
    excludeImages: false,
  });

  // SMS provider settings
  const [smsSettings, setSmsSettings] = useState({
    smsProvider: 'kavenegar',
    apiKey: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    senderNumber: '10008663',
    usernameTemplate: '%USERNAME%',
    reservationCodeTemplate: '%CODE%',
    enabled: true,
  });

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle general settings changes
  const handleGeneralSettingChange = (event) => {
    const { name, value, checked } = event.target;
    setGeneralSettings({
      ...generalSettings,
      [name]: event.target.type === 'checkbox' ? checked : value,
    });
  };

  // Handle parking settings changes
  const handleParkingSettingChange = (event) => {
    const { name, value, checked } = event.target;
    setParkingtings({
      ...parkingSettings,
      [name]: event.target.type === 'checkbox' ? checked : value,
    });
  };

  // Handle security settings changes
  const handleSecuritySettingChange = (event) => {
    const { name, value, checked } = event.target;
    setSecuritySettings({
      ...securitySettings,
      [name]: event.target.type === 'checkbox' ? checked : value,
    });
  };

  // Handle notification settings changes
  const handleNotificationSettingChange = (event) => {
    const { name, value, checked } = event.target;
    setNotificationSettings({
      ...notificationSettings,
      [name]: event.target.type === 'checkbox' ? checked : value,
    });
  };

  // Handle payment settings changes
  const handlePaymentSettingChange = (event) => {
    const { name, value, checked } = event.target;
    setPaymentSettings({
      ...paymentSettings,
      [name]: event.target.type === 'checkbox' ? checked : value,
    });
  };

  // Handle backup settings changes
  const handleBackupSettingChange = (event) => {
    const { name, value, checked } = event.target;
    setBackupSettings({
      ...backupSettings,
      [name]: event.target.type === 'checkbox' ? checked : value,
    });
  };

  // Handle SMS settings changes
  const handleSmsSettingChange = (event) => {
    const { name, value, checked } = event.target;
    setSmsSettings({
      ...smsSettings,
      [name]: event.target.type === 'checkbox' ? checked : value,
    });
  };

  // Handle save settings
  const handleSaveSettings = () => {
    setSaving(true);
    setError(null);

    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }, 1000);
  };

  // Handle sending test SMS
  const handleSendTestSms = () => {
    if (!testSmsNumber) {
      setError('شماره موبایل برای ارسال پیامک تست وارد نشده است.');
      return;
    }

    // Simulate sending SMS
    setSaving(true);
    setError(null);

    setTimeout(() => {
      setSaving(false);
      setSmsSent(true);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSmsSent(false);
      }, 3000);
    }, 1500);
  };

  // Handle backup now
  const handleBackupNow = () => {
    setBackupLoading(true);

    // Simulate backup
    setTimeout(() => {
      setBackupLoading(false);
      setIsBackupDialogOpen(false);
      setSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }, 2000);
  };

  // Check if user has admin rights
  const isAdmin = user?.role === 'admin';

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <Box className="p-8 text-center">
          <Alert severity="warning">
            شما دسترسی لازم برای مشاهده این صفحه را ندارید. این صفحه فقط برای مدیران سیستم قابل دسترسی است.
          </Alert>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box className="mb-6">
        <Typography variant="h4" className="font-bold">
          تنظیمات سیستم
        </Typography>
        <Typography variant="body1" color="text.secondary">
          مدیریت تنظیمات کلی سیستم، امنیت، پرداخت و اعلان‌ها
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Settings sidebar */}
        <Grid item xs={12} md={3}>
          <Paper className="overflow-hidden">
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              orientation="vertical"
              variant="scrollable"
              className="border-l"
            >
              <Tab
                label="تنظیمات عمومی"
                icon={<LanguageIcon />}
                iconPosition="start"
                className="h-14 flex items-center justify-start pl-4"
              />
              <Tab
                label="تنظیمات پارکینگ"
                icon={<LocalParkingIcon />}
                iconPosition="start"
                className="h-14 flex items-center justify-start pl-4"
              />
              <Tab
                label="امنیت"
                icon={<SecurityIcon />}
                iconPosition="start"
                className="h-14 flex items-center justify-start pl-4"
              />
              <Tab
                label="اعلان‌ها"
                icon={<NotificationsIcon />}
                iconPosition="start"
                className="h-14 flex items-center justify-start pl-4"
              />
              <Tab
                label="درگاه پرداخت"
                icon={<PaymentIcon />}
                iconPosition="start"
                className="h-14 flex items-center justify-start pl-4"
              />
              <Tab
                label="پشتیبان‌گیری"
                icon={<BackupIcon />}
                iconPosition="start"
                className="h-14 flex items-center justify-start pl-4"
              />
              <Tab
                label="پیامک"
                icon={<SmsIcon />}
                iconPosition="start"
                className="h-14 flex items-center justify-start pl-4"
              />
            </Tabs>
          </Paper>
        </Grid>

        {/* Settings content */}
        <Grid item xs={12} md={9}>
          <Paper className="p-6">
            {error && (
              <Alert severity="error" className="mb-4">
                {error}
              </Alert>
            )}

            {/* General Settings */}
            {activeTab === 0 && (
              <Box>
                <Typography variant="h6" className="mb-4">تنظیمات عمومی</Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="نام سیستم"
                      name="systemName"
                      value={generalSettings.systemName}
                      onChange={handleGeneralSettingChange}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="ایمیل مدیر سیستم"
                      name="adminEmail"
                      type="email"
                      value={generalSettings.adminEmail}
                      onChange={handleGeneralSettingChange}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="ایمیل پشتیبانی"
                      name="supportEmail"
                      type="email"
                      value={generalSettings.supportEmail}
                      onChange={handleGeneralSettingChange}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="شماره تلفن پشتیبانی"
                      name="supportPhone"
                      value={generalSettings.supportPhone}
                      onChange={handleGeneralSettingChange}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel id="language-label">زبان پیش‌فرض</InputLabel>
                      <Select
                        labelId="language-label"
                        name="language"
                        value={generalSettings.language}
                        onChange={handleGeneralSettingChange}
                        label="زبان پیش‌فرض"
                      >
                        <MenuItem value="fa">فارسی</MenuItem>
                        <MenuItem value="en">انگلیسی</MenuItem>
                        <MenuItem value="ar">عربی</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel id="timezone-label">منطقه زمانی</InputLabel>
                      <Select
                        labelId="timezone-label"
                        name="timezone"
                        value={generalSettings.timezone}
                        onChange={handleGeneralSettingChange}
                        label="منطقه زمانی"
                      >
                        <MenuItem value="Asia/Tehran">تهران (GMT+3:30)</MenuItem>
                        <MenuItem value="Asia/Dubai">دبی (GMT+4:00)</MenuItem>
                        <MenuItem value="Europe/Istanbul">استانبول (GMT+3:00)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="maintenanceMode"
                          checked={generalSettings.maintenanceMode}
                          onChange={handleGeneralSettingChange}
                        />
                      }
                      label="حالت تعمیر و نگهداری (سایت برای کاربران غیر مدیر غیرقابل دسترس خواهد بود)"
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Parking Settings */}
            {activeTab === 1 && (
              <Box>
                <Typography variant="h6" className="mb-4">تنظیمات پارکینگ</Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="نرخ ساعتی پیش‌فرض (تومان)"
                      name="defaultHourlyRate"
                      type="number"
                      value={parkingSettings.defaultHourlyRate}
                      onChange={handleParkingSettingChange}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="نرخ روزانه پیش‌فرض (تومان)"
                      name="defaultDailyRate"
                      type="number"
                      value={parkingSettings.defaultDailyRate}
                      onChange={handleParkingSettingChange}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="نرخ ماهانه پیش‌فرض (تومان)"
                      name="defaultMonthlyRate"
                      type="number"
                      value={parkingSettings.defaultMonthlyRate}
                      onChange={handleParkingSettingChange}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="نرخ مالیات (درصد)"
                      name="taxRate"
                      type="number"
                      value={parkingSettings.taxRate}
                      onChange={handleParkingSettingChange}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="جریمه دیرکرد (درصد)"
                      name="overtimeFee"
                      type="number"
                      value={parkingSettings.overtimeFee}
                      onChange={handleParkingSettingChange}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="جریمه لغو رزرو (درصد)"
                      name="reservationCancellationFee"
                      type="number"
                      value={parkingSettings.reservationCancellationFee}
                      onChange={handleParkingSettingChange}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="زمان انقضای رزرو (دقیقه)"
                      name="slotReservationTimeout"
                      type="number"
                      value={parkingSettings.slotReservationTimeout}
                      onChange={handleParkingSettingChange}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider className="my-2" />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="allowOvertime"
                          checked={parkingSettings.allowOvertime}
                          onChange={handleParkingSettingChange}
                        />
                      }
                      label="اجازه اضافه‌ماندن (با پرداخت جریمه)"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="enableZoneBasedPricing"
                          checked={parkingSettings.enableZoneBasedPricing}
                          onChange={handleParkingSettingChange}
                        />
                      }
                      label="فعال‌سازی قیمت‌گذاری بر اساس زون"
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Security Settings */}
            {activeTab === 2 && (
              <Box>
                <Typography variant="h6" className="mb-4">تنظیمات امنیتی</Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="حداقل طول رمز عبور"
                      name="passwordMinLength"
                      type="number"
                      value={securitySettings.passwordMinLength}
                      onChange={handleSecuritySettingChange}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="زمان انقضای نشست (دقیقه)"
                      name="sessionTimeout"
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={handleSecuritySettingChange}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="حداکثر تلاش‌های ورود ناموفق"
                      name="maxLoginAttempts"
                      type="number"
                      value={securitySettings.maxLoginAttempts}
                      onChange={handleSecuritySettingChange}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="کلید API"
                      name="apiKey"
                      type={showApiKey ? 'text' : 'password'}
                      value={securitySettings.apiKey}
                      onChange={handleSecuritySettingChange}
                      fullWidth
                      InputProps={{
                        endAdornment: (
                          <Button
                            onClick={() => setShowApiKey(!showApiKey)}
                            size="small"
                          >
                            {showApiKey ? 'مخفی کردن' : 'نمایش'}
                          </Button>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider className="my-2" />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="requireEmailVerification"
                          checked={securitySettings.requireEmailVerification}
                          onChange={handleSecuritySettingChange}
                        />
                      }
                      label="نیاز به تأیید ایمیل برای ثبت‌نام"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="passwordRequireSpecialChars"
                          checked={securitySettings.passwordRequireSpecialChars}
                          onChange={handleSecuritySettingChange}
                        />
                      }
                      label="نیاز به کاراکترهای خاص در رمز عبور"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="passwordRequireNumbers"
                          checked={securitySettings.passwordRequireNumbers}
                          onChange={handleSecuritySettingChange}
                        />
                      }
                      label="نیاز به اعداد در رمز عبور"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="twoFactorAuth"
                          checked={securitySettings.twoFactorAuth}
                          onChange={handleSecuritySettingChange}
                        />
                      }
                      label="فعال‌سازی احراز هویت دو مرحله‌ای"
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Notification Settings */}
            {activeTab === 3 && (
              <Box>
                <Typography variant="h6" className="mb-4">تنظیمات اعلان‌ها</Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="زمان یادآوری قبل از رزرو (دقیقه)"
                      name="reminderTimeBeforeReservation"
                      type="number"
                      value={notificationSettings.reminderTimeBeforeReservation}
                      onChange={handleNotificationSettingChange}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider className="my-2" />
                    <Typography variant="subtitle1" className="mb-2 mt-3">کانال‌های اعلان</Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="emailNotifications"
                          checked={notificationSettings.emailNotifications}
                          onChange={handleNotificationSettingChange}
                        />
                      }
                      label="اعلان‌های ایمیلی"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="smsNotifications"
                          checked={notificationSettings.smsNotifications}
                          onChange={handleNotificationSettingChange}
                        />
                      }
                      label="اعلان‌های پیامکی"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="pushNotifications"
                          checked={notificationSettings.pushNotifications}
                          onChange={handleNotificationSettingChange}
                        />
                      }
                      label="اعلان‌های پوش (برای اپلیکیشن موبایل)"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider className="my-2" />
                    <Typography variant="subtitle1" className="mb-2 mt-3">اعلان‌های مدیر</Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="adminNotifyNewReservations"
                          checked={notificationSettings.adminNotifyNewReservations}
                          onChange={handleNotificationSettingChange}
                        />
                      }
                      label="اعلان رزروهای جدید به مدیر"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="adminNotifyPayments"
                          checked={notificationSettings.adminNotifyPayments}
                          onChange={handleNotificationSettingChange}
                        />
                      }
                      label="اعلان پرداخت‌های جدید به مدیر"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider className="my-2" />
                    <Typography variant="subtitle1" className="mb-2 mt-3">اعلان‌های کاربر</Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="userNotifyReservationConfirmation"
                          checked={notificationSettings.userNotifyReservationConfirmation}
                          onChange={handleNotificationSettingChange}
                        />
                      }
                      label="اعلان تأیید رزرو به کاربر"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="userNotifyReservationReminder"
                          checked={notificationSettings.userNotifyReservationReminder}
                          onChange={handleNotificationSettingChange}
                        />
                      }
                      label="یادآوری رزرو به کاربر"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="userNotifyPaymentConfirmation"
                          checked={notificationSettings.userNotifyPaymentConfirmation}
                          onChange={handleNotificationSettingChange}
                        />
                      }
                      label="اعلان تأیید پرداخت به کاربر"
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Payment Gateway Settings */}
            {activeTab === 4 && (
              <Box>
                <Typography variant="h6" className="mb-4">تنظیمات درگاه پرداخت</Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel id="payment-gateway-label">درگاه پرداخت</InputLabel>
                      <Select
                        labelId="payment-gateway-label"
                        name="paymentGateway"
                        value={paymentSettings.paymentGateway}
                        onChange={handlePaymentSettingChange}
                        label="درگاه پرداخت"
                      >
                        <MenuItem value="zarinpal">زرین‌پال</MenuItem>
                        <MenuItem value="idpay">آیدی پی</MenuItem>
                        <MenuItem value="payping">پی‌پینگ</MenuItem>
                        <MenuItem value="sep">سپ (بانک سامان)</MenuItem>
                        <MenuItem value="mellat">به پرداخت (بانک ملت)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="شناسه پذیرنده"
                      name="merchantId"
                      value={paymentSettings.merchantId}
                      onChange={handlePaymentSettingChange}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel id="currency-code-label">واحد پول</InputLabel>
                      <Select
                        labelId="currency-code-label"
                        name="currencyCode"
                        value={paymentSettings.currencyCode}
                        onChange={handlePaymentSettingChange}
                        label="واحد پول"
                      >
                        <MenuItem value="IRR">ریال (IRR)</MenuItem>
                        <MenuItem value="IRT">تومان (IRT)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="زمان انقضای پرداخت (دقیقه)"
                      name="paymentExpiryMinutes"
                      type="number"
                      value={paymentSettings.paymentExpiryMinutes}
                      onChange={handlePaymentSettingChange}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider className="my-2" />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="autoConfirmPayments"
                          checked={paymentSettings.autoConfirmPayments}
                          onChange={handlePaymentSettingChange}
                        />
                      }
                      label="تأیید خودکار پرداخت‌ها"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="allowPartialPayments"
                          checked={paymentSettings.allowPartialPayments}
                          onChange={handlePaymentSettingChange}
                        />
                      }
                      label="اجازه پرداخت قسمتی"
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Backup Settings */}
            {activeTab === 5 && (
              <Box>
                <Typography variant="h6" className="mb-4">تنظیمات پشتیبان‌گیری</Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel id="backup-frequency-label">تناوب پشتیبان‌گیری</InputLabel>
                      <Select
                        labelId="backup-frequency-label"
                        name="backupFrequency"
                        value={backupSettings.backupFrequency}
                        onChange={handleBackupSettingChange}
                        label="تناوب پشتیبان‌گیری"
                      >
                        <MenuItem value="daily">روزانه</MenuItem>
                        <MenuItem value="weekly">هفتگی</MenuItem>
                        <MenuItem value="monthly">ماهانه</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="زمان پشتیبان‌گیری"
                      name="backupTime"
                      type="time"
                      value={backupSettings.backupTime}
                      onChange={handleBackupSettingChange}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="حفظ پشتیبان‌ها (روز)"
                      name="backupRetentionDays"
                      type="number"
                      value={backupSettings.backupRetentionDays}
                      onChange={handleBackupSettingChange}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel id="backup-location-label">محل ذخیره‌سازی</InputLabel>
                      <Select
                        labelId="backup-location-label"
                        name="backupLocation"
                        value={backupSettings.backupLocation}
                        onChange={handleBackupSettingChange}
                        label="محل ذخیره‌سازی"
                      >
                        <MenuItem value="local">سرور محلی</MenuItem>
                        <MenuItem value="cloud">فضای ابری</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider className="my-2" />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="autoBackup"
                          checked={backupSettings.autoBackup}
                          onChange={handleBackupSettingChange}
                        />
                      }
                      label="پشتیبان‌گیری خودکار"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="excludeImages"
                          checked={backupSettings.excludeImages}
                          onChange={handleBackupSettingChange}
                        />
                      }
                      label="حذف تصاویر از پشتیبان‌گیری (برای کاهش حجم)"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider className="my-2" />
                  </Grid>

                  <Grid item xs={12}>
                    <Card>
                      <CardHeader title="پشتیبان‌گیری دستی" />
                      <CardContent>
                        <Typography variant="body2" color="text.secondary" className="mb-4">
                          برای تهیه پشتیبان فوری، روی دکمه زیر کلیک کنید. این عملیات ممکن است چند دقیقه طول بکشد.
                        </Typography>
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<BackupIcon />}
                          onClick={() => setIsBackupDialogOpen(true)}
                        >
                          پشتیبان‌گیری اکنون
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* SMS Settings */}
            {activeTab === 6 && (
              <Box>
                <Typography variant="h6" className="mb-4">تنظیمات پیامک</Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel id="sms-provider-label">سرویس‌دهنده پیامک</InputLabel>
                      <Select
                        labelId="sms-provider-label"
                        name="smsProvider"
                        value={smsSettings.smsProvider}
                        onChange={handleSmsSettingChange}
                        label="سرویس‌دهنده پیامک"
                      >
                        <MenuItem value="kavenegar">کاوه‌نگار</MenuItem>
                        <MenuItem value="melipayamak">ملی پیامک</MenuItem>
                        <MenuItem value="ghasedak">قاصدک</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="کلید API"
                      name="apiKey"
                      value={smsSettings.apiKey}
                      onChange={handleSmsSettingChange}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="شماره فرستنده"
                      name="senderNumber"
                      value={smsSettings.senderNumber}
                      onChange={handleSmsSettingChange}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider className="my-2" />
                    <Typography variant="subtitle1" className="mb-2 mt-3">قالب‌های پیامک</Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="قالب نام کاربری"
                      name="usernameTemplate"
                      value={smsSettings.usernameTemplate}
                      onChange={handleSmsSettingChange}
                      fullWidth
                      helperText="از %USERNAME% برای جایگزینی با نام کاربر استفاده کنید"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="قالب کد رزرو"
                      name="reservationCodeTemplate"
                      value={smsSettings.reservationCodeTemplate}
                      onChange={handleSmsSettingChange}
                      fullWidth
                      helperText="از %CODE% برای جایگزینی با کد رزرو استفاده کنید"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="enabled"
                          checked={smsSettings.enabled}
                          onChange={handleSmsSettingChange}
                        />
                      }
                      label="فعال‌سازی ارسال پیامک"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider className="my-2" />
                  </Grid>

                  <Grid item xs={12}>
                    <Card>
                      <CardHeader title="ارسال پیامک تست" />
                      <CardContent>
                        <Typography variant="body2" color="text.secondary" className="mb-4">
                          برای اطمینان از صحت تنظیمات پیامک، یک پیامک تست ارسال کنید.
                        </Typography>

                        <Grid container spacing={2}>
                          <Grid item xs={12} md={8}>
                            <TextField
                              label="شماره موبایل"
                              value={testSmsNumber}
                              onChange={(e) => setTestSmsNumber(e.target.value)}
                              fullWidth
                              placeholder="مثال: 09123456789"
                            />
                          </Grid>
                          <Grid item xs={12} md={4} className="flex items-end">
                            <Button
                              variant="contained"
                              color="primary"
                              startIcon={<SmsIcon />}
                              onClick={handleSendTestSms}
                              disabled={saving || !testSmsNumber}
                              fullWidth
                            >
                              {saving ? <CircularProgress size={24} /> : 'ارسال پیامک تست'}
                            </Button>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}

            <Box className="mt-6 flex justify-end">
              <Button
                variant="contained"
                color="primary"
                startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                onClick={handleSaveSettings}
                disabled={saving}
              >
                ذخیره تنظیمات
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Backup Confirmation Dialog */}
      <Dialog
        open={isBackupDialogOpen}
        onClose={() => !backupLoading && setIsBackupDialogOpen(false)}
      >
        <DialogTitle>پشتیبان‌گیری از پایگاه داده</DialogTitle>
        <DialogContent>
          <Typography>
            آیا مطمئن هستید که می‌خواهید اکنون یک نسخه پشتیبان تهیه کنید؟
          </Typography>
          <Typography variant="body2" color="text.secondary" className="mt-2">
            این عملیات ممکن است چند دقیقه طول بکشد و ممکن است سرعت سیستم را موقتاً کاهش دهد.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsBackupDialogOpen(false)}
            disabled={backupLoading}
          >
            انصراف
          </Button>
          <Button
            onClick={handleBackupNow}
            variant="contained"
            color="primary"
            disabled={backupLoading}
            startIcon={backupLoading ? <CircularProgress size={20} /> : <BackupIcon />}
          >
            شروع پشتیبان‌گیری
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert severity="success" variant="filled">
          تنظیمات با موفقیت ذخیره شد.
        </Alert>
      </Snackbar>

      {/* SMS Sent Snackbar */}
      <Snackbar
        open={smsSent}
        autoHideDuration={3000}
        onClose={() => setSmsSent(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert severity="success" variant="filled">
          پیامک تست با موفقیت ارسال شد.
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}