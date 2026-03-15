'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';
import { Spinner } from './spinner';

const buttonVariants = {
  primary:
    'bg-gradient-to-r from-primary to-violet-500 text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:brightness-110 active:brightness-95',
  secondary:
    'bg-surface-dark text-white border border-white/10 hover:border-white/20 hover:bg-white/5 dark:bg-white/5 dark:hover:bg-white/10',
  ghost:
    'text-gray-300 hover:text-white hover:bg-white/5 dark:text-gray-400 dark:hover:text-white',
  danger:
    'bg-danger text-white shadow-lg shadow-danger/25 hover:shadow-danger/40 hover:brightness-110 active:brightness-95',
} as const;

const buttonSizes = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-md',
  md: 'h-10 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-12 px-6 text-base gap-2.5 rounded-xl',
} as const;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
  loading?: boolean;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      asChild = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    const isDisabled = disabled || loading;

    return (
      <Comp
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background-dark',
          buttonVariants[variant],
          buttonSizes[size],
          isDisabled && 'pointer-events-none opacity-50',
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <Spinner
            size={size === 'lg' ? 'md' : 'sm'}
            className="shrink-0"
          />
        )}
        {children}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants, buttonSizes };
