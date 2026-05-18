import { useState, useMemo } from 'react';
import { useRenewal } from '../context/RenewalContext';
import RenewalsTable from '../components/renewals/RenewalsTable';
import RenewalForm from '../components/renewals/RenewalForm';
import ImportModal from '../components/import/ImportModal';
import Button from '../components/ui/Button';
import { HiPlus, HiSearch, HiDownload } from 'react-icons/hi';
import { getStatusFull } from '../utils/renewalUtils';

export default function Renewals() {
  const { renewals, isLoading, searchQuery, setSearchQuery, statusFilter, setStatusFilter } = useRenewal();
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const filtered = useMemo(() => {
    return renewals.filter(r => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || r.name.toLowerCase().includes(q) || r.vendor.toLowerCase().includes(q) || (r.category || '').toLowerCase().includes(q);
      const status = getStatusFull(r);
      const matchStatus = statusFilter === 'all' || status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [renewals, searchQuery, statusFilter]);

  const counts = useMemo(() => {
    const c = { all: renewals.length, active: 0, upcoming: 0, 'due-today': 0, overdue: 0 };
    renewals.forEach(r => {
      const s = getStatusFull(r);
      c[s] = (c[s] || 0) + 1;
    });
    return c;
  }, [renewals]);

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'due-today', label: 'Due Today' },
    { key: 'overdue', label: 'Overdue' },
    { key: 'active', label: 'Active' },
  ];

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
          <input
            type="text"
            placeholder="Search by name, vendor, category..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-72"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => setShowImport(true)}
            icon={<HiDownload size={16} />}
          >
            Import
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowForm(true)}
            icon={<HiPlus size={16} />}
          >
            Add
          </Button>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-1 border-b border-gray-100 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              statusFilter === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              statusFilter === tab.key ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {counts[tab.key] || 0}
            </span>
          </button>
        ))}
      </div>

      <RenewalsTable renewals={filtered} isLoading={isLoading} />

      {!isLoading && (
        <p className="text-xs text-gray-400">
          {filtered.length} renewal{filtered.length !== 1 ? 's' : ''} {statusFilter !== 'all' ? `· ${statusFilter}` : ''}
        </p>
      )}

      <RenewalForm isOpen={showForm} onClose={() => setShowForm(false)} />
      <ImportModal isOpen={showImport} onClose={() => setShowImport(false)} />
    </div>
  );
}
