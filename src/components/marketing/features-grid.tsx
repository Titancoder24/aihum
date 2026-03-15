'use client';

import { motion } from 'framer-motion';
import { Shield, Wand2, ScanLine, Layers, CheckCircle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: Shield,
    title: 'AI Detection',
    description: 'Detects content from every AI model including GPT-4, Claude, Gemini, and Llama with industry-leading accuracy.',
  },
  {
    icon: Wand2,
    title: 'Humanization',
    description: '99.9% bypass rate against every major detector. Your text reads as authentically human-written.',
  },
  {
    icon: ScanLine,
    title: 'Per-Sentence Analysis',
    description: 'See exactly which sentences are flagged as AI-generated with granular, color-coded scoring.',
  },
  {
    icon: Layers,
    title: 'Multiple Modes',
    description: 'Academic, Creative, SEO, and Professional modes fine-tuned for each writing context.',
  },
  {
    icon: CheckCircle,
    title: 'Self-Verification',
    description: 'Built-in verification engine automatically confirms your humanized text passes all detectors.',
  },
  {
    icon: Zap,
    title: 'Speed',
    description: 'Process 10,000 words in under 5 seconds. No waiting, no queues, no rate limits.',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export function FeaturesGrid() {
  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Everything You Need,{' '}
            <span className="gradient-text">Nothing You Don&apos;t</span>
          </h2>
          <p className="mt-4 text-gray-400 max-w-xl mx-auto">
            A complete platform for AI text detection and humanization, built with precision engineering.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              className={cn(
                'group relative rounded-2xl p-6',
                'glass',
                'hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5',
                'hover:border-primary/20',
                'transition-all duration-300 ease-out'
              )}
            >
              <div
                className={cn(
                  'inline-flex items-center justify-center w-10 h-10 rounded-xl mb-4',
                  'bg-primary/10 text-primary-300',
                  'group-hover:bg-primary/20 transition-colors duration-300'
                )}
              >
                <feature.icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-gray-100 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
