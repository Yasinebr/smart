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
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Paper,
  Card,
  CardContent,
  CardActions,
  Divider,
} from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/tables/DataTable';
import useApi from '@/hooks/useApi';
import api from '@/utils/api';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { useForm, Controller } from 'react-hook-form';
import { format, isAfter } from 'date-fns';
import { faIR } from 'date-fns/locale';

// Subscription type labels in Persian
const subscriptionTypeLabels = {
  basic: 'پایه',
  premium: 'ویژه',
  vip: 'VIP',
};

// Period labels in Persian
const periodLabels = {
  monthly: 'ماهانه',
  quarterly: 'سه ماهه',
  yearly: 'سالانه',
};

const SubscriptionForm = ({ open, onClose, initialData, onSubmit, loading }) => {
  const [users, setUsers] = useState([]);
  const { data: usersData, loading: loadingUsers, execute: fetchUsers } = useApi(
    api.getUsers
  );

  // Load users when the component mounts
  useState(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  useState(() => {
    if (usersData) {
      setUsers(usersData.results || []);
    }
  }, [usersData]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: initialData || {
      user: '',
      subscription_type: 'basic',
      period: 'monthly',
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: '',
      auto_renew: true,
      amount: '',
    },
  });

  const type = watch('subscription_type');
  const period = watch('period');

  // Calculate suggested amount based on type and period
  const calculateAmount = () => {
    let baseAmount = 0;

    // Base amounts by subscription type
    switch (type) {
      case 'basic':
        baseAmount = 100000; // 100,000 تومان
        break;
      case 'premium':
        baseAmount = 200000; // 200,000 تومان
        break;
      case 'vip':
        baseAmount = 300000; // 300,000 تومان
        break;
      default:
        baseAmount = 100000;
    }

    // Multiplier based on period
    let multiplier = 1;
    switch (period) {
      case 'monthly':
        multiplier = 1;
        break;
      case 'quarterly':
        multiplier = 3 * 0.9; // 10% discount for quarterly
        break;
      case 'yearly':
        multiplier = 12 * 0.8; // 20% discount for yearly
        break;
      default:
        multiplier = 1;
    }

    return Math.round(baseAmount * multiplier);
  };

  // Update amount when type or period changes
  useState(() => {
    if (!initialData && type && period) {
      const suggestedAmount = calculateAmount();
      setValue('amount', suggestedAmount.toString());
    }
  }, [type, period]);

  return (
    <Dialog
      open={open}
      onClose={() => !loading && onClose()}
      maxWidth="md"
      fullWidth
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>
          {initialData ? 'ویرایش اشتراک' : 'افزودن اشتراک جدید'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} className="mt-1">
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.user}>
                <InputLabel id="user-label">کاربر</InputLabel>
                <Controller
                  name="user"
                  control={control}
                  rules={{ required: 'انتخاب کاربر الزامی است' }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="user-label"
                      label="کاربر"
                      disabled={loadingUsers}
                    >
                      {users.map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                          {`${user.first_name} ${user.last_name} (${user.email})`}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.user && (
                  <Typography color="error" variant="caption">
                    {errors.user.message}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.subscription_type}>
                <InputLabel id="subscription-type-label">نوع اشتراک</InputLabel>
                <Controller
                  name="subscription_type"
                  control={control}
                  rules={{ required: 'انتخاب نوع اشتراک الزامی است' }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="subscription-type-label"
                      label="نوع اشتراک"
                    >
                      <MenuItem value="basic">پایه</MenuItem>
                      <MenuItem value="premium">ویژه</MenuItem>
                      <MenuItem value="vip">VIP</MenuItem>
                    </Select>
                  )}
                />
                {errors.subscription_type && (
                  <Typography color="error" variant="caption">
                    {errors.subscription_type.message}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.period}>
                <InputLabel id="period-label">دوره زمانی</InputLabel>
                <Controller
                  name="period"
                  control={control}
                  rules={{ required: 'انتخاب دوره زمانی الزامی است' }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="period-label"
                      label="دوره زمانی"
                    >
                      <MenuItem value="monthly">ماهانه</MenuItem>
                      <MenuItem value="quarterly">سه ماهه</MenuItem>
                      <MenuItem value="yearly">سالانه</MenuItem>
                    </Select>
                  )}
                />
                {errors.period && (
                  <Typography color="error" variant="caption">
                    {errors.period.message}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="amount"
                control={control}
                rules={{
                  required: 'مبلغ الزامی است',
                  min: { value: 1000, message: 'مبلغ باید حداقل 1000 تومان باشد' }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="مبلغ (تومان)"
                    fullWidth
                    type="number"
                    error={!!errors.amount}
                    helperText={errors.amount?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="start_date"
                control={control}
                rules={{ required: 'تاریخ شروع الزامی است' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="تاریخ شروع"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.start_date}
                    helperText={errors.start_date?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="end_date"
                control={control}
                rules={{ required: 'تاریخ پایان الزامی است' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="تاریخ پایان"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.end_date}
                    helperText={errors.end_date?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="auto_renew"
                control={control}
                render={({ field: { value, onChange, ...field } }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={value}
                        onChange={e => onChange(e.target.checked)}
                        {...field}
                      />
                    }
                    label="تمدید خودکار"
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={onClose}
            disabled={loading}
          >
            انصراف
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
          >
            {initialData ? 'بروزرسانی' : 'ذخیره'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default function SubscriptionsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const [actionSubscription, setActionSubscription] = useState(null);

  const { data, loading, error, execute: fetchSubscriptions } = useApi(
    api.getSubscriptions,
    true
  );

  const { execute: deleteSubscription, loading: deleteLoading } = useApi(
    (id) => api.deleteSubscription(id)
  );

  const { execute: createSubscription } = useApi(
    (data) => api.createSubscription(data)
  );

  const { execute: updateSubscription } = useApi(
    (id, data) => api.updateSubscription(id, data)
  );

  const { execute: renewSubscription, loading: renewLoading } = useApi(
    (id) => api.renewSubscription(id, {})
  );

  const { execute: cancelAutoRenew, loading: cancelAutoRenewLoading } = useApi(
    (id) => api.cancelSubscriptionAutoRenew(id, {})
  );

  const handleAddNew = () => {
    setSelectedSubscription(null);
    setIsFormOpen(true);
  };

  const handleEdit = (subscription) => {
    setSelectedSubscription(subscription);
    setIsFormOpen(true);
  };

  const handleDelete = (ids) => {
    setSelectedIds(ids);
    setIsDeleteDialogOpen(true);
  };

  const handleViewDetails = (subscription) => {
    setSelectedDetails(subscription);
    setIsDetailsDialogOpen(true);
  };

  const handleAction = (type, subscription) => {
    setActionType(type);
    setActionSubscription(subscription);
    setIsActionDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      // Delete all selected subscriptions
      await Promise.all(selectedIds.map(id => deleteSubscription(id)));

      // Refresh the data
      fetchSubscriptions();

      // Close the dialog
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting subscriptions:', error);
    }
  };

  const confirmAction = async () => {
    try {
      if (actionType === 'renew') {
        await renewSubscription(actionSubscription.id);
      } else if (actionType === 'cancelAutoRenew') {
        await cancelAutoRenew(actionSubscription.id);
      }

      // Refresh the data
      fetchSubscriptions();

      // Close the dialog
      setIsActionDialogOpen(false);
    } catch (error) {
      console.error('Error performing action:', error);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      setFormLoading(true);

      if (selectedSubscription) {
        // Update existing subscription
        await updateSubscription(selectedSubscription.id, formData);
      } else {
        // Create new subscription
        await createSubscription(formData);
      }

      // Refresh the data
      fetchSubscriptions();

      // Close the form
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error saving subscription:', error);
    } finally {
      setFormLoading(false);
    }
  };

  // Format data for the table
  const subscriptions = data?.results || [];

  const columns = [
    {
      id: 'id',
      label: 'شناسه',
      minWidth: 70,
      align: 'center',
    },
    {
      id: 'user',
      label: 'کاربر',
      minWidth: 180,
      // In a real app, fetch user details or use user_email from API
      format: (value) => `کاربر ${value}`,
    },
    {
      id: 'subscription_type',
      label: 'نوع اشتراک',
      minWidth: 120,
      format: (value) => subscriptionTypeLabels[value] || value,
    },
    {
      id: 'period',
      label: 'دوره',
      minWidth: 100,
      format: (value) => periodLabels[value] || value,
    },
    {
      id: 'start_date',
      label: 'تاریخ شروع',
      minWidth: 120,
      format: (value) => format(new Date(value), 'yyyy/MM/dd', { locale: fa }),
    },
    {
      id: 'end_date',
      label: 'تاریخ پایان',
      minWidth: 120,
      format: (value) => format(new Date(value), 'yyyy/MM/dd', { locale: fa }),
    },
    {
      id: 'is_active',
      label: 'وضعیت',
      minWidth: 100,
      align: 'center',
      format: (value) => (
        value ? (
          <Chip
            icon={<CheckCircleIcon />}
            label="فعال"
            color="success"
            size="small"
          />
        ) : (
          <Chip
            icon={<HourglassEmptyIcon />}
            label="غیرفعال"
            color="default"
            size="small"
          />
        )
      ),
    },
    {
      id: 'amount',
      label: 'مبلغ',
      minWidth: 120,
      format: (value) => `${Number(value).toLocaleString()} تومان`,
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

          {row.is_active && (
            <Tooltip title="تمدید اشتراک">
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction('renew', row);
                }}
              >
                <AutorenewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {row.auto_renew && (
            <Tooltip title="لغو تمدید خودکار">
              <IconButton
                size="small"
                color="warning"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction('cancelAutoRenew', row);
                }}
              >
                <CancelIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  // Subscription plan cards data
  const subscriptionPlans = [
    {
      type: 'basic',
      title: 'اشتراک پایه',
      monthlyPrice: '100,000',
      features: [
        'دسترسی به تمام پارکینگ‌ها',
        'قابلیت رزرو آنلاین',
        'پشتیبانی ایمیلی',
      ],
      color: 'default',
    },
    {
      type: 'premium',
      title: 'اشتراک ویژه',
      monthlyPrice: '200,000',
      features: [
        'تمام امکانات اشتراک پایه',
        'تخفیف 10% در رزروها',
        'اولویت رزرو',
        'پشتیبانی تلفنی',
      ],
      color: 'primary',
    },
    {
      type: 'vip',
      title: 'اشتراک VIP',
      monthlyPrice: '300,000',
      features: [
        'تمام امکانات اشتراک ویژه',
        'تخفیف 20% در رزروها',
        'دسترسی به جایگاه‌های VIP',
        'پشتیبانی اختصاصی 24/7',
        'خدمات ویژه (پارک خودرو توسط مسئول پارکینگ)',
      ],
      color: 'secondary',
    },
  ];

  return (
    <DashboardLayout>
      <Box className="mb-6">
        <Typography variant="h4" className="font-bold">
          مدیریت اشتراک‌ها
        </Typography>
        <Typography variant="body1" color="text.secondary">
          در این بخش می‌توانید اشتراک‌های کاربران را مدیریت کنید.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" className="mb-4">
          خطا در بارگذاری اطلاعات: {error.message}
        </Alert>
      )}

      {/* Subscription Plans */}
      <Box className="mb-8">
        <Typography variant="h6" className="mb-4">
          انواع اشتراک
        </Typography>

        <Grid container spacing={3}>
          {subscriptionPlans.map((plan) => (
            <Grid item xs={12} md={4} key={plan.type}>
              <Card className={`border-t-4 border-${plan.color}`}>
                <CardContent>
                  <Typography variant="h6" className="font-bold mb-2">
                    {plan.title}
                  </Typography>
                  <Typography variant="h5" className="mb-4" color="primary">
                    {plan.monthlyPrice} تومان <span className="text-sm text-gray-500">/ ماهانه</span>
                  </Typography>

                  <Divider className="mb-4" />

                  <Box>
                    {plan.features.map((feature, index) => (
                      <Box key={index} className="flex items-center mb-2">
                        <CheckCircleIcon color="success" fontSize="small" className="ml-2" />
                        <Typography>{feature}</Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    variant="contained"
                    color={plan.color}
                    fullWidth
                    onClick={() => {
                      const newSubscription = {
                        subscription_type: plan.type,
                        period: 'monthly',
                        amount: plan.monthlyPrice.replace(',', ''),
                      };
                      setSelectedSubscription(newSubscription);
                      setIsFormOpen(true);
                    }}
                  >
                    ایجاد اشتراک
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box className="mb-4">
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddNew}
        >
          افزودن اشتراک جدید
        </Button>
      </Box>

      <DataTable
        title="لیست اشتراک‌ها"
        rows={subscriptions}
        columns={columns}
        loading={loading}
        onAdd={handleAddNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={fetchSubscriptions}
        searchPlaceholder="جستجو در اشتراک‌ها..."
        initialSortBy="start_date"
      />

      {/* Subscription Form Dialog */}
      <SubscriptionForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={selectedSubscription}
        onSubmit={handleFormSubmit}
        loading={formLoading}
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
              آیا از حذف این اشتراک اطمینان دارید؟ این عملیات قابل بازگشت نیست.
            </Typography>
          ) : (
            <Typography>
              آیا از حذف {selectedIds.length} اشتراک انتخاب شده اطمینان دارید؟ این عملیات قابل بازگشت نیست.
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

      {/* Subscription Details Dialog */}
      <Dialog
        open={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          جزئیات اشتراک
        </DialogTitle>
        <DialogContent>
          {selectedDetails && (
            <Box>
              <Box className="flex justify-between items-center mb-4">
                <Typography variant="h6">
                  اشتراک {subscriptionTypeLabels[selectedDetails.subscription_type]}
                </Typography>

                <Box>
                  {selectedDetails.is_active ? (
                    <Chip
                      icon={<CheckCircleIcon />}
                      label="فعال"
                      color="success"
                    />
                  ) : (
                    <Chip
                      icon={<HourglassEmptyIcon />}
                      label="غیرفعال"
                      color="default"
                    />
                  )}
                </Box>
              </Box>

              <Divider className="mb-4" />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">کاربر</Typography>
                  <Typography>
                    {/* In a real app, show user details */}
                    کاربر {selectedDetails.user}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">نوع اشتراک</Typography>
                  <Typography>{subscriptionTypeLabels[selectedDetails.subscription_type]}</Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">دوره زمانی</Typography>
                  <Typography>{periodLabels[selectedDetails.period]}</Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">مبلغ</Typography>
                  <Typography>{Number(selectedDetails.amount).toLocaleString()} تومان</Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">تاریخ شروع</Typography>
                  <Typography>
                    {format(new Date(selectedDetails.start_date), 'yyyy/MM/dd', { locale: fa })}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">تاریخ پایان</Typography>
                  <Typography>
                    {format(new Date(selectedDetails.end_date), 'yyyy/MM/dd', { locale: fa })}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">تمدید خودکار</Typography>
                  <Chip
                    label={selectedDetails.auto_renew ? 'فعال' : 'غیرفعال'}
                    color={selectedDetails.auto_renew ? 'success' : 'default'}
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">وضعیت انقضا</Typography>
                  <Chip
                    label={selectedDetails.is_expired ? 'منقضی شده' : 'معتبر'}
                    color={selectedDetails.is_expired ? 'error' : 'success'}
                    size="small"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">اطلاعات پرداخت</Typography>
                  {selectedDetails.payment ? (
                    <Typography>شناسه پرداخت: {selectedDetails.payment}</Typography>
                  ) : (
                    <Typography color="text.secondary">پرداختی ثبت نشده است.</Typography>
                  )}
                </Grid>
              </Grid>

              <Box className="mt-4">
                <Divider className="mb-4" />

                <Typography variant="subtitle1" className="mb-2">امکانات اشتراک</Typography>
                <Box>
                  {subscriptionPlans.find(plan => plan.type === selectedDetails.subscription_type)?.features.map((feature, index) => (
                    <Box key={index} className="flex items-center mb-2">
                      <CheckCircleIcon color="success" fontSize="small" className="ml-2" />
                      <Typography>{feature}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDetailsDialogOpen(false)}>بستن</Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => {
              setIsDetailsDialogOpen(false);
              handleEdit(selectedDetails);
            }}
          >
            ویرایش
          </Button>

          {selectedDetails?.is_active && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AutorenewIcon />}
              onClick={() => {
                setIsDetailsDialogOpen(false);
                handleAction('renew', selectedDetails);
              }}
            >
              تمدید
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <Dialog
        open={isActionDialogOpen}
        onClose={() => setIsActionDialogOpen(false)}
      >
        <DialogTitle>
          {actionType === 'renew' ? 'تمدید اشتراک' : 'لغو تمدید خودکار'}
        </DialogTitle>
        <DialogContent>
          {actionType === 'renew' ? (
            <Typography>
              آیا از تمدید این اشتراک اطمینان دارید؟
            </Typography>
          ) : (
            <Typography>
              آیا از لغو تمدید خودکار این اشتراک اطمینان دارید؟
            </Typography>
          )}

          {actionSubscription && (
            <Box className="mt-4 p-3 bg-gray-100 rounded">
              <Typography variant="subtitle2">
                {subscriptionTypeLabels[actionSubscription.subscription_type]} - {periodLabels[actionSubscription.period]}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                از {format(new Date(actionSubscription.start_date), 'yyyy/MM/dd', { locale: fa })} تا {format(new Date(actionSubscription.end_date), 'yyyy/MM/dd', { locale: fa })}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsActionDialogOpen(false)}
            color="inherit"
            disabled={renewLoading || cancelAutoRenewLoading}
          >
            انصراف
          </Button>
          <Button
            onClick={confirmAction}
            color={actionType === 'renew' ? 'primary' : 'warning'}
            variant="contained"
            disabled={renewLoading || cancelAutoRenewLoading}
            startIcon={
              actionType === 'renew' ?
                (renewLoading ? <CircularProgress size={20} /> : <AutorenewIcon />) :
                (cancelAutoRenewLoading ? <CircularProgress size={20} /> : <CancelIcon />)
            }
          >
            {actionType === 'renew' ? 'تمدید' : 'لغو تمدید خودکار'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}