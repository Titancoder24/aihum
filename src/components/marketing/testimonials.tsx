'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  company: string;
  initials: string;
  color: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      'I was terrified of Turnitin flagging my research summaries. HumanizeElite gives me complete confidence that my paraphrased content reads authentically. The per-sentence analysis is a game-changer.',
    name: 'Maya Chen',
    role: 'Graduate Student',
    company: 'Stanford University',
    initials: 'MC',
    color: 'bg-primary',
  },
  {
    quote:
      'We produce 200+ blog posts a month. HumanizeElite cut our editing time by 60% and none of our content has ever been flagged. The API integration was seamless.',
    name: 'David Park',
    role: 'Content Marketing Lead',
    company: 'GrowthOS',
    initials: 'DP',
    color: 'bg-violet-500',
  },
  {
    quote:
      'The SEO mode is incredible. My humanized content ranks just as well — sometimes better — than my manually written pieces. And it processes 5,000 words in seconds.',
    name: 'Sarah Mitchell',
    role: 'SEO Professional',
    company: 'RankForge Agency',
    initials: 'SM',
    color: 'bg-success',
  },
  {
    quote:
      'As a peer reviewer, I use the detection tool to screen submissions. It catches AI-generated text that other tools miss entirely. The granular scoring is incredibly useful.',
    name: 'Dr. James Liu',
    role: 'Academic Researcher',
    company: 'MIT Media Lab',
    initials: 'JL',
    color: 'bg-warning',
  },
  {
    quote:
      'I write proposals and executive briefs daily. HumanizeElite ensures my AI-assisted drafts read with the natural authority my clients expect. Worth every penny.',
    name: 'Rebecca Torres',
    role: 'Business Writer',
    company: 'Deloitte',
    initials: 'RT',
    color: 'bg-danger',
  },
];

export function Testimonials() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState, { passive: true });
    updateScrollState();
    return () => el.removeEventListener('scroll', updateScrollState);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.7;
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Loved by <span className="gradient-text">Thousands</span>
            </h2>
            <p className="mt-4 text-gray-400 max-w-xl">
              See what our users have to say about HumanizeElite.
            </p>
          </div>

          {/* Navigation arrows — desktop */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={cn(
                'p-2 rounded-lg border border-white/10',
                'hover:bg-white/5 transition-colors',
                'disabled:opacity-30 disabled:cursor-not-allowed'
              )}
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={cn(
                'p-2 rounded-lg border border-white/10',
                'hover:bg-white/5 transition-colors',
                'disabled:opacity-30 disabled:cursor-not-allowed'
              )}
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </motion.div>

        {/* Scrollable cards */}
        <div
          ref={scrollRef}
          className={cn(
            'flex gap-5 overflow-x-auto snap-x snap-mandatory',
            'scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none]',
            '[&::-webkit-scrollbar]:hidden'
          )}
        >
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={cn(
                'flex-shrink-0 w-[320px] sm:w-[360px] snap-start',
                'glass rounded-2xl p-6 flex flex-col'
              )}
            >
              <Quote className="w-5 h-5 text-primary/40 mb-4" />
              <p className="text-sm text-gray-300 leading-relaxed flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center',
                    'text-[11px] font-bold text-white',
                    t.color
                  )}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-200">{t.name}</p>
                  <p className="text-xs text-gray-500">
                    {t.role}, {t.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
