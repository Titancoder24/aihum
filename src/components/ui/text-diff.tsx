'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextDiffProps extends React.HTMLAttributes<HTMLDivElement> {
  original: string;
  modified: string;
}

type DiffSegment = {
  text: string;
  type: 'unchanged' | 'removed' | 'added';
};

/**
 * Simple word-level diff using longest common subsequence approach.
 */
function computeDiff(original: string, modified: string): { left: DiffSegment[]; right: DiffSegment[] } {
  const origWords = original.split(/(\s+)/);
  const modWords = modified.split(/(\s+)/);

  // Build LCS table
  const m = origWords.length;
  const n = modWords.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (origWords[i - 1] === modWords[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack
  const left: DiffSegment[] = [];
  const right: DiffSegment[] = [];
  let i = m;
  let j = n;

  const leftStack: DiffSegment[] = [];
  const rightStack: DiffSegment[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && origWords[i - 1] === modWords[j - 1]) {
      leftStack.push({ text: origWords[i - 1], type: 'unchanged' });
      rightStack.push({ text: modWords[j - 1], type: 'unchanged' });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      rightStack.push({ text: modWords[j - 1], type: 'added' });
      j--;
    } else {
      leftStack.push({ text: origWords[i - 1], type: 'removed' });
      i--;
    }
  }

  leftStack.reverse().forEach((seg) => left.push(seg));
  rightStack.reverse().forEach((seg) => right.push(seg));

  return { left, right };
}

const DiffPane = ({
  segments,
  title,
  side,
}: {
  segments: DiffSegment[];
  title: string;
  side: 'left' | 'right';
}) => (
  <div className="flex-1 min-w-0">
    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
      {title}
    </p>
    <div className="rounded-lg border border-white/10 bg-surface-dark p-4 text-sm leading-relaxed text-gray-300 min-h-[120px]">
      {segments.map((seg, i) => (
        <span
          key={i}
          className={cn(
            seg.type === 'removed' &&
              'bg-danger/20 text-danger line-through rounded px-0.5',
            seg.type === 'added' &&
              'bg-success/20 text-success rounded px-0.5'
          )}
        >
          {seg.text}
        </span>
      ))}
    </div>
  </div>
);

const TextDiff = React.forwardRef<HTMLDivElement, TextDiffProps>(
  ({ className, original, modified, ...props }, ref) => {
    const { left, right } = React.useMemo(
      () => computeDiff(original, modified),
      [original, modified]
    );

    return (
      <div
        ref={ref}
        className={cn('flex flex-col sm:flex-row gap-4', className)}
        {...props}
      >
        <DiffPane segments={left} title="Original" side="left" />
        <DiffPane segments={right} title="Modified" side="right" />
      </div>
    );
  }
);

TextDiff.displayName = 'TextDiff';

export { TextDiff };
