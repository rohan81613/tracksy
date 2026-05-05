export function SkeletonLine({ className = '' }) {
  return (
    <div className={`bg-gray-200 rounded animate-pulse ${className}`} />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
      <SkeletonLine className="h-4 w-24" />
      <SkeletonLine className="h-8 w-32" />
      <SkeletonLine className="h-3 w-20" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <tr className="border-b border-gray-50">
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <SkeletonLine className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <>
      {[...Array(rows)].map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </>
  );
}
