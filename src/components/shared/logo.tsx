'use client';

import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: { svg: 28, text: 'text-lg' },
  md: { svg: 36, text: 'text-xl' },
  lg: { svg: 48, text: 'text-2xl' },
} as const;

export function Logo({ className, showWordmark = true, size = 'md' }: LogoProps) {
  const { svg, text } = sizeMap[size];

  return (
    <a href="/" className={cn('flex items-center gap-2.5 select-none', className)}>
      <svg
        width={svg}
        height={svg}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          <linearGradient id="logo-glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        {/* Background rounded square */}
        <rect
          x="2"
          y="2"
          width="44"
          height="44"
          rx="12"
          fill="url(#logo-glow)"
          stroke="url(#logo-gradient)"
          strokeWidth="1.5"
        />
        {/* H letter */}
        <path
          d="M12 12V36M12 24H23M23 12V36"
          stroke="url(#logo-gradient)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* E letter */}
        <path
          d="M28 12H38M28 12V36M28 24H36M28 36H38"
          stroke="url(#logo-gradient)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {showWordmark && <Wordmark className={text} />}
    </a>
  );
}

function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('font-bold tracking-tight', className)}>
      <span className="gradient-text">Humanize</span>
      <span className="text-gray-100">Elite</span>
    </span>
  );
}

export { Wordmark };
