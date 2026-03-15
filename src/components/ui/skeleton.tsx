'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Render as a circle (width and height should be the same) */
  circle?: boolean;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, circle = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'animate-pulse bg-white/[0.08] dark:bg-white/[0.06]',
        circle ? 'rounded-full' : 'rounded-lg',
        className
      )}
      {...props}
    />
  )
);

Skeleton.displayName = 'Skeleton';

export { Skeleton };
