'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const progressColors = {
  primary: 'bg-gradient-to-r from-primary to-violet-500',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
} as const;

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  color?: keyof typeof progressColors;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, color = 'primary', ...props }, ref) => {
    const pct = Math.min(100, Math.max(0, (value / max) * 100));

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={cn(
          'relative h-2 w-full overflow-hidden rounded-full bg-white/10',
          className
        )}
        {...props}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            progressColors[color]
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    );
  }
);

Progress.displayName = 'Progress';

export { Progress, progressColors };
