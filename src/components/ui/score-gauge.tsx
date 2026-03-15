'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ScoreGaugeProps extends React.HTMLAttributes<HTMLDivElement> {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

function getScoreColor(score: number): string {
  if (score <= 25) return '#10B981';
  if (score <= 50) return '#F59E0B';
  if (score <= 75) return '#F97316';
  return '#F43F5E';
}

const MotionPath = motion.path;

const ScoreGauge = React.forwardRef<HTMLDivElement, ScoreGaugeProps>(
  ({ className, score, size = 200, strokeWidth = 14, label, ...props }, ref) => {
    const clampedScore = Math.min(100, Math.max(0, score));
    const color = getScoreColor(clampedScore);

    // Semi-circle geometry
    const radius = (size - strokeWidth) / 2;
    const cx = size / 2;
    const cy = size / 2;

    // Arc from 180deg to 0deg (left to right, bottom half is open)
    const startAngle = Math.PI;
    const endAngle = 0;
    const sweepAngle = startAngle - (startAngle - endAngle) * (clampedScore / 100);

    const startX = cx + radius * Math.cos(startAngle);
    const startY = cy - radius * Math.sin(startAngle);
    const bgEndX = cx + radius * Math.cos(endAngle);
    const bgEndY = cy - radius * Math.sin(endAngle);
    const fillEndX = cx + radius * Math.cos(sweepAngle);
    const fillEndY = cy - radius * Math.sin(sweepAngle);

    const bgPath = `M ${startX} ${startY} A ${radius} ${radius} 0 1 1 ${bgEndX} ${bgEndY}`;
    const fillPath =
      clampedScore <= 0
        ? ''
        : `M ${startX} ${startY} A ${radius} ${radius} 0 ${clampedScore > 50 ? 1 : 0} 1 ${fillEndX} ${fillEndY}`;

    const circumference = Math.PI * radius;

    return (
      <div
        ref={ref}
        className={cn('relative inline-flex flex-col items-center', className)}
        {...props}
      >
        <svg
          width={size}
          height={size / 2 + strokeWidth}
          viewBox={`0 0 ${size} ${size / 2 + strokeWidth}`}
          fill="none"
          className="overflow-visible"
        >
          {/* Background arc */}
          <path
            d={bgPath}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="text-white/10"
          />
          {/* Filled arc */}
          {fillPath && (
            <MotionPath
              d={fillPath}
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            />
          )}
        </svg>
        {/* Center score display */}
        <div
          className="absolute flex flex-col items-center"
          style={{ top: size / 2 - 10, left: '50%', transform: 'translateX(-50%)' }}
        >
          <span
            className="text-3xl font-bold tabular-nums"
            style={{ color }}
          >
            {Math.round(clampedScore)}%
          </span>
          {label && (
            <span className="text-xs text-gray-400 mt-0.5">{label}</span>
          )}
        </div>
      </div>
    );
  }
);

ScoreGauge.displayName = 'ScoreGauge';

export { ScoreGauge };
