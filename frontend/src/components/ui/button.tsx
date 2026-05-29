import * as React from 'react';
import { LucideIcon } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', icon: Icon, iconPosition = 'left', isLoading, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/10 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none';
    
    const variants = {
      primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm border border-indigo-700 hover:border-indigo-800 focus-visible:ring-indigo-500/20',
      secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 shadow-sm focus-visible:ring-slate-700/30',
      outline: 'bg-transparent border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-100 hover:border-slate-600 shadow-sm focus-visible:ring-slate-700/20',
      ghost: 'bg-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200 focus-visible:ring-slate-800/50',
      danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm border border-rose-700 hover:border-rose-800 focus-visible:ring-rose-500/20',
      success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm border border-emerald-700 hover:border-emerald-800 focus-visible:ring-emerald-500/20',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-5 py-2.5 text-base gap-2.5',
      icon: 'p-2 text-sm',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {!isLoading && Icon && iconPosition === 'left' && <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />}
        {children}
        {!isLoading && Icon && iconPosition === 'right' && <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />}
      </button>
    );
  }
);

Button.displayName = 'Button';
