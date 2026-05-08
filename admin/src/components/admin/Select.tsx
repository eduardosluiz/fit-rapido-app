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
            className="block text-sm font-bold text-gray-800 mb-2.5"
            style={{
              fontWeight: '600',
              fontSize: '14px',
              color: '#1f2937',
              letterSpacing: '0.01em'
            }}
          >
            {label}
            {props.required && <span className="text-red-600 ml-1 font-bold">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`
              block w-full appearance-none border-2 rounded-lg px-4 py-2.5 text-sm font-medium pr-8
              focus:outline-none focus:ring-2 focus:ring-[#c8921a]/30 transition-all
              bg-white text-gray-900 cursor-pointer
              ${error 
                ? 'border-red-400 focus:border-red-500 bg-red-50' 
                : 'border-gray-300 focus:border-[#c8921a]'
              }
              ${className}
            `}
            style={{
              fontSize: '14px',
              fontWeight: '500',
              borderWidth: '2px',
              borderStyle: 'solid',
              borderColor: error ? '#f87171' : '#d1d5db',
              backgroundColor: error ? '#fef2f2' : '#ffffff',
              borderRadius: '8px',
              padding: '10px 16px',
              paddingRight: '40px',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              cursor: 'pointer',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              appearance: 'none'
            }}
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

