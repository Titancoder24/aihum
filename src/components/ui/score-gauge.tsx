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

    // Arc from 180deg (left) to 0deg (right) — bottom semicircle inverted to top
    const startAngle = Math.PI;
    const endAngle = 0;
    const sweepAngle = startAngle - (startAngle - endAngle) * (clampedScore / 100);

    const startX = cx + radius * Math.cos(startAngle);
    const startY = cy - radius * Math.sin(startAngle);
    const endX = cx + radius * Math.cos(endAngle);
    const endY = cy - radius * Math.sin(endAngle);

    // Background arc path (full semicircle)
    const bgPath = `M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`;

    // Value arc endpoint
    const valEndX = cx + radius * Math.cos(sweepAngle);
    const valEndY = cy - radius * Math.sin(sweepAngle);
    const largeArc = clampedScore > 50 ? 1 : 0;
    const valuePath = `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${valEndX} ${valEndY}`;

    // Circumference of the semicircle for stroke animation
    const semiCircumference = Math.PI * radius;

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
        >
          {/* Background track */}
          <path
            d={bgPath}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="text-white/10"
          />
          {/* Animated value arc */}
          {clampedScore > 0 && (
            <MotionPath
              d={valuePath}
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
            />
          )}
        </svg>
        {/* Score value */}
        <div
          className="absolute flex flex-col items-center"
          style={{ bottom: strokeWidth / 2, left: '50%', transform: 'translateX(-50%)' }}
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
