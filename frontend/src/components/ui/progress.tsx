import * as React from 'react';

// --- Linear Progress Bar ---
interface ProgressProps {
  value: number; // 0 to 100
  className?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

export const Progress = ({ value, className = '', color = 'primary' }: ProgressProps) => {
  const colors = {
    primary: 'bg-indigo-500',
    secondary: 'bg-cyan-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
  };

  return (
    <div className={`w-full bg-slate-800 rounded-full h-2 overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ease-out ${colors[color]}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
};

// --- Radial Progress Ring ---
interface ProgressRingProps {
  value: number; // 0 to 100
  size?: number; // width/height in px
  strokeWidth?: number;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  className?: string;
  showText?: boolean;
}

export const ProgressRing = ({
  value,
  size = 64,
  strokeWidth = 6,
  color = 'primary',
  className = '',
  showText = true,
}: ProgressRingProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  const textColors = {
    primary: 'text-indigo-400',
    secondary: 'text-cyan-400',
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    danger: 'text-rose-400',
  };

  const strokeColors = {
    primary: 'stroke-indigo-500',
    secondary: 'stroke-cyan-500',
    success: 'stroke-emerald-500',
    warning: 'stroke-amber-500',
    danger: 'stroke-rose-500',
  };

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        {/* Track circle */}
        <circle
          className="stroke-slate-800"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <circle
          className={`transition-all duration-500 ease-out ${strokeColors[color]}`}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {showText && (
        <span className={`absolute text-sm font-bold tracking-tight ${textColors[color]}`}>
          {value}%
        </span>
      )}
    </div>
  );
};
