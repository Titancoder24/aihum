'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BarItem {
  label: string;
  value: number;
  color?: string;
}

export interface ChartBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Array of bars to render */
  bars?: BarItem[];
  /** Single bar label (when used as individual bar) */
  label?: string;
  /** Single bar value 0-100 (when used as individual bar) */
  value?: number;
  /** Maximum scale value */
  maxValue?: number;
  /** Weight indicator (optional, displayed if provided) */
  weight?: number;
  /** Whether to show values on the right */
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

function SingleBar({
  label,
  value,
  maxValue = 100,
  weight,
  colorClass,
  showValue = true,
}: {
  label: string;
  value: number;
  maxValue: number;
  weight?: number;
  colorClass: string;
  showValue: boolean;
}) {
  const pct = Math.min(100, Math.max(0, (value / maxValue) * 100));

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-400">{label}</span>
        <div className="flex items-center gap-2">
          {weight !== undefined && (
            <span className="text-[10px] text-gray-600">
              w:{weight}
            </span>
          )}
          {showValue && (
            <span className="text-xs tabular-nums text-gray-500">{value}</span>
          )}
        </div>
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
}

const ChartBar = React.forwardRef<HTMLDivElement, ChartBarProps>(
  ({ className, bars, label, value, maxValue = 100, weight, showValue = true, ...props }, ref) => {
    // Single-bar mode: when label & value are provided directly
    if (label !== undefined && value !== undefined) {
      return (
        <div ref={ref} className={cn(className)} {...props}>
          <SingleBar
            label={label}
            value={value}
            maxValue={maxValue}
            weight={weight}
            colorClass="bg-primary"
            showValue={showValue}
          />
        </div>
      );
    }

    // Multi-bar mode: render from bars array
    return (
      <div ref={ref} className={cn('space-y-3', className)} {...props}>
        {bars?.map((bar, i) => (
          <SingleBar
            key={i}
            label={bar.label}
            value={bar.value}
            maxValue={maxValue}
            colorClass={bar.color ?? defaultColors[i % defaultColors.length]}
            showValue={showValue}
          />
        ))}
      </div>
    );
  }
);

ChartBar.displayName = 'ChartBar';

export { ChartBar };
