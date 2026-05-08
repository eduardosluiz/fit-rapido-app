'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface BaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  icon?: string;
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  showCloseButton?: boolean;
  headerAction?: React.ReactNode;
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
};

export function BaseModal({
  open,
  onOpenChange,
  title,
  description,
  icon,
  children,
  className,
  maxWidth = 'lg',
  showCloseButton = true,
  headerAction,
}: BaseModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'max-h-[85vh] overflow-hidden flex flex-col p-0',
          'bg-white dark:bg-[#1a1a1a]',
          'border border-gray-200 dark:border-[#333]',
          'rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]',
          maxWidthClasses[maxWidth],
          className
        )}
      >
        <DialogHeader className="px-4 pt-4 pb-3 border-b border-gray-200 dark:border-[#333] relative">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              {icon && (
                <div className="p-1.5 bg-gradient-to-br from-[#c8921a]/10 to-[#c8921a]/5 dark:from-[#c8921a]/20 dark:to-[#c8921a]/10 rounded-lg flex-shrink-0">
                  <i className={cn(icon, 'text-[#c8921a] text-base')}></i>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white leading-tight truncate">
                  {title}
                </DialogTitle>
                {description && (
                  <DialogDescription className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                    {description}
                  </DialogDescription>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {headerAction && (
                <div className="flex-shrink-0">
                  {headerAction}
                </div>
              )}
              {showCloseButton && (
                <button
                  onClick={() => onOpenChange(false)}
                  className="flex items-center justify-center px-2 py-1 text-xs font-semibold transition-all shadow-sm hover:shadow-md rounded-lg bg-white dark:bg-[#252525] text-red-600 dark:text-red-400 border border-red-600 dark:border-red-500 hover:border-red-700 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  aria-label="Fechar"
                >
                  <i className="bx bx-x text-sm text-red-600 dark:text-red-400"></i>
                </button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 py-3" style={{ scrollbarWidth: 'thin', scrollbarColor: '#c8921a #f3f4f6' }}>
          <div className="space-y-2">{children}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

