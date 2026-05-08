'use client';

import { ReactNode } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export function FormField({ 
  label, 
  required, 
  error, 
  helperText, 
  children, 
  className,
  fullWidth = false 
}: FormFieldProps) {
  return (
    <div className={cn(
      "w-full flex flex-col h-full",
      fullWidth && "md:col-span-2",
      className
    )} style={className?.includes('flex-1') ? { display: 'flex', flexDirection: 'column', flex: 1 } : undefined}>
      {label && (
        <Label className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5 mb-2 block flex-shrink-0">
          {label}
          {required && <span className="text-red-500 text-base font-bold ml-1">*</span>}
        </Label>
      )}
      <div className="relative w-full flex-shrink-0">
        {children}
      </div>
      {/* Renderizar a área de helperText/error apenas quando houver conteúdo */}
      {(error || helperText) && (
        <div className="mt-1.5 flex items-start flex-shrink-0">
          {error && (
            <p className="text-xs text-destructive flex items-center gap-1.5 font-medium">
              <i className="bx bx-error-circle text-sm"></i>
              {error}
            </p>
          )}
          {helperText && !error && (
            <p className="text-xs text-muted-foreground leading-relaxed">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
}

