'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Collapsible from '@radix-ui/react-collapsible';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'How accurate is the detection?',
    answer:
      'Our detection engine achieves 99.8% accuracy across all major AI models including GPT-4, Claude, Gemini, and Llama. We use a proprietary multi-layered analysis approach that examines statistical patterns, entropy signatures, and linguistic fingerprints rather than relying on a single method. Our false positive rate is under 0.2%.',
  },
  {
    question: 'Which AI models can you detect?',
    answer:
      'We detect content from all major language models: OpenAI GPT-3.5 and GPT-4, Anthropic Claude (all versions), Google Gemini, Meta Llama, Mistral, and more. Our engine is model-agnostic — it analyzes text patterns rather than matching against specific model signatures, so it works even with new or fine-tuned models.',
  },
  {
    question: 'Will my humanized text pass Turnitin?',
    answer:
      'Yes. Our humanization engine has a 99.9% bypass rate against all major detection platforms including Turnitin, GPTZero, Originality.ai, Copyleaks, and ZeroGPT. Our built-in self-verification feature automatically checks your output against these detectors before delivering results, so you can be confident it will pass.',
  },
  {
    question: 'Do you store my text?',
    answer:
      'No. We take privacy seriously. Your input text and results are processed in memory and never stored on our servers. We do not use your content for training or any other purpose. All processing happens in isolated, ephemeral containers that are destroyed after your session ends.',
  },
  {
    question: 'How is this different from competitors?',
    answer:
      'Three key differentiators: First, our engine runs entirely on proprietary NLP algorithms — no LLM API calls — which means faster processing and no third-party data sharing. Second, we offer per-sentence granular analysis so you see exactly which sentences are flagged. Third, our self-verification loop automatically confirms your humanized output passes detection before delivering it.',
  },
  {
    question: 'Is there an API?',
    answer:
      'Yes. Our REST API is available on the Pro and Enterprise plans. It supports both detection and humanization endpoints with JSON request/response format, webhook callbacks for async processing, and comprehensive documentation. Rate limits are generous: 1,000 requests/hour on Pro and unlimited on Enterprise.',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Frequently Asked{' '}
            <span className="gradient-text">Questions</span>
          </h2>
          <p className="mt-4 text-gray-400">
            Everything you need to know about HumanizeElite.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-3"
        >
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <Collapsible.Root
                key={i}
                open={isOpen}
                onOpenChange={(open) => setOpenIndex(open ? i : null)}
              >
                <Collapsible.Trigger
                  className={cn(
                    'w-full flex items-center justify-between gap-4',
                    'px-5 py-4 rounded-xl text-left',
                    'glass',
                    'hover:bg-white/[0.06] transition-colors duration-200',
                    isOpen && 'rounded-b-none border-b-0'
                  )}
                >
                  <span className="text-sm font-medium text-gray-200">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  </motion.div>
                </Collapsible.Trigger>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <Collapsible.Content forceMount asChild>
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div
                          className={cn(
                            'px-5 pb-5 pt-0 rounded-b-xl',
                            'glass rounded-t-none border-t-0'
                          )}
                        >
                          <p className="text-sm text-gray-400 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    </Collapsible.Content>
                  )}
                </AnimatePresence>
              </Collapsible.Root>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
