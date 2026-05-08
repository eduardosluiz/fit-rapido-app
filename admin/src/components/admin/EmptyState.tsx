'use client';

import { Button } from './Button';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  actionOnClick?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  actionOnClick,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <i className={`bx ${icon} text-3xl text-gray-400`}></i>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-md">{description}</p>
      {actionLabel && (actionHref || actionOnClick) && (
        <Button
          href={actionHref}
          onClick={actionOnClick}
          variant="primary"
          icon="bx-plus"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

