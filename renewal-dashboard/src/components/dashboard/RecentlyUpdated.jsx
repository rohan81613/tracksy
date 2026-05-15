import { useMemo } from 'react';
import { parseISO, formatDistanceToNow } from 'date-fns';
import { useRenewal } from '../../context/RenewalContext';
import { SkeletonLine } from '../ui/Skeleton';

// ─── Status badge config ──────────────────────────────────────────────────────
const STATUS_CONFIG = {
  active: {
    label: 'Active',
    bg: 'color-mix(in srgb, var(--color-status-active) 12%, transparent)',
    color: 'var(--color-status-active)',
    dot: 'var(--color-status-active)',
  },
  'due-soon': {
    label: 'Due Soon',
    bg: 'color-mix(in srgb, var(--color-status-due-soon) 12%, transparent)',
    color: 'var(--color-status-due-soon)',
    dot: 'var(--color-status-due-soon)',
  },
  'due-today': {
    label: 'Due Today',
    bg: 'color-mix(in srgb, var(--color-status-due-soon) 12%, transparent)',
    color: 'var(--color-status-due-soon)',
    dot: 'var(--color-status-due-soon)',
  },
  overdue: {
    label: 'Overdue',
    bg: 'color-mix(in srgb, var(--color-status-overdue) 12%, transparent)',
    color: 'var(--color-status-overdue)',
    dot: 'var(--color-status-overdue)',
  },
  renewed: {
    label: 'Renewed',
    bg: 'color-mix(in srgb, var(--color-status-renewed) 12%, transparent)',
    color: 'var(--color-status-renewed)',
    dot: 'var(--color-status-renewed)',
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'color-mix(in srgb, var(--color-status-cancelled) 12%, transparent)',
    color: 'var(--color-status-cancelled)',
    dot: 'var(--color-status-cancelled)',
  },
  archived: {
    label: 'Archived',
    bg: 'color-mix(in srgb, var(--color-status-archived) 12%, transparent)',
    color: 'var(--color-status-archived)',
    dot: 'var(--color-status-archived)',
  },
};

// ─── Inline status badge ──────────────────────────────────────────────────────
function InlineStatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.active;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[length:var(--text-xs)] leading-[var(--text-xs-lh)] font-medium whitespace-nowrap shrink-0"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
      aria-label={`Status: ${cfg.label}`}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: cfg.dot }}
        aria-hidden="true"
      />
      {cfg.label}
    </span>
  );
}

// ─── Relative time helper ─────────────────────────────────────────────────────
function relativeTime(dateStr) {
  if (!dateStr) return null;
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return null;
  }
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────
function RecentlyUpdatedSkeletonRow() {
  return (
    <div
      className="flex items-center gap-3 py-3 animate-pulse"
      aria-hidden="true"
    >
      <div className="flex-1 min-w-0 space-y-1.5">
        <SkeletonLine className="h-4 w-40" />
        <SkeletonLine className="h-3 w-24" />
      </div>
      <SkeletonLine className="h-5 w-20 rounded-full shrink-0" />
    </div>
  );
}

// ─── Single row ───────────────────────────────────────────────────────────────
function RecentlyUpdatedRow({ renewal }) {
  const status = renewal.status ?? 'active';
  const updatedAt = renewal.updatedAt ?? renewal.updated_at ?? null;
  const timeAgo = relativeTime(updatedAt);

  return (
    <article
      className="flex items-center gap-3 py-3"
      aria-label={`${renewal.title}, ${STATUS_CONFIG[status]?.label ?? status}${timeAgo ? `, updated ${timeAgo}` : ''}`}
    >
      {/* Title + updated time */}
      <div className="flex-1 min-w-0">
        <p
          className="text-[length:var(--text-sm)] leading-[var(--text-sm-lh)] font-medium truncate"
          style={{ color: 'var(--color-text-primary)' }}
          title={renewal.title}
        >
          {renewal.title}
        </p>
        {timeAgo && (
          <p
            className="text-[length:var(--text-xs)] leading-[var(--text-xs-lh)] mt-0.5"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {timeAgo}
          </p>
        )}
      </div>

      {/* Status badge */}
      <InlineStatusBadge status={status} />
    </article>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function NoRecentActivity() {
  return (
    <div
      className="flex flex-col items-center justify-center py-8 rounded-xl border"
      style={{
        backgroundColor: 'var(--color-surface-1)',
        borderColor: 'var(--color-border)',
      }}
      role="status"
      aria-label="No recent activity"
    >
      <svg
        aria-hidden="true"
        className="w-8 h-8 mb-2 opacity-30"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z"
        />
      </svg>
      <p
        className="text-[length:var(--text-sm)] font-medium"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        No recent activity
      </p>
      <p
        className="text-[length:var(--text-xs)] mt-0.5"
        style={{ color: 'var(--color-text-muted)' }}
      >
        Modified renewals will appear here
      </p>
    </div>
  );
}

// ─── RecentlyUpdated ──────────────────────────────────────────────────────────
/**
 * RecentlyUpdated — compact list of the last 5 modified renewals.
 *
 * Each row shows: title, status badge, and relative updated time.
 * Shows skeleton loaders while data is loading.
 *
 * Requirements: 3.7
 */
export default function RecentlyUpdated() {
  const { renewals, isLoading } = useRenewal();

  // Sort by updatedAt descending, take last 5
  const recentRenewals = useMemo(() => {
    return [...renewals]
      .filter(r => {
        const updatedAt = r.updatedAt ?? r.updated_at;
        return !!updatedAt;
      })
      .sort((a, b) => {
        const dateA = new Date(a.updatedAt ?? a.updated_at ?? 0);
        const dateB = new Date(b.updatedAt ?? b.updated_at ?? 0);
        return dateB - dateA; // newest first
      })
      .slice(0, 5);
  }, [renewals]);

  return (
    <section aria-labelledby="recently-updated-heading">
      {/* Section header */}
      <div className="flex items-center justify-between mb-1">
        <h2
          id="recently-updated-heading"
          className="text-[length:var(--text-base)] leading-[var(--text-base-lh)] font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Recently Updated
        </h2>
        {!isLoading && recentRenewals.length > 0 && (
          <span
            className="text-[length:var(--text-xs)] leading-[var(--text-xs-lh)]"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Last {recentRenewals.length}
          </span>
        )}
      </div>

      {/* Divider */}
      <div
        className="mb-1"
        style={{ borderBottom: '1px solid var(--color-border)' }}
        aria-hidden="true"
      />

      {/* Content */}
      <div
        role="list"
        aria-label="Recently updated renewals"
        aria-busy={isLoading}
      >
        {isLoading ? (
          // Skeleton rows
          <>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                role="listitem"
                style={
                  i < 4
                    ? { borderBottom: '1px solid var(--color-border)' }
                    : undefined
                }
              >
                <RecentlyUpdatedSkeletonRow />
              </div>
            ))}
          </>
        ) : recentRenewals.length === 0 ? (
          // Empty state
          <NoRecentActivity />
        ) : (
          // Renewal rows
          recentRenewals.map((renewal, idx) => (
            <div
              key={renewal.id}
              role="listitem"
              style={
                idx < recentRenewals.length - 1
                  ? { borderBottom: '1px solid var(--color-border)' }
                  : undefined
              }
            >
              <RecentlyUpdatedRow renewal={renewal} />
            </div>
          ))
        )}
      </div>
    </section>
  );
}
