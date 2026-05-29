import * as React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  hoverGlow?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', glow = false, hoverGlow = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 shadow-sm text-slate-100 transition-all duration-300
          ${glow ? 'shadow-[0_0_15px_rgba(99,102,241,0.15)] border-indigo-500/20' : ''}
          ${hoverGlow ? 'hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:border-indigo-500/30' : ''}
          ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
