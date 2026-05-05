export default function Badge({ status, label }) {
  const styles = {
    active: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    upcoming: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    'due-today': 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    overdue: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  };

  const dots = {
    active: 'bg-emerald-500',
    upcoming: 'bg-amber-500',
    'due-today': 'bg-blue-500',
    overdue: 'bg-red-500',
  };

  const labels = {
    active: 'Active',
    upcoming: 'Upcoming',
    'due-today': 'Due Today',
    overdue: 'Overdue',
  };

  const style = styles[status] || styles.active;
  const dot = dots[status] || dots.active;
  const text = label || labels[status] || status;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {text}
    </span>
  );
}
