'use client';

import { Box, Paper, Typography, Container } from '@mui/material';
import Image from 'next/image';
import LoginForm from '@/components/forms/LoginForm';

export default function LoginPage() {
  return (
    <Box
      className="min-h-screen bg-cover bg-center flex items-center justify-center p-4"
      style={{ backgroundImage: 'url(/images/parking-bg.jpg)' }}
    >
      <Container maxWidth="sm">
        <Paper elevation={3} className="p-8">
          <Box className="flex flex-col items-center mb-6">
            <Image
              src="/images/logo.svg"
              alt="Smart Parking Logo"
              width={64}
              height={64}
              className="mb-4"
            />
            <Typography component="h1" variant="h4" align="center" className="font-bold">
              سیستم پارکینگ هوشمند
            </Typography>
            <Typography component="h2" variant="h6" align="center" color="text.secondary">
              ورود به حساب کاربری
            </Typography>
          </Box>

          <LoginForm />
        </Paper>
      </Container>
    </Box>
  );
}