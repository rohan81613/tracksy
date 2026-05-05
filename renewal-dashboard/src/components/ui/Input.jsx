export default function Input({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required,
  min,
  max,
  className = '',
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          error
            ? 'border-red-300 bg-red-50 focus:ring-red-400'
            : 'border-gray-200 bg-white hover:border-gray-300'
        }`}
      />
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}
