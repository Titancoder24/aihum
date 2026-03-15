'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-dark px-4">
      <div className="text-center max-w-lg">
        {/* Illustration */}
        <div className="mb-8">
          <div className="relative mx-auto w-48 h-48">
            <div className="absolute inset-0 rounded-full bg-danger/10 animate-pulse-slow" />
            <div className="absolute inset-4 rounded-full bg-danger/5 flex items-center justify-center">
              <svg
                className="w-20 h-20 text-danger"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-100 mb-4">
          Something went wrong
        </h1>
        <p className="text-gray-400 mb-8 text-lg">
          An unexpected error occurred. Please try again or contact support
          if the problem persists.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white gradient-primary hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-gray-300 glass hover:bg-white/10 transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
