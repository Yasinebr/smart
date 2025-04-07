'use client';

import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Box,
  Tooltip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import useAuth from '@/hooks/useAuth';

const Header = ({ onSidebarToggle }) => {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  return (
    <AppBar position="fixed" className="z-10">
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onSidebarToggle}
          className="mr-2 lg:hidden"
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" component="div" className="flex-grow">
          سیستم پارکینگ هوشمند
        </Typography>

        <Box className="flex items-center">
          <Tooltip title="اعلان‌ها">
            <IconButton color="inherit" onClick={handleNotificationOpen}>
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={notificationAnchorEl}
            open={Boolean(notificationAnchorEl)}
            onClose={handleNotificationClose}
            PaperProps={{
              className: 'mt-2 w-72'
            }}
          >
            <MenuItem onClick={handleNotificationClose}>
              <div className="flex flex-col">
                <Typography variant="subtitle2">رزرو جدید</Typography>
                <Typography variant="body2" color="text.secondary">
                  یک رزرو جدید برای پارکینگ مرکزی ثبت شد.
                </Typography>
              </div>
            </MenuItem>
            <MenuItem onClick={handleNotificationClose}>
              <div className="flex flex-col">
                <Typography variant="subtitle2">تراکنش موفق</Typography>
                <Typography variant="body2" color="text.secondary">
                  پرداخت شما با موفقیت انجام شد.
                </Typography>
              </div>
            </MenuItem>
            <MenuItem onClick={handleNotificationClose}>
              <div className="flex flex-col">
                <Typography variant="subtitle2">هشدار ظرفیت</Typography>
                <Typography variant="body2" color="text.secondary">
                  پارکینگ غربی به ظرفیت ۹۰٪ رسیده است.
                </Typography>
              </div>
            </MenuItem>
          </Menu>

          <Tooltip title="پروفایل کاربر">
            <IconButton color="inherit" onClick={handleMenuOpen} className="ml-2">
              {user?.profile_image ? (
                <Avatar
                  src={user.profile_image}
                  alt={`${user.first_name} ${user.last_name}`}
                  className="w-8 h-8"
                />
              ) : (
                <AccountCircleIcon />
              )}
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem>
              <div className="flex flex-col">
                <Typography variant="subtitle2">
                  {user ? `${user.first_name} ${user.last_name}` : 'کاربر'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email || 'بدون ایمیل'}
                </Typography>
              </div>
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>پروفایل من</MenuItem>
            <MenuItem onClick={handleMenuClose}>تنظیمات</MenuItem>
            <MenuItem onClick={handleLogout}>خروج</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;