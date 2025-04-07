'use client';

import { useState, useEffect } from 'react';
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
} from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/tables/DataTable';
import ParkingLotForm from '@/components/forms/ParkingLotForm';
import useApi from '@/hooks/useApi';
import api from '@/utils/api';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MapIcon from '@mui/icons-material/Map';
import DeleteIcon from '@mui/icons-material/Delete';

export default function ParkingLotsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLot, setSelectedLot] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState(null);

  const { data, loading, error, execute: fetchParkingLots } = useApi(
    api.getParkingLots,
    true
  );

  const { execute: deleteParkingLot, loading: deleteLoading } = useApi(
    (id) => api.deleteParkingLot(id)
  );

  const handleAddNew = () => {
    setSelectedLot(null);
    setIsFormOpen(true);
  };

  const handleEdit = (lot) => {
    setSelectedLot(lot);
    setIsFormOpen(true);
  };

  const handleDelete = (ids) => {
    setSelectedIds(ids);
    setIsDeleteDialogOpen(true);
  };

  const handleViewDetails = (lot) => {
    setSelectedDetails(lot);
    setDetailsDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      // Delete all selected parking lots
      await Promise.all(selectedIds.map(id => deleteParkingLot(id)));

      // Refresh the data
      fetchParkingLots();

      // Close the dialog
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting parking lots:', error);
    }
  };

  const handleFormSubmitSuccess = () => {
    fetchParkingLots();
  };

  // Format data for the table
  const parkingLots = data?.results || [];

  const columns = [
    {
      id: 'name',
      label: 'نام پارکینگ',
      minWidth: 170,
    },
    {
      id: 'address',
      label: 'آدرس',
      minWidth: 200,
      format: (value) => value.substring(0, 50) + (value.length > 50 ? '...' : ''),
    },
    {
      id: 'total_capacity',
      label: 'ظرفیت کل',
      minWidth: 100,
      align: 'center',
    },
    {
      id: 'current_occupancy',
      label: 'اشغال شده',
      minWidth: 100,
      align: 'center',
    },
    {
      id: 'available_capacity',
      label: 'ظرفیت خالی',
      minWidth: 100,
      align: 'center',
    },
    {
      id: 'occupancy_percentage',
      label: 'درصد اشغال',
      minWidth: 120,
      align: 'center',
      format: (value) => `${value}٪`,
    },
    {
      id: 'is_24h',
      label: 'ساعت کاری',
      minWidth: 120,
      align: 'center',
      format: (value, row) => (
        value ? (
          <Chip label="۲۴ ساعته" color="primary" size="small" />
        ) : (
          <span>{`${row.opening_time || '?'} تا ${row.closing_time || '?'}`}</span>
        )
      ),
    },
    {
      id: 'actions',
      label: 'جزئیات',
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
          <Tooltip title="مشاهده روی نقشه">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`https://maps.google.com/?q=${row.latitude},${row.longitude}`, '_blank');
              }}
              disabled={!row.latitude || !row.longitude}
            >
              <MapIcon fontSize="small" />
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
          مدیریت پارکینگ‌ها
        </Typography>
        <Typography variant="body1" color="text.secondary">
          در این بخش می‌توانید لیست پارکینگ‌ها را مشاهده، ویرایش یا حذف کنید.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" className="mb-4">
          خطا در بارگذاری اطلاعات: {error.message}
        </Alert>
      )}

      <DataTable
        title="لیست پارکینگ‌ها"
        rows={parkingLots}
        columns={columns}
        loading={loading}
        onAdd={handleAddNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={fetchParkingLots}
        searchPlaceholder="جستجو در نام پارکینگ یا آدرس..."
        initialSortBy="name"
      />

      {/* ParkingLot Form Dialog */}
      <ParkingLotForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={selectedLot}
        onSubmitSuccess={handleFormSubmitSuccess}
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
              آیا از حذف این پارکینگ اطمینان دارید؟ این عملیات قابل بازگشت نیست.
            </Typography>
          ) : (
            <Typography>
              آیا از حذف {selectedIds.length} پارکینگ انتخاب شده اطمینان دارید؟ این عملیات قابل بازگشت نیست.
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
          جزئیات پارکینگ
        </DialogTitle>
        <DialogContent>
          {selectedDetails && (
            <Box className="mt-2">
              <Typography variant="h6" className="mb-4">{selectedDetails.name}</Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">آدرس</Typography>
                  <Typography>{selectedDetails.address}</Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">مدیر پارکینگ</Typography>
                  <Typography>{selectedDetails.manager_email || 'تعیین نشده'}</Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">ظرفیت کل</Typography>
                  <Typography>{selectedDetails.total_capacity}</Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">اشغال شده</Typography>
                  <Typography>{selectedDetails.current_occupancy}</Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">درصد اشغال</Typography>
                  <Typography>{selectedDetails.occupancy_percentage}٪</Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">نرخ ساعتی</Typography>
                  <Typography>{selectedDetails.hourly_rate} تومان</Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">نرخ روزانه</Typography>
                  <Typography>{selectedDetails.daily_rate} تومان</Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">نرخ ماهانه</Typography>
                  <Typography>{selectedDetails.monthly_rate} تومان</Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">امکانات</Typography>
                  <Box className="flex flex-wrap gap-2 mt-1">
                    {selectedDetails.has_cctv && (
                      <Chip label="دوربین مداربسته" size="small" />
                    )}
                    {selectedDetails.has_elevator && (
                      <Chip label="آسانسور" size="small" />
                    )}
                    {selectedDetails.has_electric_charger && (
                      <Chip label="شارژر خودرو برقی" size="small" />
                    )}
                    {selectedDetails.indoor && (
                      <Chip label="سرپوشیده" size="small" />
                    )}
                    {selectedDetails.is_24h && (
                      <Chip label="۲۴ ساعته" color="primary" size="small" />
                    )}
                  </Box>
                </Grid>

                {!selectedDetails.is_24h && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">ساعت کاری</Typography>
                    <Typography>
                      {selectedDetails.opening_time || '?'} تا {selectedDetails.closing_time || '?'}
                    </Typography>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">موقعیت جغرافیایی</Typography>
                  <Typography>
                    {selectedDetails.latitude && selectedDetails.longitude ? (
                      <Button
                        startIcon={<MapIcon />}
                        variant="text"
                        onClick={() => window.open(`https://maps.google.com/?q=${selectedDetails.latitude},${selectedDetails.longitude}`, '_blank')}
                      >
                        مشاهده روی نقشه
                      </Button>
                    ) : (
                      'موقعیت ثبت نشده است'
                    )}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>بستن</Button>
          <Button
            color="primary"
            variant="contained"
            onClick={() => {
              setDetailsDialogOpen(false);
              handleEdit(selectedDetails);
            }}
          >
            ویرایش
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}