'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ListContainerProps {
  children: ReactNode;
  className?: string;
}

export function ListContainer({ children, className }: ListContainerProps) {
  return (
    <div className={cn(
      "w-full max-w-[1800px] mx-auto p-6 sm:p-8 lg:p-10",
      "bg-gray-50 dark:bg-[#0f0f0f] min-h-screen",
      className
    )}>
      {children}
    </div>
  );
}

