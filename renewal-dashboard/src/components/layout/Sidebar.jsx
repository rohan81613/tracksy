import { useState, useEffect } from 'react';
import { useRenewal } from '../../context/RenewalContext';
import {
  HiHome,
  HiRefresh,
  HiCalendar,
  HiBell,
  HiDocument,
  HiChartBar,
  HiCog,
  HiChevronLeft,
  HiChevronRight,
  HiX,
} from 'react-icons/hi';

/**
 * All 7 navigation items as required by Requirement 2.1.
 * Order matches the spec's information architecture.
 */
const NAV_ITEMS = [
  { id: 'dashboard',     label: 'Dashboard',      icon: HiHome },
  { id: 'renewals',      label: 'Renewals',        icon: HiRefresh },
  { id: 'calendar',      label: 'Calendar',        icon: HiCalendar },
  { id: 'notifications', label: 'Notifications',   icon: HiBell },
  { id: 'documents',     label: 'Documents',       icon: HiDocument },
  { id: 'reports',       label: 'Reports',         icon: HiChartBar },
  { id: 'settings',      label: 'Settings',        icon: HiCog },
];

/** localStorage key for persisting collapsed state (Requirement 2.2) */
const COLLAPSED_KEY = 'tracksy_sidebar_collapsed';

/**
 * A single nav button used in both desktop and mobile variants.
 *
 * Active state: accent-color left border + accent text (Requirement 2.1).
 * Inactive state: secondary text, hover uses surface-2 background.
 * Both states use CSS variables from the design token system (index.css).
 */
function NavItem({ id, label, icon: Icon, isActive, collapsed, unreadCount, onClick }) {
  const showBadge = id === 'notifications' && unreadCount > 0;
  const badgeLabel = unreadCount > 99 ? '99+' : String(unreadCount);

  return (
    <button
      key={id}
      onClick={() => onClick(id)}
      title={collapsed ? label : undefined}
      aria-current={isActive ? 'page' : undefined}
      className={[
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
        'transition-colors duration-150 relative',
        collapsed ? 'justify-center' : '',
        isActive
          ? 'border-l-2 border-[var(--color-accent)] bg-[var(--color-accent-light)] text-[var(--color-accent)]'
          : [
              'border-l-2 border-transparent',
              'text-[var(--color-text-secondary)]',
              'hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)]',
            ].join(' '),
      ].join(' ')}
    >
      {/* Icon — with a small dot indicator when collapsed and there are unread notifications */}
      <div className="relative shrink-0">
        <Icon size={18} aria-hidden="true" />
        {showBadge && collapsed && (
          <span
            aria-hidden="true"
            className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"
          />
        )}
      </div>

      {/* Label + badge (only in expanded mode) */}
      {!collapsed && (
        <>
          <span className="truncate">{label}</span>
          {showBadge && (
            <span
              aria-label={`${unreadCount} unread notifications`}
              className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none"
            >
              {badgeLabel}
            </span>
          )}
        </>
      )}
    </button>
  );
}

/**
 * App logo / wordmark button.
 * Clicking navigates to the Dashboard.
 */
function Logo({ collapsed, onClick }) {
  return (
    <button
      onClick={() => onClick('dashboard')}
      title="Go to Dashboard"
      className={[
        'flex items-center w-full px-4 py-4',
        'border-b border-[var(--color-border)]',
        'hover:bg-[var(--color-surface-2)] transition-colors',
        collapsed ? 'justify-center' : 'gap-2.5',
      ].join(' ')}
    >
      <div className="w-7 h-7 bg-[var(--color-accent)] rounded-lg flex items-center justify-center shrink-0">
        <HiRefresh className="text-white" size={14} aria-hidden="true" />
      </div>
      {!collapsed && (
        <span className="font-semibold text-[var(--color-text-primary)] text-sm truncate">
          Tracksy
        </span>
      )}
    </button>
  );
}

