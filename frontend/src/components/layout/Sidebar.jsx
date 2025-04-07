'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
  Box,
  Typography,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import PeopleIcon from '@mui/icons-material/People';
import PaymentIcon from '@mui/icons-material/Payment';
import AssessmentIcon from '@mui/icons-material/Assessment';
import FaceIcon from '@mui/icons-material/Face';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import MapIcon from '@mui/icons-material/Map';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import CategoryIcon from '@mui/icons-material/Category';
import BarChartIcon from '@mui/icons-material/BarChart';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import Image from 'next/image';

const menuItems = [
  {
    title: 'داشبورد',
    path: '/dashboard',
    icon: <DashboardIcon />,
  },
  {
    title: 'هوش مصنوعی',
    icon: <CameraAltIcon />,
    subItems: [
      {
        title: 'تشخیص چهره',
        path: '/ai/face',
        icon: <FaceIcon />,
      },
      {
        title: 'تشخیص پلاک',
        path: '/ai/license-plate',
        icon: <CameraAltIcon />,
      },
    ],
  },
  {
    title: 'پارکینگ',
    icon: <LocalParkingIcon />,
    subItems: [
      {
        title: 'پارکینگ‌ها',
        path: '/parking/lots',
        icon: <MapIcon />,
      },
      {
        title: 'زون‌ها',
        path: '/parking/zones',
        icon: <MapIcon />,
      },
      {
        title: 'جایگاه‌ها',
        path: '/parking/spots',
        icon: <EventSeatIcon />,
      },
      {
        title: 'رزرو‌ها',
        path: '/parking/reservations',
        icon: <EventAvailableIcon />,
      },
      {
        title: 'جلسات پارک',
        path: '/parking/sessions',
        icon: <AccessTimeIcon />,
      },
    ],
  },
  {
    title: 'کاربران',
    path: '/users',
    icon: <PeopleIcon />,
  },
  {
    title: 'خودروها',
    icon: <DirectionsCarIcon />,
    subItems: [
      {
        title: 'خودروها',
        path: '/vehicles',
        icon: <DirectionsCarIcon />,
      },
      {
        title: 'دسته‌بندی‌ها',
        path: '/vehicles/categories',
        icon: <CategoryIcon />,
      },
    ],
  },
  {
    title: 'پرداخت‌ها',
    icon: <PaymentIcon />,
    subItems: [
      {
        title: 'فاکتورها',
        path: '/payments/invoices',
        icon: <ReceiptIcon />,
      },
      {
        title: 'اشتراک‌ها',
        path: '/payments/subscriptions',
        icon: <CardMembershipIcon />,
      },
    ],
  },
  {
    title: 'گزارشات',
    icon: <AssessmentIcon />,
    subItems: [
      {
        title: 'گزارشات مالی',
        path: '/reports/financial',
        icon: <MonetizationOnIcon />,
      },
      {
        title: 'گزارشات پارکینگ',
        path: '/reports/parking',
        icon: <BarChartIcon />,
      },
    ],
  },
];

const Sidebar = ({ open, onClose, drawerWidth = 260 }) => {
  const pathname = usePathname();
  const [openSubMenus, setOpenSubMenus] = useState({});

  const handleSubMenuToggle = (title) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const isActive = (path) => {
    return pathname === path;
  };

  const drawer = (
    <div >
      <div className="p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="flex flex-col justify-center mb-2">
            <Image
              src="/images/logo.svg"
              alt="Smart Parking Logo"
              width={48}
              height={48}
              className="w-12 h-12"
            />
          </div>
          <Typography variant="h6" className="font-bold text-primary">
            پارکینگ هوشمند
          </Typography>
        </div>
      </div>

      <Divider />

      <List className="pt-0">
        {menuItems.map((item) => (
          <div key={item.title}>
            {item.subItems ? (
              <>
                <ListItem
                  button
                  onClick={() => handleSubMenuToggle(item.title)}
                  className={`my-1 rounded hover:bg-gray-100 ${
                    openSubMenus[item.title] ? 'bg-gray-100' : ''
                  }`}
                >
                  <ListItemIcon className="min-w-[40px]">
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.title} />
                  {openSubMenus[item.title] ? <ExpandLess /> : <ExpandMore />}
                </ListItem>

                <Collapse
                  in={openSubMenus[item.title]}
                  timeout="auto"
                  unmountOnExit
                >
                  <List component="div" disablePadding>
                    {item.subItems.map((subItem) => (
                      <Link href={subItem.path} key={subItem.title} passHref>
                        <ListItem
                          button
                          component="a"
                          className={`pl-8 my-1 rounded ${
                            isActive(subItem.path)
                              ? 'bg-primary bg-opacity-10 text-primary'
                              : 'hover:bg-gray-100'
                          }`}
                          onClick={onClose}
                        >
                          <ListItemIcon
                            className={`min-w-[40px] ${
                              isActive(subItem.path) ? 'text-primary' : ''
                            }`}
                          >
                            {subItem.icon}
                          </ListItemIcon>
                          <ListItemText primary={subItem.title} />
                        </ListItem>
                      </Link>
                    ))}
                  </List>
                </Collapse>
              </>
            ) : (
              <Link href={item.path} passHref>
                <ListItem
                  button
                  component="a"
                  className={`my-1 rounded ${
                    isActive(item.path)
                      ? 'bg-primary bg-opacity-10 text-primary'
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={onClose}
                >
                  <ListItemIcon
                    className={`min-w-[40px] ${
                      isActive(item.path) ? 'text-primary' : ''
                    }`}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.title} />
                </ListItem>
              </Link>
            )}
          </div>
        ))}
      </List>
    </div>
  );

  return (
    <>
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', lg: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Sidebar;