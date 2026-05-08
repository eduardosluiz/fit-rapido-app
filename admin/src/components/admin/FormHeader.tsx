'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface FormHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  action?: ReactNode;
  className?: string;
}

export function FormHeader({ title, subtitle, icon, action, className }: FormHeaderProps) {
  return (
    <Card className={cn(
      "border-0 shadow-md bg-gradient-to-br from-white via-gray-50/30 to-white dark:from-[#1a1a1a] dark:via-[#0f0f0f] dark:to-[#1a1a1a]",
      "backdrop-blur-sm rounded-xl mb-8",
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
            <div className="flex-1 space-y-2">
              <h1 className={cn(
                "text-3xl sm:text-4xl font-bold tracking-tight",
                "bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white",
                "[background-clip:text] [-webkit-background-clip:text] text-transparent"
              )}>
                {title}
              </h1>
              {subtitle && (
                <p className={cn(
                  "text-base sm:text-lg",
                  "text-gray-600 dark:text-gray-400"
                )}>
                  {subtitle}
                </p>
              )}
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

