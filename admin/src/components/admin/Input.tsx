'use client';

import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="mb-4">
        {label && (
          <label 
            className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2.5"
            style={{
              fontWeight: '600',
              fontSize: '14px',
              letterSpacing: '0.01em'
            }}
          >
            {label}
            {props.required && <span className="text-red-600 ml-1 font-bold">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full border-2 rounded-lg px-4 py-2.5 text-sm font-medium
            focus:outline-none focus:ring-2 focus:ring-[#c8921a]/30 transition-all
            bg-white dark:bg-[#252525] text-gray-900 dark:text-white
            placeholder-gray-400 dark:placeholder-gray-500
            ${error 
              ? 'border-red-400 focus:border-red-500 bg-red-50 dark:bg-red-900/20' 
              : 'border-gray-300 dark:border-[#333] focus:border-[#c8921a]'
            }
            ${className}
          `}
          style={{
            fontSize: '14px',
            fontWeight: '500',
            borderWidth: '2px',
            borderStyle: 'solid',
            borderRadius: '8px',
            padding: '10px 16px',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            cursor: 'text'
          }}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
            <i className="bx bx-error-circle"></i>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

