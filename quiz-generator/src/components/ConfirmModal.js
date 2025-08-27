'use client';
import React from 'react';

export default function ConfirmModal({
  isOpen,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger' // 'danger' | 'default'
}) {
  if (!isOpen) return null;

  const confirmClass = variant === 'danger'
    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
    : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white w-full max-w-md mx-4 rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 id="confirm-title" className="text-lg font-semibold text-gray-800">{title}</h2>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-gray-700">{message}</p>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          {cancelText ? (
            <button onClick={onCancel} className="btn-ghost-light px-4 py-2">{cancelText}</button>
          ) : null}
          <button onClick={onConfirm} className={`text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 ${confirmClass}`}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}
