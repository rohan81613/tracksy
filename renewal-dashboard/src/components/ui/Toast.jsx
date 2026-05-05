import { useRenewal } from '../../context/RenewalContext';
import { HiCheckCircle, HiXCircle, HiInformationCircle, HiX } from 'react-icons/hi';

function ToastItem({ toast, onRemove }) {
  const icons = {
    success: <HiCheckCircle className="text-emerald-500" size={20} />,
    error: <HiXCircle className="text-red-500" size={20} />,
    info: <HiInformationCircle className="text-blue-500" size={20} />,
  };

  const borders = {
    success: 'border-l-4 border-emerald-400',
    error: 'border-l-4 border-red-400',
    info: 'border-l-4 border-blue-400',
  };

  return (
    <div className={`flex items-center gap-3 bg-white rounded-xl shadow-lg px-4 py-3 min-w-[280px] max-w-sm animate-slide-in ${borders[toast.type] || borders.info}`}>
      {icons[toast.type] || icons.info}
      <span className="text-sm text-gray-700 font-medium flex-1">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <HiX size={16} />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts, removeToast } = useRenewal();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}
