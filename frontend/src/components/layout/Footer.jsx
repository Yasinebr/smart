'use client';

import { Box, Typography, Link as MuiLink } from '@mui/material';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box component="footer" className="py-4 px-6 text-center bg-white border-t border-gray-200">
      <Typography variant="body2" color="text.secondary">
        &copy; {currentYear} سیستم پارکینگ هوشمند. کلیه حقوق محفوظ است.
      </Typography>
    </Box>
  );
};

export default Footer;