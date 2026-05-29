import * as React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
}

export const Badge = ({ className = '', variant = 'primary', children, ...props }: BadgeProps) => {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors';
  
  const variants = {
    primary: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20 hover:bg-indigo-500/15',
    secondary: 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700/50',
    success: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/15',
    warning: 'bg-amber-500/10 text-amber-300 border-amber-500/20 hover:bg-amber-500/15',
    danger: 'bg-rose-500/10 text-rose-300 border-rose-500/20 hover:bg-rose-500/15',
    info: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20 hover:bg-cyan-500/15',
    outline: 'bg-transparent text-slate-400 border border-slate-700 hover:bg-slate-800/30',
  };

  return (
    <span
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
