import { useState, useMemo } from 'react';
import { useRenewal } from '../context/RenewalContext';
import StatsCards from '../components/dashboard/StatsCards';
import RenewalsTable from '../components/renewals/RenewalsTable';
import RenewalForm from '../components/renewals/RenewalForm';
import ImportModal from '../components/import/ImportModal';
import Button from '../components/ui/Button';
import { HiPlus, HiSearch, HiDownload } from 'react-icons/hi';
import { getStatus, getDaysUntil } from '../utils/renewalUtils';

export default function Dashboard() {
  const { renewals, stats, isLoading, searchQuery, setSearchQuery, statusFilter, setStatusFilter } = useRenewal();
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [activeCard, setActiveCard] = useState('all');

  const handleCardClick = (cardKey) => {
    setActiveCard(cardKey);
    setSearchQuery('');
    
    if (cardKey === 'all') {
      setStatusFilter('all');
    } else if (cardKey === 'upcoming') {
      setStatusFilter('upcoming');
    } else if (cardKey === 'overdue') {
      setStatusFilter('overdue');
    } else if (cardKey === 'spend') {
      // For spend, show all to see the breakdown
      setStatusFilter('all');
    }
  };

  const filtered = useMemo(() => {
    return renewals.filter(r => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || r.name.toLowerCase().includes(q) || r.vendor.toLowerCase().includes(q);
      const status = getStatus(r.renewalDate, r.purchaseDate);
      const matchStatus = statusFilter === 'all' || status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [renewals, searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      <StatsCards stats={stats} isLoading={isLoading} activeCard={activeCard} onCardClick={handleCardClick} />

      {/* Table section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-gray-700">Recent Renewals</h2>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input
                type="text"
                placeholder="Search renewals..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48"
              />
            </div>
            {/* Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-gray-200 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="due-today">Due Today</option>
              <option value="overdue">Overdue</option>
            </select>
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

        <RenewalsTable renewals={filtered} isLoading={isLoading} />

        {!isLoading && filtered.length > 0 && (
          <p className="text-xs text-gray-400 text-right">
            Showing {filtered.length} of {renewals.length} renewals
          </p>
        )}
      </div>

      <RenewalForm isOpen={showForm} onClose={() => setShowForm(false)} />
      <ImportModal isOpen={showImport} onClose={() => setShowImport(false)} />
    </div>
  );
}
