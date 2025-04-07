'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  CircularProgress,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import api from '@/utils/api';

const VehicleForm = ({ open, onClose, initialData = null, onSubmitSuccess }) => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      license_plate: '',
      vehicle_type: 'sedan',
      make: '',
      model: '',
      year: '',
      color: '',
    },
  });

  // Reset form when initialData changes
  useState(() => {
    if (open) {
      if (initialData) {
        reset(initialData);
      } else {
        reset({
          license_plate: '',
          vehicle_type: 'sedan',
          make: '',
          model: '',
          year: '',
          color: '',
        });
      }
    }
  }, [initialData, open, reset]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);

      // Convert string values to numbers where appropriate
      const formattedData = {
        ...data,
        year: data.year ? Number(data.year) : null,
      };

      if (initialData) {
        // Update existing vehicle
        await api.updateVehicle(initialData.id, formattedData);
      } else {
        // Create new vehicle
        await api.createVehicle(formattedData);
      }

      onSubmitSuccess();
      onClose();
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err.response?.data?.message || 'خطا در ارسال اطلاعات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box className="flex justify-between items-center">
          <Typography variant="h6">
            {initialData ? 'ویرایش خودرو' : 'افزودن خودرو جدید'}
          </Typography>
          {!loading && (
            <Button
              onClick={onClose}
              color="inherit"
              startIcon={<CloseIcon />}
              size="small"
            >
              بستن
            </Button>
          )}
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {error && (
            <Alert severity="error" className="mb-4">
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Controller
                name="license_plate"
                control={control}
                rules={{ required: 'شماره پلاک الزامی است' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="شماره پلاک"
                    fullWidth
                    required
                    error={!!errors.license_plate}
                    helperText={errors.license_plate?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={loading}>
                <InputLabel id="vehicle-type-label">نوع خودرو</InputLabel>
                <Controller
                  name="vehicle_type"
                  control={control}
                  rules={{ required: 'نوع خودرو الزامی است' }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="vehicle-type-label"
                      label="نوع خودرو"
                      error={!!errors.vehicle_type}
                    >
                      <MenuItem value="sedan">سواری</MenuItem>
                      <MenuItem value="suv">شاسی بلند</MenuItem>
                      <MenuItem value="hatchback">هاچبک</MenuItem>
                      <MenuItem value="pickup">وانت</MenuItem>
                      <MenuItem value="van">ون</MenuItem>
                      <MenuItem value="truck">کامیون</MenuItem>
                      <MenuItem value="motorcycle">موتورسیکلت</MenuItem>
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="make"
                control={control}
                rules={{ required: 'سازنده خودرو الزامی است' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="سازنده"
                    fullWidth
                    required
                    error={!!errors.make}
                    helperText={errors.make?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="model"
                control={control}
                rules={{ required: 'مدل خودرو الزامی است' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="مدل"
                    fullWidth
                    required
                    error={!!errors.model}
                    helperText={errors.model?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="year"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="سال تولید"
                    fullWidth
                    type="number"
                    inputProps={{ min: 1900, max: new Date().getFullYear() + 1 }}
                    error={!!errors.year}
                    helperText={errors.year?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="color"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="رنگ"
                    fullWidth
                    error={!!errors.color}
                    helperText={errors.color?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={onClose}
            color="inherit"
            disabled={loading}
          >
            انصراف
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} color="inherit" />}
          >
            {initialData ? 'بروزرسانی' : 'ذخیره'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default VehicleForm;