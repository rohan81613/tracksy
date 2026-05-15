/**
 * BulkActionBar — sticky bar that appears when one or more table rows are selected.
 *
 * Props:
 *   selectedCount      {number}    — number of currently selected rows
 *   onArchive          {function}  — called when "Archive" is clicked
 *   onChangeOwner      {function}  — called when "Change Owner" is clicked
 *   onChangeReminder   {function}  — called when "Change Reminder Rule" is clicked
 *   onExportCsv        {function}  — called when "Export CSV" is clicked
 *   onDeselectAll      {function}  — called when "Deselect all" is clicked
 *
 * Requirements: 4.6
 */
export function BulkActionBar({
  selectedCount = 0,
  onArchive,
  onChangeOwner,
  onChangeReminder,
  onExportCsv,
  onDeselectAll,
}) {
  // Only render when at least one row is selected
  if (selectedCount === 0) return null;

  return (
    <div
      role="toolbar"
      aria-label={`Bulk actions for ${selectedCount} selected item${selectedCount !== 1 ? 's' : ''}`}
      className={[
        // Positioning — sticky bar at the bottom of the table area
        'sticky bottom-4 z-30 mx-4',
        // Layout
        'flex items-center gap-3 flex-wrap',
        // Elevated surface to stand out from the table
        'rounded-xl px-4 py-3',
        'bg-[var(--color-surface-1)] border border-[var(--color-border)]',
        'shadow-lg',
        // Smooth entrance
        'animate-in fade-in slide-in-from-bottom-2 duration-200',
      ].join(' ')}
    >
      {/* Selection count */}
      <span className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)] shrink-0">
        {/* Checkmark circle icon */}
        <span
          aria-hidden="true"
          className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--color-accent)] text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="w-3 h-3"
          >
            <path
              fillRule="evenodd"
              d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
              clipRule="evenodd"
            />
          </svg>
        </span>
        {selectedCount} selected
      </span>

      {/* Divider */}
      <span aria-hidden="true" className="w-px h-5 bg-[var(--color-border)] shrink-0" />

      {/* Action buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Archive */}
        <button
          type="button"
          onClick={onArchive}
          className={[
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium',
            'border border-[var(--color-border)] bg-[var(--color-surface-2)]',
            'text-[var(--color-text-secondary)]',
            'hover:border-[var(--color-status-overdue)] hover:text-[var(--color-status-overdue)] hover:bg-red-50',
            'dark:hover:bg-red-950/30',
            'transition-colors duration-150',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1',
          ].join(' ')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="w-3.5 h-3.5"
            aria-hidden="true"
          >
            <path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h9A1.5 1.5 0 0 1 14 3.5v.5H2v-.5Z" />
            <path
              fillRule="evenodd"
              d="M2 5.5h12v7a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 12.5v-7Zm4.5 2a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3Z"
              clipRule="evenodd"
            />
          </svg>
          Archive
        </button>

        {/* Change Owner */}
        <button
          type="button"
          onClick={onChangeOwner}
          className={[
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium',
            'border border-[var(--color-border)] bg-[var(--color-surface-2)]',
            'text-[var(--color-text-secondary)]',
            'hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-light)]',
            'transition-colors duration-150',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1',
          ].join(' ')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="w-3.5 h-3.5"
            aria-hidden="true"
          >
            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
          </svg>
          Change Owner
        </button>

        {/* Change Reminder Rule */}
        <button
          type="button"
          onClick={onChangeReminder}
          className={[
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium',
            'border border-[var(--color-border)] bg-[var(--color-surface-2)]',
            'text-[var(--color-text-secondary)]',
            'hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-light)]',
            'transition-colors duration-150',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1',
          ].join(' ')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="w-3.5 h-3.5"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8 1.5A3.5 3.5 0 0 0 4.5 5v2.947c0 .346-.102.683-.294.97l-1.703 2.556a.75.75 0 0 0 .624 1.152h1.373A3.001 3.001 0 0 0 11 12.625h1.373a.75.75 0 0 0 .624-1.152l-1.703-2.556a1.75 1.75 0 0 1-.294-.97V5A3.5 3.5 0 0 0 8 1.5ZM6.5 12.625a1.5 1.5 0 0 0 3 0h-3Z"
              clipRule="evenodd"
            />
          </svg>
          Change Reminder Rule
        </button>

        {/* Export CSV */}
        <button
          type="button"
          onClick={onExportCsv}
          className={[
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium',
            'border border-[var(--color-border)] bg-[var(--color-surface-2)]',
            'text-[var(--color-text-secondary)]',
            'hover:border-[var(--color-status-active)] hover:text-[var(--color-status-active)] hover:bg-green-50',
            'dark:hover:bg-green-950/30',
            'transition-colors duration-150',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1',
          ].join(' ')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="w-3.5 h-3.5"
            aria-hidden="true"
          >
            <path d="M8.75 2.75a.75.75 0 0 0-1.5 0v5.69L5.03 6.22a.75.75 0 0 0-1.06 1.06l3.5 3.5a.75.75 0 0 0 1.06 0l3.5-3.5a.75.75 0 0 0-1.06-1.06L8.75 8.44V2.75Z" />
            <path d="M3.5 9.75a.75.75 0 0 0-1.5 0v1.5A2.75 2.75 0 0 0 4.75 14h6.5A2.75 2.75 0 0 0 14 11.25v-1.5a.75.75 0 0 0-1.5 0v1.5c0 .69-.56 1.25-1.25 1.25h-6.5c-.69 0-1.25-.56-1.25-1.25v-1.5Z" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Spacer pushes deselect to the right */}
      <span className="flex-1" aria-hidden="true" />

      {/* Deselect all */}
      <button
        type="button"
        onClick={onDeselectAll}
        aria-label="Deselect all selected items"
        className={[
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium',
          'text-[var(--color-text-muted)]',
          'hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)]',
          'transition-colors duration-150',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1',
        ].join(' ')}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="w-3.5 h-3.5"
          aria-hidden="true"
        >
          <path d="M2.22 2.22a.75.75 0 0 1 1.06 0L8 6.94l4.72-4.72a.75.75 0 1 1 1.06 1.06L9.06 8l4.72 4.72a.75.75 0 1 1-1.06 1.06L8 9.06l-4.72 4.72a.75.75 0 0 1-1.06-1.06L6.94 8 2.22 3.28a.75.75 0 0 1 0-1.06Z" />
        </svg>
        Deselect all
      </button>
    </div>
  );
}

export default BulkActionBar;
