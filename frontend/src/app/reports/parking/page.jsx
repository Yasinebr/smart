'use client';

import { useState } from 'react';
import {
  Typography,
  Box,
  Chip,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Paper,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/tables/DataTable';
import useApi from '@/hooks/useApi';
import api from '@/utils/api';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import BarChartIcon from '@mui/icons-material/BarChart';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import DeleteIcon from '@mui/icons-material/Delete';
import TrafficIcon from '@mui/icons-material/Traffic';
import { useForm, Controller } from 'react-hook-form';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, isAfter, parseISO, sub } from 'date-fns';
import { faIR } from 'date-fns/locale';

// Report types in Persian
const reportTypeLabels = {
  daily: 'روزانه',
  weekly: 'هفتگی',
  monthly: 'ماهانه',
  custom: 'سفارشی',
};

// Parking report types in Persian
const parkingReportTypeLabels = {
  occupancy: 'میزان اشغال',
  revenue: 'درآمد',
  traffic: 'ترافیک',
};

// Status colors
const statusColors = {
  pending: 'warning',
  completed: 'success',
  failed: 'error',
};

// Mock data for charts
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

// Mock data for parking lot occupancy
const parkingLotsPieData = [
  { name: 'پارکینگ مرکزی', value: 85 },
  { name: 'پارکینگ شمالی', value: 70 },
  { name: 'پارکینگ غربی', value: 60 },
  { name: 'پارکینگ شرقی', value: 40 },
];

