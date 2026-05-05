export default function Card({ children, className = '', onClick, hover = false }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-gray-100 shadow-sm ${hover ? 'hover:shadow-md hover:border-gray-200 cursor-pointer transition-all duration-150' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
