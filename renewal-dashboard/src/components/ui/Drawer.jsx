import { useEffect, useRef } from 'react';
import { HiX } from 'react-icons/hi';

/**
 * Drawer — accessible slide-in panel from the right side of the screen.
 *
 * Props:
 *   isOpen    {boolean}        — controls visibility
 *   onClose   {function}       — called when backdrop is clicked or ESC is pressed
 *   title     {string}         — optional header title; if omitted, header title area is not rendered
 *   width     {number|string}  — drawer width in px (default: 480)
 *   children  {ReactNode}      — drawer body content
 *
 * Requirements: 6.1, 1.7
 */
export function Drawer({ isOpen, onClose, title, width = 480, children }) {
  const drawerRef = useRef(null);
  const closeButtonRef = useRef(null);

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // ESC to close
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    if (isOpen) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Focus trap — keep focus inside the drawer while open
  useEffect(() => {
    if (!isOpen) return;

    // Move focus to the close button on open
    const frame = requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    const handleFocusTrap = (e) => {
      if (!drawerRef.current) return;
      const focusable = drawerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleFocusTrap);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('keydown', handleFocusTrap);
    };
  }, [isOpen]);

  const drawerWidth = typeof width === 'number' ? `${width}px` : width;

  return (
    <>
      {/* Backdrop */}
      <div
        className={[
          'fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'drawer-title' : undefined}
        className={[
          'fixed top-0 right-0 z-50 h-full flex flex-col shadow-2xl',
          'transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
        style={{
          width: drawerWidth,
          maxWidth: '100vw',
          backgroundColor: 'var(--color-surface-0)',
          borderLeft: '1px solid var(--color-border)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          {title ? (
            <h2
              id="drawer-title"
              className="text-base font-semibold truncate pr-4"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {title}
            </h2>
          ) : (
            <div />
          )}
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="shrink-0 p-1.5 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1"
            style={{
              color: 'var(--color-text-secondary)',
              '--tw-ring-color': 'var(--color-accent)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-surface-2)';
              e.currentTarget.style.color = 'var(--color-text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--color-text-secondary)';
            }}
          >
            <HiX size={18} />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {children}
        </div>
      </div>
    </>
  );
}

export default Drawer;
