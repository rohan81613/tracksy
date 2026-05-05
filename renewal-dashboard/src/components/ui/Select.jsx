export default function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  error,
  required,
  className = '',
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${
          error
            ? 'border-red-300 bg-red-50 focus:ring-red-400'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}
