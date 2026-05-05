import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { HiExclamation } from 'react-icons/hi';

export default function DeleteConfirm({ isOpen, onClose, onConfirm, renewalName }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Renewal" size="sm">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
          <HiExclamation className="text-red-500" size={24} />
        </div>
        <div>
          <p className="text-sm text-gray-700">
            Are you sure you want to delete <span className="font-semibold">"{renewalName}"</span>?
          </p>
          <p className="text-xs text-gray-400 mt-1">This action cannot be undone.</p>
        </div>
        <div className="flex gap-3 w-full">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => { onConfirm(); onClose(); }}
            className="flex-1 !bg-red-600 !text-white !border-red-600 hover:!bg-red-700"
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
}
