import { useMemo, useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from 'date-fns';
import { useRenewal } from '../../context/RenewalContext';

// ─── Constants ────────────────────────────────────────────────────────────────

const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/** Map renewal status → CSS variable color */
const STATUS_COLOR = {
  overdue: 'var(--color-status-overdue)',
  'due-soon': 'var(--color-status-due-soon)',
  'due-today': 'var(--color-status-due-soon)',
  active: 'var(--color-status-active)',
  renewed: 'var(--color-status-renewed)',
  cancelled: 'var(--color-status-cancelled)',
  archived: 'var(--color-status-archived)',
};

const MAX_DOTS = 3;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Derive a display status from a renewal object.
 * Falls back to the server-computed `status` field when present.
 */
function getRenewalStatus(renewal) {
  if (renewal.status) return renewal.status;

  const dateStr = renewal.renewalDate ?? renewal.renewal_date;
  if (!dateStr) return 'active';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const renewalDate = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  const diff = Math.floor((renewalDate - today) / (1000 * 60 * 60 * 24));

  if (diff < 0) return 'overdue';
  if (diff === 0) return 'due-today';
  if (diff <= 7) return 'due-soon';
  return 'active';
}

/**
 * Build a map of { 'yyyy-MM-dd': renewal[] } for the current month.
 */
function buildRenewalsByDate(renewals) {
  const map = {};
  renewals.forEach(r => {
    const dateStr = r.renewalDate ?? r.renewal_date;
    if (!dateStr) return;
    const key = typeof dateStr === 'string' ? dateStr.slice(0, 10) : format(dateStr, 'yyyy-MM-dd');
    if (!map[key]) map[key] = [];
    map[key].push(r);
  });
  return map;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** A single colored dot representing one renewal's status. */
function RenewalDot({ status, title }) {
  const color = STATUS_COLOR[status] ?? 'var(--color-text-muted)';
  return (
    <span
      className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
      style={{ backgroundColor: color }}
      aria-label={title ? `${title} — ${status}` : status}
      role="img"
    />
  );
}

/** Skeleton shimmer for a single day cell. */
function DayCellSkeleton() {
  return (
    <div
      className="flex flex-col items-center gap-0.5 p-0.5 rounded-md"
      aria-hidden="true"
    >
      <div
        className="w-5 h-5 rounded-full animate-pulse"
        style={{ backgroundColor: 'var(--color-surface-2)' }}
      />
    </div>
  );
}

// ─── CalendarMiniPreview ──────────────────────────────────────────────────────

/**
 * CalendarMiniPreview — compact sidebar widget showing the current month.
 *
 * - 7-column grid (Sun–Sat)
 * - Dots on days with renewals, color-coded by status
 * - Max 3 dots per day; overflow shown as "+N"
 * - Today highlighted with accent-color border
 * - Clicking any day or "View Calendar" navigates to the Calendar page
 *
 * Requirements: 3.5
 */
export default function CalendarMiniPreview() {
  const { renewals, isLoading, setCurrentPage } = useRenewal();

  // Always show the current month (no navigation — this is a mini preview)
  const today = useMemo(() => new Date(), []);

  /** All calendar cells for the current month view (including padding days). */
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(today));
    const end = endOfWeek(endOfMonth(today));
    return eachDayOfInterval({ start, end });
  }, [today]);

  /** Renewals indexed by date string. */
  const renewalsByDate = useMemo(() => buildRenewalsByDate(renewals), [renewals]);

  /** Navigate to the Calendar page. */
  const goToCalendar = () => setCurrentPage('calendar');

  return (
    <section
      aria-labelledby="calendar-mini-heading"
      style={{
        backgroundColor: 'var(--color-surface-1)',
        borderColor: 'var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-3 pt-3 pb-2"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <h2
          id="calendar-mini-heading"
          className="text-[length:var(--text-sm)] leading-[var(--text-sm-lh)] font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {format(today, 'MMMM yyyy')}
        </h2>
        <button
          type="button"
          onClick={goToCalendar}
          className="text-[length:var(--text-xs)] leading-[var(--text-xs-lh)] font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 rounded"
          style={{ color: 'var(--color-accent)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-accent-hover)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-accent)')}
          aria-label="View full calendar"
        >
          View Calendar
        </button>
      </div>

      {/* ── Day-of-week labels ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-7 px-2 pt-2 pb-1">
        {DAY_NAMES.map(d => (
          <div
            key={d}
            className="text-center text-[length:var(--text-xs)] leading-[var(--text-xs-lh)] font-medium uppercase tracking-wide"
            style={{ color: 'var(--color-text-muted)' }}
            aria-hidden="true"
          >
            {d}
          </div>
        ))}
      </div>

      {/* ── Calendar grid ──────────────────────────────────────────────────── */}
      <div
        className="grid grid-cols-7 gap-y-0.5 px-2 pb-2"
        role="grid"
        aria-label={`Calendar for ${format(today, 'MMMM yyyy')}`}
      >
        {isLoading
          ? days.map((_, i) => <DayCellSkeleton key={i} />)
          : days.map((day, idx) => {
              const key = format(day, 'yyyy-MM-dd');
              const dayRenewals = renewalsByDate[key] ?? [];
              const inMonth = isSameMonth(day, today);
              const isCurrentDay = isToday(day);
              const hasRenewals = dayRenewals.length > 0;

              // Dots to render (max MAX_DOTS)
              const visibleRenewals = dayRenewals.slice(0, MAX_DOTS);
              const overflow = dayRenewals.length - MAX_DOTS;

              return (
                <div
                  key={idx}
                  role="gridcell"
                  aria-label={
                    hasRenewals
                      ? `${format(day, 'MMMM d')}: ${dayRenewals.length} renewal${dayRenewals.length !== 1 ? 's' : ''}`
                      : format(day, 'MMMM d')
                  }
                  onClick={hasRenewals ? goToCalendar : undefined}
                  className={[
                    'flex flex-col items-center gap-0.5 p-0.5 rounded-md transition-colors duration-100',
                    hasRenewals ? 'cursor-pointer' : '',
                    hasRenewals && !isCurrentDay
                      ? 'hover:bg-[color-mix(in_srgb,var(--color-accent)_8%,transparent)]'
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={
                    isCurrentDay
                      ? {
                          outline: '2px solid var(--color-accent)',
                          outlineOffset: '-1px',
                          borderRadius: 'var(--radius-sm)',
                        }
                      : undefined
                  }
                >
                  {/* Day number */}
                  <span
                    className="w-5 h-5 flex items-center justify-center rounded-full text-[length:var(--text-xs)] leading-none font-medium select-none"
                    style={{
                      color: isCurrentDay
                        ? 'var(--color-accent)'
                        : inMonth
                        ? 'var(--color-text-primary)'
                        : 'var(--color-text-muted)',
                      fontWeight: isCurrentDay ? '700' : undefined,
                    }}
                    aria-current={isCurrentDay ? 'date' : undefined}
                  >
                    {format(day, 'd')}
                  </span>

                  {/* Renewal dots */}
                  {hasRenewals && (
                    <div className="flex items-center gap-px flex-wrap justify-center">
                      {visibleRenewals.map(r => (
                        <RenewalDot
                          key={r.id}
                          status={getRenewalStatus(r)}
                          title={r.title ?? r.name}
                        />
                      ))}
                      {overflow > 0 && (
                        <span
                          className="text-[9px] leading-none font-semibold"
                          style={{ color: 'var(--color-text-muted)' }}
                          aria-label={`${overflow} more renewal${overflow !== 1 ? 's' : ''}`}
                        >
                          +{overflow}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
      </div>

      {/* ── Legend ─────────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-center gap-3 px-3 py-2"
        style={{ borderTop: '1px solid var(--color-border)' }}
        aria-label="Status legend"
      >
        {[
          { status: 'overdue', label: 'Overdue' },
          { status: 'due-soon', label: 'Due soon' },
          { status: 'active', label: 'Active' },
        ].map(({ status, label }) => (
          <span
            key={status}
            className="inline-flex items-center gap-1 text-[length:var(--text-xs)] leading-[var(--text-xs-lh)]"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: STATUS_COLOR[status] }}
              aria-hidden="true"
            />
            {label}
          </span>
        ))}
      </div>
    </section>
  );
}
