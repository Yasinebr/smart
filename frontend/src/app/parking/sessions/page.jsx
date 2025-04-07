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
  Paper,
  Tab,
  Tabs,
  TextField,
} from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/tables/DataTable';
import useApi from '@/hooks/useApi';
import api from '@/utils/api';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { format } from 'date-fns';
import { fa } from 'date-fns/locale';

// Convert status to Persian
const statusMap = {
  active: 'فعال',
  completed: 'تکمیل شده',
  expired: 'منقضی شده',
};

// Status colors
const statusColors = {
  active: 'success',
  completed: 'info',
  expired: 'error',
};

export default function ParkingSessionsPage() {
  const [tabValue, setTabValue] = useState(0);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [entryDialogOpen, setEntryDialogOpen] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [licensePlate, setLicensePlate] = useState('');
  const [parkingLotId, setParkingLotId] = useState('');
  const [operationError, setOperationError] = useState(null);

  const { data, loading, error, execute: fetchSessions } = useApi(
    api.getParkingSessions,
    true
  );

  const { data: parkingLots, loading: loadingParkingLots, execute: fetchParkingLots } = useApi(
    api.getParkingLots,
    true
  );

  const { execute: deleteSession, loading: deleteLoading } = useApi(
    (id) => api.deleteParkingSession(id)
  );

  const { execute: registerEntry, loading: registerEntryLoading } = useApi(
    (data) => api.registerVehicleEntry(data)
  );

  const { execute: registerExit, loading: registerExitLoading } = useApi(
    (data) => api.registerVehicleExit(data)
  );

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleDelete = (ids) => {
    setSelectedIds(ids);
    setIsDeleteDialogOpen(true);
  };

  const handleViewDetails = (session) => {
    setSelectedDetails(session);
    setDetailsDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      // Delete all selected sessions
      await Promise.all(selectedIds.map(id => deleteSession(id)));

      // Refresh the data
      fetchSessions();

      // Close the dialog
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting sessions:', error);
    }
  };

  const handleEntrySubmit = async () => {
    if (!licensePlate || !parkingLotId) {
      setOperationError('لطفاً شماره پلاک و پارکینگ را وارد کنید.');
      return;
    }

    try {
      setOperationError(null);

      await registerEntry({
        license_plate: licensePlate,
        parking_lot: parkingLotId,
      });

      // Refresh the data
      fetchSessions();

      // Reset form and close dialog
      setLicensePlate('');
      setParkingLotId('');
      setEntryDialogOpen(false);
    } catch (error) {
      console.error('Error registering entry:', error);
      setOperationError('خطا در ثبت ورود خودرو. لطفاً دوباره تلاش کنید.');
    }
  };

  const handleExitSubmit = async () => {
    if (!licensePlate) {
      setOperationError('لطفاً شماره پلاک را وارد کنید.');
      return;
    }

    try {
      setOperationError(null);

      await registerExit({
        license_plate: licensePlate,
      });

      // Refresh the data
      fetchSessions();

      // Reset form and close dialog
      setLicensePlate('');
      setExitDialogOpen(false);
    } catch (error) {
      console.error('Error registering exit:', error);
      setOperationError('خطا در ثبت خروج خودرو. لطفاً دوباره تلاش کنید.');
    }
  };

  // Format data for the table
  const sessions = data?.results || [];

  // Filter sessions based on tab
  const filteredSessions = tabValue === 0
    ? sessions
    : tabValue === 1
    ? sessions.filter(session => session.status === 'active')
    : sessions.filter(session => ['completed', 'expired'].includes(session.status));

  const columns = [
    {
      id: 'parking_lot_name',
      label: 'نام پارکینگ',
      minWidth: 150,
    },
    {
      id: 'spot_number',
      label: 'شماره جایگاه',
      minWidth: 120,
      align: 'center',
      format: (value) => value || 'تعیین نشده',
    },
    {
      id: 'vehicle_plate',
      label: 'پلاک خودرو',
      minWidth: 120,
    },
    {
      id: 'user_email',
      label: 'ایمیل کاربر',
      minWidth: 180,
      format: (value) => value || 'بدون کاربر',
    },
    {
      id: 'entry_time',
      label: 'زمان ورود',
      minWidth: 140,
      format: (value) => format(new Date(value), 'yyyy/MM/dd HH:mm', { locale: fa }),
    },
    {
      id: 'exit_time',
      label: 'زمان خروج',
      minWidth: 140,
      format: (value) => value ? format(new Date(value), 'yyyy/MM/dd HH:mm', { locale: fa }) : '-',
    },
    {
      id: 'status',
      label: 'وضعیت',
      minWidth: 120,
      align: 'center',
      format: (value) => (
        <Chip
          label={statusMap[value] || value}
          color={statusColors[value] || 'default'}
          size="small"
        />
      ),
    },
    {
      id: 'is_paid',
      label: 'پرداخت',
      minWidth: 100,
      align: 'center',
      format: (value) => (
        value ? (
          <Chip label="پرداخت شده" color="success" size="small" />
        ) : (
          <Chip label="پرداخت نشده" variant="outlined" color="warning" size="small" />
        )
      ),
    },
    {
      id: 'actions',
      label: 'عملیات',
      minWidth: 100,
      align: 'center',
      sortable: false,
      format: (value, row) => (
        <Box className="flex justify-center">
          <Tooltip title="مشاهده جزئیات">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetails(row);
              }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // For details dialog
  const formattedDateTime = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'yyyy/MM/dd HH:mm:ss', { locale: fa });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <DashboardLayout>
      <Box className="mb-6">
        <Typography variant="h4" className="font-bold">
          مدیریت جلسات پارک
        </Typography>
        <Typography variant="body1" color="text.secondary">
          در این بخش می‌توانید جلسات پارک فعال و گذشته را مشاهده و مدیریت کنید.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" className="mb-4">
          خطا در بارگذاری اطلاعات: {error.message}
        </Alert>
      )}

      <Box className="mb-4 flex flex-wrap gap-2">
        <Button
          variant="contained"
          color="primary"
          startIcon={<DirectionsCarIcon />}
          onClick={() => setEntryDialogOpen(true)}
        >
          ثبت ورود خودرو
        </Button>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<ExitToAppIcon />}
          onClick={() => setExitDialogOpen(true)}
        >
          ثبت خروج خودرو
        </Button>
      </Box>

      <Paper className="mb-4">
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="همه جلسات" />
          <Tab label="جلسات فعال" />
          <Tab label="جلسات گذشته" />
        </Tabs>
      </Paper>

      <DataTable
        title="لیست جلسات پارک"
        rows={filteredSessions}
        columns={columns}
        loading={loading}
        onDelete={handleDelete}
        onRefresh={fetchSessions}
        searchPlaceholder="جستجو در نام پارکینگ یا پلاک خودرو..."
        initialSortBy="entry_time"
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
              آیا از حذف این جلسه پارک اطمینان دارید؟ این عملیات قابل بازگشت نیست.
            </Typography>
          ) : (
            <Typography>
              آیا از حذف {selectedIds.length} جلسه پارک انتخاب شده اطمینان دارید؟ این عملیات قابل بازگشت نیست.
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

      {/* Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          جزئیات جلسه پارک
        </DialogTitle>
        <DialogContent>
          {selectedDetails && (
            <Box className="mt-2">
              <Box className="flex justify-between items-center mb-4">
                <Typography variant="h6">
                  {selectedDetails.parking_lot_name}
                </Typography>
                <Chip
                  label={statusMap[selectedDetails.status] || selectedDetails.status}
                  color={statusColors[selectedDetails.status] || 'default'}
                />
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">شماره جایگاه</Typography>
                  <Typography>{selectedDetails.spot_number || 'تعیین نشده'}</Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">پلاک خودرو</Typography>
                  <Typography>{selectedDetails.vehicle_plate}</Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">ایمیل کاربر</Typography>
                  <Typography>{selectedDetails.user_email || 'بدون کاربر'}</Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">مدت زمان پارک</Typography>
                  <Typography>{selectedDetails.duration || 'در حال محاسبه'}</Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">زمان ورود</Typography>
                  <Typography>{formattedDateTime(selectedDetails.entry_time)}</Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">زمان خروج</Typography>
                  <Typography>{formattedDateTime(selectedDetails.exit_time)}</Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">مبلغ قابل پرداخت</Typography>
                  <Typography>
                    {selectedDetails.amount_due
                      ? `${Number(selectedDetails.amount_due).toLocaleString()} تومان`
                      : '-'}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">وضعیت پرداخت</Typography>
                  <Box className="mt-1">
                    {selectedDetails.is_paid ? (
                      <Chip label="پرداخت شده" color="success" />
                    ) : (
                      <Chip label="پرداخت نشده" variant="outlined" color="warning" />
                    )}
                  </Box>
                </Grid>

                {selectedDetails.entry_image && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">تصویر ورود</Typography>
                    <Box className="mt-2">
                      <img
                        src={selectedDetails.entry_image}
                        alt="تصویر ورود"
                        className="max-w-full h-auto rounded border border-gray-200"
                        style={{ maxHeight: '150px' }}
                      />
                    </Box>
                  </Grid>
                )}

                {selectedDetails.exit_image && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">تصویر خروج</Typography>
                    <Box className="mt-2">
                      <img
                        src={selectedDetails.exit_image}
                        alt="تصویر خروج"
                        className="max-w-full h-auto rounded border border-gray-200"
                        style={{ maxHeight: '150px' }}
                      />
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>بستن</Button>
        </DialogActions>
      </Dialog>

      {/* Vehicle Entry Dialog */}
      <Dialog
        open={entryDialogOpen}
        onClose={() => setEntryDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          ثبت ورود خودرو
        </DialogTitle>
        <DialogContent>
          <Box className="mt-2">
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="شماره پلاک خودرو"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                  fullWidth
                  required
                  margin="normal"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  select
                  label="پارکینگ"
                  value={parkingLotId}
                  onChange={(e) => setParkingLotId(e.target.value)}
                  fullWidth
                  required
                  margin="normal"
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="">انتخاب کنید</option>
                  {(parkingLots?.results || []).map((lot) => (
                    <option key={lot.id} value={lot.id}>
                      {lot.name}
                    </option>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            {operationError && (
              <Alert severity="error" className="mt-3">
                {operationError}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setEntryDialogOpen(false)}
            color="inherit"
          >
            انصراف
          </Button>
          <Button
            onClick={handleEntrySubmit}
            color="primary"
            variant="contained"
            disabled={registerEntryLoading}
            startIcon={registerEntryLoading ? <AccessTimeIcon /> : <DirectionsCarIcon />}
          >
            ثبت ورود
          </Button>
        </DialogActions>
      </Dialog>

      {/* Vehicle Exit Dialog */}
      <Dialog
        open={exitDialogOpen}
        onClose={() => setExitDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          ثبت خروج خودرو
        </DialogTitle>
        <DialogContent>
          <Box className="mt-2">
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="شماره پلاک خودرو"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                  fullWidth
                  required
                  margin="normal"
                />
              </Grid>
            </Grid>

            {operationError && (
              <Alert severity="error" className="mt-3">
                {operationError}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setExitDialogOpen(false)}
            color="inherit"
          >
            انصراف
          </Button>
          <Button
            onClick={handleExitSubmit}
            color="primary"
            variant="contained"
            disabled={registerExitLoading}
            startIcon={registerExitLoading ? <AccessTimeIcon /> : <ExitToAppIcon />}
          >
            ثبت خروج
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}