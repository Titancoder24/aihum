'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CTASection() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className={cn(
            'relative overflow-hidden rounded-3xl',
            'bg-gradient-to-br from-primary/20 via-violet-500/10 to-primary/5',
            'border border-primary/20',
            'px-8 py-16 sm:px-16 sm:py-20',
            'text-center'
          )}
        >
          {/* Background glow */}
          <div className="absolute inset-0 -z-10">
            <div
              className={cn(
                'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
                'w-[600px] h-[300px] rounded-full',
                'bg-primary/15 blur-[120px]'
              )}
            />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight max-w-2xl mx-auto">
            Ready to{' '}
            <span className="gradient-text">Humanize</span>{' '}
            Your Content?
          </h2>

          <p className="mt-5 text-lg text-gray-400 max-w-lg mx-auto">
            Start for free — no credit card required.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10"
          >
            <a
              href="/app"
              className={cn(
                'group inline-flex items-center gap-2',
                'px-8 py-4 rounded-xl text-base font-semibold',
                'bg-gradient-to-r from-primary to-violet-500 text-white',
                'shadow-xl shadow-primary/30',
                'hover:shadow-2xl hover:shadow-primary/40 hover:brightness-110',
                'transition-all duration-300'
              )}
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
