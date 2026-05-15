import { useState } from 'react';
import { useRenewal } from '../context/RenewalContext';
import StatsCards from '../components/dashboard/StatsCards';
import UpcomingTimeline from '../components/dashboard/UpcomingTimeline';
import OverduePanel from '../components/dashboard/OverduePanel';
import RecentlyUpdated from '../components/dashboard/RecentlyUpdated';
import CalendarMiniPreview from '../components/dashboard/CalendarMiniPreview';
import CategorySpendChart from '../components/dashboard/CategorySpendChart';
import RenewalForm from '../components/renewals/RenewalForm';
import { HiPlus } from 'react-icons/hi';

// ─── Empty State ──────────────────────────────────────────────────────────────

function DashboardEmptyState({ onAddRenewal }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-20 px-6 rounded-2xl border"
      style={{
        backgroundColor: 'var(--color-surface-1)',
        borderColor: 'var(--color-border)',
      }}
      role="status"
      aria-label="No renewals yet"
    >
      {/* Illustration */}
      <div
        className="flex items-center justify-center w-20 h-20 rounded-full mb-6"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--color-accent) 10%, transparent)',
        }}
        aria-hidden="true"
      >
        <svg
          className="w-10 h-10"
          style={{ color: 'var(--color-accent)' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      </div>

      {/* Headline */}
      <h2
        className="text-[length:var(--text-xl)] leading-[var(--text-xl-lh)] font-bold mb-2 text-center"
        style={{ color: 'var(--color-text-primary)' }}
      >
        Start tracking your renewals
      </h2>

      {/* Subtext */}
      <p
        className="text-[length:var(--text-sm)] leading-[var(--text-sm-lh)] text-center max-w-sm mb-8"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        Keep all your subscriptions, licenses, and contracts in one place. Never miss a renewal date again.
      </p>

      {/* CTA */}
      <button
        type="button"
        onClick={onAddRenewal}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[length:var(--text-sm)] leading-[var(--text-sm-lh)] font-semibold transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{
          backgroundColor: 'var(--color-accent)',
          color: '#ffffff',
          focusVisibleOutlineColor: 'var(--color-accent)',
        }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-accent-hover)')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--color-accent)')}
        aria-label="Add your first renewal"
      >
        <HiPlus size={18} aria-hidden="true" />
        Add Your First Renewal
      </button>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

/**
 * Dashboard — redesigned 2-column grid layout.
 *
 * Desktop: main column (70%) + sidebar column (30%)
 * Mobile: single column
 *
 * Composes all dashboard widgets:
 *   - StatsCards (full width, top)
 *   - UpcomingTimeline (main column)
 *   - OverduePanel (main column)
 *   - RecentlyUpdated (main column)
 *   - CalendarMiniPreview (sidebar column)
 *   - CategorySpendChart (sidebar column)
 *
 * Shows a meaningful empty state when no renewals exist and not loading.
 *
 * Requirements: 3.8, 3.9, 3.10
 */
export default function Dashboard() {
  const { renewals, isLoading } = useRenewal();
  const [showForm, setShowForm] = useState(false);

  const isEmpty = !isLoading && renewals.length === 0;

  return (
    <div className="flex flex-col gap-6">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1
            className="text-[length:var(--text-2xl)] leading-[var(--text-2xl-lh)] font-bold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Dashboard
          </h1>
          <p
            className="text-[length:var(--text-sm)] leading-[var(--text-sm-lh)] mt-0.5"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Your renewal overview at a glance
          </p>
        </div>

        {/* "+ Add Renewal" — always visible, top-right */}
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[length:var(--text-sm)] leading-[var(--text-sm-lh)] font-semibold transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 shrink-0"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: '#ffffff',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-accent-hover)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--color-accent)')}
          aria-label="Add a new renewal"
        >
          <HiPlus size={18} aria-hidden="true" />
          <span>Add Renewal</span>
        </button>
      </div>

      {/* ── KPI Stats Row (full width) ────────────────────────────────────── */}
      <StatsCards />

      {/* ── Empty state ───────────────────────────────────────────────────── */}
      {isEmpty ? (
        <DashboardEmptyState onAddRenewal={() => setShowForm(true)} />
      ) : (
        /* ── 2-column grid layout ─────────────────────────────────────────── */
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,420px)] gap-6 items-start">

          {/* ── Main column (70%) ─────────────────────────────────────────── */}
          <div className="flex flex-col gap-6 min-w-0">

            {/* Upcoming Renewals Timeline */}
            <section
              className="rounded-2xl border p-5"
              style={{
                backgroundColor: 'var(--color-surface-1)',
                borderColor: 'var(--color-border)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <UpcomingTimeline />
            </section>

            {/* Overdue Panel */}
            <section
              className="rounded-2xl border p-5"
              style={{
                backgroundColor: 'var(--color-surface-1)',
                borderColor: 'var(--color-border)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <OverduePanel />
            </section>

            {/* Recently Updated */}
            <section
              className="rounded-2xl border p-5"
              style={{
                backgroundColor: 'var(--color-surface-1)',
                borderColor: 'var(--color-border)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <RecentlyUpdated />
            </section>
          </div>

          {/* ── Sidebar column (30%) ──────────────────────────────────────── */}
          <div className="flex flex-col gap-6 min-w-0">

            {/* Calendar Mini Preview */}
            <CalendarMiniPreview />

            {/* Category Spend Chart */}
            <section
              className="rounded-2xl border p-5"
              style={{
                backgroundColor: 'var(--color-surface-1)',
                borderColor: 'var(--color-border)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <CategorySpendChart />
            </section>
          </div>
        </div>
      )}

      {/* ── Renewal Form Modal ────────────────────────────────────────────── */}
      <RenewalForm isOpen={showForm} onClose={() => setShowForm(false)} />
    </div>
  );
}
