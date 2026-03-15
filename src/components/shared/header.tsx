'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from './logo';
import { ThemeToggle } from './theme-toggle';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Blog', href: '/blog' },
  { label: 'Docs', href: '/docs' },
] as const;

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-background-dark/80 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/10'
          : 'bg-transparent'
      )}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Logo size="sm" />

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={cn(
                  'px-3.5 py-2 rounded-lg text-sm font-medium',
                  'text-gray-400 hover:text-gray-100',
                  'hover:bg-white/5 transition-colors duration-200'
                )}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop right side */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <a
              href="/app"
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-semibold',
                'bg-gradient-to-r from-primary to-violet-500',
                'text-white shadow-lg shadow-primary/25',
                'hover:shadow-xl hover:shadow-primary/30 hover:brightness-110',
                'transition-all duration-200'
              )}
            >
              Try Free
            </a>
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                'flex items-center justify-center w-9 h-9 rounded-lg',
                'bg-white/5 hover:bg-white/10 border border-white/10',
                'transition-colors duration-200'
              )}
              aria-label="Toggle menu"
              aria-expanded={isOpen}
            >
              {isOpen ? (
                <X className="w-4 h-4 text-gray-300" />
              ) : (
                <Menu className="w-4 h-4 text-gray-300" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile slide-out menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 top-16 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={cn(
                'fixed top-16 right-0 bottom-0 w-72 md:hidden',
                'bg-surface-dark/95 backdrop-blur-xl',
                'border-l border-white/5',
                'flex flex-col p-6'
              )}
            >
              <div className="flex flex-col gap-1">
                {navLinks.map((link, i) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 + 0.1 }}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'px-4 py-3 rounded-lg text-base font-medium',
                      'text-gray-300 hover:text-white',
                      'hover:bg-white/5 transition-colors duration-200'
                    )}
                  >
                    {link.label}
                  </motion.a>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-white/10">
                <a
                  href="/app"
                  className={cn(
                    'flex items-center justify-center w-full',
                    'px-4 py-3 rounded-lg text-sm font-semibold',
                    'bg-gradient-to-r from-primary to-violet-500',
                    'text-white shadow-lg shadow-primary/25',
                    'hover:shadow-xl hover:shadow-primary/30',
                    'transition-all duration-200'
                  )}
                >
                  Try Free
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
