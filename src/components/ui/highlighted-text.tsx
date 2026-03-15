'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

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
    border: 'border-b-2 border-emerald-500/40',
    label: 'Human-like',
  },
  yellow: {
    bg: 'bg-yellow-500/15 hover:bg-yellow-500/25',
    border: 'border-b-2 border-yellow-500/40',
    label: 'Likely human',
  },
  orange: {
    bg: 'bg-orange-500/15 hover:bg-orange-500/25',
    border: 'border-b-2 border-orange-500/40',
    label: 'Possibly AI',
  },
  red: {
    bg: 'bg-rose-500/15 hover:bg-rose-500/25',
    border: 'border-b-2 border-rose-500/40',
    label: 'Likely AI',
  },
} as const;

const HighlightedText = React.forwardRef<HTMLDivElement, HighlightedTextProps>(
  ({ className, sentences, ...props }, ref) => (
    <TooltipProvider delayDuration={200}>
      <div
        ref={ref}
        className={cn(
          'text-sm leading-relaxed text-gray-200 dark:text-gray-300',
          className
        )}
        {...props}
      >
        {sentences.map((sentence, i) => {
          const { bg, border, label } = colorMap[sentence.color];

          return (
            <Tooltip key={i}>
              <TooltipTrigger asChild>
                <span
                  className={cn(
                    'inline rounded-sm px-0.5 py-0.5 transition-colors cursor-default',
                    bg,
                    border
                  )}
                >
                  {sentence.text}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{label}</span>
                  <span className="text-gray-400">&middot;</span>
                  <span className="tabular-nums">{Math.round(sentence.score)}% AI</span>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  )
);

HighlightedText.displayName = 'HighlightedText';

export { HighlightedText };
