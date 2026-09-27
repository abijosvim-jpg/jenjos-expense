import { format, parseISO } from 'date-fns';

export const CURRENCY = '₹';

export const formatCurrency = (amount, options = {}) => {
  const { showSign = false, compact = false } = options;
  const num = Number(amount) || 0;
  const abs = Math.abs(num);

  let formatted;
  if (compact && abs >= 100000) {
    formatted = `${CURRENCY}${(abs / 100000).toFixed(1)}L`;
  } else if (compact && abs >= 1000) {
    formatted = `${CURRENCY}${(abs / 1000).toFixed(1)}K`;
  } else {
    formatted = `${CURRENCY}${abs.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  if (showSign && num < 0) return `-${formatted}`;
  if (showSign && num > 0) return `+${formatted}`;
  return formatted;
};

export const formatDate = (date) => {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date?.toDate?.() || new Date(date);
    return format(d, 'dd MMM yyyy');
  } catch {
    return '';
  }
};

export const formatMonthKey = (year, month) => {
  // month is 0-indexed
  return `${year}-${String(month + 1).padStart(2, '0')}`;
};

export const parseMonthKey = (key) => {
  const [year, month] = key.split('-');
  return { year: parseInt(year), month: parseInt(month) - 1 };
};

export const getMonthLabel = (monthIndex) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[monthIndex];
};

export const getMonthFullLabel = (monthIndex) => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  return months[monthIndex];
};

export const toDateInputValue = (date) => {
  try {
    const d = date?.toDate?.() || new Date(date);
    return format(d, 'yyyy-MM-dd');
  } catch {
    return format(new Date(), 'yyyy-MM-dd');
  }
};
