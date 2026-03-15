'use client';

import * as React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string | number;
  /** Display label below the value */
  label?: string;
  /** Alias for label — used as the card heading */
  title?: string;
  /** Optional icon rendered beside the value */
  icon?: React.ReactNode;
  trend?: {
    direction: 'up' | 'down';
    value: string;
  };
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, value, label, title, icon, trend, ...props }, ref) => {
    const heading = title ?? label;

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl border border-white/10 bg-surface-dark p-5',
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-3xl font-bold tabular-nums tracking-tight text-white">
              {value}
            </p>
            {heading && <p className="mt-1 text-sm text-gray-400">{heading}</p>}
          </div>
          {icon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5">
              {icon}
            </div>
          )}
        </div>
        {trend && (
          <div
            className={cn(
              'mt-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
              trend.direction === 'up'
                ? 'bg-success/15 text-success'
                : 'bg-danger/15 text-danger'
            )}
          >
            {trend.direction === 'up' ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {trend.value}
          </div>
        )}
      </div>
    );
  }
);

StatCard.displayName = 'StatCard';

export { StatCard };
