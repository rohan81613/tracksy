import { SkeletonCard } from '../ui/Skeleton';
import { formatCurrency } from '../../utils/renewalUtils';
import { HiRefresh, HiClock, HiExclamation, HiCurrencyDollar } from 'react-icons/hi';

function StatCard({ title, value, subtitle, icon: Icon, color, isLoading, active, onClick }) {
  if (isLoading) return <SkeletonCard />;

  const colors = {
    blue:    { bg: 'bg-blue-50',    icon: 'text-blue-600',    val: 'text-blue-700',    ring: 'ring-blue-400',    activeBg: 'bg-blue-600',    activeIcon: 'bg-blue-500'  },
    amber:   { bg: 'bg-amber-50',   icon: 'text-amber-600',   val: 'text-amber-700',   ring: 'ring-amber-400',   activeBg: 'bg-amber-500',   activeIcon: 'bg-amber-400' },
    red:     { bg: 'bg-red-50',     icon: 'text-red-600',     val: 'text-red-700',     ring: 'ring-red-400',     activeBg: 'bg-red-600',     activeIcon: 'bg-red-500'   },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', val: 'text-emerald-700', ring: 'ring-emerald-400', activeBg: 'bg-emerald-600', activeIcon: 'bg-emerald-500' },
  };
  const c = colors[color] || colors.blue;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border transition-all duration-150 p-5 focus:outline-none focus:ring-2 focus:ring-offset-1 ${c.ring} ${
        active
          ? `${c.activeBg} shadow-md scale-[1.02] border-transparent`
          : 'bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 hover:scale-[1.01]'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`text-xs font-semibold uppercase tracking-wide ${active ? 'text-white/70' : 'text-gray-400'}`}>
            {title}
          </p>
          <p className={`text-2xl font-bold mt-1.5 ${active ? 'text-white' : c.val}`}>
            {value}
          </p>
          {subtitle && (
            <p className={`text-xs mt-1 ${active ? 'text-white/60' : 'text-gray-400'}`}>
              {subtitle}
            </p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${active ? c.activeIcon : c.bg}`}>
          <Icon className={active ? 'text-white' : c.icon} size={20} />
        </div>
      </div>

      {/* Active indicator */}
      {active && (
        <div className="mt-3 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
          <span className="text-[11px] text-white/80 font-medium">Filtered below</span>
        </div>
      )}
    </button>
  );
}

export default function StatsCards({ stats, isLoading, activeCard, onCardClick }) {
  const s = stats ?? { total: 0, upcoming: 0, overdue: 0, monthlySpend: 0 };
  const cards = [
    {
      key: 'all',
      title: 'Total Renewals',
      value: s.total,
      subtitle: 'All tracked subscriptions',
      icon: HiRefresh,
      color: 'blue',
    },
    {
      key: 'upcoming',
      title: 'Upcoming (30d)',
      value: s.upcoming,
      subtitle: 'Renewing soon',
      icon: HiClock,
      color: 'amber',
    },
    {
      key: 'overdue',
      title: 'Overdue',
      value: s.overdue,
      subtitle: 'Needs attention',
      icon: HiExclamation,
      color: 'red',
    },
    {
      key: 'spend',
      title: 'Monthly Spend',
      value: formatCurrency(s.monthlySpend),
      subtitle: 'Estimated per month',
      icon: HiCurrencyDollar,
      color: 'emerald',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(card => (
        <StatCard
          key={card.key}
          {...card}
          isLoading={isLoading || !stats}
          active={activeCard === card.key}
          onClick={() => onCardClick(card.key)}
        />
      ))}
    </div>
  );
}
