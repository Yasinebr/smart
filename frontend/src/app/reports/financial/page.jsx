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
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import DeleteIcon from '@mui/icons-material/Delete';
import { useForm, Controller } from 'react-hook-form';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, isAfter, parseISO, sub } from 'date-fns';
import { faIR } from 'date-fns/locale';

// Report types in Persian
const reportTypeLabels = {
  daily: 'روزانه',
  weekly: 'هفتگی',
  monthly: 'ماهانه',
  custom: 'سفارشی',
};

// Financial report types in Persian
const financialReportTypeLabels = {
  revenue: 'درآمد',
  expenses: 'هزینه‌ها',
  profit_loss: 'سود و زیان',
};

// Status colors
const statusColors = {
  pending: 'warning',
  completed: 'success',
  failed: 'error',
};

// Mock data for charts
const revenueData = [
  { name: 'فروردین', revenue: 1200000, expenses: 800000, profit: 400000 },
  { name: 'اردیبهشت', revenue: 1500000, expenses: 900000, profit: 600000 },
  { name: 'خرداد', revenue: 1300000, expenses: 850000, profit: 450000 },
  { name: 'تیر', revenue: 1800000, expenses: 1100000, profit: 700000 },
  { name: 'مرداد', revenue: 2000000, expenses: 1300000, profit: 700000 },
  { name: 'شهریور', revenue: 1900000, expenses: 1200000, profit: 700000 },
];

// Mock data for revenue sources pie chart
const revenueSourcesData = [
  { name: 'پارکینگ روزانه', value: 45 },
  { name: 'اشتراک‌ها', value: 30 },
  { name: 'رزرو آنلاین', value: 20 },
  { name: 'جریمه‌ها', value: 5 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const ReportForm = ({ open, onClose, onSubmit, loading }) => {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      report_type: 'monthly',
      financial_report_type: 'profit_loss',
      start_date: format(sub(new Date(), { months: 6 }), 'yyyy-MM-dd'),
      end_date: format(new Date(), 'yyyy-MM-dd'),
    },
  });

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
          ایجاد گزارش مالی جدید
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} className="mt-1">
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
              <FormControl fullWidth error={!!errors.financial_report_type}>
                <InputLabel id="financial-report-type-label">نوع گزارش مالی</InputLabel>
                <Controller
                  name="financial_report_type"
                  control={control}
                  rules={{ required: 'انتخاب نوع گزارش مالی الزامی است' }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="financial-report-type-label"
                      label="نوع گزارش مالی"
                    >
                      <MenuItem value="revenue">درآمد</MenuItem>
                      <MenuItem value="expenses">هزینه‌ها</MenuItem>
                      <MenuItem value="profit_loss">سود و زیان</MenuItem>
                    </Select>
                  )}
                />
                {errors.financial_report_type && (
                  <Typography color="error" variant="caption">
                    {errors.financial_report_type.message}
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

export default function FinancialReportsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [formLoading, setFormLoading] = useState(false);

  const { data, loading, error, execute: fetchReports } = useApi(
    api.getFinancialReports,
    true
  );

  const { execute: deleteReport, loading: deleteLoading } = useApi(
    (id) => api.deleteFinancialReport(id)
  );

  const { execute: createReport } = useApi(
    (data) => api.createFinancialReport(data)
  );

  const { execute: regenerateReport, loading: regenerateLoading } = useApi(
    (id) => api.regenerateFinancialReport(id, {})
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
      id: 'report_type',
      label: 'نوع گزارش',
      minWidth: 120,
      format: (value) => reportTypeLabels[value] || value,
    },
    {
      id: 'financial_report_type',
      label: 'نوع گزارش مالی',
      minWidth: 120,
      format: (value) => financialReportTypeLabels[value] || value,
    },
    {
      id: 'start_date',
      label: 'تاریخ شروع',
      minWidth: 120,
      format: (value) => format(new Date(value), 'yyyy/MM/dd', { locale: faIR }),
    },
    {
      id: 'end_date',
      label: 'تاریخ پایان',
      minWidth: 120,
      format: (value) => format(new Date(value), 'yyyy/MM/dd', { locale: faIR }),
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
      format: (value) => format(new Date(value), 'yyyy/MM/dd HH:mm', { locale: faIR }),
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
          گزارشات مالی
        </Typography>
        <Typography variant="body1" color="text.secondary">
          در این بخش می‌توانید گزارش‌های مالی را ایجاد، مشاهده و مدیریت کنید.
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
                  درآمد کل
                </Typography>
                <Typography variant="h4" className="font-bold">
                  8,400,000
                </Typography>
                <Typography variant="body2" color="success.main" className="flex items-center">
                  <TrendingUpIcon fontSize="small" className="ml-1" />
                  <span>21% بیشتر از ماه قبل</span>
                </Typography>
              </Box>
              <Box className="flex items-center justify-center w-12 h-12 bg-primary bg-opacity-10 rounded-full">
                <MonetizationOnIcon color="primary" />
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper className="p-4">
            <Box className="flex justify-between">
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  هزینه‌ها
                </Typography>
                <Typography variant="h4" className="font-bold">
                  4,150,000
                </Typography>
                <Typography variant="body2" color="success.main" className="flex items-center">
                  <TrendingDownIcon fontSize="small" className="ml-1" />
                  <span>5% کمتر از ماه قبل</span>
                </Typography>
              </Box>
              <Box className="flex items-center justify-center w-12 h-12 bg-warning bg-opacity-10 rounded-full">
                <TrendingDownIcon color="warning" />
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper className="p-4">
            <Box className="flex justify-between">
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  سود خالص
                </Typography>
                <Typography variant="h4" className="font-bold">
                  4,250,000
                </Typography>
                <Typography variant="body2" color="success.main" className="flex items-center">
                  <TrendingUpIcon fontSize="small" className="ml-1" />
                  <span>32% بیشتر از ماه قبل</span>
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
                تحلیل مالی ۶ ماه اخیر
              </Typography>
              <Box className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={revenueData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip formatter={(value) => `${value.toLocaleString()} تومان`} />
                    <Legend />
                    <Bar dataKey="revenue" name="درآمد" fill="#2196f3" />
                    <Bar dataKey="expenses" name="هزینه‌ها" fill="#ff9800" />
                    <Bar dataKey="profit" name="سود" fill="#4caf50" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" className="mb-4">
                منابع درآمد
              </Typography>
              <Box className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueSourcesData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {revenueSourcesData.map((entry, index) => (
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
        title="لیست گزارشات مالی"
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