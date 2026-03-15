import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE } from '@/constants';

export const metadata: Metadata = {
  title: 'AI Detector — Detect AI-Generated Text Instantly',
  description:
    'Free AI content detector that identifies ChatGPT, Claude, Gemini, and other AI-generated text. Per-sentence analysis, 7 detection modules, confidence scoring.',
  alternates: { canonical: `${SITE.url}/tools/ai-detector` },
  openGraph: {
    title: 'AI Detector — Detect AI-Generated Text Instantly | HumanizeElite',
    description:
      'Free AI content detector with per-sentence analysis. Identify AI-generated text from ChatGPT, Claude, and more.',
    url: `${SITE.url}/tools/ai-detector`,
  },
};

const features = [
  {
    title: 'Multi-Module Detection',
    description:
      'Seven independent analysis modules — perplexity, burstiness, vocabulary, structural, coherence, stylometric, and statistical — working together for maximum accuracy.',
  },
  {
    title: 'Per-Sentence Scoring',
    description:
      'See exactly which sentences trigger AI detection with color-coded highlighting. Green means human, red means AI — and everything in between.',
  },
  {
    title: 'Pattern Identification',
    description:
      'Our engine identifies specific AI patterns like vocabulary uniformity, structural predictability, and coherence anomalies, with explanations you can act on.',
  },
  {
    title: 'Confidence Levels',
    description:
      'Get a clear confidence rating (low, medium, high, very-high) alongside the numerical score so you know how much to trust the result.',
  },
  {
    title: 'Fast Processing',
    description:
      'Analyze up to 100,000 characters in seconds. Our detection engine runs entirely in real-time with no queuing or wait times.',
  },
  {
    title: 'Free to Use',
    description:
      'Detect AI content for free with our generous daily limit. No credit card required, no account needed to get started.',
  },
];

const faqs = [
  {
    q: 'How accurate is the AI detector?',
    a: 'Our multi-module approach achieves high accuracy across a range of AI models including ChatGPT, Claude, Gemini, and Llama. No detector is perfect, but our combined scoring significantly reduces false positives compared to single-metric tools.',
  },
  {
    q: 'Which AI models can it detect?',
    a: 'HumanizeElite detects content from all major language models including GPT-4, GPT-3.5, Claude, Gemini, Llama, and Mistral. Our detection is model-agnostic — it analyzes writing patterns, not model fingerprints.',
  },
  {
    q: 'Does it work on short texts?',
    a: 'Detection works best on texts of 100+ words. Shorter texts provide fewer statistical signals, which can reduce confidence. We recommend analyzing at least a full paragraph for reliable results.',
  },
  {
    q: 'Is my text stored or shared?',
    a: 'No. Text submitted for detection is processed in real-time and never stored on our servers. Your content remains completely private.',
  },
  {
    q: 'Can I use it for free?',
    a: 'Yes. The free tier includes 1,000 words per day for detection. Upgrade to Pro for 50,000 words per day and API access.',
  },
];

export default function AIDetectorPage() {
  return (
    <div className="min-h-screen bg-background-dark">
      <div className="max-w-5xl mx-auto px-4 py-20">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-sm text-primary mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            AI Detection Tool
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-100 mb-6">
            Detect AI-Generated Text <br />
            <span className="gradient-text">With Surgical Precision</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
            Our multi-module detection engine analyzes text across seven dimensions
            to identify AI-generated content from ChatGPT, Claude, Gemini, and more.
            Per-sentence scoring tells you exactly where AI patterns appear.
          </p>
          <Link
            href="/detector"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg font-semibold text-white gradient-primary hover:opacity-90 transition-opacity text-lg"
          >
            Try AI Detector Free
          </Link>
        </div>

        {/* Features Grid */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-gray-100 text-center mb-10">
            Why Our Detector Stands Out
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="glass rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-gray-100 text-center mb-10">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Paste Your Text', desc: 'Copy and paste the text you want to analyze into the detector.' },
              { step: '2', title: 'Instant Analysis', desc: 'Our 7 detection modules analyze the text simultaneously in real-time.' },
              { step: '3', title: 'Detailed Results', desc: 'Get an overall score, per-sentence highlights, and identified patterns.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-100 mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-bold text-gray-100 text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="glass rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-100 mb-2">{faq.q}</h3>
                <p className="text-gray-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
