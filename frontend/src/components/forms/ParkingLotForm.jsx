'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
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
import useApi from '@/hooks/useApi';
import api from '@/utils/api';

const ParkingLotForm = ({ open, onClose, initialData = null, onSubmitSuccess }) => {
  const [error, setError] = useState(null);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);

  const { execute: fetchManagers, loading: loadingManagers } = useApi(
    () => api.getUsers({ role: 'parking_manager' })
  );

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      address: '',
      latitude: '',
      longitude: '',
      total_capacity: 100,
      hourly_rate: 0,
      daily_rate: 0,
      monthly_rate: 0,
      has_cctv: false,
      has_elevator: false,
      has_electric_charger: false,
      indoor: false,
      opening_time: '',
      closing_time: '',
      is_24h: true,
      manager: '',
    },
  });

  const is24h = watch('is_24h');

  // Load managers when the component mounts
  useEffect(() => {
    const loadManagers = async () => {
      try {
        const response = await fetchManagers();
        if (response && response.results) {
          setManagers(response.results);
        }
      } catch (err) {
        console.error('Failed to load managers:', err);
      }
    };

    loadManagers();
  }, [fetchManagers]);

  // Reset form when initialData changes
  useEffect(() => {
    if (open) {
      if (initialData) {
        // Fill form with initial data for editing
        Object.keys(initialData).forEach((key) => {
          if (key in initialData && initialData[key] !== null) {
            setValue(key, initialData[key]);
          }
        });
      } else {
        // Reset form for creating new
        reset({
          name: '',
          address: '',
          latitude: '',
          longitude: '',
          total_capacity: 100,
          hourly_rate: 0,
          daily_rate: 0,
          monthly_rate: 0,
          has_cctv: false,
          has_elevator: false,
          has_electric_charger: false,
          indoor: false,
          opening_time: '',
          closing_time: '',
          is_24h: true,
          manager: '',
        });
      }
    }
  }, [initialData, open, reset, setValue]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);

      // Convert string values to numbers where appropriate
      const formattedData = {
        ...data,
        total_capacity: Number(data.total_capacity),
        hourly_rate: Number(data.hourly_rate),
        daily_rate: Number(data.daily_rate),
        monthly_rate: Number(data.monthly_rate),
      };

      if (initialData) {
        // Update existing parking lot
        await api.updateParkingLot(initialData.id, formattedData);
      } else {
        // Create new parking lot
        await api.createParkingLot(formattedData);
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
            {initialData ? 'ویرایش پارکینگ' : 'افزودن پارکینگ جدید'}
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
                name="name"
                control={control}
                rules={{ required: 'نام پارکینگ الزامی است' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="نام پارکینگ"
                    fullWidth
                    required
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={loading}>
                <InputLabel id="manager-label">مدیر پارکینگ</InputLabel>
                <Controller
                  name="manager"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="manager-label"
                      label="مدیر پارکینگ"
                    >
                      <MenuItem value="">انتخاب نشده</MenuItem>
                      {managers.map((manager) => (
                        <MenuItem key={manager.id} value={manager.id}>
                          {`${manager.first_name} ${manager.last_name} (${manager.email})`}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="address"
                control={control}
                rules={{ required: 'آدرس پارکینگ الزامی است' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="آدرس پارکینگ"
                    fullWidth
                    required
                    multiline
                    rows={2}
                    error={!!errors.address}
                    helperText={errors.address?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="latitude"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="عرض جغرافیایی"
                    fullWidth
                    type="number"
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="longitude"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="طول جغرافیایی"
                    fullWidth
                    type="number"
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="total_capacity"
                control={control}
                rules={{ required: 'ظرفیت کل الزامی است' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="ظرفیت کل"
                    fullWidth
                    required
                    type="number"
                    inputProps={{ min: 1 }}
                    error={!!errors.total_capacity}
                    helperText={errors.total_capacity?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="hourly_rate"
                control={control}
                rules={{ required: 'نرخ ساعتی الزامی است' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="نرخ ساعتی (تومان)"
                    fullWidth
                    required
                    type="number"
                    inputProps={{ min: 0 }}
                    error={!!errors.hourly_rate}
                    helperText={errors.hourly_rate?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="daily_rate"
                control={control}
                rules={{ required: 'نرخ روزانه الزامی است' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="نرخ روزانه (تومان)"
                    fullWidth
                    required
                    type="number"
                    inputProps={{ min: 0 }}
                    error={!!errors.daily_rate}
                    helperText={errors.daily_rate?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="monthly_rate"
                control={control}
                rules={{ required: 'نرخ ماهانه الزامی است' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="نرخ ماهانه (تومان)"
                    fullWidth
                    required
                    type="number"
                    inputProps={{ min: 0 }}
                    error={!!errors.monthly_rate}
                    helperText={errors.monthly_rate?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" className="mb-2">
                امکانات پارکینگ
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name="has_cctv"
                    control={control}
                    render={({ field: { onChange, value, ...field } }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={value}
                            onChange={(e) => onChange(e.target.checked)}
                            disabled={loading}
                            {...field}
                          />
                        }
                        label="دوربین مداربسته"
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name="has_elevator"
                    control={control}
                    render={({ field: { onChange, value, ...field } }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={value}
                            onChange={(e) => onChange(e.target.checked)}
                            disabled={loading}
                            {...field}
                          />
                        }
                        label="آسانسور"
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name="has_electric_charger"
                    control={control}
                    render={({ field: { onChange, value, ...field } }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={value}
                            onChange={(e) => onChange(e.target.checked)}
                            disabled={loading}
                            {...field}
                          />
                        }
                        label="شارژر خودرو برقی"
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name="indoor"
                    control={control}
                    render={({ field: { onChange, value, ...field } }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={value}
                            onChange={(e) => onChange(e.target.checked)}
                            disabled={loading}
                            {...field}
                          />
                        }
                        label="پارکینگ سرپوشیده"
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="is_24h"
                control={control}
                render={({ field: { onChange, value, ...field } }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                        disabled={loading}
                        {...field}
                      />
                    }
                    label="پارکینگ ۲۴ ساعته"
                  />
                )}
              />
            </Grid>

            {!is24h && (
              <>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="opening_time"
                    control={control}
                    rules={{ required: !is24h ? 'زمان باز شدن الزامی است' : false }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="زمان باز شدن"
                        fullWidth
                        type="time"
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.opening_time}
                        helperText={errors.opening_time?.message}
                        disabled={loading}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="closing_time"
                    control={control}
                    rules={{ required: !is24h ? 'زمان بسته شدن الزامی است' : false }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="زمان بسته شدن"
                        fullWidth
                        type="time"
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.closing_time}
                        helperText={errors.closing_time?.message}
                        disabled={loading}
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

export default ParkingLotForm;