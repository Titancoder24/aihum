'use client';

import * as React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string | number;
  label: string;
  trend?: {
    direction: 'up' | 'down';
    value: string;
  };
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, value, label, trend, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border border-white/10 bg-surface-dark p-5',
        className
      )}
      {...props}
    >
      <p className="text-3xl font-bold tabular-nums tracking-tight text-white">
        {value}
      </p>
      <p className="mt-1 text-sm text-gray-400">{label}</p>
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
  )
);

StatCard.displayName = 'StatCard';

export { StatCard };
