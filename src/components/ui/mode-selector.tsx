'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export interface HumanizationMode {
  name: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

export interface ModeSelectorProps extends React.HTMLAttributes<HTMLDivElement> {
  modes: HumanizationMode[];
  selected: string;
  onSelect: (name: string) => void;
}

const ModeSelector = React.forwardRef<HTMLDivElement, ModeSelectorProps>(
  ({ className, modes, selected, onSelect, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3', className)}
      {...props}
    >
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isSelected = mode.name === selected;

        return (
          <button
            key={mode.name}
            type="button"
            onClick={() => onSelect(mode.name)}
            className={cn(
              'group relative flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200',
              'hover:bg-white/[0.03]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
              isSelected
                ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                : 'border-white/10 bg-surface-dark'
            )}
          >
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                isSelected
                  ? 'bg-primary/15 text-primary'
                  : 'bg-white/5 text-gray-400 group-hover:text-gray-300'
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p
                className={cn(
                  'text-sm font-semibold transition-colors',
                  isSelected ? 'text-white' : 'text-gray-200'
                )}
              >
                {mode.label}
              </p>
              <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">
                {mode.description}
              </p>
            </div>
            {isSelected && (
              <div className="absolute right-3 top-3 h-2 w-2 rounded-full bg-primary shadow-lg shadow-primary/50" />
            )}
          </button>
        );
      })}
    </div>
  )
);

ModeSelector.displayName = 'ModeSelector';

export { ModeSelector };
