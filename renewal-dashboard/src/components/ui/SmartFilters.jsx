import { useState } from 'react';
import {
  HiFilter,
  HiChevronDown,
  HiChevronUp,
  HiX,
} from 'react-icons/hi';

/**
 * Default empty filter state — used for reset and counting active filters.
 */
export const DEFAULT_FILTERS = {
  category: '',
  owner: '',
  provider: '',
  dateFrom: '',
  dateTo: '',
  autoRenew: null,
  costMin: '',
  costMax: '',
};

/**
 * Count how many filters are currently active (non-empty / non-null).
 */
function countActiveFilters(filters) {
  return Object.entries(filters).reduce((count, [, value]) => {
    if (value === null || value === '' || value === undefined) return count;
    return count + 1;
  }, 0);
}

/**
 * SmartFilters — collapsible filter panel for the Renewals list.
 *
 * Props:
 *   filters   — object matching DEFAULT_FILTERS shape
 *   onChange  — (updatedFilters: object) => void
 *   categories — string[]
 *   owners    — { id: string|number, name: string }[]
 */
export function SmartFilters({ filters = DEFAULT_FILTERS, onChange, categories = [], owners = [] }) {
  const [isOpen, setIsOpen] = useState(false);

  const activeCount = countActiveFilters(filters);

  /** Update a single filter key. */
  function handleChange(key, value) {
    onChange({ ...filters, [key]: value });
  }

  /** Reset all filters to defaults. */
  function handleClearAll() {
    onChange({ ...DEFAULT_FILTERS });
  }

  // ─── shared input / select class helpers ────────────────────────────────────
  const inputCls =
    'w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] ' +
    'bg-[var(--color-surface-2)] text-[var(--color-text-primary)] ' +
    'placeholder:text-[var(--color-text-muted)] ' +
    'transition-colors duration-150 ' +
    'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent ' +
    'hover:border-[var(--color-text-muted)]';

  const labelCls = 'block text-xs font-medium text-[var(--color-text-secondary)] mb-1';

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-1)] shadow-[var(--shadow-sm)]">
      {/* ── Toggle bar ─────────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className={
          'w-full flex items-center justify-between px-4 py-3 ' +
          'text-sm font-medium text-[var(--color-text-primary)] ' +
          'hover:bg-[var(--color-surface-2)] transition-colors duration-150 ' +
          'rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]' +
          (isOpen ? ' rounded-b-none' : '')
        }
        aria-expanded={isOpen}
        aria-controls="smart-filters-panel"
      >
        <span className="flex items-center gap-2">
          <HiFilter className="text-[var(--color-text-secondary)]" size={16} />
          <span>Filters</span>
          {activeCount > 0 && (
            <span
              className={
                'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 ' +
                'rounded-full text-xs font-semibold ' +
                'bg-[var(--color-accent)] text-white'
              }
              aria-label={`${activeCount} active filter${activeCount !== 1 ? 's' : ''}`}
            >
              {activeCount}
            </span>
          )}
        </span>

        <span className="flex items-center gap-2">
          {activeCount > 0 && (
            <span
              role="button"
              tabIndex={0}
              onClick={e => { e.stopPropagation(); handleClearAll(); }}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); handleClearAll(); } }}
              className={
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs ' +
                'text-[var(--color-text-secondary)] hover:text-[var(--color-status-overdue)] ' +
                'hover:bg-red-50 dark:hover:bg-red-950 transition-colors cursor-pointer'
              }
            >
              <HiX size={11} />
              Clear all
            </span>
          )}
          {isOpen
            ? <HiChevronUp size={16} className="text-[var(--color-text-secondary)]" />
            : <HiChevronDown size={16} className="text-[var(--color-text-secondary)]" />
          }
        </span>
      </button>

      {/* ── Filter fields ───────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          id="smart-filters-panel"
          className={
            'px-4 pb-4 pt-3 border-t border-[var(--color-border)] ' +
            'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
          }
        >
          {/* Category */}
          <div>
            <label htmlFor="sf-category" className={labelCls}>Category</label>
            <select
              id="sf-category"
              value={filters.category}
              onChange={e => handleChange('category', e.target.value)}
              className={inputCls}
            >
              <option value="">All categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Owner */}
          <div>
            <label htmlFor="sf-owner" className={labelCls}>Owner</label>
            <select
              id="sf-owner"
              value={filters.owner}
              onChange={e => handleChange('owner', e.target.value)}
              className={inputCls}
            >
              <option value="">All owners</option>
              {owners.map(o => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </div>

          {/* Provider */}
          <div>
            <label htmlFor="sf-provider" className={labelCls}>Provider / Vendor</label>
            <input
              id="sf-provider"
              type="text"
              value={filters.provider}
              onChange={e => handleChange('provider', e.target.value)}
              placeholder="e.g. AWS, Stripe…"
              className={inputCls}
            />
          </div>

          {/* Date Range */}
          <div>
            <span className={labelCls}>Date Range</span>
            <div className="flex items-center gap-2">
              <input
                id="sf-date-from"
                type="date"
                value={filters.dateFrom}
                onChange={e => handleChange('dateFrom', e.target.value)}
                aria-label="Date from"
                className={inputCls}
              />
              <span className="text-[var(--color-text-muted)] text-xs shrink-0">to</span>
              <input
                id="sf-date-to"
                type="date"
                value={filters.dateTo}
                onChange={e => handleChange('dateTo', e.target.value)}
                aria-label="Date to"
                className={inputCls}
              />
            </div>
          </div>

          {/* Auto-Renew */}
          <div>
            <span className={labelCls}>Auto-Renew</span>
            <div className="flex items-center gap-3 mt-1.5">
              {/* Three-state toggle: null = any, true = on, false = off */}
              {[
                { label: 'Any', value: null },
                { label: 'On', value: true },
                { label: 'Off', value: false },
              ].map(opt => (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => handleChange('autoRenew', opt.value)}
                  className={
                    'flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors duration-150 ' +
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ' +
                    (filters.autoRenew === opt.value
                      ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
                      : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-text-muted)]')
                  }
                  aria-pressed={filters.autoRenew === opt.value}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cost Range */}
          <div>
            <span className={labelCls}>Cost Range</span>
            <div className="flex items-center gap-2">
              <input
                id="sf-cost-min"
                type="number"
                min="0"
                value={filters.costMin}
                onChange={e => handleChange('costMin', e.target.value)}
                placeholder="Min"
                aria-label="Minimum cost"
                className={inputCls}
              />
              <span className="text-[var(--color-text-muted)] text-xs shrink-0">–</span>
              <input
                id="sf-cost-max"
                type="number"
                min="0"
                value={filters.costMax}
                onChange={e => handleChange('costMax', e.target.value)}
                placeholder="Max"
                aria-label="Maximum cost"
                className={inputCls}
              />
            </div>
          </div>

          {/* Clear all — bottom row shortcut (only shown when filters are active) */}
          {activeCount > 0 && (
            <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4 flex justify-end pt-1">
              <button
                type="button"
                onClick={handleClearAll}
                className={
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ' +
                  'border border-[var(--color-border)] text-[var(--color-text-secondary)] ' +
                  'bg-[var(--color-surface-2)] hover:text-[var(--color-status-overdue)] ' +
                  'hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-950 ' +
                  'transition-colors duration-150 ' +
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]'
                }
              >
                <HiX size={12} />
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SmartFilters;
