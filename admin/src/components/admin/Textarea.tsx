'use client';

import { forwardRef } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="mb-4">
        {label && (
          <label 
            className="block text-xs font-normal text-gray-700 dark:text-gray-300 mb-2.5 uppercase tracking-wide"
          >
            {label}
            {props.required && <span className="text-red-600 ml-1 font-normal">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          className={`
            w-full border rounded-lg px-4 py-2 text-xs font-normal
            focus:outline-none focus:border-[#c8921a] transition-all
            bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300
            ${error 
              ? 'border-red-400 focus:border-red-500 bg-red-50 dark:bg-red-900/20' 
              : 'border-gray-300 dark:border-[#333]'
            }
            ${className}
          `}
          style={{ minHeight: '100px' }}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
            <i className="bx bx-error-circle"></i>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-xs text-gray-500 mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

