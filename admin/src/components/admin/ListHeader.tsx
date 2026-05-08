'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface ListHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  count?: number;
  countLabel?: string;
  action?: ReactNode;
  className?: string;
}

export function ListHeader({ 
  title, 
  subtitle, 
  icon, 
  count, 
  countLabel = 'item',
  action,
  className 
}: ListHeaderProps) {
  return (
    <Card className={cn(
      "border-0 shadow-md bg-gradient-to-br from-white via-gray-50/30 to-white dark:from-[#1a1a1a] dark:via-[#0f0f0f] dark:to-[#1a1a1a]",
      "backdrop-blur-sm rounded-xl",
      className
    )}>
      <div className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-start gap-4 flex-1">
            {icon && (
              <div className="p-3 bg-gradient-to-br from-[#c8921a]/10 via-[#c8921a]/5 to-transparent dark:from-[#c8921a]/20 dark:via-[#c8921a]/10 rounded-xl shadow-sm border border-[#c8921a]/10 dark:border-[#c8921a]/20">
                <i className={cn(icon, "text-[#c8921a] text-2xl sm:text-3xl")}></i>
              </div>
            )}
            <div className="flex-1 space-y-3">
              <h1 className={cn(
                "text-4xl sm:text-5xl font-bold tracking-tight",
                "bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white",
                "[background-clip:text] [-webkit-background-clip:text] text-transparent"
              )}>
                {title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-2.5">
                {subtitle && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700/50 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c8921a] animate-pulse"></span>
                    {subtitle}
                  </span>
                )}
                {count !== undefined && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-[#c8921a]/10 to-[#c8921a]/5 dark:from-[#c8921a]/20 dark:to-[#c8921a]/10 text-[#c8921a] border border-[#c8921a]/20 dark:border-[#c8921a]/30 shadow-sm">
                    <i className="bx bx-stats text-xs"></i>
                    {count} {countLabel}{count !== 1 ? (countLabel.endsWith('s') ? '' : 's') : ''}
                  </span>
                )}
              </div>
            </div>
          </div>
          {action && (
            <div className="flex-shrink-0">
              {action}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

