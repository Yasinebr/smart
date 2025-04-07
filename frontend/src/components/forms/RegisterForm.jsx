'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Box,
  Button,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import useAuth from '@/hooks/useAuth';

const RegisterForm = () => {
  const { register: registerUser, loading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password', '');

  const onSubmit = async (data) => {
    try {
      const userData = {
        email: data.email,
        password: data.password,
        confirm_password: data.confirmPassword,
        first_name: data.firstName,
        last_name: data.lastName,
        phone_number: data.phoneNumber,
        role: data.role,
      };
      await registerUser(userData);
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate className="w-full">
      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      <Box className="flex flex-wrap gap-4">
        <TextField
          margin="normal"
          required
          fullWidth
          id="firstName"
          label="نام"
          name="firstName"
          autoComplete="given-name"
          autoFocus
          error={!!errors.firstName}
          helperText={errors.firstName?.message}
          disabled={loading}
          {...register('firstName', {
            required: 'لطفا نام خود را وارد کنید',
          })}
          className="mb-2 w-full md:w-[calc(50%-8px)]"
        />

        <TextField
          margin="normal"
          required
          fullWidth
          id="lastName"
          label="نام خانوادگی"
          name="lastName"
          autoComplete="family-name"
          error={!!errors.lastName}
          helperText={errors.lastName?.message}
          disabled={loading}
          {...register('lastName', {
            required: 'لطفا نام خانوادگی خود را وارد کنید',
          })}
          className="mb-2 w-full md:w-[calc(50%-8px)]"
        />
      </Box>

      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="آدرس ایمیل"
        name="email"
        autoComplete="email"
        error={!!errors.email}
        helperText={errors.email?.message}
        disabled={loading}
        {...register('email', {
          required: 'لطفا آدرس ایمیل خود را وارد کنید',
          pattern: {
            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            message: 'آدرس ایمیل معتبر نیست',
          },
        })}
        className="mb-2"
      />

      <TextField
        margin="normal"
        fullWidth
        id="phoneNumber"
        label="شماره تلفن"
        name="phoneNumber"
        autoComplete="tel"
        error={!!errors.phoneNumber}
        helperText={errors.phoneNumber?.message}
        disabled={loading}
        {...register('phoneNumber', {
          pattern: {
            value: /^[0-9]{10,15}$/,
            message: 'شماره تلفن معتبر نیست',
          },
        })}
        className="mb-2"
      />

      <FormControl fullWidth margin="normal" className="mb-2">
        <InputLabel id="role-label">نقش کاربری</InputLabel>
        <Select
          labelId="role-label"
          id="role"
          label="نقش کاربری"
          defaultValue="customer"
          disabled={loading}
          {...register('role')}
        >
          <MenuItem value="customer">مشتری</MenuItem>
          <MenuItem value="parking_manager">مدیر پارکینگ</MenuItem>
          <MenuItem value="admin">مدیر سیستم</MenuItem>
        </Select>
      </FormControl>

      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="رمز عبور"
        type={showPassword ? 'text' : 'password'}
        id="password"
        autoComplete="new-password"
        error={!!errors.password}
        helperText={errors.password?.message}
        disabled={loading}
        {...register('password', {
          required: 'لطفا رمز عبور را وارد کنید',
          minLength: {
            value: 6,
            message: 'رمز عبور باید حداقل 6 کاراکتر باشد',
          },
        })}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
              >
                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        className="mb-2"
      />

      <TextField
        margin="normal"
        required
        fullWidth
        name="confirmPassword"
        label="تکرار رمز عبور"
        type={showConfirmPassword ? 'text' : 'password'}
        id="confirmPassword"
        autoComplete="new-password"
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword?.message}
        disabled={loading}
        {...register('confirmPassword', {
          required: 'لطفا تکرار رمز عبور را وارد کنید',
          validate: (value) =>
            value === password || 'رمز عبور و تکرار آن مطابقت ندارند',
        })}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle confirm password visibility"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                edge="end"
              >
                {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        className="mb-2"
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        disabled={loading}
        className="mt-4"
      >
        {loading ? <CircularProgress size={24} /> : 'ثبت‌نام'}
      </Button>

      <Typography className="mt-4 text-center">
        قبلاً ثبت‌نام کرده‌اید؟{' '}
        <Button href="/login" variant="text" color="primary" className="p-0 min-w-0">
          ورود
        </Button>
      </Typography>
    </Box>
  );
};

export default RegisterForm;