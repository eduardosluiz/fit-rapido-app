'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FormSectionProps {
  title: string;
  icon?: string;
  children: ReactNode;
  className?: string;
  isFirst?: boolean;
}

export function FormSection({ title, icon, children, className, isFirst = false }: FormSectionProps) {
  return (
    <div className={cn(
      "space-y-6",
      !isFirst && "pt-8 border-t border-gray-200 dark:border-[#333]",
      className
    )}>
      <div className="border-b-2 border-gray-200 dark:border-[#333] pb-3">
        <h3 className={cn(
          "text-xl font-bold",
          "text-gray-900 dark:text-white",
          "flex items-center gap-3"
        )}>
          {icon && (
            <i className={cn(
              icon,
              "text-[#c8921a]",
              "text-2xl"
            )}></i>
          )}
          {title}
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {children}
      </div>
    </div>
  );
}

