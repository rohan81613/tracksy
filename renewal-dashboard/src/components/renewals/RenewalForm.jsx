import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import CategorySelect from '../ui/CategorySelect';
import { useRenewal } from '../../context/RenewalContext';

const EMPTY_FORM = {
  name: '',
  vendor: '',
  amount: '',
  amountInr: '',
  billingCycle: 'monthly',
  purchaseDate: '',
  renewalDate: '',
  reminderDays: '7',
  category: '',
  notes: '',
};

const BILLING_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Name is required';
  if (!form.vendor.trim()) errors.vendor = 'Vendor is required';
  if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
    errors.amount = 'Enter a valid USD amount';
  if (!form.renewalDate) errors.renewalDate = 'Renewal date is required';
  if (!form.reminderDays || isNaN(Number(form.reminderDays)) || Number(form.reminderDays) < 0)
    errors.reminderDays = 'Enter valid reminder days';
  return errors;
}

export default function RenewalForm({ isOpen, onClose, editRenewal = null }) {
  const { addRenewal, updateRenewal } = useRenewal();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (editRenewal) {
        setForm({
          name: editRenewal.name || '',
          vendor: editRenewal.vendor || '',
          amount: String(editRenewal.amount || ''),
          amountInr: editRenewal.amountInr != null ? String(editRenewal.amountInr) : '',
          billingCycle: editRenewal.billingCycle || 'monthly',
          purchaseDate: editRenewal.purchaseDate || '',
          renewalDate: editRenewal.renewalDate || '',
          reminderDays: String(editRenewal.reminderDays || '7'),
          category: editRenewal.category || '',
          notes: editRenewal.notes || '',
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setErrors({});
    }
  }, [isOpen, editRenewal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const payload = {
      ...form,
      amount: parseFloat(form.amount),
      amountInr: form.amountInr !== '' ? parseFloat(form.amountInr) : null,
      reminderDays: parseInt(form.reminderDays),
    };
    if (editRenewal) {
      updateRenewal(editRenewal.id, payload);
    } else {
      addRenewal(payload);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editRenewal ? 'Edit Renewal' : 'Add New Renewal'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Name & Vendor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Netflix"
            error={errors.name}
            required
          />
          <Input
            label="Vendor"
            name="vendor"
            value={form.vendor}
            onChange={handleChange}
            placeholder="e.g. Netflix Inc."
            error={errors.vendor}
            required
          />
        </div>

        {/* Dual currency amount boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* USD box */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Amount (USD)
              <span className="ml-1 text-xs font-normal text-gray-400">required</span>
            </label>
            <div className="flex items-center rounded-lg border border-gray-200 hover:border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent overflow-hidden">
              <span className="px-3 py-2 bg-blue-50 text-blue-700 font-semibold text-sm border-r border-gray-200 select-none">
                $
              </span>
              <input
                name="amount"
                type="number"
                value={form.amount}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="flex-1 px-3 py-2 text-sm outline-none bg-white"
              />
            </div>
            {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
          </div>

          {/* INR box */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Amount (INR)
              <span className="ml-1 text-xs font-normal text-gray-400">optional</span>
            </label>
            <div className="flex items-center rounded-lg border border-gray-200 hover:border-gray-300 focus-within:ring-2 focus-within:ring-orange-400 focus-within:border-transparent overflow-hidden">
              <span className="px-3 py-2 bg-orange-50 text-orange-600 font-semibold text-sm border-r border-gray-200 select-none">
                ₹
              </span>
              <input
                name="amountInr"
                type="number"
                value={form.amountInr}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="flex-1 px-3 py-2 text-sm outline-none bg-white"
              />
            </div>
          </div>
        </div>

        {/* Billing Cycle */}
        <Select
          label="Billing Cycle"
          name="billingCycle"
          value={form.billingCycle}
          onChange={handleChange}
          options={BILLING_OPTIONS}
        />

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Purchase Date"
            name="purchaseDate"
            type="date"
            value={form.purchaseDate}
            onChange={handleChange}
          />
          <Input
            label="Renewal Date"
            name="renewalDate"
            type="date"
            value={form.renewalDate}
            onChange={handleChange}
            error={errors.renewalDate}
            required
          />
        </div>

        <Input
          label="Reminder (days before)"
          name="reminderDays"
          type="number"
          value={form.reminderDays}
          onChange={handleChange}
          placeholder="7"
          min="0"
          error={errors.reminderDays}
        />

        <CategorySelect
          value={form.category}
          onChange={handleChange}
          error={errors.category}
        />

        <div className="flex flex-col gap-1">
          <label htmlFor="notes" className="text-sm font-medium text-gray-700">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Optional notes..."
            rows={2}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            {editRenewal ? 'Save Changes' : 'Add'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
