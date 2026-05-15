import { useEffect, useRef } from 'react';
import { HiExclamation, HiOutlineExclamationCircle } from 'react-icons/hi';

/**
 * ConfirmDialog — accessible confirmation dialog for destructive/warning actions.
 *
 * Props:
 *   isOpen       {boolean}  — controls visibility
 *   title        {string}   — dialog heading
 *   description  {string}   — body text explaining the action
 *   confirmLabel {string}   — label for the confirm button (default: "Confirm")
 *   onConfirm    {function} — called when the user confirms
 *   onCancel     {function} — called when the user cancels or presses ESC
 *   variant      {'danger'|'warning'} — controls confirm button color
 */
export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
  variant = 'danger',
}) {
  const dialogRef = useRef(null);
  const confirmBtnRef = useRef(null);

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
      if (e.key === 'Escape') onCancel?.();
    };
    if (isOpen) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onCancel]);

  // Focus trap — keep focus inside the dialog while open
  useEffect(() => {
    if (!isOpen) return;

    // Move focus to the confirm button on open
    const frame = requestAnimationFrame(() => {
      confirmBtnRef.current?.focus();
    });

    const handleFocusTrap = (e) => {
      if (!dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
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

  if (!isOpen) return null;

  // Variant-specific styles
  const isDanger = variant === 'danger';

  const iconBg = isDanger
    ? 'bg-[color:var(--color-status-overdue)]/10'
    : 'bg-[color:var(--color-status-due-soon)]/10';

  const iconColor = isDanger
    ? 'text-[color:var(--color-status-overdue)]'
    : 'text-[color:var(--color-status-due-soon)]';

  const confirmBtnStyle = isDanger
    ? {
        backgroundColor: 'var(--color-status-overdue)',
        color: '#ffffff',
        border: '1px solid var(--color-status-overdue)',
      }
    : {
        backgroundColor: 'var(--color-status-due-soon)',
        color: '#ffffff',
        border: '1px solid var(--color-status-due-soon)',
      };

  const IconComponent = isDanger ? HiExclamation : HiOutlineExclamationCircle;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className="relative w-full max-w-sm rounded-2xl shadow-2xl flex flex-col animate-slide-in"
        style={{
          backgroundColor: 'var(--color-surface-0)',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Body */}
        <div className="flex flex-col items-center text-center gap-4 px-6 py-6">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBg}`}>
            <IconComponent className={iconColor} size={24} />
          </div>

          {/* Text */}
          <div className="space-y-1">
            <h2
              id="confirm-dialog-title"
              className="text-base font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {title}
            </h2>
            {description && (
              <p
                id="confirm-dialog-description"
                className="text-sm"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div
          className="flex gap-3 px-6 pb-6"
        >
          {/* Cancel — ghost/secondary style */}
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 px-4 py-2 text-sm"
            style={{
              backgroundColor: 'var(--color-surface-1)',
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-surface-2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-surface-1)';
            }}
          >
            Cancel
          </button>

          {/* Confirm — variant-colored */}
          <button
            ref={confirmBtnRef}
            type="button"
            onClick={onConfirm}
            className="flex-1 inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 px-4 py-2 text-sm"
            style={confirmBtnStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
