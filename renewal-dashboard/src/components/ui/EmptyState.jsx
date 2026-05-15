/**
 * EmptyState — shown on every page when a list has no items.
 *
 * Props:
 *   icon        — React node (SVG element or react-icons icon)
 *   title       — short heading text
 *   description — supporting body text
 *   action      — optional { label: string, onClick: function }
 */
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && (
        <div
          className="mb-4 flex items-center justify-center w-16 h-16 rounded-full"
          style={{ backgroundColor: 'var(--color-accent-light)', color: 'var(--color-accent)' }}
          aria-hidden="true"
        >
          <span className="text-3xl leading-none">{icon}</span>
        </div>
      )}

      <h3
        className="text-lg font-semibold mb-1"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {title}
      </h3>

      {description && (
        <p
          className="text-sm max-w-sm mb-6"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {description}
        </p>
      )}

      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{
            backgroundColor: 'var(--color-accent)',
            '--tw-ring-color': 'var(--color-accent)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-accent-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-accent)';
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
