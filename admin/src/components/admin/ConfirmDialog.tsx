import React from 'react';
import { BaseModal } from './BaseModal';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <BaseModal open={isOpen} onOpenChange={(open) => !open && onCancel()} title={title} maxWidth="md">
      <div className="p-6">
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-8">{message}</p>
        
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-[6px] text-sm font-normal border border-gray-400 bg-white hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-[6px] text-sm font-normal bg-red-600 hover:bg-red-700 text-white transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
