import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found',
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-dark px-4">
      <div className="text-center max-w-lg">
        {/* Illustration */}
        <div className="mb-8">
          <div className="relative mx-auto w-48 h-48">
            <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse-slow" />
            <div className="absolute inset-4 rounded-full bg-primary/5 flex items-center justify-center">
              <span className="text-8xl font-bold gradient-text">404</span>
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-100 mb-4">
          Page not found
        </h1>
        <p className="text-gray-400 mb-8 text-lg">
          The page you are looking for does not exist or has been moved.
          Let us get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white gradient-primary hover:opacity-90 transition-opacity"
          >
            Back to Home
          </Link>
          <Link
            href="/detector"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-gray-300 glass hover:bg-white/10 transition-colors"
          >
            Try AI Detector
          </Link>
        </div>
      </div>
    </div>
  );
}
