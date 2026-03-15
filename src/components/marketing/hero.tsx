'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const avatars = [
  { color: 'bg-primary', initials: 'JM' },
  { color: 'bg-violet-500', initials: 'SK' },
  { color: 'bg-success', initials: 'AR' },
  { color: 'bg-warning', initials: 'LP' },
  { color: 'bg-danger', initials: 'TC' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function Hero() {
  return (
    <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden pt-16">
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 -z-10">
        <div
          className={cn(
            'absolute inset-0',
            'bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.25),transparent)]'
          )}
        />
        <div
          className={cn(
            'absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full',
            'bg-primary/10 blur-[128px] animate-pulse-slow'
          )}
        />
        <div
          className={cn(
            'absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full',
            'bg-violet-500/10 blur-[128px] animate-pulse-slow',
            'animation-delay-[2s]'
          )}
        />
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
          className="mb-8"
        >
          <span
            className={cn(
              'inline-flex items-center gap-2 px-4 py-1.5 rounded-full',
              'text-xs font-medium tracking-wide',
              'bg-primary/10 text-primary-300 border border-primary/20'
            )}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Now in public beta
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
          className={cn(
            'text-4xl sm:text-5xl md:text-6xl lg:text-7xl',
            'font-extrabold tracking-tight leading-[1.1]',
            'max-w-4xl mx-auto'
          )}
        >
          The World&apos;s Most Advanced{' '}
          <span className="gradient-text">AI Text Platform</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={2}
          className={cn(
            'mt-6 text-lg sm:text-xl text-gray-400',
            'max-w-2xl mx-auto leading-relaxed'
          )}
        >
          Detect AI content with surgical precision. Humanize it beyond detection.
          Built for the 0.1%.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={3}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="/app"
            className={cn(
              'group flex items-center gap-2 px-7 py-3.5 rounded-xl',
              'text-sm font-semibold text-white',
              'bg-gradient-to-r from-primary to-violet-500',
              'shadow-lg shadow-primary/25',
              'hover:shadow-xl hover:shadow-primary/35 hover:brightness-110',
              'transition-all duration-300'
            )}
          >
            Try Free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
          <a
            href="#demo"
            className={cn(
              'px-7 py-3.5 rounded-xl text-sm font-semibold',
              'text-gray-300 border border-white/10',
              'hover:bg-white/5 hover:border-white/20',
              'transition-all duration-300'
            )}
          >
            See How It Works
          </a>
        </motion.div>

        {/* Social proof */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={4}
          className="mt-16 flex flex-col items-center gap-4"
        >
          <div className="flex -space-x-2">
            {avatars.map((avatar, i) => (
              <div
                key={i}
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center',
                  'text-[10px] font-bold text-white',
                  'ring-2 ring-background-dark',
                  avatar.color
                )}
              >
                {avatar.initials}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500">
            Trusted by{' '}
            <span className="text-gray-300 font-medium">50,000+</span>{' '}
            writers, students, and marketers
          </p>
        </motion.div>
      </div>
    </section>
  );
}
