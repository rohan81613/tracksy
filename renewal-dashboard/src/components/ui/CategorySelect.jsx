import { useState, useEffect, useRef } from 'react';
import { HiPlus, HiX, HiTag, HiCheck } from 'react-icons/hi';

const DEFAULT_CATEGORIES = [
  'Infrastructure',
  'Design',
  'Development',
  'Communication',
  'Productivity',
  'Project Management',
  'Entertainment',
  'Security',
];

const STORAGE_KEY = 'tracksy_custom_categories';

function loadCustomCategories() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCustomCategories(cats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cats));
}

export default function CategorySelect({ value, onChange, error }) {
  const [customCategories, setCustomCategories] = useState(loadCustomCategories);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [customError, setCustomError] = useState('');
  const inputRef = useRef(null);

  const allCategories = [...DEFAULT_CATEGORIES, ...customCategories];

  // If the current value is not in the list (e.g. loaded from storage), show it as custom
  useEffect(() => {
    if (value && value !== 'other' && !allCategories.includes(value)) {
      if (!customCategories.includes(value)) {
        const updated = [...customCategories, value];
        setCustomCategories(updated);
        saveCustomCategories(updated);
      }
    }
  }, []);

  // When "Other" is selected, show the input
  useEffect(() => {
    if (value === 'other') {
      setShowCustomInput(true);
      setCustomInput('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [value]);

  const handleSelectChange = (e) => {
    const selected = e.target.value;
    if (selected === 'other') {
      setShowCustomInput(true);
      setCustomInput('');
      onChange({ target: { name: 'category', value: 'other' } });
    } else {
      setShowCustomInput(false);
      setCustomError('');
      onChange({ target: { name: 'category', value: selected } });
    }
  };

  const handleAddCustom = () => {
    const trimmed = customInput.trim();
    if (!trimmed) {
      setCustomError('Please enter a category name');
      return;
    }
    if (allCategories.map(c => c.toLowerCase()).includes(trimmed.toLowerCase())) {
      setCustomError('This category already exists');
      return;
    }
    const updated = [...customCategories, trimmed];
    setCustomCategories(updated);
    saveCustomCategories(updated);
    setShowCustomInput(false);
    setCustomInput('');
    setCustomError('');
    onChange({ target: { name: 'category', value: trimmed } });
  };

  const handleRemoveCustom = (cat, e) => {
    e.stopPropagation();
    const updated = customCategories.filter(c => c !== cat);
    setCustomCategories(updated);
    saveCustomCategories(updated);
    // If the removed category was selected, clear it
    if (value === cat) {
      onChange({ target: { name: 'category', value: '' } });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustom();
    }
    if (e.key === 'Escape') {
      setShowCustomInput(false);
      setCustomInput('');
      setCustomError('');
      onChange({ target: { name: 'category', value: '' } });
    }
  };

  const handleCancelCustom = () => {
    setShowCustomInput(false);
    setCustomInput('');
    setCustomError('');
    onChange({ target: { name: 'category', value: '' } });
  };

  // Display value for the select — if value is a custom category, show it selected
  const selectValue = showCustomInput ? 'other' : (value || '');

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
        <HiTag size={13} className="text-gray-400" />
        Category
      </label>

      {/* Main select */}
      <select
        value={selectValue}
        onChange={handleSelectChange}
        className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <option value="">Select category...</option>

        {/* Default categories */}
        <optgroup label="Default">
          {DEFAULT_CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </optgroup>

        {/* Custom categories */}
        {customCategories.length > 0 && (
          <optgroup label="My Categories">
            {customCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </optgroup>
        )}

        <option value="other">+ Add custom category...</option>
      </select>

      {/* Custom input — shown when "Other" is selected */}
      {showCustomInput && (
        <div className="mt-1 space-y-1.5 animate-slide-in">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={customInput}
              onChange={e => { setCustomInput(e.target.value); setCustomError(''); }}
              onKeyDown={handleKeyDown}
              placeholder="Type your category name..."
              className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                customError ? 'border-red-300 bg-red-50' : 'border-blue-300 bg-blue-50'
              }`}
            />
            <button
              type="button"
              onClick={handleAddCustom}
              className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5 shrink-0"
            >
              <HiCheck size={14} />
              Add
            </button>
            <button
              type="button"
              onClick={handleCancelCustom}
              className="px-2.5 py-2 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition-colors shrink-0"
            >
              <HiX size={14} />
            </button>
          </div>
          {customError && <p className="text-xs text-red-500">{customError}</p>}
          <p className="text-xs text-gray-400">Press Enter to add · Esc to cancel</p>
        </div>
      )}

      {/* Custom categories chips — manage/remove */}
      {customCategories.length > 0 && !showCustomInput && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {customCategories.map(cat => (
            <span
              key={cat}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-default ${
                value === cat
                  ? 'bg-blue-100 text-blue-700 border-blue-200'
                  : 'bg-gray-100 text-gray-600 border-gray-200'
              }`}
            >
              {cat}
              <button
                type="button"
                onClick={(e) => handleRemoveCustom(cat, e)}
                className="ml-0.5 text-gray-400 hover:text-red-500 transition-colors rounded-full"
                title={`Remove "${cat}"`}
              >
                <HiX size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
