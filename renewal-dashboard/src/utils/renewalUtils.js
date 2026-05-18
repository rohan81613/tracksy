import { differenceInDays, parseISO, addMonths, addYears, isBefore, isAfter } from 'date-fns';

/**
 * Computes the next upcoming renewal date based on purchase date and billing cycle.
 *
 * Logic: Starting from purchaseDate, advance by billingCycle increments until
 * we find the first date that is today or in the future.
 *
 * If no purchaseDate is provided, falls back to renewalDate-based calculation.
 */
export function getUpcomingRenewalDate(purchaseDate, renewalDate, billingCycle) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (purchaseDate) {
    let anchor = parseISO(purchaseDate);
    anchor.setHours(0, 0, 0, 0);

    // Advance anchor by one cycle at a time until it's >= today
    let iterations = 0;
    while (isBefore(anchor, today) && iterations < 1200) {
      anchor = billingCycle === 'yearly' ? addYears(anchor, 1) : addMonths(anchor, 1);
      iterations++;
    }
    return anchor;
  }

  // Fallback: use renewalDate
  const rDate = parseISO(renewalDate);
  rDate.setHours(0, 0, 0, 0);
  if (!isBefore(rDate, today)) return rDate;
  // renewalDate is in the past — advance one cycle at a time
  let anchor = rDate;
  let iterations = 0;
  while (isBefore(anchor, today) && iterations < 1200) {
    anchor = billingCycle === 'yearly' ? addYears(anchor, 1) : addMonths(anchor, 1);
    iterations++;
  }
  return anchor;
}

/**
 * Days until the upcoming renewal (can be negative if overdue, but with new logic
 * upcoming is always >= today when purchaseDate is set).
 */
export function getDaysUntilUpcoming(purchaseDate, renewalDate, billingCycle) {
  const upcoming = getUpcomingRenewalDate(purchaseDate, renewalDate, billingCycle);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return differenceInDays(upcoming, today);
}

/**
 * Status based on upcoming renewal date (purchase-date-aware).
 * - overdue: upcoming renewal is in the past (only possible when no purchaseDate)
 * - due-today: upcoming renewal is today
 * - upcoming: within 30 days
 * - active: more than 30 days away
 */
export function getStatus(renewalDate, purchaseDate = null) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingDate = getUpcomingRenewalDate(purchaseDate, renewalDate, 'monthly'); // billingCycle not available here, use renewalDate fallback
  // NOTE: getStatus is called with renewalDate + purchaseDate only (no billingCycle).
  // We compute status from the raw renewalDate diff for backward compat with badge display,
  // but treat any subscription with a valid purchaseDate as active unless renewal is today/overdue.

  const rDate = parseISO(renewalDate);
  rDate.setHours(0, 0, 0, 0);
  const diff = differenceInDays(rDate, today);

  if (diff < 0) {
    // renewalDate is past — if purchaseDate exists, subscription is still active (upcoming computed)
    if (purchaseDate) return 'active';
    return 'overdue';
  }
  if (diff === 0) return 'due-today';
  if (diff <= 30) return 'upcoming';
  return 'active';
}

/**
 * Status using full renewal data including billingCycle for accurate upcoming calculation.
 */
export function getStatusFull(renewal) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingDate = getUpcomingRenewalDate(renewal.purchaseDate, renewal.renewalDate, renewal.billingCycle);
  const diff = differenceInDays(upcomingDate, today);

  if (diff < 0) return 'overdue';
  if (diff === 0) return 'due-today';
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
    const diff = getDaysUntilUpcoming(r.purchaseDate, r.renewalDate, r.billingCycle);
    return diff >= 0 && diff <= 30;
  }).length;
  const overdue = renewals.filter(r => {
    // Only overdue if no purchaseDate and renewalDate is past
    if (r.purchaseDate) return false;
    return getDaysUntil(r.renewalDate) < 0;
  }).length;

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
    const upcomingDate = getUpcomingRenewalDate(renewal.purchaseDate, renewal.renewalDate, renewal.billingCycle);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = differenceInDays(upcomingDate, today);

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

/**
 * @deprecated Use getUpcomingRenewalDate instead.
 * Kept for any legacy callers.
 */
export function getNextRenewalDate(renewalDate, billingCycle) {
  return getUpcomingRenewalDate(null, renewalDate, billingCycle);
}
