'use client';

import * as React from 'react';
import { cn, wordCount } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  showCount?: 'chars' | 'words' | 'both';
  maxChars?: number;
  maxWords?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      showCount,
      maxChars,
      maxWords,
      id,
      value,
      defaultValue,
      onChange,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const internalRef = React.useRef<HTMLTextAreaElement | null>(null);
    const [internalValue, setInternalValue] = React.useState(
      (defaultValue as string) ?? ''
    );

    const currentValue = value !== undefined ? String(value) : internalValue;
    const charCount = currentValue.length;
    const words = wordCount(currentValue);

    const autoGrow = React.useCallback(() => {
      const el = internalRef.current;
      if (!el) return;
      el.style.height = 'auto';
      el.style.height = `${Math.max(el.scrollHeight, 200)}px`;
    }, []);

    React.useEffect(() => {
      autoGrow();
    }, [currentValue, autoGrow]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInternalValue(e.target.value);
      onChange?.(e);
    };

    const setRefs = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        internalRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      },
      [ref]
    );

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-300 dark:text-gray-400"
          >
            {label}
          </label>
        )}
        <textarea
          ref={setRefs}
          id={inputId}
          value={value}
          defaultValue={value !== undefined ? undefined : defaultValue}
          onChange={handleChange}
          className={cn(
            'flex min-h-[200px] w-full resize-none rounded-lg border bg-surface-dark px-3 py-3 text-sm text-white placeholder:text-gray-500 transition-all duration-200',
            'border-white/10 hover:border-white/20',
            'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'dark:bg-white/5 dark:text-white',
            error && 'border-danger focus:ring-danger/50 focus:border-danger',
            className
          )}
          {...props}
        />
        <div className="flex items-center justify-between">
          {error && <p className="text-xs text-danger">{error}</p>}
          {showCount && (
            <p className="ml-auto text-xs text-gray-500">
              {(showCount === 'chars' || showCount === 'both') && (
                <span>
                  {charCount}
                  {maxChars ? `/${maxChars}` : ''} chars
                </span>
              )}
              {showCount === 'both' && <span className="mx-1.5">&middot;</span>}
              {(showCount === 'words' || showCount === 'both') && (
                <span>
                  {words}
                  {maxWords ? `/${maxWords}` : ''} words
                </span>
              )}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
