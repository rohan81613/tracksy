import { useRenewal } from '../../context/RenewalContext';
import {
  HiViewGrid,
  HiRefresh,
  HiCalendar,
  HiCog,
  HiChevronLeft,
  HiChevronRight,
  HiX,
} from 'react-icons/hi';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: HiViewGrid },
  { id: 'renewals', label: 'All Renewals', icon: HiRefresh },
  { id: 'calendar', label: 'Calendar', icon: HiCalendar },
  { id: 'settings', label: 'Settings', icon: HiCog },
];

export default function Sidebar({ mobile = false, onClose }) {
  const { currentPage, setCurrentPage, sidebarOpen, setSidebarOpen } = useRenewal();

  const handleNav = (id) => {
    setCurrentPage(id);
    if (mobile && onClose) onClose();
  };

  if (mobile) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <button
            onClick={() => handleNav('dashboard')}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <HiRefresh className="text-white" size={14} />
            </div>
            <span className="font-semibold text-gray-900 text-sm">Tracksy</span>
          </button>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <HiX size={18} />
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleNav(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                currentPage === id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">v1.0.0 · Tracksy</p>
        </div>
      </div>
    );
  }

  return (
    <aside
      className={`hidden md:flex flex-col bg-white border-r border-gray-100 transition-all duration-200 ${
        sidebarOpen ? 'w-56' : 'w-16'
      }`}
    >
      {/* Logo */}
      <button
        onClick={() => handleNav('dashboard')}
        className={`flex items-center px-4 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors w-full ${sidebarOpen ? 'gap-2.5' : 'justify-center'}`}
        title="Go to Dashboard"
      >
        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
          <HiRefresh className="text-white" size={14} />
        </div>
        {sidebarOpen && (
          <span className="font-semibold text-gray-900 text-sm truncate">Tracksy</span>
        )}
      </button>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => handleNav(id)}
            title={!sidebarOpen ? label : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
              sidebarOpen ? '' : 'justify-center'
            } ${
              currentPage === id
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Icon size={18} className="shrink-0" />
            {sidebarOpen && <span className="truncate">{label}</span>}
          </button>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="px-2 py-3 border-t border-gray-100">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors ${!sidebarOpen ? 'justify-center' : ''}`}
        >
          {sidebarOpen ? (
            <>
              <HiChevronLeft size={16} />
              <span>Collapse</span>
            </>
          ) : (
            <HiChevronRight size={16} />
          )}
        </button>
      </div>
    </aside>
  );
}
