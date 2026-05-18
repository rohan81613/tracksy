import { differenceInDays, parseISO, isToday, isPast, isFuture, addDays, addMonths, addYears } from 'date-fns';

export function getStatus(renewalDate, purchaseDate = null) {
  const date = parseISO(renewalDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = differenceInDays(date, today);

  // Past renewal date → overdue
  if (diff < 0) return 'overdue';

  // Renewal is today → due-today
  if (diff === 0) return 'due-today';

  // If purchase date exists and is today or in the past,
  // the subscription is live/active regardless of how soon renewal is
  if (purchaseDate) {
    const pDate = parseISO(purchaseDate);
    pDate.setHours(0, 0, 0, 0);
    if (pDate <= today && diff > 0) return 'active';
  }

  // Within 30 days → upcoming
  if (diff <= 30) return 'upcoming';

  return 'active';
}

export function getDaysUntil(renewalDate) {
  const date = parseISO(renewalDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return differenceInDays(date, today);
}

export function calculateStats(renewals) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const total = renewals.length;
  const upcoming = renewals.filter(r => {
    const diff = getDaysUntil(r.renewalDate);
    return diff >= 0 && diff <= 30;
  }).length;
  const overdue = renewals.filter(r => getDaysUntil(r.renewalDate) < 0).length;

  const monthlySpend = renewals.reduce((sum, r) => {
    if (r.billingCycle === 'monthly') return sum + r.amount;
    if (r.billingCycle === 'yearly') return sum + r.amount / 12;
    return sum;
  }, 0);

  return { total, upcoming, overdue, monthlySpend };
}

export function generateNotifications(renewals) {
  const notifications = [];
  renewals.forEach(renewal => {
    const days = getDaysUntil(renewal.renewalDate);
    if (days >= 0 && days <= renewal.reminderDays) {
      notifications.push({
        id: `notif-${renewal.id}`,
        renewalId: renewal.id,
        title: days === 0
          ? `${renewal.name} renews TODAY`
          : `${renewal.name} renews in ${days} day${days !== 1 ? 's' : ''}`,
        subtitle: `$${renewal.amount} · ${renewal.vendor}`,
        days,
        read: false,
        createdAt: new Date().toISOString(),
      });
    }
    if (days < 0) {
      notifications.push({
        id: `notif-overdue-${renewal.id}`,
        renewalId: renewal.id,
        title: `${renewal.name} is overdue`,
        subtitle: `Was due ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} ago · $${renewal.amount}`,
        days,
        read: false,
        createdAt: new Date().toISOString(),
      });
    }
  });
  return notifications.sort((a, b) => a.days - b.days);
}

export function formatCurrency(amount, currency = 'USD') {
  const localeMap = { USD: 'en-US', INR: 'en-IN' };
  return new Intl.NumberFormat(localeMap[currency] || 'en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function formatCurrencyWithCode(amount, currency = 'USD') {
  const localeMap = { USD: 'en-US', INR: 'en-IN' };
  return new Intl.NumberFormat(localeMap[currency] || 'en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function getNextRenewalDate(renewalDate, billingCycle) {
  const date = parseISO(renewalDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // If already in the future, next renewal is one cycle after current
  if (date >= today) {
    return billingCycle === 'yearly' ? addYears(date, 1) : addMonths(date, 1);
  }
  // If overdue, next renewal is one cycle from today
  return billingCycle === 'yearly' ? addYears(today, 1) : addMonths(today, 1);
}
