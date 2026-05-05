import { useState, useRef, useEffect } from 'react';
import { HiBell, HiCheck, HiCheckCircle } from 'react-icons/hi';
import { useRenewal } from '../../context/RenewalContext';
import { format, parseISO } from 'date-fns';

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useRenewal();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const urgencyColor = (days) => {
    if (days < 0) return 'bg-red-50 border-red-100';
    if (days === 0) return 'bg-blue-50 border-blue-100';
    if (days <= 7) return 'bg-amber-50 border-amber-100';
    return 'bg-gray-50 border-gray-100';
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <HiBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 animate-slide-in overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-xs text-gray-400">{unreadCount} unread</p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <HiCheck size={14} />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <HiCheckCircle className="text-gray-300 mb-2" size={32} />
                <p className="text-sm text-gray-400">All caught up!</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => markNotificationRead(notif.id)}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${notif.read ? 'opacity-60' : ''}`}
                >
                  <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${notif.read ? 'bg-gray-300' : 'bg-blue-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${notif.read ? 'text-gray-500' : 'text-gray-800 font-medium'}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{notif.subtitle}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-400 text-center">{notifications.length} total notifications</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
