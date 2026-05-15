/**
 * DatePill — shows a formatted date with a relative "in X days" / "X days ago" label.
 *
 * Color coding (matches status color tokens from index.css):
 *   - overdue  (daysRemaining < 0)  → red   (--color-status-overdue)
 *   - due-soon (daysRemaining ≤ 7)  → amber (--color-status-due-soon)
 *   - active   (daysRemaining > 7)  → green (--color-status-active)
 *
 * Props:
 *   date           {string|Date}  ISO date string or Date object
 *   daysRemaining  {number}       Negative = overdue, 0 = today, positive = future
 */

import { format, parseISO, isValid } from 'date-fns';

/** Resolve the color CSS variable based on daysRemaining. */
function resolveColor(daysRemaining) {
  if (daysRemaining < 0) return 'var(--color-status-overdue)';
  if (daysRemaining <= 7) return 'var(--color-status-due-soon)';
  return 'var(--color-status-active)';
}

/** Build the relative label string. */
function buildRelativeLabel(daysRemaining) {
  if (daysRemaining === 0) return 'today';
  if (daysRemaining < 0) {
    const abs = Math.abs(daysRemaining);
    return `${abs} day${abs === 1 ? '' : 's'} ago`;
  }
  return `in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`;
}

/** Parse a date value that may be a string or a Date object. */
function parseDate(date) {
  if (!date) return null;
  if (date instanceof Date) return isValid(date) ? date : null;
  // Try ISO parse first, then fall back to new Date()
  const parsed = parseISO(date);
  if (isValid(parsed)) return parsed;
  const fallback = new Date(date);
  return isValid(fallback) ? fallback : null;
}

export function DatePill({ date, daysRemaining }) {
  const parsedDate = parseDate(date);
  const color = resolveColor(daysRemaining);
  const relativeLabel = buildRelativeLabel(daysRemaining);

  // Format the date as "Jan 15, 2025"; fall back to the raw string if unparseable
  const formattedDate = parsedDate ? format(parsedDate, 'MMM d, yyyy') : String(date ?? '');

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '2px 10px',
        borderRadius: 'var(--radius-full)',
        fontSize: 'var(--text-xs)',
        lineHeight: 'var(--text-xs-lh)',
        fontWeight: 500,
        backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
        color,
        boxShadow: `0 0 0 1px color-mix(in srgb, ${color} 25%, transparent)`,
        whiteSpace: 'nowrap',
      }}
      aria-label={`Due ${formattedDate}, ${relativeLabel}`}
    >
      {/* Calendar icon dot */}
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: color,
          flexShrink: 0,
        }}
        aria-hidden="true"
      />
      {formattedDate}
      <span
        style={{
          opacity: 0.75,
          fontWeight: 400,
        }}
      >
        · {relativeLabel}
      </span>
    </span>
  );
}

export default DatePill;
