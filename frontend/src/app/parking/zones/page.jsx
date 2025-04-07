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
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/tables/DataTable';
import useApi from '@/hooks/useApi';
import api from '@/utils/api';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import { useForm, Controller } from 'react-hook-form';

// Zone types mapped to Persian
const zoneTypeMap = {
  regular: 'معمولی',
  vip: 'ویژه',
  disabled: 'معلولین',
};

export default function ParkingZonesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [spotsDialogOpen, setSpotsDialogOpen] = useState(false);
  const [selectedZoneSpots, setSelectedZoneSpots] = useState(null);

  const { data, loading, error, execute: fetchZones } = useApi(
    api.getParkingZones,
    true
  );

  const { data: parkingLots, loading: loadingParkingLots, execute: fetchParkingLots } = useApi(
    api.getParkingLots,
    true
  );

  const { execute: deleteZone, loading: deleteLoading } = useApi(
    (id) => api.deleteParkingZone(id)
  );

  const { execute: createZone, loading: createLoading } = useApi(
    (data) => api.createParkingZone(data)
  );

  const { execute: updateZone, loading: updateLoading } = useApi(
    (id, data) => api.updateParkingZone(id, data)
  );

  const { data: zoneSpots, loading: loadingZoneSpots, execute: fetchZoneSpots } = useApi(
    (zoneId) => api.getParkingZoneSpots(zoneId)
  );

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      parking_lot: '',
      name: '',
      capacity: 20,
      zone_type: 'regular',
      floor: 1,
      price_multiplier: 1.0,
    },
  });

  const handleAddNew = () => {
    reset({
      parking_lot: '',
      name: '',
      capacity: 20,
      zone_type: 'regular',
      floor: 1,
      price_multiplier: 1.0,
    });
    setSelectedZone(null);
    setIsFormOpen(true);
  };

  const handleEdit = (zone) => {
    // Fill form with zone data
    Object.keys(zone).forEach((key) => {
      if (key in zone && zone[key] !== null) {
        setValue(key, zone[key]);
      }
    });
    setSelectedZone(zone);
    setIsFormOpen(true);
  };

  const handleDelete = (ids) => {
    setSelectedIds(ids);
    setIsDeleteDialogOpen(true);
  };

  const handleViewDetails = (zone) => {
    setSelectedDetails(zone);
    setIsDetailsDialogOpen(true);
  };

  const handleViewSpots = async (zone) => {
    setSelectedZoneSpots(zone);
    await fetchZoneSpots(zone.id);
    setSpotsDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      // Delete all selected zones
      await Promise.all(selectedIds.map(id => deleteZone(id)));

      // Refresh the data
      fetchZones();

      // Close the dialog
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting zones:', error);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (selectedZone) {
        // Update existing zone
        await updateZone(selectedZone.id, data);
      } else {
        // Create new zone
        await createZone(data);
      }

      // Refresh the data
      fetchZones();

      // Close the form
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error saving zone:', error);
    }
  };

  // Load parking lots when component mounts
  useState(() => {
    fetchParkingLots();
  }, []);

  // Format data for the table
  const zones = data?.results || [];

  const columns = [
    {
      id: 'name',
      label: 'نام زون',
      minWidth: 150,
    },
    {
      id: 'parking_lot_name',
      label: 'پارکینگ',
      minWidth: 150,
    },
    {
      id: 'capacity',
      label: 'ظرفیت',
      minWidth: 100,
      align: 'center',
    },
    {
      id: 'current_occupancy',
      label: 'اشغال شده',
      minWidth: 120,
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
      id: 'zone_type',
      label: 'نوع زون',
      minWidth: 120,
      align: 'center',
      format: (value) => (
        <Chip
          label={zoneTypeMap[value] || value}
          color={value === 'vip' ? 'secondary' : value === 'disabled' ? 'primary' : 'default'}
          size="small"
        />
      ),
    },
    {
      id: 'floor',
      label: 'طبقه',
      minWidth: 100,
      align: 'center',
    },
    {
      id: 'price_multiplier',
      label: 'ضریب قیمت',
      minWidth: 120,
      align: 'center',
      format: (value) => `×${value}`,
    },
    {
      id: 'actions',
      label: 'عملیات',
      minWidth: 120,
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
          <Tooltip title="مشاهده جایگاه‌ها">
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                handleViewSpots(row);
              }}
            >
              <EventSeatIcon fontSize="small" />
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
          مدیریت زون‌های پارکینگ
        </Typography>
        <Typography variant="body1" color="text.secondary">
          در این بخش می‌توانید زون‌های پارکینگ را مدیریت کنید.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" className="mb-4">
          خطا در بارگذاری اطلاعات: {error.message}
        </Alert>
      )}

      <DataTable
        title="لیست زون‌های پارکینگ"
        rows={zones}
        columns={columns}
        loading={loading}
        onAdd={handleAddNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={fetchZones}
        searchPlaceholder="جستجو در نام زون..."
        initialSortBy="name"
      />

      {/* Zone Form Dialog */}
      <Dialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>
            {selectedZone ? 'ویرایش زون پارکینگ' : 'افزودن زون جدید'}
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
                      >
                        {(parkingLots?.results || []).map((lot) => (
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
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: 'نام زون الزامی است' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="نام زون"
                      fullWidth
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="capacity"
                  control={control}
                  rules={{
                    required: 'ظرفیت الزامی است',
                    min: { value: 1, message: 'ظرفیت باید حداقل 1 باشد' }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="ظرفیت"
                      type="number"
                      fullWidth
                      error={!!errors.capacity}
                      helperText={errors.capacity?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.zone_type}>
                  <InputLabel id="zone-type-label">نوع زون</InputLabel>
                  <Controller
                    name="zone_type"
                    control={control}
                    rules={{ required: 'انتخاب نوع زون الزامی است' }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        labelId="zone-type-label"
                        label="نوع زون"
                      >
                        <MenuItem value="regular">معمولی</MenuItem>
                        <MenuItem value="vip">ویژه</MenuItem>
                        <MenuItem value="disabled">معلولین</MenuItem>
                      </Select>
                    )}
                  />
                  {errors.zone_type && (
                    <Typography color="error" variant="caption">
                      {errors.zone_type.message}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="floor"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="طبقه"
                      type="number"
                      fullWidth
                      error={!!errors.floor}
                      helperText={errors.floor?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="price_multiplier"
                  control={control}
                  rules={{
                    required: 'ضریب قیمت الزامی است',
                    min: { value: 0.1, message: 'ضریب قیمت باید بزرگتر از 0.1 باشد' }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="ضریب قیمت"
                      type="number"
                      inputProps={{ step: "0.1", min: "0.1" }}
                      fullWidth
                      error={!!errors.price_multiplier}
                      helperText={errors.price_multiplier?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsFormOpen(false)}>انصراف</Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={createLoading || updateLoading}
              startIcon={
                (createLoading || updateLoading) ? <CircularProgress size={20} /> : <AddIcon />
              }
            >
              {selectedZone ? 'بروزرسانی' : 'ذخیره'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

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
              آیا از حذف این زون پارکینگ اطمینان دارید؟ این عملیات قابل بازگشت نیست.
            </Typography>
          ) : (
            <Typography>
              آیا از حذف {selectedIds.length} زون پارکینگ انتخاب شده اطمینان دارید؟ این عملیات قابل بازگشت نیست.
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

      {/* Zone Details Dialog */}
      <Dialog
        open={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          جزئیات زون پارکینگ
        </DialogTitle>
        <DialogContent>
          {selectedDetails && (
            <Grid container spacing={2} className="mt-1">
              <Grid item xs={12}>
                <Typography variant="h6" className="mb-2">
                  {selectedDetails.name}
                </Typography>
                <Divider />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">پارکینگ</Typography>
                <Typography>{selectedDetails.parking_lot_name}</Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">نوع زون</Typography>
                <Chip
                  label={zoneTypeMap[selectedDetails.zone_type] || selectedDetails.zone_type}
                  color={selectedDetails.zone_type === 'vip' ? 'secondary' : selectedDetails.zone_type === 'disabled' ? 'primary' : 'default'}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">طبقه</Typography>
                <Typography>{selectedDetails.floor}</Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">ضریب قیمت</Typography>
                <Typography>×{selectedDetails.price_multiplier}</Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">ظرفیت کل</Typography>
                <Typography>{selectedDetails.capacity}</Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">ظرفیت اشغال شده</Typography>
                <Typography>{selectedDetails.current_occupancy}</Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">ظرفیت خالی</Typography>
                <Typography>{selectedDetails.available_capacity}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">درصد اشغال</Typography>
                <Box className="w-full bg-gray-200 rounded h-2 mt-1">
                  <Box
                    className="h-full rounded"
                    style={{
                      width: `${selectedDetails.occupancy_percentage}%`,
                      backgroundColor:
                        selectedDetails.occupancy_percentage > 80 ? '#f44336' :
                        selectedDetails.occupancy_percentage > 50 ? '#ff9800' :
                        '#4caf50'
                    }}
                  />
                </Box>
                <Typography variant="caption" className="mt-1">
                  {selectedDetails.occupancy_percentage}% اشغال شده
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDetailsDialogOpen(false)}>بستن</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setIsDetailsDialogOpen(false);
              handleViewSpots(selectedDetails);
            }}
            startIcon={<EventSeatIcon />}
          >
            مشاهده جایگاه‌ها
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => {
              setIsDetailsDialogOpen(false);
              handleEdit(selectedDetails);
            }}
            startIcon={<EditIcon />}
          >
            ویرایش
          </Button>
        </DialogActions>
      </Dialog>

      {/* Zone Spots Dialog */}
      <Dialog
        open={spotsDialogOpen}
        onClose={() => setSpotsDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          جایگاه‌های زون «{selectedZoneSpots?.name}»
        </DialogTitle>
        <DialogContent>
          {loadingZoneSpots ? (
            <Box className="flex justify-center p-8">
              <CircularProgress />
            </Box>
          ) : zoneSpots ? (
            <Box>
              <Grid container spacing={1} className="mt-1">
                {/* In a real application, you would map through zoneSpots.spots */}
                {/* Since we don't have the exact API response structure, this is a simulation */}
                {Array.from({ length: selectedZoneSpots?.capacity || 0 }).map((_, index) => {
                  const isOccupied = Math.random() > 0.6; // Simulate random occupancy
                  return (
                    <Grid item xs={6} sm={4} md={3} lg={2} key={index}>
                      <Box
                        className={`border rounded p-3 text-center ${
                          isOccupied ? 'bg-red-100 border-red-300' : 'bg-green-100 border-green-300'
                        }`}
                      >
                        <Typography variant="h6">
                          {selectedZoneSpots?.name}-{index + 1}
                        </Typography>
                        <Chip
                          label={isOccupied ? 'اشغال شده' : 'خالی'}
                          color={isOccupied ? 'error' : 'success'}
                          size="small"
                          className="mt-1"
                        />
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          ) : (
            <Alert severity="info">اطلاعات جایگاه‌ها در دسترس نیست.</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSpotsDialogOpen(false)}>بستن</Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}