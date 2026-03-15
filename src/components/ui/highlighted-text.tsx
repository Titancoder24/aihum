'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

export interface HighlightedSentence {
  text: string;
  score: number;
  color: 'green' | 'yellow' | 'orange' | 'red';
}

export interface HighlightedTextProps extends React.HTMLAttributes<HTMLDivElement> {
  sentences: HighlightedSentence[];
}

const colorMap = {
  green: {
    bg: 'bg-emerald-500/15 hover:bg-emerald-500/25',
    border: 'border-emerald-500/30',
    text: 'text-emerald-300',
  },
  yellow: {
    bg: 'bg-yellow-500/15 hover:bg-yellow-500/25',
    border: 'border-yellow-500/30',
    text: 'text-yellow-300',
  },
  orange: {
    bg: 'bg-orange-500/15 hover:bg-orange-500/25',
    border: 'border-orange-500/30',
    text: 'text-orange-300',
  },
  red: {
    bg: 'bg-rose-500/15 hover:bg-rose-500/25',
    border: 'border-rose-500/30',
    text: 'text-rose-300',
  },
} as const;

const SentenceSpan = ({ sentence }: { sentence: HighlightedSentence }) => {
  const colors = colorMap[sentence.color];

  return (
    <TooltipPrimitive.Provider delayDuration={200}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          <span
            className={cn(
              'inline rounded px-0.5 py-0.5 cursor-default transition-colors duration-150',
              colors.bg
            )}
          >
            {sentence.text}
          </span>
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            sideOffset={6}
            className={cn(
              'z-50 rounded-lg border border-white/10 bg-surface-dark px-3 py-2 shadow-xl animate-fade-in',
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'inline-block h-2 w-2 rounded-full',
                  sentence.color === 'green' && 'bg-emerald-500',
                  sentence.color === 'yellow' && 'bg-yellow-500',
                  sentence.color === 'orange' && 'bg-orange-500',
                  sentence.color === 'red' && 'bg-rose-500'
                )}
              />
              <span className="text-xs text-gray-300">
                AI Score: <span className={cn('font-semibold', colors.text)}>{sentence.score}%</span>
              </span>
            </div>
            <TooltipPrimitive.Arrow className="fill-surface-dark" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};

const HighlightedText = React.forwardRef<HTMLDivElement, HighlightedTextProps>(
  ({ className, sentences, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border border-white/10 bg-surface-dark p-4 text-sm leading-relaxed text-gray-200',
        className
      )}
      {...props}
    >
      {sentences.map((sentence, i) => (
        <SentenceSpan key={i} sentence={sentence} />
      ))}
    </div>
  )
);

HighlightedText.displayName = 'HighlightedText';

export { HighlightedText };
