import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';

export const formatCurrency = (amount: number, currency = 'TZS'): string => {
  return new Intl.NumberFormat('en-TZ', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (num: number, decimals = 2): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

export const formatDate = (date: string | Date, formatString = 'MMM dd, yyyy'): string => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsedDate)) return '-';
  return format(parsedDate, formatString);
};

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'MMM dd, yyyy HH:mm');
};

export const formatTime = (date: string | Date): string => {
  return formatDate(date, 'HH:mm');
};

export const formatRelativeTime = (date: string | Date): string => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsedDate)) return '-';
  return formatDistanceToNow(parsedDate, { addSuffix: true });
};

export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

export const formatPatientNumber = (num: number): string => {
  return `PT${num.toString().padStart(6, '0')}`;
};

export const formatBillNumber = (num: number): string => {
  return `BILL${num.toString().padStart(6, '0')}`;
};