'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'relative inline-flex items-center gap-1 border-b border-white/10',
      className
    )}
    {...props}
  />
));
TabsList.displayName = 'TabsList';

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'relative inline-flex items-center justify-center whitespace-nowrap px-4 py-2.5 text-sm font-medium text-gray-400 transition-colors',
      'hover:text-gray-200',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
      'disabled:pointer-events-none disabled:opacity-50',
      'data-[state=active]:text-white',
      className
    )}
    {...props}
  >
    {props.children}
    <TabsPrimitive.Trigger
      value={props.value}
      asChild
      disabled
      className="pointer-events-none absolute inset-0"
    >
      <span>
        {/* Active underline rendered via CSS for the active trigger */}
      </span>
    </TabsPrimitive.Trigger>
  </TabsPrimitive.Trigger>
));
TabsTrigger.displayName = 'TabsTrigger';

/* Animated underline component to be placed inside TabsList */
interface TabsIndicatorProps {
  activeValue: string;
  layoutId?: string;
}

const MotionSpan = motion.span;

function TabsIndicator({ layoutId = 'tab-indicator' }: TabsIndicatorProps) {
  return (
    <MotionSpan
      layoutId={layoutId}
      className="absolute bottom-0 left-0 h-0.5 w-full bg-primary rounded-full"
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    />
  );
}

/* Simpler approach: use data-state styling for the underline */
const TabsTriggerWithIndicator = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'relative inline-flex items-center justify-center whitespace-nowrap px-4 py-2.5 text-sm font-medium text-gray-400 transition-colors',
      'hover:text-gray-200',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
      'disabled:pointer-events-none disabled:opacity-50',
      'data-[state=active]:text-white',
      className
    )}
    {...props}
  >
    {children}
    <span className="absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 bg-primary rounded-full transition-transform duration-200 data-[state=active]:scale-x-100" />
  </TabsPrimitive.Trigger>
));
TabsTriggerWithIndicator.displayName = 'TabsTriggerWithIndicator';

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
      'data-[state=inactive]:hidden',
      'animate-fade-in',
      className
    )}
    {...props}
  />
));
TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsTriggerWithIndicator, TabsContent, TabsIndicator };
