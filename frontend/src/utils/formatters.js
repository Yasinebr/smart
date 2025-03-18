import moment from 'moment-jalaali';

// تبدیل تاریخ به فرمت جلالی
export const formatDate = (dateString) => {
  if (!dateString) return '---';

  try {
    return moment(dateString).format('jYYYY/jMM/jDD HH:mm');
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

// تبدیل مدت زمان به فرمت خوانا
export const formatDuration = (durationString) => {
  if (!durationString) return '---';

  // دریافت اعداد از رشته
  const hours = durationString.match(/(\d+)\s*ساعت/);
  const minutes = durationString.match(/(\d+)\s*دقیقه/);

  if (!hours && !minutes) return durationString;

  let result = '';
  if (hours && hours[1]) {
    result += `${hours[1]} ساعت `;
  }
  if (minutes && minutes[1]) {
    result += `${minutes[1]} دقیقه`;
  }

  return result.trim();
};

// تبدیل قیمت به فرمت پول
export const formatPrice = (price) => {
  if (!price) return '---';

  try {
    return new Intl.NumberFormat('fa-IR', {
      style: 'currency',
      currency: 'IRR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price).replace('ریال', 'تومان');
  } catch (error) {
    console.error('Error formatting price:', error);
    return price;
  }
};

// تبدیل شماره به فرمت فارسی
export const formatNumber = (number) => {
  if (number === null || number === undefined) return '---';

  try {
    return new Intl.NumberFormat('fa-IR').format(number);
  } catch (error) {
    console.error('Error formatting number:', error);
    return number;
  }
};
