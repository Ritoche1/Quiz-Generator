'use client';

export default function Skeleton({ className = '', count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`skeleton ${className}`}>&nbsp;</div>
      ))}
    </>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="skeleton h-5 w-3/4 mb-3" />
      <div className="skeleton h-4 w-full mb-2" />
      <div className="skeleton h-4 w-2/3 mb-4" />
      <div className="flex gap-3">
        <div className="skeleton h-8 w-20" />
        <div className="skeleton h-8 w-16" />
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-100">
      <div className="skeleton h-10 w-10 rounded-full" />
      <div className="flex-1">
        <div className="skeleton h-4 w-1/3 mb-2" />
        <div className="skeleton h-3 w-1/4" />
      </div>
      <div className="skeleton h-4 w-16" />
    </div>
  );
}
