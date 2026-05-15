import { useState, useRef } from 'react';

const PRESET_OPTIONS = [30, 15, 7, 3, 1];

/**
 * ReminderChips — multi-select chip input for reminder offsets.
 *
 * Props:
 *   value    {number[]}  — currently selected day offsets
 *   onChange {function}  — called with the new array when selection changes
 */
export function ReminderChips({ value = [], onChange }) {
  const [customInput, setCustomInput] = useState('');
  const [customError, setCustomError] = useState('');
  const inputRef = useRef(null);

  const selected = Array.isArray(value) ? value : [];

  // Toggle a preset or custom chip
  function toggleChip(days) {
    if (selected.includes(days)) {
      onChange(selected.filter((d) => d !== days));
    } else {
      onChange([...selected, days].sort((a, b) => b - a));
    }
  }

  // Remove a chip (used by the × button)
  function removeChip(days) {
    onChange(selected.filter((d) => d !== days));
  }

  // Validate and add a custom value
  function addCustom() {
    const trimmed = customInput.trim();
    const num = parseInt(trimmed, 10);

    if (!trimmed || isNaN(num) || num <= 0 || !Number.isInteger(num)) {
      setCustomError('Enter a positive whole number.');
      return;
    }
    if (selected.includes(num)) {
      setCustomError(`${num} day${num !== 1 ? 's' : ''} is already added.`);
      return;
    }

    setCustomError('');
    setCustomInput('');
    onChange([...selected, num].sort((a, b) => b - a));
    inputRef.current?.focus();
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustom();
    }
    // Clear error on any new keystroke
    if (customError) setCustomError('');
  }

  // Custom chips are those not in the preset list
  const customChips = selected.filter((d) => !PRESET_OPTIONS.includes(d));

  return (
    <div className="flex flex-col gap-3">
      {/* Preset chips */}
      <div className="flex flex-wrap gap-2">
        {PRESET_OPTIONS.map((days) => {
          const isSelected = selected.includes(days);
          return (
            <button
              key={days}
              type="button"
              onClick={() => toggleChip(days)}
              aria-pressed={isSelected}
              className={[
                'inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium',
                'border transition-all duration-150 focus:outline-none focus-visible:ring-2',
                'focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1',
                isSelected
                  ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-white shadow-sm'
                  : 'bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]',
              ].join(' ')}
            >
              {days} {days === 1 ? 'day' : 'days'}
              {isSelected && (
                <span
                  role="button"
                  aria-label={`Remove ${days} days`}
                  tabIndex={-1}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeChip(days);
                  }}
                  className="ml-0.5 flex items-center justify-center w-4 h-4 rounded-full hover:bg-white/20 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 12 12"
                    fill="currentColor"
                    className="w-2.5 h-2.5"
                    aria-hidden="true"
                  >
                    <path d="M2.22 2.22a.75.75 0 0 1 1.06 0L6 4.94l2.72-2.72a.75.75 0 1 1 1.06 1.06L7.06 6l2.72 2.72a.75.75 0 1 1-1.06 1.06L6 7.06 3.28 9.78a.75.75 0 0 1-1.06-1.06L4.94 6 2.22 3.28a.75.75 0 0 1 0-1.06Z" />
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom chips (values not in presets) */}
      {customChips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {customChips.map((days) => (
            <span
              key={days}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-[var(--color-accent)] border border-[var(--color-accent)] text-white shadow-sm"
            >
              {days} {days === 1 ? 'day' : 'days'}
              <button
                type="button"
                aria-label={`Remove ${days} days`}
                onClick={() => removeChip(days)}
                className="ml-0.5 flex items-center justify-center w-4 h-4 rounded-full hover:bg-white/20 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 12 12"
                  fill="currentColor"
                  className="w-2.5 h-2.5"
                  aria-hidden="true"
                >
                  <path d="M2.22 2.22a.75.75 0 0 1 1.06 0L6 4.94l2.72-2.72a.75.75 0 1 1 1.06 1.06L7.06 6l2.72 2.72a.75.75 0 1 1-1.06 1.06L6 7.06 3.28 9.78a.75.75 0 0 1-1.06-1.06L4.94 6 2.22 3.28a.75.75 0 0 1 0-1.06Z" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Custom input row */}
      <div className="flex items-center gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="number"
              min="1"
              step="1"
              value={customInput}
              onChange={(e) => {
                setCustomInput(e.target.value);
                if (customError) setCustomError('');
              }}
              onKeyDown={handleKeyDown}
              placeholder="Custom days…"
              aria-label="Custom reminder days"
              className={[
                'w-32 px-3 py-1.5 text-sm rounded-lg border transition-colors duration-150',
                'bg-[var(--color-surface-2)] text-[var(--color-text-primary)]',
                'placeholder:text-[var(--color-text-muted)]',
                'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent',
                customError
                  ? 'border-[var(--color-status-overdue)]'
                  : 'border-[var(--color-border)] hover:border-[var(--color-accent)]',
              ].join(' ')}
            />
            <button
              type="button"
              onClick={addCustom}
              aria-label="Add custom reminder"
              className={[
                'flex items-center justify-center w-8 h-8 rounded-lg border transition-all duration-150',
                'bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-secondary)]',
                'hover:bg-[var(--color-accent)] hover:border-[var(--color-accent)] hover:text-white',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1',
              ].join(' ')}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="w-4 h-4"
                aria-hidden="true"
              >
                <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
              </svg>
            </button>
          </div>
          {customError && (
            <p className="text-xs text-[var(--color-status-overdue)]" role="alert">
              {customError}
            </p>
          )}
        </div>
        <span className="text-xs text-[var(--color-text-muted)] self-start mt-2">
          Press Enter or + to add
        </span>
      </div>
    </div>
  );
}

export default ReminderChips;
