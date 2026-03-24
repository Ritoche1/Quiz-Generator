'use client';

export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="text-center py-12 px-4">
      {icon && <div className="text-5xl mb-4">{icon}</div>}
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>}
      {description && <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">{description}</p>}
      {action}
    </div>
  );
}