/**
 * Sidebar component — two variants:
 *
 * 1. Desktop (default): fixed left sidebar, collapsible to icon-only mode.
 *    - Collapsed state persisted in localStorage under `tracksy_sidebar_collapsed`.
 *    - Hidden on mobile (use MobileNav instead).
 *
 * 2. Mobile (mobile={true}): full-width drawer content, no collapse toggle.
 *    - Rendered inside a drawer/sheet managed by the parent (e.g. MobileNav).
 *    - Calls `onClose` after navigation.
 *
 * Requirements: 2.1 (7 nav items, unread badge), 2.2 (collapsible, localStorage)
 */
export default function Sidebar({ mobile = false, onClose }) {
  const { currentPage, setCurrentPage, unreadCount } = useRenewal();

  // Collapsed state — initialized from localStorage (Requirement 2.2)
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Persist collapsed state whenever it changes (Requirement 2.2)
  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSED_KEY, String(collapsed));
    } catch {
      // Silently ignore if localStorage is unavailable (e.g. private browsing)
    }
  }, [collapsed]);

  const handleNav = (id) => {
    setCurrentPage(id);
    if (mobile && onClose) onClose();
  };

  // ─── Mobile variant ────────────────────────────────────────────────────────
  // Full nav list, no collapse toggle. Rendered inside a parent drawer/sheet.
  if (mobile) {
    return (
      <div
        className="flex flex-col h-full"
        style={{ backgroundColor: 'var(--color-surface-1)' }}
      >
        {/* Drawer header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <button
            onClick={() => handleNav('dashboard')}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <div className="w-7 h-7 bg-[var(--color-accent)] rounded-lg flex items-center justify-center">
              <HiRefresh className="text-white" size={14} aria-hidden="true" />
            </div>
            <span
              className="font-semibold text-sm"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Tracksy
            </span>
          </button>

          <button
            onClick={onClose}
            aria-label="Close navigation"
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-surface-2)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <HiX size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Nav list */}
        <nav
          className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin"
          aria-label="Main navigation"
        >
          {NAV_ITEMS.map(({ id, label, icon }) => (
            <NavItem
              key={id}
              id={id}
              label={label}
              icon={icon}
              isActive={currentPage === id}
              collapsed={false}
              unreadCount={unreadCount}
              onClick={handleNav}
            />
          ))}
        </nav>

        {/* Footer */}
        <div
          className="px-4 py-4 border-t"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <p
            className="text-xs"
            style={{ color: 'var(--color-text-muted)' }}
          >
            v1.0.0 · Tracksy
          </p>
        </div>
      </div>
    );
  }

  // ─── Desktop variant ───────────────────────────────────────────────────────
  // Fixed left sidebar, collapsible to icon-only mode (Requirement 2.2).
  // Hidden on mobile — MobileNav handles small viewports (Requirement 2.5).
  return (
    <aside
      aria-label="Main navigation"
      className={[
        'hidden md:flex flex-col',
        'border-r transition-all duration-200',
        collapsed ? 'w-16' : 'w-56',
      ].join(' ')}
      style={{
        backgroundColor: 'var(--color-surface-1)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Logo */}
      <Logo collapsed={collapsed} onClick={handleNav} />

      {/* Nav list */}
      <nav
        className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-thin"
        aria-label="Main navigation"
      >
        {NAV_ITEMS.map(({ id, label, icon }) => (
          <NavItem
            key={id}
            id={id}
            label={label}
            icon={icon}
            isActive={currentPage === id}
            collapsed={collapsed}
            unreadCount={unreadCount}
            onClick={handleNav}
          />
        ))}
      </nav>

      {/* Collapse / expand toggle (Requirement 2.2) */}
      <div
        className="px-2 py-3 border-t"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <button
          onClick={() => setCollapsed(prev => !prev)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={[
            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs',
            'transition-colors duration-150',
            collapsed ? 'justify-center' : '',
          ].join(' ')}
          style={{ color: 'var(--color-text-muted)' }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'var(--color-surface-2)';
            e.currentTarget.style.color = 'var(--color-text-secondary)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--color-text-muted)';
          }}
        >
          {collapsed ? (
            <HiChevronRight size={16} aria-hidden="true" />
          ) : (
            <>
              <HiChevronLeft size={16} aria-hidden="true" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
