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
  Paper,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/tables/DataTable';
import useApi from '@/hooks/useApi';
import api from '@/utils/api';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import AirportShuttleIcon from '@mui/icons-material/AirportShuttle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { useForm, Controller } from 'react-hook-form';

const vehicleTypes = [
  { value: 'sedan', label: 'سواری', icon: <DirectionsCarIcon /> },
  { value: 'suv', label: 'شاسی بلند', icon: <DirectionsCarIcon /> },
  { value: 'hatchback', label: 'هاچبک', icon: <DirectionsCarIcon /> },
  { value: 'pickup', label: 'وانت', icon: <LocalShippingIcon /> },
  { value: 'van', label: 'ون', icon: <AirportShuttleIcon /> },
  { value: 'truck', label: 'کامیون', icon: <LocalShippingIcon /> },
  { value: 'motorcycle', label: 'موتورسیکلت', icon: <TwoWheelerIcon /> },
];

const CategoryForm = ({ open, onClose, initialData, onSubmit, loading }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: initialData || {
      name: '',
      description: '',
      price_multiplier: 1,
      allowed_vehicle_types: {},
    },
  });

  // Set initial values for allowed_vehicle_types checkboxes
  useState(() => {
    if (initialData && initialData.allowed_vehicle_types) {
      const allowedTypes = initialData.allowed_vehicle_types;
      vehicleTypes.forEach(type => {
        setValue(`allowed_vehicle_types.${type.value}`, !!allowedTypes[type.value]);
      });
    }
  }, [initialData]);

  // Convert form data to API format before submission
  const handleFormSubmit = (data) => {
    const formattedData = {
      ...data,
      // Convert checkboxes to object format
      allowed_vehicle_types: Object.fromEntries(
        Object.entries(data.allowed_vehicle_types || {})
          .filter(([_, checked]) => checked)
          .map(([key]) => [key, true])
      ),
    };

    onSubmit(formattedData);
  };

  return (
    <Dialog
      open={open}
      onClose={() => !loading && onClose()}
      maxWidth="md"
      fullWidth
    >
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogTitle>
          {initialData ? 'ویرایش دسته‌بندی' : 'افزودن دسته‌بندی جدید'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} className="mt-1">
            <Grid item xs={12} md={6}>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'نام دسته‌بندی الزامی است' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="نام دسته‌بندی"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
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
                  min: { value: 0.1, message: 'ضریب قیمت نمی‌تواند کمتر از 0.1 باشد' }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="ضریب قیمت"
                    type="number"
                    inputProps={{ step: 0.1, min: 0.1 }}
                    fullWidth
                    error={!!errors.price_multiplier}
                    helperText={errors.price_multiplier?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="توضیحات"
                    fullWidth
                    multiline
                    rows={3}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                انواع خودرو مجاز
              </Typography>
              <FormControl component="fieldset">
                <FormGroup className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {vehicleTypes.map((type) => (
                    <Controller
                      key={type.value}
                      name={`allowed_vehicle_types.${type.value}`}
                      control={control}
                      render={({ field: { onChange, value, ...field } }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={!!value}
                              onChange={(e) => onChange(e.target.checked)}
                              {...field}
                            />
                          }
                          label={
                            <Box className="flex items-center">
                              {type.icon}
                              <span className="mr-1">{type.label}</span>
                            </Box>
                          }
                        />
                      )}
                    />
                  ))}
                </FormGroup>
              </FormControl>
            </Grid>
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
            {initialData ? 'بروزرسانی' : 'ذخیره'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default function VehicleCategoriesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [formLoading, setFormLoading] = useState(false);

  const { data, loading, error, execute: fetchCategories } = useApi(
    api.getVehicleCategories,
    true
  );

  const { execute: deleteCategory, loading: deleteLoading } = useApi(
    (id) => api.deleteVehicleCategory(id)
  );

  const { execute: createCategory } = useApi(
    (data) => api.createVehicleCategory(data)
  );

  const { execute: updateCategory } = useApi(
    (id, data) => api.updateVehicleCategory(id, data)
  );

  const handleAddNew = () => {
    setSelectedCategory(null);
    setIsFormOpen(true);
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setIsFormOpen(true);
  };

  const handleDelete = (ids) => {
    setSelectedIds(ids);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      // Delete all selected categories
      await Promise.all(selectedIds.map(id => deleteCategory(id)));

      // Refresh the data
      fetchCategories();

      // Close the dialog
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting categories:', error);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      setFormLoading(true);

      if (selectedCategory) {
        // Update existing category
        await updateCategory(selectedCategory.id, formData);
      } else {
        // Create new category
        await createCategory(formData);
      }

      // Refresh the data
      fetchCategories();

      // Close the form
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error saving category:', error);
    } finally {
      setFormLoading(false);
    }
  };

  // Format data for the table
  const categories = data?.results || [];

  const columns = [
    {
      id: 'name',
      label: 'نام دسته‌بندی',
      minWidth: 150,
    },
    {
      id: 'description',
      label: 'توضیحات',
      minWidth: 200,
      format: (value) => value || '---',
    },
    {
      id: 'price_multiplier',
      label: 'ضریب قیمت',
      minWidth: 120,
      align: 'center',
      format: (value) => `×${value}`,
    },
    {
      id: 'allowed_vehicle_types',
      label: 'انواع خودرو',
      minWidth: 200,
      format: (value) => {
        const types = Object.keys(value || {});
        return types.length > 0 ? (
          <Box className="flex flex-wrap gap-1">
            {types.map(type => {
              const vehicleType = vehicleTypes.find(vt => vt.value === type);
              return (
                <Chip
                  key={type}
                  label={vehicleType ? vehicleType.label : type}
                  size="small"
                  icon={vehicleType ? vehicleType.icon : <DirectionsCarIcon />}
                />
              );
            })}
          </Box>
        ) : '---';
      },
    },
    {
      id: 'actions',
      label: 'عملیات',
      minWidth: 120,
      align: 'center',
      sortable: false,
      format: (value, row) => (
        <Box className="flex justify-center">
          <Tooltip title="ویرایش">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(row);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="حذف">
            <IconButton
              size="small"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete([row.id]);
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // Predefined categories cards for quick creation
  const predefinedCategories = [
    {
      name: 'استاندارد',
      description: 'خودروهای سواری استاندارد',
      price_multiplier: 1.0,
      allowed_vehicle_types: { sedan: true, hatchback: true },
      icon: <DirectionsCarIcon fontSize="large" />,
      color: 'primary.light',
    },
    {
      name: 'لوکس',
      description: 'خودروهای لوکس و شاسی بلند',
      price_multiplier: 1.5,
      allowed_vehicle_types: { suv: true, sedan: true },
      icon: <DirectionsCarIcon fontSize="large" />,
      color: 'secondary.main',
    },
    {
      name: 'موتور',
      description: 'موتورسیکلت‌ها',
      price_multiplier: 0.7,
      allowed_vehicle_types: { motorcycle: true },
      icon: <TwoWheelerIcon fontSize="large" />,
      color: 'success.main',
    },
    {
      name: 'تجاری',
      description: 'وسایل نقلیه تجاری',
      price_multiplier: 2.0,
      allowed_vehicle_types: { van: true, pickup: true, truck: true },
      icon: <LocalShippingIcon fontSize="large" />,
      color: 'warning.main',
    },
  ];

  return (
    <DashboardLayout>
      <Box className="mb-6">
        <Typography variant="h4" className="font-bold">
          مدیریت دسته‌بندی خودروها
        </Typography>
        <Typography variant="body1" color="text.secondary">
          در این بخش می‌توانید دسته‌بندی‌های خودرو را ایجاد و مدیریت کنید.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" className="mb-4">
          خطا در بارگذاری اطلاعات: {error.message}
        </Alert>
      )}

      {/* Predefined Categories */}
      <Box className="mb-8">
        <Typography variant="h6" className="mb-4">
          دسته‌بندی‌های پیش‌فرض
        </Typography>

        <Grid container spacing={3}>
          {predefinedCategories.map((category, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card className="text-center h-full flex flex-col">
                <CardHeader
                  title={category.name}
                  subheader={`ضریب قیمت: ×${category.price_multiplier}`}
                />
                <CardContent className="flex-grow">
                  <Box
                    className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full"
                    sx={{ bgcolor: `${category.color}30` }}
                  >
                    <Box sx={{ color: category.color }}>
                      {category.icon}
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" className="mb-3">
                    {category.description}
                  </Typography>
                  <Typography variant="subtitle2" className="mb-2">انواع خودرو:</Typography>
                  <Box className="flex flex-wrap gap-1 justify-center">
                    {Object.keys(category.allowed_vehicle_types).map(type => {
                      const vehicleType = vehicleTypes.find(vt => vt.value === type);
                      return (
                        <Chip
                          key={type}
                          label={vehicleType ? vehicleType.label : type}
                          size="small"
                          icon={vehicleType ? vehicleType.icon : <DirectionsCarIcon />}
                        />
                      );
                    })}
                  </Box>
                </CardContent>
                <Box className="p-2 pt-0">
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => {
                      setSelectedCategory(category);
                      setIsFormOpen(true);
                    }}
                  >
                    استفاده از این الگو
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box className="mb-4">
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddNew}
        >
          افزودن دسته‌بندی جدید
        </Button>
      </Box>

      <DataTable
        title="لیست دسته‌بندی‌های خودرو"
        rows={categories}
        columns={columns}
        loading={loading}
        onAdd={handleAddNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={fetchCategories}
        searchPlaceholder="جستجو در نام یا توضیحات..."
        initialSortBy="name"
      />

      {/* Category Form Dialog */}
      <CategoryForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={selectedCategory}
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
              آیا از حذف این دسته‌بندی اطمینان دارید؟ این عملیات قابل بازگشت نیست.
            </Typography>
          ) : (
            <Typography>
              آیا از حذف {selectedIds.length} دسته‌بندی انتخاب شده اطمینان دارید؟ این عملیات قابل بازگشت نیست.
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