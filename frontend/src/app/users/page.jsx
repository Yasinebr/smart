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
  Avatar,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/tables/DataTable';
import useApi from '@/hooks/useApi';
import api from '@/utils/api';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import { useForm, Controller } from 'react-hook-form';

// Role labels in Persian
const roleLabels = {
  admin: 'مدیر سیستم',
  parking_manager: 'مدیر پارکینگ',
  customer: 'مشتری',
};

// Role icons
const roleIcons = {
  admin: <AdminPanelSettingsIcon fontSize="small" />,
  parking_manager: <LocalParkingIcon fontSize="small" />,
  customer: <PersonIcon fontSize="small" />,
};

const UserForm = ({ open, onClose, initialData, onSubmit, loading }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: initialData || {
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      role: 'customer',
      password: '',
      confirm_password: '',
      date_of_birth: '',
      address: '',
      national_id: '',
    },
  });

  const isEditMode = !!initialData;
  const password = watch('password');

  return (
    <Dialog
      open={open}
      onClose={() => !loading && onClose()}
      maxWidth="md"
      fullWidth
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>
          {isEditMode ? 'ویرایش کاربر' : 'افزودن کاربر جدید'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} className="mt-1">
            <Grid item xs={12} md={6}>
              <Controller
                name="first_name"
                control={control}
                rules={{ required: 'نام الزامی است' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="نام"
                    fullWidth
                    error={!!errors.first_name}
                    helperText={errors.first_name?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="last_name"
                control={control}
                rules={{ required: 'نام خانوادگی الزامی است' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="نام خانوادگی"
                    fullWidth
                    error={!!errors.last_name}
                    helperText={errors.last_name?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="email"
                control={control}
                rules={{
                  required: 'ایمیل الزامی است',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'ایمیل نامعتبر است'
                  }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="ایمیل"
                    type="email"
                    fullWidth
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    disabled={isEditMode} // Email cannot be changed in edit mode
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="phone_number"
                control={control}
                rules={{
                  pattern: {
                    value: /^[0-9]{10,15}$/,
                    message: 'شماره تلفن نامعتبر است'
                  }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="شماره تلفن"
                    fullWidth
                    error={!!errors.phone_number}
                    helperText={errors.phone_number?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.role}>
                <InputLabel id="role-label">نقش کاربری</InputLabel>
                <Controller
                  name="role"
                  control={control}
                  rules={{ required: 'انتخاب نقش الزامی است' }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="role-label"
                      label="نقش کاربری"
                      disabled={isEditMode} // Role cannot be changed in edit mode
                    >
                      <MenuItem value="admin">مدیر سیستم</MenuItem>
                      <MenuItem value="parking_manager">مدیر پارکینگ</MenuItem>
                      <MenuItem value="customer">مشتری</MenuItem>
                    </Select>
                  )}
                />
                {errors.role && (
                  <Typography color="error" variant="caption">
                    {errors.role.message}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="national_id"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="کد ملی"
                    fullWidth
                    error={!!errors.national_id}
                    helperText={errors.national_id?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
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
                    rows={2}
                    error={!!errors.address}
                    helperText={errors.address?.message}
                  />
                )}
              />
            </Grid>

            {!isEditMode && (
              <>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="password"
                    control={control}
                    rules={{
                      required: 'رمز عبور الزامی است',
                      minLength: {
                        value: 6,
                        message: 'رمز عبور باید حداقل 6 کاراکتر باشد'
                      }
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="رمز عبور"
                        type="password"
                        fullWidth
                        error={!!errors.password}
                        helperText={errors.password?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="confirm_password"
                    control={control}
                    rules={{
                      required: 'تأیید رمز عبور الزامی است',
                      validate: value => value === password || 'رمز عبور و تأیید آن مطابقت ندارند'
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="تأیید رمز عبور"
                        type="password"
                        fullWidth
                        error={!!errors.confirm_password}
                        helperText={errors.confirm_password?.message}
                      />
                    )}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            انصراف
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <PersonAddIcon />}
          >
            {isEditMode ? 'بروزرسانی' : 'ذخیره'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default function UsersPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [userVehicles, setUserVehicles] = useState([]);

  const { data, loading, error, execute: fetchUsers } = useApi(
    api.getUsers,
    true
  );

  const { execute: deleteUser, loading: deleteLoading } = useApi(
    (id) => api.deleteUser(id)
  );

  const { execute: createUser } = useApi(
    (data) => api.register(data)
  );

  const { execute: updateUser } = useApi(
    (id, data) => api.updateUser(id, data)
  );

  const { execute: fetchUserVehicles, loading: loadingVehicles } = useApi(
    (id) => api.getUserVehicles(id)
  );

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAddNew = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleDelete = (ids) => {
    setSelectedIds(ids);
    setIsDeleteDialogOpen(true);
  };

  const handleViewDetails = async (user) => {
    setSelectedDetails(user);
    setIsDetailsDialogOpen(true);

    try {
      const response = await fetchUserVehicles(user.id);
      setUserVehicles(response || []);
    } catch (error) {
      console.error('Error fetching user vehicles:', error);
    }
  };

  const confirmDelete = async () => {
    try {
      // Delete all selected users
      await Promise.all(selectedIds.map(id => deleteUser(id)));

      // Refresh the data
      fetchUsers();

      // Close the dialog
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting users:', error);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      setFormLoading(true);

      if (selectedUser) {
        // Update existing user
        // Remove password fields for update
        const { password, confirm_password, ...updateData } = formData;
        await updateUser(selectedUser.id, updateData);
      } else {
        // Create new user
        await createUser(formData);
      }

      // Refresh the data
      fetchUsers();

      // Close the form
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error saving user:', error);
    } finally {
      setFormLoading(false);
    }
  };

  // Format data for the table
  const users = data?.results || [];

  // Filter users based on tab
  const filteredUsers = tabValue === 0
    ? users
    : users.filter(user => user.role === ['admin', 'parking_manager', 'customer'][tabValue - 1]);

  const columns = [
    {
      id: 'first_name',
      label: 'نام',
      minWidth: 100,
    },
    {
      id: 'last_name',
      label: 'نام خانوادگی',
      minWidth: 120,
    },
    {
      id: 'email',
      label: 'ایمیل',
      minWidth: 180,
    },
    {
      id: 'phone_number',
      label: 'شماره تلفن',
      minWidth: 130,
      format: (value) => value || '-',
    },
    {
      id: 'role',
      label: 'نقش',
      minWidth: 140,
      align: 'center',
      format: (value) => (
        <Chip
          icon={roleIcons[value]}
          label={roleLabels[value] || value}
          color={value === 'admin' ? 'error' : value === 'parking_manager' ? 'primary' : 'default'}
          size="small"
        />
      ),
    },
    {
      id: 'created_at',
      label: 'تاریخ ثبت‌نام',
      minWidth: 150,
      format: (value) => new Date(value).toLocaleDateString('fa-IR'),
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
        </Box>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <Box className="mb-6">
        <Typography variant="h4" className="font-bold">
          مدیریت کاربران
        </Typography>
        <Typography variant="body1" color="text.secondary">
          در این بخش می‌توانید کاربران سیستم را مدیریت کنید.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" className="mb-4">
          خطا در بارگذاری اطلاعات: {error.message}
        </Alert>
      )}

      <Box className="mb-4">
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab label="همه کاربران" />
          <Tab label="مدیران سیستم" />
          <Tab label="مدیران پارکینگ" />
          <Tab label="مشتریان" />
        </Tabs>
      </Box>

      <DataTable
        title="لیست کاربران"
        rows={filteredUsers}
        columns={columns}
        loading={loading}
        onAdd={handleAddNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={fetchUsers}
        searchPlaceholder="جستجو در نام، نام خانوادگی یا ایمیل..."
        initialSortBy="last_name"
      />

      {/* User Form Dialog */}
      <UserForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={selectedUser}
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
              آیا از حذف این کاربر اطمینان دارید؟ این عملیات قابل بازگشت نیست.
            </Typography>
          ) : (
            <Typography>
              آیا از حذف {selectedIds.length} کاربر انتخاب شده اطمینان دارید؟ این عملیات قابل بازگشت نیست.
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

      {/* User Details Dialog */}
      <Dialog
        open={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          اطلاعات کاربر
        </DialogTitle>
        <DialogContent>
          {selectedDetails && (
            <Box>
              <Box className="flex items-center mb-4">
                <Avatar
                  src={selectedDetails.profile_image}
                  alt={`${selectedDetails.first_name} ${selectedDetails.last_name}`}
                  className="w-16 h-16 ml-4"
                >
                  {selectedDetails.first_name?.charAt(0) || 'U'}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {selectedDetails.first_name} {selectedDetails.last_name}
                  </Typography>
                  <Chip
                    icon={roleIcons[selectedDetails.role]}
                    label={roleLabels[selectedDetails.role] || selectedDetails.role}
                    color={selectedDetails.role === 'admin' ? 'error' : selectedDetails.role === 'parking_manager' ? 'primary' : 'default'}
                    size="small"
                    className="mt-1"
                  />
                </Box>
              </Box>

              <Divider className="mb-4" />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">ایمیل</Typography>
                  <Typography>{selectedDetails.email}</Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">شماره تلفن</Typography>
                  <Typography>{selectedDetails.phone_number || '-'}</Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">کد ملی</Typography>
                  <Typography>{selectedDetails.national_id || '-'}</Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">تاریخ تولد</Typography>
                  <Typography>{selectedDetails.date_of_birth ? new Date(selectedDetails.date_of_birth).toLocaleDateString('fa-IR') : '-'}</Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">آدرس</Typography>
                  <Typography>{selectedDetails.address || '-'}</Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">تاریخ عضویت</Typography>
                  <Typography>{new Date(selectedDetails.created_at).toLocaleDateString('fa-IR')}</Typography>
                </Grid>
              </Grid>

              <Box className="mt-4">
                <Typography variant="h6" className="mb-2">
                  خودروهای کاربر
                </Typography>

                {loadingVehicles ? (
                  <Box className="flex justify-center p-4">
                    <CircularProgress />
                  </Box>
                ) : userVehicles && userVehicles.length > 0 ? (
                  <Grid container spacing={2}>
                    {userVehicles.map((vehicle) => (
                      <Grid item xs={12} md={6} key={vehicle.id}>
                        <Box className="border rounded p-3">
                          <Box className="flex items-center">
                            <DirectionsCarIcon className="ml-2" />
                            <Typography variant="subtitle1">
                              {vehicle.make} {vehicle.model}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            پلاک: {vehicle.license_plate}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            رنگ: {vehicle.color || '-'}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography className="text-center text-gray-500 p-4">
                    هیچ خودرویی برای این کاربر ثبت نشده است.
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDetailsDialogOpen(false)}>بستن</Button>
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
    </DashboardLayout>
  );
}