'use client';

import { useState, useRef } from 'react';
import {
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  CircularProgress,
  TextField,
  Alert,
  Card,
  CardContent,
  CardActions,
  Divider,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import HistoryIcon from '@mui/icons-material/History';
import TabPanel from '@mui/lab/TabPanel';
import TabContext from '@mui/lab/TabContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/tables/DataTable';
import useApi from '@/hooks/useApi';
import api from '@/utils/api';

export default function LicensePlatePage() {
  const [activeTab, setActiveTab] = useState('1');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [detectionResult, setDetectionResult] = useState(null);
  const fileInputRef = useRef(null);

  const { data, loading, error, execute: fetchDetections } = useApi(
    api.getLicensePlateDetections,
    true
  );

  const { execute: detectLicensePlate, loading: detectLoading } = useApi(
    (data) => api.createLicensePlateDetection(data)
  );

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];

    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setUploadError(null);
      } else {
        setUploadError('لطفاً یک فایل تصویر انتخاب کنید.');
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleDetect = async () => {
    if (!selectedFile) {
      setUploadError('لطفاً ابتدا یک تصویر انتخاب کنید.');
      return;
    }

    try {
      setUploadError(null);
      setDetectionResult(null);

      const formData = new FormData();
      formData.append('input_image', selectedFile);

      const response = await detectLicensePlate(formData);
      setDetectionResult(response);
      fetchDetections(); // Refresh the list
    } catch (error) {
      console.error('License plate detection error:', error);
      setUploadError('خطا در تشخیص پلاک. لطفاً دوباره تلاش کنید.');
    }
  };

  // Format data for the table
  const detections = data?.results || [];

  const columns = [
    {
      id: 'id',
      label: 'شناسه',
      minWidth: 70,
      align: 'center',
    },
    {
      id: 'license_plate_text',
      label: 'متن پلاک',
      minWidth: 120,
      format: (value) => value || 'تشخیص داده نشده',
    },
    {
      id: 'confidence',
      label: 'اطمینان',
      minWidth: 100,
      align: 'center',
      format: (value) => value ? `${(value * 100).toFixed(1)}%` : 'نامشخص',
    },
    {
      id: 'status',
      label: 'وضعیت',
      minWidth: 100,
      align: 'center',
      format: (value) => {
        switch (value) {
          case 'completed':
            return <Chip label="تکمیل شده" color="success" size="small" />;
          case 'pending':
            return <Chip label="در حال پردازش" color="warning" size="small" />;
          case 'failed':
            return <Chip label="خطا" color="error" size="small" />;
          default:
            return <Chip label={value} size="small" />;
        }
      },
    },
    {
      id: 'processing_time',
      label: 'زمان پردازش (ثانیه)',
      minWidth: 150,
      align: 'center',
      format: (value) => value ? value.toFixed(3) : 'نامشخص',
    },
    {
      id: 'created_at',
      label: 'تاریخ ایجاد',
      minWidth: 150,
      format: (value) => new Date(value).toLocaleString('fa-IR'),
    },
    {
      id: 'input_image',
      label: 'تصویر',
      minWidth: 100,
      align: 'center',
      format: (value) => (
        <Button
          size="small"
          onClick={() => window.open(value, '_blank')}
        >
          مشاهده
        </Button>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <Box className="mb-6">
        <Typography variant="h4" className="font-bold">
          سیستم تشخیص پلاک خودرو
        </Typography>
        <Typography variant="body1" color="text.secondary">
          در این بخش می‌توانید تصویر پلاک خودرو را برای تشخیص آپلود کنید.
        </Typography>
      </Box>

      <TabContext value={activeTab}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="license plate detection tabs"
          >
            <Tab label="تشخیص پلاک" value="1" icon={<CameraAltIcon />} iconPosition="start" />
            <Tab label="تاریخچه تشخیص‌ها" value="2" icon={<HistoryIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        <TabPanel value="1">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Paper className="p-4 h-full">
                <Typography variant="h6" className="mb-4">
                  آپلود تصویر پلاک
                </Typography>

                <Box className="flex flex-col items-center">
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                  />

                  {previewUrl ? (
                    <Box className="w-full mb-4 flex justify-center">
                      <img
                        src={previewUrl}
                        alt="License Plate"
                        className="max-w-full max-h-64 h-auto rounded border border-gray-200"
                      />
                    </Box>
                  ) : (
                    <Box
                      className="w-full mb-4 p-8 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100"
                      onClick={handleUploadClick}
                    >
                      <UploadFileIcon fontSize="large" color="primary" />
                      <Typography className="mt-2">کلیک کنید و تصویر پلاک را انتخاب کنید</Typography>
                    </Box>
                  )}

                  <Box className="w-full mt-2 flex gap-2 justify-center">
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<UploadFileIcon />}
                      onClick={handleUploadClick}
                    >
                      انتخاب تصویر
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<CameraAltIcon />}
                      onClick={handleDetect}
                      disabled={!selectedFile || detectLoading}
                    >
                      {detectLoading ? <CircularProgress size={24} /> : 'تشخیص پلاک'}
                    </Button>
                  </Box>

                  {uploadError && (
                    <Alert severity="error" className="mt-4 w-full">
                      {uploadError}
                    </Alert>
                  )}
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper className="p-4 h-full">
                <Typography variant="h6" className="mb-4">
                  نتیجه تشخیص
                </Typography>

                {detectLoading ? (
                  <Box className="w-full flex flex-col items-center justify-center p-8">
                    <CircularProgress />
                    <Typography className="mt-4">در حال تشخیص پلاک...</Typography>
                  </Box>
                ) : detectionResult ? (
                  <Box>
                    <Card className="mb-4">
                      <CardContent>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" color="text.secondary">
                              متن پلاک تشخیص داده شده
                            </Typography>
                            <Typography variant="h5" className="font-bold mt-1">
                              {detectionResult.license_plate_text || 'تشخیص داده نشده'}
                            </Typography>
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" color="text.secondary">
                              درصد اطمینان
                            </Typography>
                            <Typography>
                              {detectionResult.confidence
                                ? `${(detectionResult.confidence * 100).toFixed(1)}%`
                                : 'نامشخص'}
                            </Typography>
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" color="text.secondary">
                              زمان پردازش
                            </Typography>
                            <Typography>
                              {detectionResult.processing_time
                                ? `${detectionResult.processing_time.toFixed(3)} ثانیه`
                                : 'نامشخص'}
                            </Typography>
                          </Grid>

                          <Grid item xs={12}>
                            <Divider className="my-2" />
                          </Grid>

                          <Grid item xs={12}>
                            <Typography variant="subtitle2" color="text.secondary">
                              وضعیت
                            </Typography>
                            <Box className="mt-1">
                              {detectionResult.status === 'completed' ? (
                                <Chip label="تکمیل شده" color="success" />
                              ) : detectionResult.status === 'pending' ? (
                                <Chip label="در حال پردازش" color="warning" />
                              ) : (
                                <Chip label="خطا" color="error" />
                              )}
                            </Box>
                          </Grid>
                        </Grid>

                        {detectionResult.output_image && (
                          <Box className="mt-4">
                            <Typography variant="subtitle2" color="text.secondary">
                              تصویر پردازش شده
                            </Typography>
                            <Box className="mt-2 flex justify-center">
                              <img
                                src={detectionResult.output_image}
                                alt="Processed License Plate"
                                className="max-w-full max-h-48 h-auto rounded border border-gray-200"
                              />
                            </Box>
                          </Box>
                        )}
                      </CardContent>

                      {detectionResult.license_plate_text && (
                        <CardActions>
                          <Button
                            startIcon={<DriveEtaIcon />}
                            color="primary"
                            size="small"
                            onClick={() => {
                              // Here you could implement a link to vehicle management with this plate
                              alert(`Searching for vehicle with plate: ${detectionResult.license_plate_text}`);
                            }}
                          >
                            جستجوی خودرو با این پلاک
                          </Button>
                        </CardActions>
                      )}
                    </Card>
                  </Box>
                ) : (
                  <Box className="w-full flex flex-col items-center justify-center p-8 text-gray-500">
                    <CameraAltIcon fontSize="large" />
                    <Typography className="mt-2">
                      تصویری را برای تشخیص پلاک آپلود کنید
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value="2">
          {error && (
            <Alert severity="error" className="mb-4">
              خطا در بارگذاری اطلاعات: {error.message}
            </Alert>
          )}

          <DataTable
            title="تاریخچه تشخیص پلاک‌ها"
            rows={detections}
            columns={columns}
            loading={loading}
            onRefresh={fetchDetections}
            searchPlaceholder="جستجو در متن پلاک..."
            initialSortBy="created_at"
            selectable={false}
          />
        </TabPanel>
      </TabContext>
    </DashboardLayout>
  );
}