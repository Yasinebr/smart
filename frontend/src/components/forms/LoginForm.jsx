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
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import useAuth from '@/hooks/useAuth';

const LoginForm = () => {
  const { login, loading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate className="w-full">
      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="آدرس ایمیل"
        name="email"
        autoComplete="email"
        autoFocus
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
        className="mb-4"
      />

      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="رمز عبور"
        type={showPassword ? 'text' : 'password'}
        id="password"
        autoComplete="current-password"
        error={!!errors.password}
        helperText={errors.password?.message}
        disabled={loading}
        {...register('password', {
          required: 'لطفا رمز عبور خود را وارد کنید',
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
        className="mb-4"
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        disabled={loading}
        className="mt-4"
      >
        {loading ? <CircularProgress size={24} /> : 'ورود'}
      </Button>

      <Typography className="mt-4 text-center">
        حساب کاربری ندارید؟{' '}
        <Button
          href="/register"
          variant="text"
          color="primary"
          className="p-0 min-w-0"
        >
          ثبت‌نام
        </Button>
      </Typography>
    </Box>
  );
};

export default LoginForm;