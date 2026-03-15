'use client';

import * as React from 'react';
import * as TogglePrimitive from '@radix-ui/react-toggle';
import { cn } from '@/lib/utils';

export interface ToggleProps
  extends React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> {
  size?: 'sm' | 'md' | 'lg';
}

const toggleSizes = {
  sm: 'h-8 px-2.5 text-xs',
  md: 'h-10 px-3 text-sm',
  lg: 'h-12 px-4 text-base',
} as const;

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  ToggleProps
>(({ className, size = 'md', ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200',
      'border border-white/10 text-gray-400 bg-transparent',
      'hover:bg-white/5 hover:text-gray-200',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
      'disabled:pointer-events-none disabled:opacity-50',
      'data-[state=on]:bg-primary/15 data-[state=on]:text-primary data-[state=on]:border-primary/30',
      toggleSizes[size],
      className
    )}
    {...props}
  />
));

Toggle.displayName = 'Toggle';

export { Toggle };
