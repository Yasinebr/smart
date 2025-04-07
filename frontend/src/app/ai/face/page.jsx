'use client';

import { useState, useRef } from 'react';
import {
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardActions,
  Divider,
  Chip,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { TabPanel , TabContext } from '@mui/lab';

import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/tables/DataTable';
import useApi from '@/hooks/useApi';
import api from '@/utils/api';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FaceIcon from '@mui/icons-material/Face';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import HistoryIcon from '@mui/icons-material/History';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import { format  } from 'date-fns';
import {faIR} from "date-fns/locale";


export default function FaceDetectionPage() {
  const [activeTab, setActiveTab] = useState('1');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [detectionResult, setDetectionResult] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const fileInputRef = useRef(null);

  const { data, loading, error, execute: fetchDetections } = useApi(
    api.getFaceDetections,
    true
  );

  const { execute: detectFace, loading: detectLoading } = useApi(
    (data) => api.detectFace(data)
  );

  const { execute: createFaceDetection, loading: createLoading } = useApi(
    (data) => api.createFaceDetection(data)
  );

  const { execute: deleteFaceDetection, loading: deleteLoading } = useApi(
    (id) => api.deleteFaceDetection(id)
  );

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];

    if (file) {
      // if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        console.log(selectedFile)
        setPreviewUrl(URL.createObjectURL(file));
        setUploadError(null);
      // } else {
      //   setUploadError('لطفاً یک فایل تصویر انتخاب کنید.');
      // }
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

      const formData = new FormData();
      formData.append('image', selectedFile);
      const response = await detectFace(formData);
      setDetectionResult(response);
    } catch (error) {
      console.error('Face detection error:', error);
      setUploadError('خطا در تشخیص چهره. لطفاً دوباره تلاش کنید.');
    }
  };

  const handleSaveDetection = async () => {
    if (!detectionResult) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append('input_image', selectedFile);

      await createFaceDetection(formData);

      // Refresh the detections list
      fetchDetections();

      // Reset the current detection
      setDetectionResult(null);
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error('Error saving detection:', error);
      setUploadError('خطا در ذخیره تشخیص چهره. لطفاً دوباره تلاش کنید.');
    }
  };

  const handleDelete = (ids) => {
    setSelectedIds(ids);
    setIsDeleteDialogOpen(true);
  };

  const handleViewDetails = (detection) => {
    setSelectedDetails(detection);
    setIsDetailsDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      // Delete all selected detections
      await Promise.all(selectedIds.map(id => deleteFaceDetection(id)));

      // Refresh the data
      fetchDetections();

      // Close the dialog
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting detections:', error);
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
      id: 'face_count',
      label: 'تعداد چهره',
      minWidth: 100,
      align: 'center',
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
      format: (value) => format(new Date(value), 'yyyy/MM/dd HH:mm', { locale: fa }),
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
    {
      id: 'actions',
      label: 'عملیات',
      minWidth: 120,
      align: 'center',
      sortable: false,
      format: (value, row) => (
        <Box className="flex justify-center">
          <Tooltip title="مشاهده جزئیات">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetails(row);
              }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <Box className="mb-6">
        <Typography variant="h4" className="font-bold">
          سیستم تشخیص چهره
        </Typography>
        <Typography variant="body1" color="text.secondary">
          در این بخش می‌توانید تصویر را برای تشخیص چهره آپلود کنید.
        </Typography>
      </Box>

      <TabContext value={activeTab}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="face detection tabs"
          >
            <Tab label="تشخیص چهره" value="1" icon={<FaceIcon />} iconPosition="start" />
            <Tab label="تاریخچه تشخیص‌ها" value="2" icon={<HistoryIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        <TabPanel value="1">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Paper className="p-4 h-full">
                <Typography variant="h6" className="mb-4">
                  آپلود تصویر چهره
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
                        alt="Face Image"
                        className="max-w-full max-h-64 h-auto rounded border border-gray-200"
                      />
                    </Box>
                  ) : (
                    <Box
                      className="w-full mb-4 p-8 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100"
                      onClick={handleUploadClick}
                    >
                      <UploadFileIcon fontSize="large" color="primary" />
                      <Typography className="mt-2">کلیک کنید و تصویر چهره را انتخاب کنید</Typography>
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
                      {detectLoading ? <CircularProgress size={24} /> : 'تشخیص چهره'}
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
                    <Typography className="mt-4">در حال تشخیص چهره...</Typography>
                  </Box>
                ) : detectionResult ? (
                  <Box>
                    <Card className="mb-4">
                      <CardContent>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" color="text.secondary">
                              تعداد چهره‌های تشخیص داده شده
                            </Typography>
                            <Typography variant="h5" className="font-bold mt-1">
                              {detectionResult.face_count || 0}
                            </Typography>
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" color="text.secondary">
                              درصد اطمینان
                            </Typography>
                            <Typography>
                              {detectionResult.faces.length
                                ? detectionResult.faces.map(item => {
                                  return (
                                    <span>{`${(item.confidence * 100).toFixed(1)}%`}</span>
                                  )
                                })
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
                              {detectionResult.success === true ? (
                                <Chip label="تکمیل شده" color="success" />
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
                                src={'http://localhost:8000' + detectionResult.output_image}
                                alt="Processed Face"
                                className="max-w-full max-h-48 h-auto rounded border border-gray-200"
                              />
                            </Box>
                          </Box>
                        )}

                        {detectionResult.faces_data && (
                          <Box className="mt-4">
                            <Typography variant="subtitle2" color="text.secondary" className="mb-2">
                              اطلاعات چهره‌ها
                            </Typography>
                            <Box className="mt-2 grid grid-cols-2 gap-2">
                              {Array.isArray(detectionResult.faces_data) ? (
                                detectionResult.faces_data.map((face, index) => (
                                  <Paper key={index} className="p-2 border border-gray-200">
                                    <Typography variant="subtitle2">چهره {index + 1}</Typography>
                                    <Typography variant="body2">
                                      احتمال: {(face.confidence * 100).toFixed(1)}%
                                    </Typography>
                                    <Typography variant="body2">
                                      موقعیت: X={face.position.x}, Y={face.position.y}
                                    </Typography>
                                  </Paper>
                                ))
                              ) : (
                                <Typography>اطلاعات چهره در دسترس نیست</Typography>
                              )}
                            </Box>
                          </Box>
                        )}
                      </CardContent>

                      {detectionResult.face_count > 0 && (
                        <CardActions>
                          <Button
                            startIcon={<PersonSearchIcon />}
                            color="primary"
                            size="small"
                            onClick={() => {
                              // Here you could implement logic to search for matching people
                              alert('جستجوی افراد مطابق با چهره‌های شناسایی شده');
                            }}
                          >
                            تطبیق با افراد ثبت شده
                          </Button>
                          <Button
                            color="primary"
                            variant="contained"
                            onClick={handleSaveDetection}
                            disabled={createLoading}
                          >
                            {createLoading ? <CircularProgress size={20} /> : 'ذخیره نتیجه تشخیص'}
                          </Button>
                        </CardActions>
                      )}
                    </Card>
                  </Box>
                ) : (
                  <Box className="w-full flex flex-col items-center justify-center p-8 text-gray-500">
                    <FaceIcon fontSize="large" />
                    <Typography className="mt-2">
                      تصویری را برای تشخیص چهره آپلود کنید
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
            title="تاریخچه تشخیص چهره‌ها"
            rows={detections}
            columns={columns}
            loading={loading}
            onRefresh={fetchDetections}
            onDelete={handleDelete}
            searchPlaceholder="جستجو در تشخیص‌ها..."
            initialSortBy="created_at"
            selectable={false}
          />
        </TabPanel>
      </TabContext>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <DialogTitle>
          تأیید حذف
        </DialogTitle>
        <DialogContent>
          {selectedIds.length === 1 ? (
            <Typography>
              آیا از حذف این تشخیص چهره اطمینان دارید؟ این عملیات قابل بازگشت نیست.
            </Typography>
          ) : (
            <Typography>
              آیا از حذف {selectedIds.length} تشخیص چهره انتخاب شده اطمینان دارید؟ این عملیات قابل بازگشت نیست.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsDeleteDialogOpen(false)}
            color="inherit"
            disabled={deleteLoading}
          >
            انصراف
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={deleteLoading}
            startIcon={<DeleteIcon />}
          >
            حذف
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details Dialog */}
      <Dialog
        open={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          جزئیات تشخیص چهره
        </DialogTitle>
        <DialogContent>
          {selectedDetails && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">تصویر ورودی</Typography>
                <Box className="mt-2 flex justify-center">
                  <img
                    src={selectedDetails.input_image}
                    alt="Input Face"
                    className="max-w-full max-h-64 h-auto rounded border border-gray-200"
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">تصویر پردازش شده</Typography>
                {selectedDetails.output_image ? (
                  <Box className="mt-2 flex justify-center">
                    <img
                      src={selectedDetails.output_image}
                      alt="Processed Face"
                      className="max-w-full max-h-64 h-auto rounded border border-gray-200"
                    />
                  </Box>
                ) : (
                  <Typography className="mt-2">تصویر پردازش شده در دسترس نیست</Typography>
                )}
              </Grid>

              <Grid item xs={12}>
                <Divider className="my-2" />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">تعداد چهره‌ها</Typography>
                <Typography variant="h6">{selectedDetails.face_count}</Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">وضعیت</Typography>
                <Box className="mt-1">
                  {selectedDetails.status === 'completed' ? (
                    <Chip label="تکمیل شده" color="success" />
                  ) : selectedDetails.status === 'pending' ? (
                    <Chip label="در حال پردازش" color="warning" />
                  ) : (
                    <Chip label="خطا" color="error" />
                  )}
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">زمان پردازش</Typography>
                <Typography>
                  {selectedDetails.processing_time
                    ? `${selectedDetails.processing_time.toFixed(3)} ثانیه`
                    : 'نامشخص'}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">تاریخ ایجاد</Typography>
                <Typography>
                  {format(new Date(selectedDetails.created_at), 'yyyy/MM/dd HH:mm:ss', { locale: faIR })}
                </Typography>
              </Grid>

              {selectedDetails.faces_data && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" className="mb-2">
                    اطلاعات چهره‌ها
                  </Typography>
                  <Grid container spacing={2}>
                    {Object.entries(selectedDetails.faces_data).map(([key, face], index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Paper className="p-3">
                          <Typography variant="subtitle2">چهره {index + 1}</Typography>
                          {/* Render face properties based on API response structure */}
                          <Typography variant="body2">
                            موقعیت: x={face.x || '?'}, y={face.y || '?'}
                          </Typography>
                          <Typography variant="body2">
                            ابعاد: {face.width || '?'} × {face.height || '?'}
                          </Typography>
                          {face.confidence && (
                            <Typography variant="body2">
                              اطمینان: {(face.confidence * 100).toFixed(1)}%
                            </Typography>
                          )}
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDetailsDialogOpen(false)}>بستن</Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}