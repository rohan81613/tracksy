import { useRenewal } from '../../context/RenewalContext';
import KpiCard from '../ui/KpiCard';
import { formatCurrency } from '../../utils/renewalUtils';

/**
 * StatsCards — 5 KPI cards for the dashboard
 *
 * Reads `stats` and `isLoading` from RenewalContext.
 * Uses `setCurrentPage` + `setStatusFilter` for navigation on clickable cards.
 */
export default function StatsCards() {
  const { stats, isLoading, setCurrentPage, setStatusFilter } = useRenewal();

  const totalActive    = stats?.totalActive    ?? stats?.total    ?? 0;
  const dueIn7Days     = stats?.dueIn7Days     ?? 0;
  const overdue        = stats?.overdue        ?? 0;
  const monthlySpend   = stats?.monthlySpend   ?? 0;
  const annualProjected = stats?.annualProjected ?? monthlySpend * 12;

  const handleOverdueClick = () => {
    setStatusFilter('overdue');
    setCurrentPage('renewals');
  };

  const handleDueSoonClick = () => {
    setStatusFilter('due-soon');
    setCurrentPage('renewals');
  };

  return (
    <div
      className="flex flex-row gap-4 overflow-x-auto pb-1 md:grid md:grid-cols-5 md:overflow-visible"
      aria-label="Dashboard KPI cards"
    >
      {/* 1. Total Active Renewals */}
      <div className="min-w-[180px] flex-shrink-0 md:min-w-0">
        <KpiCard
          label="Total Active Renewals"
          value={totalActive}
          isLoading={isLoading}
        />
      </div>

      {/* 2. Due in 7 Days */}
      <div className="min-w-[180px] flex-shrink-0 md:min-w-0">
        <KpiCard
          label="Due in 7 Days"
          value={dueIn7Days}
          isLoading={isLoading}
          accentColor={dueIn7Days > 0 ? 'var(--color-status-due-soon)' : undefined}
          onClick={dueIn7Days > 0 ? handleDueSoonClick : undefined}
        />
      </div>

      {/* 3. Overdue */}
      <div className="min-w-[180px] flex-shrink-0 md:min-w-0">
        <KpiCard
          label="Overdue"
          value={overdue}
          isLoading={isLoading}
          accentColor={overdue > 0 ? 'var(--color-status-overdue)' : undefined}
          onClick={overdue > 0 ? handleOverdueClick : undefined}
        />
      </div>

      {/* 4. Monthly Recurring Spend */}
      <div className="min-w-[180px] flex-shrink-0 md:min-w-0">
        <KpiCard
          label="Monthly Recurring Spend"
          value={formatCurrency(monthlySpend)}
          isLoading={isLoading}
        />
      </div>

      {/* 5. Annual Projected Spend */}
      <div className="min-w-[180px] flex-shrink-0 md:min-w-0">
        <KpiCard
          label="Annual Projected Spend"
          value={formatCurrency(annualProjected)}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
