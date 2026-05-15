import { useMemo } from 'react';
import { differenceInDays, parseISO } from 'date-fns';
import { useRenewal } from '../../context/RenewalContext';
import { formatCurrency } from '../../utils/renewalUtils';
import { SkeletonLine } from '../ui/Skeleton';

// ─── Skeleton row ─────────────────────────────────────────────────────────────
function OverdueSkeletonRow() {
  return (
    <div
      className="flex items-center gap-4 p-4 rounded-lg border-l-4 animate-pulse"
      style={{
        backgroundColor: 'var(--color-surface-1)',
        borderLeftColor: 'var(--color-status-overdue)',
        borderTopColor: 'var(--color-border)',
        borderRightColor: 'var(--color-border)',
        borderBottomColor: 'var(--color-border)',
        borderTopWidth: '1px',
        borderRightWidth: '1px',
        borderBottomWidth: '1px',
      }}
      aria-hidden="true"
    >
      <div className="flex-1 space-y-2 min-w-0">
        <SkeletonLine className="h-4 w-40" />
        <SkeletonLine className="h-3 w-28" />
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0">
        <SkeletonLine className="h-4 w-16" />
        <SkeletonLine className="h-3 w-20" />
      </div>
      <SkeletonLine className="h-8 w-24 rounded-lg shrink-0" />
    </div>
  );
}

// ─── Overdue item row ─────────────────────────────────────────────────────────
function OverdueItem({ renewal, onRenewNow }) {
  const currency = renewal.currency ?? 'USD';

  // Compute days overdue from renewalDate (or renewal_date for snake_case API responses)
  const rawDate = renewal.renewalDate ?? renewal.renewal_date;
  const daysOverdue = useMemo(() => {
    if (!rawDate) return 0;
    const parsed = typeof rawDate === 'string' ? parseISO(rawDate) : rawDate;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = differenceInDays(today, parsed); // positive = overdue by N days
    return Math.max(0, diff);
  }, [rawDate]);

  // Owner display name
  const ownerName =
    renewal.ownerName ??
    renewal.owner?.name ??
    renewal.owner_name ??
    null;

  return (
    <article
      className="flex items-center gap-4 p-4 rounded-lg border border-l-4 transition-shadow duration-150 hover:shadow-[var(--shadow-md)]"
      style={{
        backgroundColor: 'var(--color-surface-1)',
        borderColor: 'var(--color-border)',
        borderLeftColor: 'var(--color-status-overdue)',
        boxShadow: 'var(--shadow-sm)',
      }}
      aria-label={`${renewal.title} — overdue by ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''}`}
    >
      {/* Left: title + overdue label */}
      <div className="flex-1 min-w-0">
        <p
          className="text-[length:var(--text-sm)] leading-[var(--text-sm-lh)] font-semibold truncate"
          style={{ color: 'var(--color-text-primary)' }}
          title={renewal.title}
        >
          {renewal.title}
        </p>
        <p
          className="text-[length:var(--text-xs)] leading-[var(--text-xs-lh)] font-medium mt-0.5"
          style={{ color: 'var(--color-status-overdue)' }}
        >
          {daysOverdue === 0
            ? 'Due today'
            : `${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue`}
        </p>
      </div>

      {/* Middle: amount + owner */}
      <div className="flex flex-col items-end gap-0.5 shrink-0 text-right">
        <p
          className="text-[length:var(--text-sm)] leading-[var(--text-sm-lh)] font-bold tabular-nums"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {formatCurrency(renewal.amount ?? 0, currency)}
        </p>
        {ownerName && (
          <p
            className="text-[length:var(--text-xs)] leading-[var(--text-xs-lh)] truncate max-w-[120px]"
            style={{ color: 'var(--color-text-secondary)' }}
            title={ownerName}
          >
            {ownerName}
          </p>
        )}
      </div>

      {/* Right: Renew Now CTA */}
      <button
        type="button"
        onClick={() => onRenewNow(renewal)}
        className="shrink-0 inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-[length:var(--text-xs)] leading-[var(--text-xs-lh)] font-medium transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 whitespace-nowrap"
        style={{
          backgroundColor: 'var(--color-status-overdue)',
          color: '#ffffff',
        }}
        onMouseEnter={e =>
          (e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-status-overdue) 85%, black)')
        }
        onMouseLeave={e =>
          (e.currentTarget.style.backgroundColor = 'var(--color-status-overdue)')
        }
        aria-label={`Renew ${renewal.title} now`}
      >
        Renew Now
      </button>
    </article>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function AllCaughtUp() {
  return (
    <div
      className="flex flex-col items-center justify-center py-10 rounded-xl border"
      style={{
        backgroundColor: 'var(--color-surface-1)',
        borderColor: 'var(--color-border)',
      }}
      role="status"
      aria-label="No overdue renewals"
    >
      {/* Green checkmark icon */}
      <span
        className="flex items-center justify-center w-12 h-12 rounded-full mb-3"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--color-status-active) 12%, transparent)',
        }}
        aria-hidden="true"
      >
        <svg
          className="w-6 h-6"
          style={{ color: 'var(--color-status-active)' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </span>
      <p
        className="text-[length:var(--text-sm)] leading-[var(--text-sm-lh)] font-semibold"
        style={{ color: 'var(--color-text-primary)' }}
      >
        All caught up!
      </p>
      <p
        className="text-[length:var(--text-xs)] leading-[var(--text-xs-lh)] mt-1"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        No overdue renewals right now
      </p>
    </div>
  );
}

