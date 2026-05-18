import { useState, useMemo, useRef, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { HiDotsVertical, HiPencil, HiTrash, HiEye, HiChevronUp, HiChevronDown, HiSelector } from 'react-icons/hi';
import Badge from '../ui/Badge';
import { SkeletonTable } from '../ui/Skeleton';
import { getStatusFull, formatCurrency, getUpcomingRenewalDate } from '../../utils/renewalUtils';
import { useRenewal } from '../../context/RenewalContext';
import RenewalForm from './RenewalForm';
import DeleteConfirm from './DeleteConfirm';
import ViewRenewal from './ViewRenewal';

function SortIcon({ column, sortConfig }) {
  if (sortConfig.key !== column) return <HiSelector className="text-gray-300" size={14} />;
  return sortConfig.direction === 'asc'
    ? <HiChevronUp className="text-blue-500" size={14} />
    : <HiChevronDown className="text-blue-500" size={14} />;
}

function ActionMenu({ renewal, onView, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const actions = [
    {
      label: 'View',
      icon: HiEye,
      onClick: () => { onView(renewal); setOpen(false); },
      className: 'text-gray-700 hover:bg-gray-50',
    },
    {
      label: 'Edit',
      icon: HiPencil,
      onClick: () => { onEdit(renewal); setOpen(false); },
      className: 'text-gray-700 hover:bg-gray-50',
    },
    {
      label: 'Delete',
      icon: HiTrash,
      onClick: () => { onDelete(renewal); setOpen(false); },
      className: 'text-red-500 hover:bg-red-50',
    },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(p => !p); }}
        className={`p-1.5 rounded-lg transition-colors ${
          open ? 'bg-gray-100 text-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
        }`}
      >
        <HiDotsVertical size={16} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden animate-slide-in">
          {actions.map(({ label, icon: Icon, onClick, className }) => (
            <button
              key={label}
              onClick={onClick}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium transition-colors ${className}`}
            >
              <Icon size={15} className="shrink-0" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RenewalsTable({ renewals, isLoading }) {
  const { sortConfig, setSortConfig, deleteRenewal, setCurrentPage, setSelectedVendorId } = useRenewal();
  const [editRenewal, setEditRenewal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewRenewal, setViewRenewal] = useState(null);

  const handleSort = (key) => {
    setSortConfig(prev =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' }
    );
  };

  const sorted = useMemo(() => {
    return [...renewals].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      if (sortConfig.key === 'renewalDate' || sortConfig.key === 'purchaseDate') {
        aVal = aVal ? new Date(aVal) : new Date(0);
        bVal = bVal ? new Date(bVal) : new Date(0);
      } else if (sortConfig.key === 'amount') {
        aVal = Number(aVal);
        bVal = Number(bVal);
      } else {
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
      }
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [renewals, sortConfig]);

  const cols = [
    { key: 'name',          label: 'Name',              sortable: true  },
    { key: 'vendor',        label: 'Vendor',            sortable: true  },
    { key: 'amount',        label: 'Amount',            sortable: true  },
    { key: 'purchaseDate',  label: 'Purchase Date',     sortable: true  },
    { key: 'nextRenewal',   label: 'Upcoming Renewal',  sortable: false },
    { key: 'status',        label: 'Status',            sortable: false },
    { key: 'actions',       label: 'Actions',           sortable: false },
  ];

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {cols.map(col => (
                <th
                  key={col.key}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap ${
                    col.sortable ? 'cursor-pointer hover:text-gray-700 select-none' : ''
                  } ${col.key === 'actions' ? 'w-10' : ''}`}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && <SortIcon column={col.key} sortConfig={sortConfig} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-50">
            {isLoading ? (
              <SkeletonTable rows={5} />
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">📋</div>
                    <p className="text-sm font-medium text-gray-500">No renewals found</p>
                    <p className="text-xs text-gray-400">Try adjusting your search or filters</p>
                  </div>
                </td>
              </tr>
            ) : (
              sorted.map(renewal => {
                const status = getStatusFull(renewal);
                const upcomingDate = getUpcomingRenewalDate(renewal.purchaseDate, renewal.renewalDate, renewal.billingCycle);

                return (
                  <tr
                    key={renewal.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    {/* Name */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          setSelectedVendorId(renewal.id);
                          setCurrentPage('vendor-profile');
                        }}
                        className="text-left hover:opacity-70 transition-opacity"
                      >
                        <p className="font-medium text-blue-600 hover:text-blue-700 cursor-pointer">{renewal.name}</p>
                        {renewal.category && (
                          <p className="text-xs text-gray-400">{renewal.category}</p>
                        )}
                      </button>
                    </td>

                    {/* Vendor */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          setSelectedVendorId(renewal.id);
                          setCurrentPage('vendor-profile');
                        }}
                        className="text-blue-600 hover:text-blue-700 font-medium transition-colors whitespace-nowrap"
                      >
                        {renewal.vendor}
                      </button>
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">${Number(renewal.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      {renewal.amountInr != null && (
                        <p className="text-xs text-orange-600 font-medium">
                          ₹{Number(renewal.amountInr).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 capitalize">{renewal.billingCycle}</p>
                    </td>

                    {/* Purchase Date */}
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {renewal.purchaseDate
                        ? format(parseISO(renewal.purchaseDate), 'MMM d, yyyy')
                        : <span className="text-gray-300">—</span>}
                    </td>

                    {/* Upcoming Renewal Date */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-blue-600 font-medium">
                        {format(upcomingDate, 'MMM d, yyyy')}
                      </p>
                      <p className="text-xs text-gray-400 capitalize">{renewal.billingCycle}</p>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <Badge status={status} />
                    </td>

                    {/* Actions — 3-dot menu */}
                    <td className="px-3 py-3">
                      <ActionMenu
                        renewal={renewal}
                        onView={setViewRenewal}
                        onEdit={setEditRenewal}
                        onDelete={setDeleteTarget}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ViewRenewal
        isOpen={!!viewRenewal}
        onClose={() => setViewRenewal(null)}
        renewal={viewRenewal}
        onEdit={setEditRenewal}
      />
      <RenewalForm
        isOpen={!!editRenewal}
        onClose={() => setEditRenewal(null)}
        editRenewal={editRenewal}
      />
      <DeleteConfirm
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteRenewal(deleteTarget?.id)}
        renewalName={deleteTarget?.name}
      />
    </>
  );
}
