import { SkeletonLine } from './Skeleton';

/**
 * KpiCard — number-first dashboard stat card
 *
 * Props:
 *   label       {string}  — metric label shown below the value (e.g. "Total Active Renewals")
 *   value       {string|number} — primary display value
 *   trend       {'up'|'down'|'neutral'} — direction of trend vs previous period
 *   trendValue  {string|number} — percentage or absolute change (e.g. "12%" or 12)
 *   accentColor {string}  — optional CSS color for the value text (e.g. var(--color-status-overdue))
 *   onClick     {function} — if provided, card becomes clickable
 *   isLoading   {boolean} — show skeleton placeholders when true
 */
export default function KpiCard({
  label,
  value,
  trend,
  trendValue,
  accentColor,
  onClick,
  isLoading = false,
}) {
  const isClickable = typeof onClick === 'function';

  // Trend config
  const trendConfig = {
    up: {
      icon: (
        <svg
          aria-hidden="true"
          className="w-3.5 h-3.5"
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M8 3.293l5.354 5.353a1 1 0 01-1.415 1.415L9 7.121V13a1 1 0 11-2 0V7.121L4.06 10.06a1 1 0 01-1.414-1.414L8 3.293z"
            clipRule="evenodd"
          />
        </svg>
      ),
      colorClass: 'text-green-600 dark:text-green-400',
      label: 'up',
    },
    down: {
      icon: (
        <svg
          aria-hidden="true"
          className="w-3.5 h-3.5"
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M8 12.707L2.646 7.354a1 1 0 011.415-1.415L7 8.879V3a1 1 0 112 0v5.879l2.94-2.94a1 1 0 011.414 1.414L8 12.707z"
            clipRule="evenodd"
          />
        </svg>
      ),
      colorClass: 'text-red-600 dark:text-red-400',
      label: 'down',
    },
    neutral: {
      icon: (
        <svg
          aria-hidden="true"
          className="w-3.5 h-3.5"
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M2 8a1 1 0 011-1h10a1 1 0 110 2H3a1 1 0 01-1-1z"
            clipRule="evenodd"
          />
        </svg>
      ),
      colorClass: 'text-[var(--color-text-muted)]',
      label: 'no change',
    },
  };

  const resolvedTrend = trend && trendConfig[trend] ? trend : 'neutral';
  const { icon: trendIcon, colorClass: trendColorClass, label: trendAriaLabel } =
    trendConfig[resolvedTrend];

  const hasTrend = trendValue !== undefined && trendValue !== null;

  return (
    <div
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={isClickable ? onClick : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick(e);
              }
            }
          : undefined
      }
      className={[
        // Base surface
        'rounded-xl border p-5 flex flex-col gap-3 transition-all duration-150',
        'bg-[var(--color-surface-1)] border-[var(--color-border)]',
        'shadow-[var(--shadow-sm)]',
        // Clickable states
        isClickable
          ? 'cursor-pointer hover:shadow-[var(--shadow-md)] hover:border-[var(--color-accent)] focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-2'
          : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={isClickable ? label : undefined}
    >
      {isLoading ? (
        /* ── Skeleton state ── */
        <>
          <SkeletonLine className="h-3 w-28" />
          <SkeletonLine className="h-8 w-20" />
          <SkeletonLine className="h-3 w-16" />
        </>
      ) : (
        /* ── Content state ── */
        <>
          {/* Label */}
          <span
            className="text-[length:var(--text-xs)] leading-[var(--text-xs-lh)] text-[var(--color-text-secondary)] font-medium tracking-wide uppercase"
          >
            {label}
          </span>

          {/* Value */}
          <span
            className="text-[length:var(--text-2xl)] leading-[var(--text-2xl-lh)] font-bold text-[var(--color-text-primary)] tabular-nums"
            style={accentColor ? { color: accentColor } : undefined}
          >
            {value ?? '—'}
          </span>

          {/* Trend indicator */}
          {hasTrend && (
            <span
              className={`inline-flex items-center gap-1 text-[length:var(--text-xs)] leading-[var(--text-xs-lh)] font-medium ${trendColorClass}`}
              aria-label={`Trend: ${trendAriaLabel} ${trendValue}`}
            >
              {trendIcon}
              <span>
                {typeof trendValue === 'number' && !String(trendValue).includes('%')
                  ? `${trendValue}%`
                  : trendValue}
              </span>
              <span className="text-[var(--color-text-muted)] font-normal">vs last period</span>
            </span>
          )}
        </>
      )}
    </div>
  );
}
