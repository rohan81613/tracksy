import { useState, useMemo } from 'react';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, parseISO, addMonths, subMonths, isToday
} from 'date-fns';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { getStatusFull, getUpcomingRenewalDate } from '../../utils/renewalUtils';
import Badge from '../ui/Badge';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import { formatCurrency } from '../../utils/renewalUtils';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function RenewalDot({ status }) {
  const colors = {
    overdue: 'bg-red-500',
    'due-today': 'bg-blue-500',
    upcoming: 'bg-amber-400',
    active: 'bg-emerald-400',
  };
  return <span className={`inline-block w-1.5 h-1.5 rounded-full ${colors[status] || colors.active}`} />;
}

export default function CalendarView({ renewals }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Map renewals by their upcoming renewal date (purchase-date-aware)
  const renewalsByDate = useMemo(() => {
    const map = {};
    renewals.forEach(r => {
      const upcomingDate = getUpcomingRenewalDate(r.purchaseDate, r.renewalDate, r.billingCycle);
      const key = format(upcomingDate, 'yyyy-MM-dd');
      if (!map[key]) map[key] = [];
      map[key].push({ ...r, _upcomingDate: upcomingDate });
    });
    return map;
  }, [renewals]);

  const selectedRenewals = useMemo(() => {
    if (!selectedDay) return [];
    const key = format(selectedDay, 'yyyy-MM-dd');
    return renewalsByDate[key] || [];
  }, [selectedDay, renewalsByDate]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentDate(d => subMonths(d, 1))}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <HiChevronLeft size={18} />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentDate(d => addMonths(d, 1))}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <HiChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        {[
          { status: 'upcoming', label: 'Upcoming' },
          { status: 'due-today', label: 'Due Today' },
          { status: 'overdue', label: 'Overdue' },
          { status: 'active', label: 'Active' },
        ].map(({ status, label }) => (
          <span key={status} className="flex items-center gap-1.5">
            <RenewalDot status={status} />
            {label}
          </span>
        ))}
      </div>

      {/* Calendar Grid */}
      <Card className="overflow-hidden">
        {/* Day names */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {DAY_NAMES.map(d => (
            <div key={d} className="py-2.5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">
              {d}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            const key = format(day, 'yyyy-MM-dd');
            const dayRenewals = renewalsByDate[key] || [];
            const inMonth = isSameMonth(day, currentDate);
            const today = isToday(day);
            const isSelected = selectedDay && isSameDay(day, selectedDay);

            return (
              <div
                key={idx}
                onClick={() => dayRenewals.length > 0 && setSelectedDay(day)}
                className={`min-h-[72px] p-1.5 border-b border-r border-gray-50 transition-colors ${
                  !inMonth ? 'bg-gray-50/50' : ''
                } ${dayRenewals.length > 0 ? 'cursor-pointer hover:bg-blue-50/30' : ''} ${
                  isSelected ? 'bg-blue-50' : ''
                }`}
              >
                <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium mb-1 ${
                  today
                    ? 'bg-blue-600 text-white'
                    : inMonth
                    ? 'text-gray-700'
                    : 'text-gray-300'
                }`}>
                  {format(day, 'd')}
                </div>

                <div className="space-y-0.5">
                  {dayRenewals.slice(0, 2).map(r => {
                    const status = getStatusFull(r);
                    return (
                      <div
                        key={r.id}
                        className={`flex items-center gap-1 px-1 py-0.5 rounded text-[10px] font-medium truncate ${
                          status === 'overdue' ? 'bg-red-50 text-red-700' :
                          status === 'due-today' ? 'bg-blue-50 text-blue-700' :
                          status === 'upcoming' ? 'bg-amber-50 text-amber-700' :
                          'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        <RenewalDot status={status} />
                        <span className="truncate">{r.name}</span>
                      </div>
                    );
                  })}
                  {dayRenewals.length > 2 && (
                    <p className="text-[10px] text-gray-400 px-1">+{dayRenewals.length - 2} more</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Day detail modal */}
      <Modal
        isOpen={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        title={selectedDay ? format(selectedDay, 'MMMM d, yyyy') : ''}
        size="sm"
      >
        <div className="space-y-3">
          {selectedRenewals.map(r => {
            const status = getStatusFull(r);
            return (
              <div key={r.id} className="flex items-start justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{r.name}</p>
                  <p className="text-xs text-gray-500">{r.vendor}</p>
                  <p className="text-xs text-gray-400 capitalize mt-0.5">{r.billingCycle}</p>
                  {r.purchaseDate && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Purchased: {format(parseISO(r.purchaseDate), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(r.amount)}</p>
                  <Badge status={status} />
                </div>
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}
