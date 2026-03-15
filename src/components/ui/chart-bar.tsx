'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BarItem {
  label: string;
  value: number;
  color?: string;
}

export interface ChartBarProps extends React.HTMLAttributes<HTMLDivElement> {
  bars: BarItem[];
  maxValue?: number;
  showValue?: boolean;
}

const defaultColors = [
  'bg-primary',
  'bg-violet-500',
  'bg-success',
  'bg-warning',
  'bg-danger',
  'bg-sky-500',
  'bg-pink-500',
  'bg-amber-500',
];

const ChartBar = React.forwardRef<HTMLDivElement, ChartBarProps>(
  ({ className, bars, maxValue, showValue = true, ...props }, ref) => {
    const max = maxValue ?? Math.max(...bars.map((b) => b.value), 1);

    return (
      <div ref={ref} className={cn('space-y-3', className)} {...props}>
        {bars.map((bar, i) => {
          const pct = Math.min(100, Math.max(0, (bar.value / max) * 100));
          const colorClass = bar.color ?? defaultColors[i % defaultColors.length];

          return (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">
                  {bar.label}
                </span>
                {showValue && (
                  <span className="text-xs tabular-nums text-gray-500">
                    {bar.value}
                  </span>
                )}
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-700 ease-out',
                    colorClass
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }
);

ChartBar.displayName = 'ChartBar';

export { ChartBar };
