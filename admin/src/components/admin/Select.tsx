'use client';

import { forwardRef } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, placeholder, className = '', ...props }, ref) => {
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
        <div className="relative">
          <select
            ref={ref}
            className={`
              block w-full appearance-none border rounded-lg px-4 py-2 text-xs font-normal pr-8
              focus:outline-none focus:border-[#c8921a] transition-all
              bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300 cursor-pointer
              ${error 
                ? 'border-red-400 focus:border-red-500 bg-red-50 dark:bg-red-900/20' 
                : 'border-gray-300 dark:border-[#333]'
              }
              ${className}
            `}
            {...props}
          >
          {placeholder && (
            <option value="">{placeholder}</option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
            <i className="bx bx-chevron-down" style={{ fontSize: '18px', color: '#6b7280' }}></i>
          </div>
        </div>
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

Select.displayName = 'Select';