// ─── OverduePanel ─────────────────────────────────────────────────────────────
/**
 * OverduePanel — lists all overdue renewals with a "Renew Now" CTA per item.
 *
 * Reads `renewals`, `isLoading`, `addToast`, and optionally `renewRenewal`
 * from RenewalContext.
 *
 * A renewal is considered overdue when:
 *   - its `status` field equals 'overdue', OR
 *   - its `renewalDate` is in the past (computed client-side as fallback)
 *
 * Requirements: 3.4
 */
export default function OverduePanel() {
  const { renewals, isLoading, addToast, renewRenewal } = useRenewal();

  // Filter to overdue renewals only
  const overdueRenewals = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return renewals.filter(r => {
      // Prefer server-computed status
      if (r.status === 'overdue') return true;
      // Fallback: compute from renewalDate
      const rawDate = r.renewalDate ?? r.renewal_date;
      if (!rawDate) return false;
      const parsed = typeof rawDate === 'string' ? parseISO(rawDate) : rawDate;
      return parsed < today && r.status !== 'cancelled' && r.status !== 'archived' && r.status !== 'renewed';
    });
  }, [renewals]);

  // ── Action handler ────────────────────────────────────────────────────────
  const handleRenewNow = async (renewal) => {
    if (typeof renewRenewal === 'function') {
      await renewRenewal(renewal.id);
    } else {
      addToast(`Marked "${renewal.title}" as renewed`, 'success');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <section aria-labelledby="overdue-panel-heading">
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <h2
          id="overdue-panel-heading"
          className="text-[length:var(--text-base)] leading-[var(--text-base-lh)] font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Overdue Renewals
        </h2>
        {!isLoading && overdueRenewals.length > 0 && (
          <span
            className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 rounded-full text-[length:var(--text-xs)] leading-none font-semibold"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-status-overdue) 12%, transparent)',
              color: 'var(--color-status-overdue)',
            }}
            aria-label={`${overdueRenewals.length} overdue`}
          >
            {overdueRenewals.length}
          </span>
        )}
      </div>

      {/* Content */}
      <div
        className="flex flex-col gap-3"
        role="list"
        aria-label="Overdue renewals"
        aria-busy={isLoading}
      >
        {isLoading ? (
          // Skeleton rows
          <>
            {[...Array(3)].map((_, i) => (
              <div key={i} role="listitem">
                <OverdueSkeletonRow />
              </div>
            ))}
          </>
        ) : overdueRenewals.length === 0 ? (
          // Empty state
          <AllCaughtUp />
        ) : (
          // Overdue items
          overdueRenewals.map(renewal => (
            <div key={renewal.id} role="listitem">
              <OverdueItem renewal={renewal} onRenewNow={handleRenewNow} />
            </div>
          ))
        )}
      </div>
    </section>
  );
}