// Peak hours data
const peakHoursData = [
  { hour: '6-9', count: 120 },
  { hour: '9-12', count: 240 },
  { hour: '12-15', count: 180 },
  { hour: '15-18', count: 300 },
  { hour: '18-21', count: 220 },
  { hour: '21-24', count: 100 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const ReportForm = ({ open, onClose, onSubmit, loading }) => {
  const [parkingLots, setParkingLots] = useState([]);
  const { data: parkingLotsData, loading: loadingParkingLots, execute: fetchParkingLots } = useApi(
    api.getParkingLots
  );

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      report_type: 'monthly',
      parking_report_type: 'occupancy',
      parking_lot: '',
      start_date: format(sub(new Date(), { months: 1 }), 'yyyy-MM-dd'),
      end_date: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  // Load parking lots when component mounts
  useState(() => {
    if (open) {
      fetchParkingLots();
    }
  }, [open]);

  useState(() => {
    if (parkingLotsData) {
      setParkingLots(parkingLotsData.results || []);
    }
  }, [parkingLotsData]);

  const reportType = watch('report_type');

  return (
    <Dialog
      open={open}
      onClose={() => !loading && onClose()}
      maxWidth="md"
      fullWidth
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>
          ایجاد گزارش پارکینگ جدید
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} className="mt-1">
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.parking_lot}>
                <InputLabel id="parking-lot-label">پارکینگ</InputLabel>
                <Controller
                  name="parking_lot"
                  control={control}
                  rules={{ required: 'انتخاب پارکینگ الزامی است' }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="parking-lot-label"
                      label="پارکینگ"
                      disabled={loadingParkingLots}
                    >
                      {parkingLots.map((lot) => (
                        <MenuItem key={lot.id} value={lot.id}>
                          {lot.name}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.parking_lot && (
                  <Typography color="error" variant="caption">
                    {errors.parking_lot.message}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.report_type}>
                <InputLabel id="report-type-label">نوع گزارش</InputLabel>
                <Controller
                  name="report_type"
                  control={control}
                  rules={{ required: 'انتخاب نوع گزارش الزامی است' }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="report-type-label"
                      label="نوع گزارش"
                    >
                      <MenuItem value="daily">روزانه</MenuItem>
                      <MenuItem value="weekly">هفتگی</MenuItem>
                      <MenuItem value="monthly">ماهانه</MenuItem>
                      <MenuItem value="custom">سفارشی</MenuItem>
                    </Select>
                  )}
                />
                {errors.report_type && (
                  <Typography color="error" variant="caption">
                    {errors.report_type.message}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.parking_report_type}>
                <InputLabel id="parking-report-type-label">نوع گزارش پارکینگ</InputLabel>
                <Controller
                  name="parking_report_type"
                  control={control}
                  rules={{ required: 'انتخاب نوع گزارش پارکینگ الزامی است' }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="parking-report-type-label"
                      label="نوع گزارش پارکینگ"
                    >
                      <MenuItem value="occupancy">میزان اشغال</MenuItem>
                      <MenuItem value="revenue">درآمد</MenuItem>
                      <MenuItem value="traffic">ترافیک</MenuItem>
                    </Select>
                  )}
                />
                {errors.parking_report_type && (
                  <Typography color="error" variant="caption">
                    {errors.parking_report_type.message}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {(reportType === 'custom') && (
              <>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="start_date"
                    control={control}
                    rules={{ required: 'تاریخ شروع الزامی است' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="تاریخ شروع"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.start_date}
                        helperText={errors.start_date?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="end_date"
                    control={control}
                    rules={{
                      required: 'تاریخ پایان الزامی است',
                      validate: value => {
                        const start = parseISO(watch('start_date'));
                        const end = parseISO(value);
                        return isAfter(end, start) || 'تاریخ پایان باید بعد از تاریخ شروع باشد';
                      }
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="تاریخ پایان"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.end_date}
                        helperText={errors.end_date?.message}
                      />
                    )}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={onClose}
            disabled={loading}
          >
            انصراف
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
          >
            ایجاد گزارش
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default function ParkingReportsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [formLoading, setFormLoading] = useState(false);

  const { data, loading, error, execute: fetchReports } = useApi(
    api.getParkingReports,
    true
  );

  const { execute: deleteReport, loading: deleteLoading } = useApi(
    (id) => api.deleteParkingReport(id)
  );

  const { execute: createReport } = useApi(
    (data) => api.createParkingReport(data)
  );

  const { execute: regenerateReport, loading: regenerateLoading } = useApi(
    (id) => api.regenerateParkingReport(id, {})
  );

  const handleAddNew = () => {
    setIsFormOpen(true);
  };

  const handleDelete = (ids) => {
    setSelectedIds(ids);
    setIsDeleteDialogOpen(true);
  };

  const handleRegenerate = async (id) => {
    try {
      await regenerateReport(id);
      fetchReports();
    } catch (error) {
      console.error('Error regenerating report:', error);
    }
  };

  const confirmDelete = async () => {
    try {
      // Delete all selected reports
      await Promise.all(selectedIds.map(id => deleteReport(id)));

      // Refresh the data
      fetchReports();

      // Close the dialog
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting reports:', error);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      setFormLoading(true);
      await createReport(formData);

      // Refresh the data
      fetchReports();

      // Close the form
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error creating report:', error);
    } finally {
      setFormLoading(false);
    }
  };

  // Format data for the table
  const reports = data?.results || [];

  const columns = [
    {
      id: 'id',
      label: 'شناسه',
      minWidth: 70,
      align: 'center',
    },
    {
      id: 'parking_lot',
      label: 'پارکینگ',
      minWidth: 150,
      // In a real app, fetch parking lot details or use parking_lot_name from API
      format: (value) => `پارکینگ ${value}`,
    },
    {
      id: 'report_type',
      label: 'نوع گزارش',
      minWidth: 120,
      format: (value) => reportTypeLabels[value] || value,
    },
    {
      id: 'parking_report_type',
      label: 'نوع گزارش پارکینگ',
      minWidth: 120,
      format: (value) => parkingReportTypeLabels[value] || value,
    },
    {
      id: 'start_date',
      label: 'تاریخ شروع',
      minWidth: 120,
      format: (value) => format(new Date(value), 'yyyy/MM/dd', { locale: fa }),
    },
    {
      id: 'end_date',
      label: 'تاریخ پایان',
      minWidth: 120,
      format: (value) => format(new Date(value), 'yyyy/MM/dd', { locale: fa }),
    },
    {
      id: 'status',
      label: 'وضعیت',
      minWidth: 100,
      align: 'center',
      format: (value) => (
        <Chip
          label={value === 'completed' ? 'تکمیل شده' : value === 'pending' ? 'در حال پردازش' : 'خطا'}
          color={statusColors[value] || 'default'}
          size="small"
        />
      ),
    },
    {
      id: 'created_at',
      label: 'تاریخ ایجاد',
      minWidth: 140,
      format: (value) => format(new Date(value), 'yyyy/MM/dd HH:mm', { locale: fa }),
    },
    {
      id: 'actions',
      label: 'عملیات',
      minWidth: 150,
      align: 'center',
      sortable: false,
      format: (value, row) => (
        <Box className="flex justify-center">
          {row.file && (
            <Tooltip title="دانلود گزارش">
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(row.file, '_blank');
                }}
              >
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="تولید مجدد گزارش">
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                handleRegenerate(row.id);
              }}
              disabled={regenerateLoading}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <Box className="mb-6">
        <Typography variant="h4" className="font-bold">
          گزارشات پارکینگ
        </Typography>
        <Typography variant="body1" color="text.secondary">
          در این بخش می‌توانید گزارش‌های پارکینگ را ایجاد، مشاهده و مدیریت کنید.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" className="mb-4">
          خطا در بارگذاری اطلاعات: {error.message}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} className="mb-6">
        <Grid item xs={12} md={4}>
          <Paper className="p-4">
            <Box className="flex justify-between">
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  میانگین نرخ اشغال
                </Typography>
                <Typography variant="h4" className="font-bold">
                  67%
                </Typography>
                <Typography variant="body2" color="success.main" className="flex items-center">
                  <TrendingUpIcon fontSize="small" className="ml-1" />
                  <span>5% بیشتر از ماه قبل</span>
                </Typography>
              </Box>
              <Box className="flex items-center justify-center w-12 h-12 bg-primary bg-opacity-10 rounded-full">
                <LocalParkingIcon color="primary" />
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper className="p-4">
            <Box className="flex justify-between">
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  ترافیک روزانه
                </Typography>
                <Typography variant="h4" className="font-bold">
                  245
                </Typography>
                <Typography variant="body2" color="success.main" className="flex items-center">
                  <TrendingUpIcon fontSize="small" className="ml-1" />
                  <span>12% بیشتر از ماه قبل</span>
                </Typography>
              </Box>
              <Box className="flex items-center justify-center w-12 h-12 bg-warning bg-opacity-10 rounded-full">
                <TrafficIcon color="warning" />
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper className="p-4">
            <Box className="flex justify-between">
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  میانگین مدت توقف
                </Typography>
                <Typography variant="h4" className="font-bold">
                  2.5
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ساعت
                </Typography>
              </Box>
              <Box className="flex items-center justify-center w-12 h-12 bg-success bg-opacity-10 rounded-full">
                <BarChartIcon color="success" />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} className="mb-6">
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" className="mb-4">
                نمودار میزان اشغال پارکینگ در طول روز
              </Typography>
              <Box className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={occupancyData}
                    margin={{
                      top: 20,
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

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" className="mb-4">
                وضعیت اشغال پارکینگ‌ها
              </Typography>
              <Box className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={parkingLotsPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {parkingLotsPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" className="mb-4">
                ساعات اوج استفاده از پارکینگ
              </Typography>
              <Box className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={peakHoursData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <ChartTooltip />
                    <Legend />
                    <Bar dataKey="count" name="تعداد خودروها" fill="#2196f3" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box className="mb-4">
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddNew}
        >
          ایجاد گزارش جدید
        </Button>
      </Box>

      <DataTable
        title="لیست گزارشات پارکینگ"
        rows={reports}
        columns={columns}
        loading={loading}
        onAdd={handleAddNew}
        onDelete={handleDelete}
        onRefresh={fetchReports}
        searchPlaceholder="جستجو در گزارشات..."
        initialSortBy="created_at"
      />

      {/* Report Form Dialog */}
      <ReportForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        loading={formLoading}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <DialogTitle>
          تأیید حذف
        </DialogTitle>
        <DialogContent>
          {selectedIds.length === 1 ? (
            <Typography>
              آیا از حذف این گزارش اطمینان دارید؟ این عملیات قابل بازگشت نیست.
            </Typography>
          ) : (
            <Typography>
              آیا از حذف {selectedIds.length} گزارش انتخاب شده اطمینان دارید؟ این عملیات قابل بازگشت نیست.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsDeleteDialogOpen(false)}
            color="inherit"
            disabled={deleteLoading}
          >
            انصراف
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={deleteLoading}
            startIcon={<DeleteIcon />}
          >
            حذف
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}