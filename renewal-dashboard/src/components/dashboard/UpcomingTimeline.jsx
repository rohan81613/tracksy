import { useMemo } from 'react';
import { differenceInDays, parseISO, format } from 'date-fns';
import { useRenewal } from '../../context/RenewalContext';
import { formatCurrency } from '../../utils/renewalUtils';
import { SkeletonLine } from '../ui/Skeleton';

// ─── DatePill ────────────────────────────────────────────────────────────────
/**
 * Inline DatePill component.
 * Shows a formatted date + relative label ("in X days" / "today" / "X days ago").
 * Color: red if overdue, amber if ≤7 days, green otherwise.
 */
function DatePill({ date }) {
  if (!date) return null;

  const parsed = typeof date === 'string' ? parseISO(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = differenceInDays(parsed, today);

  let relativeLabel;
  if (days === 0) relativeLabel = 'today';
  else if (days > 0) relativeLabel = `in ${days} day${days !== 1 ? 's' : ''}`;
  else relativeLabel = `${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} ago`;

  // Color logic
  let colorStyle;
  if (days < 0) {
    colorStyle = {
      backgroundColor: 'color-mix(in srgb, var(--color-status-overdue) 12%, transparent)',
      color: 'var(--color-status-overdue)',
      borderColor: 'color-mix(in srgb, var(--color-status-overdue) 25%, transparent)',
    };
  } else if (days <= 7) {
    colorStyle = {
      backgroundColor: 'color-mix(in srgb, var(--color-status-due-soon) 12%, transparent)',
      color: 'var(--color-status-due-soon)',
      borderColor: 'color-mix(in srgb, var(--color-status-due-soon) 25%, transparent)',
    };
  } else {
    colorStyle = {
      backgroundColor: 'color-mix(in srgb, var(--color-status-active) 12%, transparent)',
      color: 'var(--color-status-active)',
      borderColor: 'color-mix(in srgb, var(--color-status-active) 25%, transparent)',
    };
  }

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[length:var(--text-xs)] leading-[var(--text-xs-lh)] font-medium whitespace-nowrap"
      style={colorStyle}
      aria-label={`Due ${relativeLabel}`}
    >
      <span>{format(parsed, 'MMM d, yyyy')}</span>
      <span className="opacity-75">·</span>
      <span>{relativeLabel}</span>
    </span>
  );
}

// ─── Status dot ──────────────────────────────────────────────────────────────
const STATUS_DOT_COLOR = {
  active: 'var(--color-status-active)',
  'due-soon': 'var(--color-status-due-soon)',
  'due-today': 'var(--color-status-due-soon)',
  overdue: 'var(--color-status-overdue)',
  renewed: 'var(--color-status-renewed)',
  cancelled: 'var(--color-status-cancelled)',
  archived: 'var(--color-status-archived)',
};

function StatusDot({ status }) {
  const color = STATUS_DOT_COLOR[status] ?? 'var(--color-text-muted)';
  return (
    <span
      className="inline-block w-2.5 h-2.5 rounded-full shrink-0 mt-0.5"
      style={{ backgroundColor: color }}
      aria-label={`Status: ${status}`}
      role="img"
    />
  );
}

// ─── Skeleton card ────────────────────────────────────────────────────────────
function TimelineSkeletonCard() {
  return (
    <div
      className="flex-shrink-0 w-64 rounded-xl border p-4 space-y-3 snap-start"
      style={{
        backgroundColor: 'var(--color-surface-1)',
        borderColor: 'var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
      }}
      aria-hidden="true"
    >
      {/* Header row: dot + title */}
      <div className="flex items-start gap-2">
        <div
          className="w-2.5 h-2.5 rounded-full shrink-0 mt-1 animate-pulse"
          style={{ backgroundColor: 'var(--color-border)' }}
        />
        <div className="flex-1 space-y-1.5">
          <SkeletonLine className="h-4 w-36" />
          <SkeletonLine className="h-3 w-24" />
        </div>
      </div>
      {/* Date pill */}
      <SkeletonLine className="h-5 w-40 rounded-full" />
      {/* Amount */}
      <SkeletonLine className="h-5 w-20" />
      {/* Buttons */}
      <div className="flex gap-2 pt-1">
        <SkeletonLine className="h-7 w-24 rounded-lg" />
        <SkeletonLine className="h-7 w-16 rounded-lg" />
      </div>
    </div>
  );
}

