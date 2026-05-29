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
        className={`bg-slate-900/60 border border-slate-800/80 rounded-xl p-6 shadow-sm text-slate-100 transition-all duration-300 backdrop-blur-sm
          ${glow ? 'shadow-[0_4px_20px_rgba(99,102,241,0.12)] border-indigo-500/30 bg-slate-900/80' : ''}
          ${hoverGlow ? 'hover:shadow-[0_8px_30px_rgba(99,102,241,0.15)] hover:border-indigo-500/40 hover:bg-slate-900/85 hover:scale-[1.005]' : ''}
          ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
