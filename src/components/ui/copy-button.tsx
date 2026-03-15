'use client';

import * as React from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CopyButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  size?: 'sm' | 'md' | 'lg';
}

const iconSizes = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
} as const;

const buttonSizes = {
  sm: 'h-8 w-8',
  md: 'h-9 w-9',
  lg: 'h-10 w-10',
} as const;

const CopyButton = React.forwardRef<HTMLButtonElement, CopyButtonProps>(
  ({ className, text, size = 'md', ...props }, ref) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = React.useCallback(async () => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }, [text]);

    return (
      <button
        ref={ref}
        type="button"
        onClick={handleCopy}
        className={cn(
          'inline-flex items-center justify-center rounded-lg border border-white/10 transition-all duration-200',
          'text-gray-400 hover:text-white hover:bg-white/5',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
          copied && 'text-success border-success/30 bg-success/5',
          buttonSizes[size],
          className
        )}
        aria-label={copied ? 'Copied' : 'Copy to clipboard'}
        {...props}
      >
        {copied ? (
          <Check className={cn(iconSizes[size], 'text-success')} />
        ) : (
          <Copy className={iconSizes[size]} />
        )}
      </button>
    );
  }
);

CopyButton.displayName = 'CopyButton';

export { CopyButton };
