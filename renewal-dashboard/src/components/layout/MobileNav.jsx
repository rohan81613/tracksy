import { useState, useEffect, useRef } from 'react';
import {
  HiHome,
  HiRefresh,
  HiCalendar,
  HiBell,
  HiDotsHorizontal,
  HiDocument,
  HiChartBar,
  HiCog,
  HiX,
} from 'react-icons/hi';
import { useRenewal } from '../../context/RenewalContext';

/**
 * Primary bottom bar items — always visible on mobile.
 * Requirements: 2.5, 1.8
 */
const PRIMARY_ITEMS = [
  { id: 'dashboard',     label: 'Dashboard',    icon: HiHome },
  { id: 'renewals',      label: 'Renewals',     icon: HiRefresh },
  { id: 'calendar',      label: 'Calendar',     icon: HiCalendar },
  { id: 'notifications', label: 'Alerts',       icon: HiBell },
];

/**
 * Secondary items shown in the "More" drawer.
 */
const MORE_ITEMS = [
  { id: 'documents', label: 'Documents', icon: HiDocument },
  { id: 'reports',   label: 'Reports',   icon: HiChartBar },
  { id: 'settings',  label: 'Settings',  icon: HiCog },
];

/**
 * A single bottom bar tab button.
 */
function BottomTab({ id, label, icon: Icon, isActive, unreadCount, onClick }) {
  const showBadge = id === 'notifications' && unreadCount > 0;
  const badgeLabel = unreadCount > 99 ? '99+' : String(unreadCount);

  return (
    <button
      onClick={() => onClick(id)}
      aria-current={isActive ? 'page' : undefined}
      aria-label={showBadge ? `${label}, ${unreadCount} unread` : label}
      className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-w-0 transition-colors duration-150"
      style={{
        color: isActive
          ? 'var(--color-accent)'
          : 'var(--color-text-secondary)',
      }}
    >
      <div className="relative">
        <Icon size={22} aria-hidden="true" />
        {showBadge && (
          <span
            aria-hidden="true"
            className="absolute -top-1 -right-1.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none"
          >
            {badgeLabel}
          </span>
        )}
      </div>
      <span
        className="text-[10px] font-medium leading-none truncate max-w-full px-1"
        style={{
          color: isActive
            ? 'var(--color-accent)'
            : 'var(--color-text-secondary)',
        }}
      >
        {label}
      </span>
    </button>
  );
}

/**
 * MobileNav — bottom navigation bar for viewports < 768px.
 *
 * - Fixed at the bottom of the screen, hidden on md+ (md:hidden).
 * - 5 primary tabs: Dashboard, Renewals, Calendar, Notifications, More.
 * - "More" opens a bottom sheet/drawer with: Documents, Reports, Settings.
 * - Notification badge shows unreadCount from RenewalContext.
 * - Uses CSS variables from the design token system for full dark mode support.
 * - Includes iOS safe-area-inset-bottom padding.
 *
 * Requirements: 2.5, 1.8
 */
export default function MobileNav() {
  const { currentPage, setCurrentPage, unreadCount } = useRenewal();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef(null);
  const moreButtonRef = useRef(null);

  // Close drawer when navigating to a primary item
  const handlePrimaryNav = (id) => {
    setDrawerOpen(false);
    setCurrentPage(id);
  };

  // Navigate from the "More" drawer and close it
  const handleMoreNav = (id) => {
    setDrawerOpen(false);
    setCurrentPage(id);
  };

  // Close drawer on Escape key
  useEffect(() => {
    if (!drawerOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setDrawerOpen(false);
        moreButtonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [drawerOpen]);

  // Trap focus inside drawer when open
  useEffect(() => {
    if (drawerOpen && drawerRef.current) {
      const focusable = drawerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length > 0) {
        focusable[0].focus();
      }
    }
  }, [drawerOpen]);

  // Determine if "More" tab should appear active (any secondary page is current)
  const isMoreActive = MORE_ITEMS.some((item) => item.id === currentPage);

  return (
    <>
      {/* ── Bottom navigation bar ─────────────────────────────────────── */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-stretch border-t"
        style={{
          backgroundColor: 'var(--color-surface-1)',
          borderColor: 'var(--color-border)',
          boxShadow: 'var(--shadow-lg)',
          /* iOS safe area inset */
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* Primary tabs */}
        {PRIMARY_ITEMS.map(({ id, label, icon }) => (
          <BottomTab
            key={id}
            id={id}
            label={label}
            icon={icon}
            isActive={currentPage === id}
            unreadCount={unreadCount}
            onClick={handlePrimaryNav}
          />
        ))}

        {/* "More" tab — opens the drawer */}
        <button
          ref={moreButtonRef}
          onClick={() => setDrawerOpen((prev) => !prev)}
          aria-haspopup="dialog"
          aria-expanded={drawerOpen}
          aria-label="More navigation options"
          className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-w-0 transition-colors duration-150"
          style={{
            color: isMoreActive || drawerOpen
              ? 'var(--color-accent)'
              : 'var(--color-text-secondary)',
          }}
        >
          <HiDotsHorizontal size={22} aria-hidden="true" />
          <span
            className="text-[10px] font-medium leading-none"
            style={{
              color: isMoreActive || drawerOpen
                ? 'var(--color-accent)'
                : 'var(--color-text-secondary)',
            }}
          >
            More
          </span>
        </button>
      </nav>

      {/* ── "More" bottom drawer ──────────────────────────────────────── */}
      {/* Backdrop */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40"
          aria-hidden="true"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Drawer sheet */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="More options"
        className={[
          'md:hidden fixed left-0 right-0 z-50 rounded-t-2xl',
          'transition-transform duration-300 ease-out',
          drawerOpen ? 'translate-y-0' : 'translate-y-full',
        ].join(' ')}
        style={{
          bottom: 0,
          backgroundColor: 'var(--color-surface-1)',
          borderTop: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-lg)',
          /* iOS safe area inset */
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div
            className="w-10 h-1 rounded-full"
            style={{ backgroundColor: 'var(--color-border)' }}
          />
        </div>

        {/* Drawer header */}
        <div
          className="flex items-center justify-between px-5 py-3 border-b"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <span
            className="text-sm font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            More
          </span>
          <button
            onClick={() => {
              setDrawerOpen(false);
              moreButtonRef.current?.focus();
            }}
            aria-label="Close drawer"
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = 'var(--color-surface-2)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = 'transparent')
            }
          >
            <HiX size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Secondary nav items */}
        <nav
          aria-label="Additional navigation"
          className="px-4 py-3 space-y-1"
        >
          {MORE_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = currentPage === id;
            return (
              <button
                key={id}
                onClick={() => handleMoreNav(id)}
                aria-current={isActive ? 'page' : undefined}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-150"
                style={{
                  backgroundColor: isActive
                    ? 'var(--color-accent-light)'
                    : 'transparent',
                  color: isActive
                    ? 'var(--color-accent)'
                    : 'var(--color-text-secondary)',
                  borderLeft: isActive
                    ? '2px solid var(--color-accent)'
                    : '2px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor =
                      'var(--color-surface-2)';
                    e.currentTarget.style.color = 'var(--color-text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                  }
                }}
              >
                <Icon size={20} aria-hidden="true" />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom spacer so content isn't flush against the bar */}
        <div className="h-3" />
      </div>
    </>
  );
}
