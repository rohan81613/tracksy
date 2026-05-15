/**
 * StatusBadge — colored pill showing a renewal's lifecycle status.
 *
 * Uses CSS variables defined in index.css so it works in both light and dark mode.
 *
 * Props:
 *   status  {string}  One of: active | due-soon | due-today | overdue |
 *                              renewed | cancelled | archived
 */

const STATUS_CONFIG = {
  active: {
    label: 'Active',
    color: 'var(--color-status-active)',
  },
  'due-soon': {
    label: 'Due Soon',
    color: 'var(--color-status-due-soon)',
  },
  'due-today': {
    label: 'Due Today',
    color: 'var(--color-status-due-soon)', // amber — same urgency tier as due-soon
  },
  overdue: {
    label: 'Overdue',
    color: 'var(--color-status-overdue)',
  },
  renewed: {
    label: 'Renewed',
    color: 'var(--color-status-renewed)',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'var(--color-status-cancelled)',
  },
  archived: {
    label: 'Archived',
    color: 'var(--color-status-archived)',
  },
};

/** Fallback for unknown statuses */
const FALLBACK = {
  label: 'Unknown',
  color: 'var(--color-status-archived)',
};

export function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? FALLBACK;

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
        // Tinted background: the status color at ~12% opacity
        backgroundColor: `color-mix(in srgb, ${config.color} 12%, transparent)`,
        color: config.color,
        // Subtle ring using the status color at ~25% opacity
        boxShadow: `0 0 0 1px color-mix(in srgb, ${config.color} 25%, transparent)`,
        whiteSpace: 'nowrap',
      }}
      aria-label={`Status: ${config.label}`}
    >
      {/* Status dot */}
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: config.color,
          flexShrink: 0,
        }}
        aria-hidden="true"
      />
      {config.label}
    </span>
  );
}

export default StatusBadge;
