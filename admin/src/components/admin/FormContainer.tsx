'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FormContainerProps {
  children: ReactNode;
  className?: string;
}

export function FormContainer({ children, className }: FormContainerProps) {
  return (
    <div className={cn(
      "w-full max-w-[1200px] mx-auto p-6 sm:p-8 lg:p-10",
      "bg-gray-50 dark:bg-[#1a1a1a] min-h-screen",
      className
    )}>
      {children}
    </div>
  );
}

