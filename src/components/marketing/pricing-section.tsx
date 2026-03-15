'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Tier {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
}

const tiers: Tier[] = [
  {
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: 'Perfect for trying things out.',
    features: [
      '1,000 words/day detection',
      '500 words/day humanization',
      'Basic modes (General)',
      'Per-sentence analysis',
      'Community support',
    ],
    cta: 'Start Free',
  },
  {
    name: 'Pro',
    monthlyPrice: 12,
    yearlyPrice: 10,
    description: 'For serious writers and creators.',
    features: [
      '50,000 words/day detection',
      '50,000 words/day humanization',
      'All modes (Academic, SEO, Creative, Professional)',
      'API access',
      'Self-verification',
      'Priority support',
    ],
    cta: 'Start Free',
    popular: true,
  },
  {
    name: 'Enterprise',
    monthlyPrice: 49,
    yearlyPrice: 39,
    description: 'For teams and high-volume users.',
    features: [
      'Unlimited detection',
      'Unlimited humanization',
      'All modes + custom modes',
      'Team accounts (up to 25)',
      'Advanced API + webhooks',
      'Dedicated support',
      'SLA guarantee',
    ],
    cta: 'Start Free',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export function PricingSection() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Simple, Transparent{' '}
            <span className="gradient-text">Pricing</span>
          </h2>
          <p className="mt-4 text-gray-400 max-w-xl mx-auto">
            Start for free, upgrade when you need to. No hidden fees.
          </p>

          {/* Annual toggle */}
          <div className="mt-8 inline-flex items-center gap-3 p-1 rounded-full bg-white/5 border border-white/10">
            <button
              onClick={() => setAnnual(false)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
                !annual
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
                annual
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              )}
            >
              Annual
              <span className="ml-1.5 text-xs text-success font-semibold">-20%</span>
            </button>
          </div>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          {tiers.map((tier) => {
            const price = annual ? tier.yearlyPrice : tier.monthlyPrice;
            return (
              <motion.div
                key={tier.name}
                variants={cardVariants}
                className={cn(
                  'relative rounded-2xl p-6 sm:p-8 flex flex-col',
                  'glass',
                  tier.popular && [
                    'border-primary/30 bg-primary/[0.04]',
                    'shadow-xl shadow-primary/10',
                    'ring-1 ring-primary/20',
                  ]
                )}
              >
                {tier.popular && (
                  <div
                    className={cn(
                      'absolute -top-3 left-1/2 -translate-x-1/2',
                      'px-3 py-0.5 rounded-full text-xs font-semibold',
                      'bg-gradient-to-r from-primary to-violet-500 text-white'
                    )}
                  >
                    Most Popular
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold text-gray-100">{tier.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{tier.description}</p>
                </div>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-100">
                    ${price}
                  </span>
                  {price > 0 && (
                    <span className="text-sm text-gray-500">/mo</span>
                  )}
                </div>

                <ul className="mt-8 space-y-3 flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-400">{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="/app"
                  className={cn(
                    'mt-8 flex items-center justify-center',
                    'px-5 py-3 rounded-xl text-sm font-semibold',
                    'transition-all duration-200',
                    tier.popular
                      ? [
                          'bg-gradient-to-r from-primary to-violet-500',
                          'text-white shadow-lg shadow-primary/25',
                          'hover:shadow-xl hover:brightness-110',
                        ]
                      : [
                          'border border-white/10 text-gray-300',
                          'hover:bg-white/5 hover:border-white/20',
                        ]
                  )}
                >
                  {tier.cta}
                </a>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
