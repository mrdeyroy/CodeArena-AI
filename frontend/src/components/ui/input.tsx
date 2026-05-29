import * as React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', type = 'text', error, label, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-semibold text-slate-300 select-none">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={`w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 shadow-sm
            focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-150
            disabled:opacity-50 disabled:pointer-events-none
            ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/10' : ''}
            ${className}`}
          {...props}
        />
        {error && (
          <span className="text-xs text-rose-400 font-semibold mt-0.5">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
