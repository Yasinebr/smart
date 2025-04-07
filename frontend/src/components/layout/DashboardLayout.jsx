'use client';

import { useState } from 'react';
import { Box } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

const drawerWidth = 260;

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box className="flex h-screen flex-row-reverse bg-gray-50">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        drawerWidth={drawerWidth}
      />

      <Box
        component="main"
        className="flex-grow"
        sx={{
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          ml: { lg: `${drawerWidth}px` },
        }}
      >
        <Header onSidebarToggle={handleSidebarToggle} />

        <Box className="p-6 mt-16 min-h-[calc(100vh-132px)]">
          {children}
        </Box>

        <Footer />
      </Box>
    </Box>
  );
};

export default DashboardLayout;