// ─── Timeline card ────────────────────────────────────────────────────────────
function TimelineCard({ renewal, onRenewNow, onSnooze }) {
  const status = renewal.status ?? 'active';
  const currency = renewal.currency ?? 'USD';

  return (
    <article
      className="flex-shrink-0 w-64 rounded-xl border p-4 flex flex-col gap-3 snap-start transition-shadow duration-150 hover:shadow-[var(--shadow-md)]"
      style={{
        backgroundColor: 'var(--color-surface-1)',
        borderColor: 'var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
      }}
      aria-label={`${renewal.title} renewal`}
    >
      {/* Header: status dot + title + provider */}
      <div className="flex items-start gap-2">
        <StatusDot status={status} />
        <div className="flex-1 min-w-0">
          <p
            className="text-[length:var(--text-sm)] leading-[var(--text-sm-lh)] font-semibold truncate"
            style={{ color: 'var(--color-text-primary)' }}
            title={renewal.title}
          >
            {renewal.title}
          </p>
          {renewal.provider && (
            <p
              className="text-[length:var(--text-xs)] leading-[var(--text-xs-lh)] truncate"
              style={{ color: 'var(--color-text-secondary)' }}
              title={renewal.provider}
            >
              {renewal.provider}
            </p>
          )}
        </div>
      </div>

      {/* Date pill */}
      <DatePill date={renewal.renewalDate ?? renewal.renewal_date} />

      {/* Amount */}
      <p
        className="text-[length:var(--text-base)] leading-[var(--text-base-lh)] font-bold tabular-nums"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {formatCurrency(renewal.amount ?? 0, currency)}
        {renewal.billingCycle && (
          <span
            className="ml-1 text-[length:var(--text-xs)] font-normal"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            /{renewal.billingCycle === 'monthly' ? 'mo' : renewal.billingCycle === 'yearly' ? 'yr' : renewal.billingCycle}
          </span>
        )}
      </p>

      {/* Action buttons */}
      <div className="flex gap-2 mt-auto pt-1">
        <button
          type="button"
          onClick={() => onRenewNow(renewal)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[length:var(--text-xs)] leading-[var(--text-xs-lh)] font-medium transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: '#ffffff',
            focusVisibleOutlineColor: 'var(--color-accent)',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-accent-hover)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--color-accent)')}
          aria-label={`Renew ${renewal.title} now`}
        >
          Renew Now
        </button>
        <button
          type="button"
          onClick={() => onSnooze(renewal)}
          className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-[length:var(--text-xs)] leading-[var(--text-xs-lh)] font-medium border transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            backgroundColor: 'var(--color-surface-2)',
            color: 'var(--color-text-secondary)',
            borderColor: 'var(--color-border)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'var(--color-surface-0)';
            e.currentTarget.style.color = 'var(--color-text-primary)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'var(--color-surface-2)';
            e.currentTarget.style.color = 'var(--color-text-secondary)';
          }}
          aria-label={`Snooze ${renewal.title}`}
        >
          Snooze
        </button>
      </div>
    </article>
  );
}

// ─── UpcomingTimeline ─────────────────────────────────────────────────────────
/**
 * UpcomingTimeline — horizontal scrollable list of the next 10 upcoming renewals.
 *
 * Reads `renewals`, `isLoading`, `addToast` from RenewalContext.
 * Calls `renewRenewal(id)` / `snoozeRenewal(id)` if available on context,
 * otherwise falls back to a toast notification.
 *
 * Requirements: 3.3
 */
export default function UpcomingTimeline() {
  const { renewals, isLoading, addToast, renewRenewal, snoozeRenewal } = useRenewal();

  // Filter to upcoming/active renewals, sort by renewalDate asc, take first 10
  const upcomingRenewals = useMemo(() => {
    const EXCLUDED = new Set(['cancelled', 'archived']);
    return [...renewals]
      .filter(r => !EXCLUDED.has(r.status))
      .sort((a, b) => {
        const dateA = new Date(a.renewalDate ?? a.renewal_date ?? 0);
        const dateB = new Date(b.renewalDate ?? b.renewal_date ?? 0);
        return dateA - dateB;
      })
      .slice(0, 10);
  }, [renewals]);

  // ── Action handlers ──────────────────────────────────────────────────────
  const handleRenewNow = async (renewal) => {
    if (typeof renewRenewal === 'function') {
      await renewRenewal(renewal.id);
    } else {
      addToast(`Marked "${renewal.title}" as renewed`, 'success');
    }
  };

  const handleSnooze = async (renewal) => {
    if (typeof snoozeRenewal === 'function') {
      await snoozeRenewal(renewal.id, 7);
    } else {
      addToast(`Snoozed "${renewal.title}" for 7 days`, 'info');
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <section aria-labelledby="upcoming-timeline-heading">
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <h2
          id="upcoming-timeline-heading"
          className="text-[length:var(--text-base)] leading-[var(--text-base-lh)] font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Upcoming Renewals
        </h2>
        {!isLoading && upcomingRenewals.length > 0 && (
          <span
            className="text-[length:var(--text-xs)] leading-[var(--text-xs-lh)]"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Next {upcomingRenewals.length} renewal{upcomingRenewals.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Scroll container */}
      <div
        className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin snap-x snap-mandatory"
        role="list"
        aria-label="Upcoming renewals timeline"
        aria-busy={isLoading}
      >
        {isLoading ? (
          // Skeleton cards
          <>
            {[...Array(4)].map((_, i) => (
              <TimelineSkeletonCard key={i} />
            ))}
          </>
        ) : upcomingRenewals.length === 0 ? (
          // Empty state
          <div
            className="flex-1 flex flex-col items-center justify-center py-10 rounded-xl border"
            style={{
              backgroundColor: 'var(--color-surface-1)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <svg
              aria-hidden="true"
              className="w-10 h-10 mb-3 opacity-40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-[length:var(--text-sm)] font-medium">No upcoming renewals</p>
            <p className="text-[length:var(--text-xs)] mt-1 opacity-75">
              Add a renewal to see it here
            </p>
          </div>
        ) : (
          // Renewal cards
          upcomingRenewals.map(renewal => (
            <div key={renewal.id} role="listitem">
              <TimelineCard
                renewal={renewal}
                onRenewNow={handleRenewNow}
                onSnooze={handleSnooze}
              />
            </div>
          ))
        )}
      </div>
    </section>
  );
}
