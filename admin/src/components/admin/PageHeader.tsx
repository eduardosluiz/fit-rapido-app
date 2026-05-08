'use client';

import { Button } from './Button';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionHref?: string;
  actionOnClick?: () => void;
  actionIcon?: string;
}

export function PageHeader({
  title,
  subtitle,
  actionLabel,
  actionHref,
  actionOnClick,
  actionIcon = 'bx-plus',
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-0.5">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
      </div>
      {actionLabel && (actionHref || actionOnClick) && (
        <Button
          href={actionHref}
          onClick={actionOnClick}
          variant="primary"
          size="sm"
          icon={actionIcon}
          className="w-full sm:w-auto"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

