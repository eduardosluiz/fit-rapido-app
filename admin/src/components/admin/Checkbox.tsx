'use client';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Checkbox({ label, error, className = '', ...props }: CheckboxProps) {
  return (
    <div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          className={`
            w-4 h-4 text-[#c8921a] border-gray-300 rounded
            focus:ring-[#c8921a]/20 cursor-pointer
            ${error ? 'border-red-300' : ''}
            ${className}
          `}
          {...props}
        />
        {label && (
          <span className={`text-sm font-medium ${error ? 'text-red-600' : 'text-gray-700'}`}>
            {label}
          </span>
        )}
      </label>
      {error && (
        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
          <i className="bx bx-error-circle"></i>
          {error}
        </p>
      )}
    </div>
  );
}

