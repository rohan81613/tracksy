import { useState, useRef, useEffect } from 'react';
import { HiMenu, HiRefresh, HiLogout, HiCog, HiUser, HiBell, HiSearch, HiCheck, HiCheckCircle } from 'react-icons/hi';
import { useRenewal } from '../../context/RenewalContext';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../ui/ThemeToggle';
import Sidebar from './Sidebar';

/** Maps page IDs to display titles (Requirement 2.3) */
const PAGE_TITLES = {
  dashboard:     'Dashboard',
  renewals:      'Renewals',
  calendar:      'Calendar',
  notifications: 'Notifications',
  documents:     'Documents',
  reports:       'Reports',
  settings:      'Settings',
  'vendor-profile': 'Vendor Profile',
};

// ---------------------------------------------------------------------------
// NotificationBell — inline bell with unread badge + dropdown
// ---------------------------------------------------------------------------
function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead, setCurrentPage } = useRenewal();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleViewAll = () => {
    setCurrentPage('notifications');
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(p => !p)}
        aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
        title="Notifications"
        className="relative p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-1"
        style={{ color: 'var(--color-text-secondary)' }}
        onMouseEnter={e => {
          e.currentTarget.style.backgroundColor = 'var(--color-surface-2)';
          e.currentTarget.style.color = 'var(--color-text-primary)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'var(--color-text-secondary)';
        }}
      >
        <HiBell size={20} aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-80 rounded-xl shadow-[var(--shadow-lg)] z-50 overflow-hidden"
          style={{
            backgroundColor: 'var(--color-surface-1)',
            border: '1px solid var(--color-border)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Notifications
              </h3>
              {unreadCount > 0 && (
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {unreadCount} unread
                </p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="text-xs font-medium flex items-center gap-1 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] rounded"
                style={{ color: 'var(--color-accent)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-accent-hover)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-accent)')}
              >
                <HiCheck size={14} aria-hidden="true" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-72 overflow-y-auto scrollbar-thin">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <HiCheckCircle
                  size={32}
                  aria-hidden="true"
                  style={{ color: 'var(--color-text-muted)' }}
                  className="mb-2"
                />
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  All caught up!
                </p>
              </div>
            ) : (
              notifications.slice(0, 8).map(notif => (
                <button
                  key={notif.id}
                  onClick={() => markNotificationRead(notif.id)}
                  className="w-full flex items-start gap-3 px-4 py-3 border-b text-left transition-colors"
                  style={{
                    borderColor: 'var(--color-border)',
                    opacity: notif.read ? 0.6 : 1,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-surface-2)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <span
                    aria-hidden="true"
                    className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${notif.read ? '' : 'bg-[var(--color-accent)]'}`}
                    style={notif.read ? { backgroundColor: 'var(--color-text-muted)' } : {}}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm ${notif.read ? '' : 'font-medium'}`}
                      style={{ color: notif.read ? 'var(--color-text-secondary)' : 'var(--color-text-primary)' }}
                    >
                      {notif.title}
                    </p>
                    {notif.subtitle && (
                      <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-muted)' }}>
                        {notif.subtitle}
                      </p>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div
              className="px-4 py-2.5 border-t"
              style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface-2)' }}
            >
              <button
                onClick={handleViewAll}
                className="w-full text-xs font-medium text-center transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] rounded"
                style={{ color: 'var(--color-accent)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-accent-hover)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-accent)')}
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// UserMenu — avatar button + dropdown with Profile, Settings, Logout
// ---------------------------------------------------------------------------
function UserMenu({ user, onLogout, onNavigate }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Derive initials from name (up to 2 chars)
  const initials = (user.name || 'U')
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const menuItems = [
    {
      label: 'Profile',
      icon: HiUser,
      onClick: () => { onNavigate('settings'); setOpen(false); },
    },
    {
      label: 'Settings',
      icon: HiCog,
      onClick: () => { onNavigate('settings'); setOpen(false); },
    },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(p => !p)}
        aria-label="User menu"
        aria-expanded={open}
        className="flex items-center gap-2 p-1 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-1"
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-surface-2)')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        {/* Avatar: image if available, else initials */}
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 select-none">
            {initials}
          </div>
        )}

        {/* Name + company (hidden on small screens) */}
        <div className="hidden sm:block text-left">
          <p
            className="text-xs font-semibold leading-tight"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {user.name}
          </p>
          {user.company && (
            <p className="text-[10px] leading-tight" style={{ color: 'var(--color-text-muted)' }}>
              {user.company}
            </p>
          )}
        </div>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-52 rounded-xl shadow-[var(--shadow-lg)] z-50 overflow-hidden"
          style={{
            backgroundColor: 'var(--color-surface-1)',
            border: '1px solid var(--color-border)',
          }}
        >
          {/* User info header */}
          <div
            className="px-4 py-3 border-b"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <p
              className="text-sm font-semibold truncate"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {user.name}
            </p>
            <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
              {user.email}
            </p>
          </div>

          {/* Menu items */}
          <div className="py-1">
            {menuItems.map(({ label, icon: Icon, onClick }) => (
              <button
                key={label}
                onClick={onClick}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--color-accent)]"
                style={{ color: 'var(--color-text-secondary)' }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = 'var(--color-surface-2)';
                  e.currentTarget.style.color = 'var(--color-text-primary)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--color-text-secondary)';
                }}
              >
                <Icon size={16} aria-hidden="true" style={{ color: 'var(--color-text-muted)' }} />
                {label}
              </button>
            ))}

            {/* Divider */}
            <div className="my-1 border-t" style={{ borderColor: 'var(--color-border)' }} />

            {/* Logout */}
            <button
              onClick={() => { onLogout(); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-400"
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <HiLogout size={16} aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SearchTrigger — "Search... ⌘K" button that dispatches a custom event
// ---------------------------------------------------------------------------
function SearchTrigger() {
  const handleClick = () => {
    // Dispatch a custom event so Phase 3 search modal can listen for it
    window.dispatchEvent(new CustomEvent('tracksy:open-search'));
  };

  // Register cmd+k / ctrl+k shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('tracksy:open-search'));
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <button
      onClick={handleClick}
      aria-label="Open search (⌘K)"
      title="Search (⌘K)"
      className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-1"
      style={{
        backgroundColor: 'var(--color-surface-2)',
        border: '1px solid var(--color-border)',
        color: 'var(--color-text-muted)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--color-accent)';
        e.currentTarget.style.color = 'var(--color-text-secondary)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--color-border)';
        e.currentTarget.style.color = 'var(--color-text-muted)';
      }}
    >
      <HiSearch size={14} aria-hidden="true" />
      <span>Search...</span>
      <kbd
        className="ml-1 text-[10px] font-mono px-1 py-0.5 rounded"
        style={{
          backgroundColor: 'var(--color-surface-1)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-muted)',
        }}
      >
        ⌘K
      </kbd>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Header — main export
// ---------------------------------------------------------------------------
/**
 * Sticky top header for the Tracksy app shell.
 *
 * Features (Requirement 2.3):
 * - Current page title (mapped from RenewalContext.currentPage)
 * - Global search trigger button with ⌘K shortcut (dispatches custom event for Phase 3 modal)
 * - ThemeToggle (light / dark / system)
 * - Notification bell with unread count badge
 * - User avatar with dropdown: Profile, Settings, Logout
 *
 * All colors use CSS variables from the design token system (index.css).
 * Supports dark mode automatically via the .dark class on <html>.
 */
export default function Header() {
  const { currentPage, setCurrentPage } = useRenewal();
  const { currentUser, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pageTitle = PAGE_TITLES[currentPage] || 'Dashboard';

  return (
    <>
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 py-3"
        style={{
          backgroundColor: 'var(--color-surface-1)',
          borderBottom: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {/* ── Left: mobile menu + page title ── */}
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            className="md:hidden p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{ color: 'var(--color-text-secondary)' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-surface-2)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <HiMenu size={20} aria-hidden="true" />
          </button>

          {/* Mobile logo (shown when sidebar is hidden) */}
          <button
            onClick={() => setCurrentPage('dashboard')}
            className="md:hidden flex items-center gap-2 hover:opacity-75 transition-opacity focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] rounded"
          >
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              <HiRefresh className="text-white" size={12} aria-hidden="true" />
            </div>
            <span className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
              Tracksy
            </span>
          </button>

          {/* Desktop page title */}
          <h1
            className="hidden md:block text-base font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {pageTitle}
          </h1>
        </div>

        {/* ── Right: search + theme + bell + user ── */}
        <div className="flex items-center gap-1.5">
          {/* Global search trigger */}
          <SearchTrigger />

          {/* Mobile search icon (compact) */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('tracksy:open-search'))}
            aria-label="Search"
            className="sm:hidden p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{ color: 'var(--color-text-secondary)' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-surface-2)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <HiSearch size={18} aria-hidden="true" />
          </button>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Notification bell */}
          <NotificationBell />

          {/* User avatar + dropdown */}
          {currentUser && (
            <UserMenu
              user={currentUser}
              onLogout={logout}
              onNavigate={setCurrentPage}
            />
          )}
        </div>
      </header>

      {/* Mobile sidebar drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer */}
          <div
            className="absolute left-0 top-0 bottom-0 w-64 shadow-xl"
            style={{ backgroundColor: 'var(--color-surface-1)' }}
          >
            <Sidebar mobile onClose={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
