import { format, parseISO } from 'date-fns';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import { getStatusFull, getDaysUntilUpcoming, formatCurrency, getUpcomingRenewalDate } from '../../utils/renewalUtils';
import {
  HiOfficeBuilding, HiCurrencyDollar, HiCalendar, HiBell,
  HiTag, HiDocumentText, HiRefresh,
} from 'react-icons/hi';

function InfoRow({ icon: Icon, label, value, valueClass = '' }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="text-gray-400" size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 mb-0.5">{label}</p>
        <p className={`text-sm font-medium text-gray-800 ${valueClass}`}>{value}</p>
      </div>
    </div>
  );
}

export default function ViewRenewal({ isOpen, onClose, renewal, onEdit }) {
  if (!renewal) return null;

  const status = getStatusFull(renewal);
  const days = getDaysUntilUpcoming(renewal.purchaseDate, renewal.renewalDate, renewal.billingCycle);
  const upcomingDate = getUpcomingRenewalDate(renewal.purchaseDate, renewal.renewalDate, renewal.billingCycle);

  // Reminder alert = upcoming renewal date minus reminder days
  const reminderDate = new Date(upcomingDate.getTime() - renewal.reminderDays * 86400000);

  const daysLabel =
    days < 0
      ? `${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} overdue`
      : days === 0
      ? 'Due today'
      : `In ${days} day${days !== 1 ? 's' : ''}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Renewal Details" size="md">
      {/* Header block */}
      <div className="flex items-start justify-between mb-5 pb-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
            <HiRefresh className="text-blue-600" size={18} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">{renewal.name}</h3>
            <p className="text-sm text-gray-400">{renewal.vendor}</p>
          </div>
        </div>
        <Badge status={status} />
      </div>

      {/* Days pill */}
      <div className={`mb-5 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 ${
        days < 0
          ? 'bg-red-50 text-red-700 border border-red-100'
          : days === 0
          ? 'bg-blue-50 text-blue-700 border border-blue-100'
          : days <= 7
          ? 'bg-amber-50 text-amber-700 border border-amber-100'
          : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
      }`}>
        <HiCalendar size={15} />
        {daysLabel}
      </div>

      {/* Details — purchase date → upcoming renewal → reminder alert chain */}
      <div className="space-y-0">
        <InfoRow icon={HiCurrencyDollar} label="Amount" value={`${formatCurrency(renewal.amount)} / ${renewal.billingCycle}`} />
        {renewal.purchaseDate && (
          <InfoRow icon={HiCalendar} label="Purchase Date" value={format(parseISO(renewal.purchaseDate), 'MMMM d, yyyy')} />
        )}
        <InfoRow
          icon={HiRefresh}
          label="Upcoming Renewal"
          value={format(upcomingDate, 'MMMM d, yyyy')}
          valueClass="text-blue-600"
        />
        <InfoRow
          icon={HiBell}
          label="Renewal Alert"
          value={`${format(reminderDate, 'MMMM d, yyyy')} (${renewal.reminderDays}d before)`}
        />
        {renewal.category && <InfoRow icon={HiTag} label="Category" value={renewal.category} />}
        {renewal.notes && <InfoRow icon={HiDocumentText} label="Notes" value={renewal.notes} />}
      </div>

      {/* Footer actions */}
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Close
        </button>
        <button
          onClick={() => { onClose(); onEdit(renewal); }}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          Edit Renewal
        </button>
      </div>
    </Modal>
  );
}
