'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ScanLine, Loader2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { wordCount } from '@/lib/utils';

const SAMPLE_TEXT =
  'Artificial intelligence has revolutionized the way we approach content creation. The emergence of large language models has made it possible to generate text that is virtually indistinguishable from human-written content. These models leverage sophisticated neural network architectures to produce coherent and contextually relevant text across a wide range of topics and styles.';

const WORD_LIMIT = 500;

interface SentenceResult {
  text: string;
  score: number;
}

/** Simple mock detection for the demo. */
function mockDetect(text: string): { overall: number; sentences: SentenceResult[] } {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.trim().length > 0);

  const results: SentenceResult[] = sentences.map((s, i) => ({
    text: s,
    score: Math.min(0.95, 0.6 + Math.sin(i * 1.7) * 0.25 + Math.random() * 0.1),
  }));

  const overall = results.reduce((sum, r) => sum + r.score, 0) / results.length;
  return { overall, sentences: results };
}

/** Simple mock humanization for the demo. */
function mockHumanize(sentences: SentenceResult[]): SentenceResult[] {
  return sentences.map((s) => ({
    ...s,
    score: Math.max(0.02, s.score * 0.08 + Math.random() * 0.05),
  }));
}

function scoreColor(score: number): string {
  if (score <= 0.25) return 'text-success';
  if (score <= 0.50) return 'text-warning';
  if (score <= 0.75) return 'text-orange-400';
  return 'text-danger';
}

function scoreBg(score: number): string {
  if (score <= 0.25) return 'bg-success/10';
  if (score <= 0.50) return 'bg-warning/10';
  if (score <= 0.75) return 'bg-orange-400/10';
  return 'bg-danger/10';
}

export function LiveDemo() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    overall: number;
    sentences: SentenceResult[];
    humanized: boolean;
  } | null>(null);

  const handleDetect = useCallback(async () => {
    const input = text.trim() || SAMPLE_TEXT;
    if (!text.trim()) setText(SAMPLE_TEXT);
    setLoading(true);
    setResult(null);

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 1500));
    const detection = mockDetect(input);
    setResult({ overall: detection.overall, sentences: detection.sentences, humanized: false });
    setLoading(false);
  }, [text]);

  const handleHumanize = useCallback(async () => {
    if (!result) return;
    setLoading(true);

    await new Promise((r) => setTimeout(r, 2000));
    const humanized = mockHumanize(result.sentences);
    const overall = humanized.reduce((sum, r) => sum + r.score, 0) / humanized.length;
    setResult({ overall, sentences: humanized, humanized: true });
    setLoading(false);
  }, [result]);

  const words = wordCount(text);
  const overLimit = words > WORD_LIMIT;

  return (
    <section id="demo" className="py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            See It <span className="gradient-text">In Action</span>
          </h2>
          <p className="mt-4 text-gray-400 max-w-xl mx-auto">
            Paste any text below to see our detection and humanization engine at work.
          </p>
        </motion.div>

        {/* Glass card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={cn(
            'glass rounded-2xl p-6 sm:p-8',
            'shadow-2xl shadow-black/20'
          )}
        >
          {/* Textarea */}
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setResult(null);
              }}
              placeholder={SAMPLE_TEXT}
              rows={6}
              className={cn(
                'w-full resize-none rounded-xl p-4',
                'bg-white/[0.03] border border-white/10',
                'text-sm text-gray-200 placeholder:text-gray-600',
                'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40',
                'transition-all duration-200',
                overLimit && 'ring-2 ring-danger/40 border-danger/40'
              )}
            />
            <div
              className={cn(
                'absolute bottom-3 right-3 text-xs',
                overLimit ? 'text-danger' : 'text-gray-600'
              )}
            >
              {words}/{WORD_LIMIT} words
            </div>
          </div>

          {/* Detect button */}
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleDetect}
              disabled={loading || overLimit}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-xl',
                'text-sm font-semibold text-white',
                'bg-gradient-to-r from-primary to-violet-500',
                'shadow-lg shadow-primary/20',
                'hover:shadow-xl hover:brightness-110',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-all duration-200'
              )}
            >
              {loading && !result ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ScanLine className="w-4 h-4" />
              )}
              Detect AI
            </button>
            {overLimit && (
              <span className="text-xs text-danger">
                Free demo limited to {WORD_LIMIT} words.
              </span>
            )}
          </div>

          {/* Results */}
          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                key={result.humanized ? 'humanized' : 'detected'}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4 }}
                className="mt-8"
              >
                {/* Score gauge */}
                <div className="flex items-center gap-6 mb-6">
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72">
                      <circle
                        cx="36"
                        cy="36"
                        r="30"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="6"
                        className="text-white/5"
                      />
                      <circle
                        cx="36"
                        cy="36"
                        r="30"
                        fill="none"
                        stroke="url(#gauge-gradient)"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={`${result.overall * 188.5} 188.5`}
                      />
                      <defs>
                        <linearGradient id="gauge-gradient" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor={result.overall > 0.5 ? '#F43F5E' : '#10B981'} />
                          <stop offset="100%" stopColor={result.overall > 0.5 ? '#F59E0B' : '#6366F1'} />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={cn('text-lg font-bold', scoreColor(result.overall))}>
                        {Math.round(result.overall * 100)}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-200">
                      {result.humanized ? 'After Humanization' : 'AI Detection Score'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {result.humanized
                        ? 'Your text now reads as fully human-written.'
                        : 'Higher scores indicate AI-generated content.'}
                    </p>
                  </div>
                </div>

                {/* Per-sentence analysis */}
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {result.sentences.map((s, i) => (
                    <div
                      key={i}
                      className={cn(
                        'flex items-start gap-3 p-3 rounded-lg',
                        scoreBg(s.score)
                      )}
                    >
                      <span
                        className={cn(
                          'flex-shrink-0 text-xs font-mono font-bold mt-0.5',
                          scoreColor(s.score)
                        )}
                      >
                        {Math.round(s.score * 100)}%
                      </span>
                      <span className="text-sm text-gray-300 leading-relaxed">{s.text}</span>
                    </div>
                  ))}
                </div>

                {/* Humanize button */}
                {!result.humanized && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6"
                  >
                    <button
                      onClick={handleHumanize}
                      disabled={loading}
                      className={cn(
                        'group flex items-center gap-2 px-5 py-2.5 rounded-xl',
                        'text-sm font-semibold text-white',
                        'bg-gradient-to-r from-success to-emerald-500',
                        'shadow-lg shadow-success/20',
                        'hover:shadow-xl hover:brightness-110',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        'transition-all duration-200'
                      )}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                      Humanize This
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
