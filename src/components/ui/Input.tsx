import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="mb-4">
        {label && <label className="block text-text-secondary font-medium text-[13px] mb-2">{label}</label>}
        <input
          ref={ref}
          className={`w-full bg-bg-input border ${error ? 'border-danger focus:ring-danger' : 'border-border focus:border-accent focus:ring-accent'} rounded-xl px-4 py-3 text-[14px] text-text-primary focus:outline-none focus:ring-1 transition-all ${className}`}
          {...props}
        />
        {error && <p className="text-danger text-[12px] mt-1.5">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: {value: string, label: string}[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    return (
      <div className="mb-4">
        {label && <label className="block text-text-secondary font-medium text-[13px] mb-2">{label}</label>}
        <select
          ref={ref}
          className={`w-full bg-bg-input border ${error ? 'border-danger focus:ring-danger' : 'border-border focus:border-accent focus:ring-accent'} rounded-xl px-4 py-3 text-[14px] text-text-primary focus:outline-none focus:ring-1 transition-all appearance-none ${className}`}
          {...props}
        >
          {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        {error && <p className="text-danger text-[12px] mt-1.5">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
