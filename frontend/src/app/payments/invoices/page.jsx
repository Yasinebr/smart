'use client';

import { useState } from 'react';
import {
  Typography,
  Box,
  Chip,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Divider,
} from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/tables/DataTable';
import useApi from '@/hooks/useApi';
import api from '@/utils/api';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import PaidIcon from '@mui/icons-material/Paid';
import DownloadIcon from '@mui/icons-material/Download';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { format } from 'date-fns';
import { faIR } from 'date-fns/locale';

export default function InvoicesPage() {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [printInvoice, setPrintInvoice] = useState(null);

  const { data, loading, error, execute: fetchInvoices } = useApi(
    api.getInvoices,
    true
  );

  const { execute: deleteInvoice, loading: deleteLoading } = useApi(
    (id) => api.deleteInvoice(id)
  );

  const handleDelete = (ids) => {
    setSelectedIds(ids);
    setIsDeleteDialogOpen(true);
  };

  const handleViewDetails = (invoice) => {
    setSelectedDetails(invoice);
    setIsDetailsDialogOpen(true);
  };

  const handlePrint = (invoice) => {
    setPrintInvoice(invoice);
    setIsPrintDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      // Delete all selected invoices
      await Promise.all(selectedIds.map(id => deleteInvoice(id)));

      // Refresh the data
      fetchInvoices();

      // Close the dialog
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting invoices:', error);
    }
  };

  // Format data for the table
  const invoices = data?.results || [];

  const columns = [
    {
      id: 'invoice_number',
      label: 'شماره فاکتور',
      minWidth: 130,
    },
    {
      id: 'payment',
      label: 'شناسه پرداخت',
      minWidth: 130,
      align: 'center',
    },
    {
      id: 'total_amount',
      label: 'مبلغ کل',
      minWidth: 120,
      format: (value) => `${Number(value).toLocaleString()} تومان`,
    },
    {
      id: 'is_paid',
      label: 'وضعیت پرداخت',
      minWidth: 140,
      align: 'center',
      format: (value) => (
        value ? (
          <Chip label="پرداخت شده" color="success" size="small" />
        ) : (
          <Chip label="پرداخت نشده" color="warning" size="small" />
        )
      ),
    },
    {
      id: 'due_date',
      label: 'تاریخ سررسید',
      minWidth: 140,
      format: (value) => value ? format(new Date(value), 'yyyy/MM/dd', { locale: fa }) : '-',
    },
    {
      id: 'created_at',
      label: 'تاریخ صدور',
      minWidth: 140,
      format: (value) => format(new Date(value), 'yyyy/MM/dd', { locale: fa }),
    },
    {
      id: 'actions',
      label: 'عملیات',
      minWidth: 150,
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
          <Tooltip title="چاپ فاکتور">
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                handlePrint(row);
              }}
            >
              <PrintIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const formattedDateTime = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'yyyy/MM/dd HH:mm', { locale: fa });
    } catch (error) {
      return dateString;
    }
  };

  // Invoice items mock data (since we don't have the actual structure)
  const mockInvoiceItems = [
    { id: 1, description: 'رزرو پارکینگ', quantity: 1, unit_price: 50000, total: 50000 },
    { id: 2, description: 'خدمات اضافی', quantity: 2, unit_price: 10000, total: 20000 },
  ];

  return (
    <DashboardLayout>
      <Box className="mb-6">
        <Typography variant="h4" className="font-bold">
          مدیریت فاکتورها
        </Typography>
        <Typography variant="body1" color="text.secondary">
          در این بخش می‌توانید فاکتورهای صادر شده را مشاهده و مدیریت کنید.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" className="mb-4">
          خطا در بارگذاری اطلاعات: {error.message}
        </Alert>
      )}

      <DataTable
        title="لیست فاکتورها"
        rows={invoices}
        columns={columns}
        loading={loading}
        onDelete={handleDelete}
        onRefresh={fetchInvoices}
        searchPlaceholder="جستجو در شماره فاکتور..."
        initialSortBy="created_at"
      />

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
              آیا از حذف این فاکتور اطمینان دارید؟ این عملیات قابل بازگشت نیست.
            </Typography>
          ) : (
            <Typography>
              آیا از حذف {selectedIds.length} فاکتور انتخاب شده اطمینان دارید؟ این عملیات قابل بازگشت نیست.
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

      {/* Invoice Details Dialog */}
      <Dialog
        open={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          جزئیات فاکتور
        </DialogTitle>
        <DialogContent>
          {selectedDetails && (
            <Box>
              <Box className="flex justify-between items-start mb-4">
                <Box>
                  <Typography variant="h6">
                    فاکتور شماره {selectedDetails.invoice_number}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    تاریخ صدور: {formattedDateTime(selectedDetails.created_at)}
                  </Typography>
                </Box>
                <Box>
                  {selectedDetails.is_paid ? (
                    <Chip
                      icon={<PaidIcon />}
                      label="پرداخت شده"
                      color="success"
                    />
                  ) : (
                    <Chip
                      label="پرداخت نشده"
                      color="warning"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Box>

              <Divider className="mb-4" />

              <Grid container spacing={2} className="mb-4">
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">اطلاعات مشتری</Typography>
                  <Typography variant="body1">نام مشتری: محمد علیزاده</Typography>
                  <Typography variant="body2">ایمیل: m.alizadeh@example.com</Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">اطلاعات پرداخت</Typography>
                  <Typography variant="body1">شناسه پرداخت: {selectedDetails.payment}</Typography>
                  {selectedDetails.due_date && (
                    <Typography variant="body2">تاریخ سررسید: {formattedDateTime(selectedDetails.due_date)}</Typography>
                  )}
                </Grid>
              </Grid>

              <Typography variant="subtitle1" className="mb-2">اقلام فاکتور</Typography>
              <TableContainer component={Paper} className="mb-4">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>شرح</TableCell>
                      <TableCell align="center">تعداد</TableCell>
                      <TableCell align="center">قیمت واحد (تومان)</TableCell>
                      <TableCell align="left">مبلغ کل (تومان)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* In a real app, you'd map through selectedDetails.items */}
                    {mockInvoiceItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell align="center">{item.quantity}</TableCell>
                        <TableCell align="center">{item.unit_price.toLocaleString()}</TableCell>
                        <TableCell align="left">{item.total.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={2} />
                      <TableCell align="right"><strong>جمع کل:</strong></TableCell>
                      <TableCell align="left"><strong>{Number(70000).toLocaleString()} تومان</strong></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={2} />
                      <TableCell align="right">مالیات:</TableCell>
                      <TableCell align="left">{Number(selectedDetails.tax_amount || 0).toLocaleString()} تومان</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={2} />
                      <TableCell align="right">تخفیف:</TableCell>
                      <TableCell align="left">{Number(selectedDetails.discount_amount || 0).toLocaleString()} تومان</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={2} />
                      <TableCell align="right"><strong>مبلغ قابل پرداخت:</strong></TableCell>
                      <TableCell align="left"><strong>{Number(selectedDetails.total_amount).toLocaleString()} تومان</strong></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="body2" color="text.secondary">
                توضیحات: این فاکتور مربوط به خدمات پارکینگ می‌باشد.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDetailsDialogOpen(false)}>بستن</Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<DownloadIcon />}
          >
            دانلود فاکتور
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PrintIcon />}
            onClick={() => {
              setIsDetailsDialogOpen(false);
              handlePrint(selectedDetails);
            }}
          >
            چاپ فاکتور
          </Button>
        </DialogActions>
      </Dialog>

      {/* Print Invoice Dialog */}
      <Dialog
        open={isPrintDialogOpen}
        onClose={() => setIsPrintDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ className: "print-container" }}
      >
        <DialogTitle className="flex justify-between items-center">
          <Typography variant="h6">پیش‌نمایش چاپ</Typography>
          <IconButton onClick={() => setIsPrintDialogOpen(false)}>
            <DeleteIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {printInvoice && (
            <Box className="invoice-print p-8 border border-gray-300">
              <Box className="flex justify-between items-start mb-8">
                <Box>
                  <Box className="flex items-center">
                    <ReceiptIcon fontSize="large" className="ml-2" />
                    <Typography variant="h5" className="font-bold">
                      فاکتور رسمی
                    </Typography>
                  </Box>
                  <Typography variant="body1" className="mt-2">
                    سیستم پارکینگ هوشمند
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    تهران، خیابان ولیعصر، پلاک 1234
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6">
                    شماره فاکتور: {printInvoice.invoice_number}
                  </Typography>
                  <Typography variant="body2">
                    تاریخ صدور: {formattedDateTime(printInvoice.created_at)}
                  </Typography>
                  {printInvoice.due_date && (
                    <Typography variant="body2">
                      تاریخ سررسید: {formattedDateTime(printInvoice.due_date)}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Divider className="mb-4" />

              <Grid container spacing={4} className="mb-6">
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" className="font-bold mb-2">اطلاعات مشتری</Typography>
                  <Typography variant="body1">نام مشتری: محمد علیزاده</Typography>
                  <Typography variant="body2">ایمیل: m.alizadeh@example.com</Typography>
                  <Typography variant="body2">تلفن: 09123456789</Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" className="font-bold mb-2">اطلاعات پرداخت</Typography>
                  <Typography variant="body1">شناسه پرداخت: {printInvoice.payment}</Typography>
                  <Typography variant="body2">
                    وضعیت پرداخت: {printInvoice.is_paid ? 'پرداخت شده' : 'پرداخت نشده'}
                  </Typography>
                </Grid>
              </Grid>

              <Typography variant="subtitle1" className="font-bold mb-2">اقلام فاکتور</Typography>
              <TableContainer component={Paper} className="mb-6">
                <Table>
                  <TableHead>
                    <TableRow className="bg-gray-100">
                      <TableCell className="font-bold">شرح</TableCell>
                      <TableCell align="center" className="font-bold">تعداد</TableCell>
                      <TableCell align="center" className="font-bold">قیمت واحد (تومان)</TableCell>
                      <TableCell align="left" className="font-bold">مبلغ کل (تومان)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockInvoiceItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell align="center">{item.quantity}</TableCell>
                        <TableCell align="center">{item.unit_price.toLocaleString()}</TableCell>
                        <TableCell align="left">{item.total.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={2} />
                      <TableCell align="right"><strong>جمع کل:</strong></TableCell>
                      <TableCell align="left"><strong>{Number(70000).toLocaleString()} تومان</strong></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={2} />
                      <TableCell align="right">مالیات:</TableCell>
                      <TableCell align="left">{Number(printInvoice.tax_amount || 0).toLocaleString()} تومان</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={2} />
                      <TableCell align="right">تخفیف:</TableCell>
                      <TableCell align="left">{Number(printInvoice.discount_amount || 0).toLocaleString()} تومان</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={2} />
                      <TableCell align="right"><strong>مبلغ قابل پرداخت:</strong></TableCell>
                      <TableCell align="left"><strong>{Number(printInvoice.total_amount).toLocaleString()} تومان</strong></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Box className="mb-6">
                <Typography variant="subtitle1" className="font-bold mb-2">توضیحات</Typography>
                <Typography variant="body2">
                  این فاکتور مربوط به خدمات پارکینگ می‌باشد. لطفاً در صورت هرگونه سؤال یا مشکل با پشتیبانی تماس بگیرید.
                </Typography>
              </Box>

              <Divider className="mb-4" />

              <Box className="text-center">
                <Typography variant="body2">
                  از انتخاب ما متشکریم
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  support@smartparking.com | 021-12345678
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsPrintDialogOpen(false)}>بستن</Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
          >
            چاپ
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}