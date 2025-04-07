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
} from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/tables/DataTable';
import useApi from '@/hooks/useApi';
import api from '@/utils/api';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckIcon from '@mui/icons-material/Check';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { format } from 'date-fns';
import { faIR } from 'date-fns/locale';

// Convert status to Persian
const statusMap = {
  pending: 'در انتظار تأیید',
  confirmed: 'تأیید شده',
  checked_in: 'پذیرش شده',
  completed: 'تکمیل شده',
  cancelled: 'لغو شده',
};

// Status colors
const statusColors = {
  pending: 'warning',
  confirmed: 'info',
  checked_in: 'info',
  completed: 'success',
  cancelled: 'error',
};

export default function ReservationsPage() {
  const [tabValue, setTabValue] = useState(0);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [confirmActionDialog, setConfirmActionDialog] = useState({
    open: false,
    action: null,
    reservation: null,
  });

  const { data, loading, error, execute: fetchReservations } = useApi(
    api.getParkingReservations,
    true
  );

  const { execute: deleteReservation, loading: deleteLoading } = useApi(
    (id) => api.deleteParkingReservation(id)
  );

  const { execute: confirmReservation, loading: confirmLoading } = useApi(
    (id) => api.confirmParkingReservation(id, {})
  );

  const { execute: completeReservation, loading: completeLoading } = useApi(
    (id) => api.completeParkingReservation(id, {})
  );

  const { execute: cancelReservation, loading: cancelLoading } = useApi(
    (id) => api.cancelParkingReservation(id, {})
  );

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleDelete = (ids) => {
    setSelectedIds(ids);
    setIsDeleteDialogOpen(true);
  };

  const handleViewDetails = (reservation) => {
    setSelectedDetails(reservation);
    setDetailsDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      // Delete all selected reservations
      await Promise.all(selectedIds.map(id => deleteReservation(id)));

      // Refresh the data
      fetchReservations();

      // Close the dialog
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting reservations:', error);
    }
  };

  const handleAction = (action, reservation) => {
    setConfirmActionDialog({
      open: true,
      action,
      reservation,
    });
  };

  const executeAction = async () => {
    try {
      const { action, reservation } = confirmActionDialog;

      switch (action) {
        case 'confirm':
          await confirmReservation(reservation.id);
          break;
        case 'complete':
          await completeReservation(reservation.id);
          break;
        case 'cancel':
          await cancelReservation(reservation.id);
          break;
        default:
          break;
      }

      // Refresh the data
      fetchReservations();

      // Close the dialog
      setConfirmActionDialog({
        open: false,
        action: null,
        reservation: null,
      });
    } catch (error) {
      console.error('Error executing action:', error);
    }
  };

  // Format data for the table
  const reservations = data?.results || [];

  // Filter reservations based on tab
  const filteredReservations = tabValue === 0
    ? reservations
    : tabValue === 1
    ? reservations.filter(res => ['pending', 'confirmed'].includes(res.status))
    : reservations.filter(res => ['completed', 'cancelled'].includes(res.status));

  const columns = [
    {
      id: 'parking_name',
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
      id: 'user_email',
      label: 'ایمیل کاربر',
      minWidth: 180,
    },
    {
      id: 'vehicle_plate',
      label: 'پلاک خودرو',
      minWidth: 120,
    },
    {
      id: 'reservation_start',
      label: 'زمان شروع',
      minWidth: 140,
      format: (value) => format(new Date(value), 'yyyy/MM/dd HH:mm', { locale: fa }),
    },
    {
      id: 'reservation_end',
      label: 'زمان پایان',
      minWidth: 140,
      format: (value) => format(new Date(value), 'yyyy/MM/dd HH:mm', { locale: fa }),
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
      id: 'actions',
      label: 'عملیات',
      minWidth: 150,
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

          {row.status === 'pending' && (
            <Tooltip title="تأیید رزرو">
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction('confirm', row);
                }}
              >
                <CheckIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {row.status === 'confirmed' && (
            <Tooltip title="تکمیل رزرو">
              <IconButton
                size="small"
                color="success"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction('complete', row);
                }}
              >
                <CheckCircleIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {['pending', 'confirmed'].includes(row.status) && (
            <Tooltip title="لغو رزرو">
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction('cancel', row);
                }}
              >
                <CancelIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  // For details dialog
  const formattedDateTime = (dateString) => {
    if (!dateString) return 'نامشخص';
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
          مدیریت رزروها
        </Typography>
        <Typography variant="body1" color="text.secondary">
          در این بخش می‌توانید لیست رزروهای پارکینگ را مشاهده و مدیریت کنید.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" className="mb-4">
          خطا در بارگذاری اطلاعات: {error.message}
        </Alert>
      )}

      <Paper className="mb-4">
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="همه رزروها" />
          <Tab label="رزروهای فعال" />
          <Tab label="رزروهای گذشته" />
        </Tabs>
      </Paper>

      <DataTable
        title="لیست رزروها"
        rows={filteredReservations}
        columns={columns}
        loading={loading}
        onDelete={handleDelete}
        onRefresh={fetchReservations}
        searchPlaceholder="جستجو در نام پارکینگ یا پلاک خودرو..."
        initialSortBy="reservation_start"
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
              آیا از حذف این رزرو اطمینان دارید؟ این عملیات قابل بازگشت نیست.
            </Typography>
          ) : (
            <Typography>
              آیا از حذف {selectedIds.length} رزرو انتخاب شده اطمینان دارید؟ این عملیات قابل بازگشت نیست.
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
          جزئیات رزرو
        </DialogTitle>
        <DialogContent>
          {selectedDetails && (
            <Box className="mt-2">
              <Box className="flex justify-between items-center mb-4">
                <Typography variant="h6">
                  {selectedDetails.parking_name}
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
                  <Typography variant="subtitle2" color="text.secondary">ایمیل کاربر</Typography>
                  <Typography>{selectedDetails.user_email}</Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">پلاک خودرو</Typography>
                  <Typography>{selectedDetails.vehicle_plate}</Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">مدت زمان رزرو</Typography>
                  <Typography>{selectedDetails.duration || 'نامشخص'}</Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">زمان شروع</Typography>
                  <Typography>{formattedDateTime(selectedDetails.reservation_start)}</Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">زمان پایان</Typography>
                  <Typography>{formattedDateTime(selectedDetails.reservation_end)}</Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">مبلغ پرداختی</Typography>
                  <Typography>
                    {selectedDetails.amount_paid
                      ? `${Number(selectedDetails.amount_paid).toLocaleString()} تومان`
                      : 'پرداخت نشده'}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">تاریخ ایجاد</Typography>
                  <Typography>{formattedDateTime(selectedDetails.created_at)}</Typography>
                </Grid>

                <Grid item xs={12}>
                  <Box className="flex gap-2 mt-4">
                    {selectedDetails.status === 'pending' && (
                      <>
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<CheckIcon />}
                          onClick={() => {
                            setDetailsDialogOpen(false);
                            handleAction('confirm', selectedDetails);
                          }}
                        >
                          تأیید رزرو
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<CancelIcon />}
                          onClick={() => {
                            setDetailsDialogOpen(false);
                            handleAction('cancel', selectedDetails);
                          }}
                        >
                          لغو رزرو
                        </Button>
                      </>
                    )}

                    {selectedDetails.status === 'confirmed' && (
                      <>
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => {
                            setDetailsDialogOpen(false);
                            handleAction('complete', selectedDetails);
                          }}
                        >
                          تکمیل رزرو
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<CancelIcon />}
                          onClick={() => {
                            setDetailsDialogOpen(false);
                            handleAction('cancel', selectedDetails);
                          }}
                        >
                          لغو رزرو
                        </Button>
                      </>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>بستن</Button>
        </DialogActions>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <Dialog
        open={confirmActionDialog.open}
        onClose={() => setConfirmActionDialog({ open: false, action: null, reservation: null })}
      >
        <DialogTitle>
          {confirmActionDialog.action === 'confirm' && 'تأیید رزرو'}
          {confirmActionDialog.action === 'complete' && 'تکمیل رزرو'}
          {confirmActionDialog.action === 'cancel' && 'لغو رزرو'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {confirmActionDialog.action === 'confirm' && 'آیا از تأیید این رزرو اطمینان دارید؟'}
            {confirmActionDialog.action === 'complete' && 'آیا از تکمیل این رزرو اطمینان دارید؟'}
            {confirmActionDialog.action === 'cancel' && 'آیا از لغو این رزرو اطمینان دارید؟ این عملیات قابل بازگشت نیست.'}
          </Typography>
          {confirmActionDialog.reservation && (
            <Box className="mt-4 p-3 bg-gray-50 rounded">
              <Typography variant="subtitle2">
                {confirmActionDialog.reservation.parking_name} - جایگاه {confirmActionDialog.reservation.spot_number || 'نامشخص'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {confirmActionDialog.reservation.vehicle_plate} - {formattedDateTime(confirmActionDialog.reservation.reservation_start)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmActionDialog({ open: false, action: null, reservation: null })}
            color="inherit"
          >
            انصراف
          </Button>
          <Button
            onClick={executeAction}
            color={
              confirmActionDialog.action === 'confirm'
                ? 'primary'
                : confirmActionDialog.action === 'complete'
                ? 'success'
                : 'error'
            }
            variant="contained"
            startIcon={
              confirmActionDialog.action === 'confirm'
                ? <CheckIcon />
                : confirmActionDialog.action === 'complete'
                ? <CheckCircleIcon />
                : <CancelIcon />
            }
          >
            {confirmActionDialog.action === 'confirm' && 'تأیید'}
            {confirmActionDialog.action === 'complete' && 'تکمیل'}
            {confirmActionDialog.action === 'cancel' && 'لغو'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}