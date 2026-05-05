import { useState, useRef, useEffect } from 'react';
import { HiMenu, HiRefresh, HiLogout, HiUser, HiCog } from 'react-icons/hi';
import { useRenewal } from '../../context/RenewalContext';
import { useAuth } from '../../context/AuthContext';
import NotificationDropdown from '../notifications/NotificationDropdown';
import Sidebar from './Sidebar';

const pageTitles = {
  dashboard: 'Dashboard',
  renewals: 'All Renewals',
  calendar: 'Calendar',
  settings: 'Settings',
};

function UserMenu({ user, onLogout, onSettings }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(p => !p)}
        className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
          {initials}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-xs font-semibold text-gray-800 leading-tight">{user.name}</p>
          {user.company && <p className="text-[10px] text-gray-400 leading-tight">{user.company}</p>}
        </div>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 z-50 animate-slide-in overflow-hidden">
          {/* User info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>

          {/* Actions */}
          <div className="py-1">
            <button
              onClick={() => { onSettings(); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <HiCog size={16} className="text-gray-400" />
              Settings
            </button>
            <button
              onClick={() => { onLogout(); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <HiLogout size={16} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const { currentPage, setCurrentPage } = useRenewal();
  const { currentUser, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-gray-100 px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <HiMenu size={20} />
          </button>
          {/* Mobile logo */}
          <button
            onClick={() => setCurrentPage('dashboard')}
            className="md:hidden flex items-center gap-2 hover:opacity-75 transition-opacity"
          >
            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
              <HiRefresh className="text-white" size={12} />
            </div>
            <span className="font-semibold text-gray-900 text-sm">Tracksy</span>
          </button>
          <h1 className="hidden md:block text-base font-semibold text-gray-900">
            {pageTitles[currentPage] || 'Dashboard'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <NotificationDropdown />
          {currentUser && (
            <UserMenu
              user={currentUser}
              onLogout={logout}
              onSettings={() => setCurrentPage('settings')}
            />
          )}
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl animate-slide-in">
            <Sidebar mobile onClose={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
