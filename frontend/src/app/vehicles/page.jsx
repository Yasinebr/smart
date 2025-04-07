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
} from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/tables/DataTable';
import VehicleForm from '@/components/forms/VehicleForm';
import useApi from '@/hooks/useApi';
import api from '@/utils/api';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VerifiedIcon from '@mui/icons-material/Verified';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

export default function VehiclesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState(null);

  const { data, loading, error, execute: fetchVehicles } = useApi(
    api.getVehicles,
    true
  );

  const { execute: deleteVehicle, loading: deleteLoading } = useApi(
    (id) => api.deleteVehicle(id)
  );

  const { execute: verifyVehicle, loading: verifyLoading } = useApi(
    (id) => api.verifyVehicle(id, {})
  );

  const handleAddNew = () => {
    setSelectedVehicle(null);
    setIsFormOpen(true);
  };

  const handleEdit = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsFormOpen(true);
  };

  const handleDelete = (ids) => {
    setSelectedIds(ids);
    setIsDeleteDialogOpen(true);
  };

  const handleViewDetails = (vehicle) => {
    setSelectedDetails(vehicle);
    setDetailsDialogOpen(true);
  };

  const handleVerify = async (id) => {
    try {
      await verifyVehicle(id);
      fetchVehicles();
    } catch (error) {
      console.error('Error verifying vehicle:', error);
    }
  };

  const confirmDelete = async () => {
    try {
      // Delete all selected vehicles
      await Promise.all(selectedIds.map(id => deleteVehicle(id)));

      // Refresh the data
      fetchVehicles();

      // Close the dialog
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting vehicles:', error);
    }
  };

  const handleFormSubmitSuccess = () => {
    fetchVehicles();
  };

  // Format data for the table
  const vehicles = data?.results || [];

  // Map vehicle types to Persian
  const vehicleTypeMap = {
    sedan: 'سواری',
    suv: 'شاسی بلند',
    hatchback: 'هاچبک',
    pickup: 'وانت',
    van: 'ون',
    truck: 'کامیون',
    motorcycle: 'موتورسیکلت',
  };

  const columns = [
    {
      id: 'license_plate',
      label: 'شماره پلاک',
      minWidth: 120,
    },
    {
      id: 'vehicle_type',
      label: 'نوع خودرو',
      minWidth: 100,
      format: (value) => vehicleTypeMap[value] || value,
    },
    {
      id: 'make',
      label: 'سازنده',
      minWidth: 100,
    },
    {
      id: 'model',
      label: 'مدل',
      minWidth: 100,
    },
    {
      id: 'year',
      label: 'سال تولید',
      minWidth: 100,
      align: 'center',
    },
    {
      id: 'color',
      label: 'رنگ',
      minWidth: 100,
    },
    {
      id: 'is_verified',
      label: 'وضعیت تأیید',
      minWidth: 120,
      align: 'center',
      format: (value) => (
        value ? (
          <Chip
            icon={<CheckCircleIcon />}
            label="تأیید شده"
            color="success"
            size="small"
          />
        ) : (
          <Chip
            icon={<HourglassEmptyIcon />}
            label="در انتظار تأیید"
            variant="outlined"
            size="small"
          />
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

          {!row.is_verified && (
            <Tooltip title="تأیید خودرو">
              <IconButton
                size="small"
                color="success"
                onClick={(e) => {
                  e.stopPropagation();
                  handleVerify(row.id);
                }}
              >
                <VerifiedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <Box className="mb-6">
        <Typography variant="h4" className="font-bold">
          مدیریت خودروها
        </Typography>
        <Typography variant="body1" color="text.secondary">
          در این بخش می‌توانید لیست خودروها را مشاهده، ویرایش یا حذف کنید.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" className="mb-4">
          خطا در بارگذاری اطلاعات: {error.message}
        </Alert>
      )}

      <DataTable
        title="لیست خودروها"
        rows={vehicles}
        columns={columns}
        loading={loading}
        onAdd={handleAddNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={fetchVehicles}
        searchPlaceholder="جستجو در پلاک، مدل یا رنگ..."
        initialSortBy="license_plate"
      />

      {/* Vehicle Form Dialog */}
      <VehicleForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={selectedVehicle}
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
              آیا از حذف این خودرو اطمینان دارید؟ این عملیات قابل بازگشت نیست.
            </Typography>
          ) : (
            <Typography>
              آیا از حذف {selectedIds.length} خودرو انتخاب شده اطمینان دارید؟ این عملیات قابل بازگشت نیست.
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
          جزئیات خودرو
        </DialogTitle>
        <DialogContent>
          {selectedDetails && (
            <Box className="mt-2">
              <Typography variant="h6" className="mb-4">
                {selectedDetails.make} {selectedDetails.model} {selectedDetails.year || ''}
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">شماره پلاک</Typography>
                  <Typography>{selectedDetails.license_plate}</Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">نوع خودرو</Typography>
                  <Typography>{vehicleTypeMap[selectedDetails.vehicle_type] || selectedDetails.vehicle_type}</Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">سازنده</Typography>
                  <Typography>{selectedDetails.make}</Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">مدل</Typography>
                  <Typography>{selectedDetails.model}</Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">سال تولید</Typography>
                  <Typography>{selectedDetails.year || 'نامشخص'}</Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">رنگ</Typography>
                  <Typography>{selectedDetails.color || 'نامشخص'}</Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">وضعیت تأیید</Typography>
                  <Box className="mt-1">
                    {selectedDetails.is_verified ? (
                      <Chip
                        icon={<CheckCircleIcon />}
                        label="تأیید شده"
                        color="success"
                      />
                    ) : (
                      <Chip
                        icon={<HourglassEmptyIcon />}
                        label="در انتظار تأیید"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Grid>

                {selectedDetails.verification_date && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">تاریخ تأیید</Typography>
                    <Typography>{new Date(selectedDetails.verification_date).toLocaleDateString('fa-IR')}</Typography>
                  </Grid>
                )}

                {selectedDetails.license_plate_image && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">تصویر پلاک</Typography>
                    <Box className="mt-2">
                      <img
                        src={selectedDetails.license_plate_image}
                        alt="تصویر پلاک"
                        className="max-w-full h-auto rounded border border-gray-200"
                        style={{ maxHeight: '200px' }}
                      />
                    </Box>
                  </Grid>
                )}

                {selectedDetails.vehicle_image && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">تصویر خودرو</Typography>
                    <Box className="mt-2">
                      <img
                        src={selectedDetails.vehicle_image}
                        alt="تصویر خودرو"
                        className="max-w-full h-auto rounded border border-gray-200"
                        style={{ maxHeight: '200px' }}
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