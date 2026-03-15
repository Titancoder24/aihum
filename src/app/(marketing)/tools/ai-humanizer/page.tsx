import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE } from '@/constants';

export const metadata: Metadata = {
  title: 'AI Humanizer — Transform AI Text Into Human Writing',
  description:
    'Humanize AI-generated text to bypass GPTZero, Turnitin, and Originality.ai. 5 writing modes, meaning preservation, and before/after detection scoring.',
  alternates: { canonical: `${SITE.url}/tools/ai-humanizer` },
  openGraph: {
    title: 'AI Humanizer — Transform AI Text Into Human Writing | HumanizeElite',
    description:
      'Humanize AI text with 5 specialized modes. Bypass all major AI detectors while preserving your original meaning.',
    url: `${SITE.url}/tools/ai-humanizer`,
  },
};

const modes = [
  { name: 'Standard', desc: 'Balanced humanization for blog posts, articles, and general content.' },
  { name: 'Academic', desc: 'Optimized for essays, research papers, and academic submissions.' },
  { name: 'Creative', desc: 'Maximum humanization for creative writing and opinion pieces.' },
  { name: 'SEO', desc: 'Maintains keyword density and structure while humanizing.' },
  { name: 'Professional', desc: 'For business communications, reports, and professional documents.' },
];

const features = [
  {
    title: 'Meaning Preservation',
    description:
      'Our humanization engine restructures how ideas are expressed without changing what is expressed. Your arguments, facts, and conclusions remain intact.',
  },
  {
    title: 'Before & After Scoring',
    description:
      'See exactly how your text\'s AI detection score changes after humanization. We keep refining until the score drops below the detection threshold.',
  },
  {
    title: 'Multi-Stage Processing',
    description:
      'Text passes through multiple humanization stages — vocabulary diversification, sentence restructuring, coherence adjustment, and style injection.',
  },
  {
    title: 'Change Transparency',
    description:
      'Every modification is logged. See a detailed diff of what was changed and why, so you maintain full control over the output.',
  },
  {
    title: 'Bypass All Major Detectors',
    description:
      'Tested against GPTZero, Turnitin, Originality.ai, Copyleaks, and more. Our humanized text consistently scores below detection thresholds.',
  },
  {
    title: 'Instant Processing',
    description:
      'Humanize up to 100,000 characters in seconds. No waiting, no queuing — just paste, choose a mode, and get results.',
  },
];

const faqs = [
  {
    q: 'Which AI detectors can it bypass?',
    a: 'HumanizeElite is tested against all major detectors including GPTZero, Turnitin AI Detection, Originality.ai, Copyleaks, ZeroGPT, and Sapling. Our humanized text consistently scores below detection thresholds.',
  },
  {
    q: 'Does humanization change the meaning of my text?',
    a: 'No. Our engine preserves your arguments, facts, and conclusions while restructuring how they are expressed. You can review every change in the detailed diff view.',
  },
  {
    q: 'What is the best mode for academic papers?',
    a: 'Use Academic mode. It preserves formal tone, technical vocabulary, and citation formatting while humanizing the prose. It is specifically tuned for the patterns that academic AI detectors look for.',
  },
  {
    q: 'How many words can I humanize for free?',
    a: 'The free tier includes 500 words per day for humanization. Upgrade to Pro for 50,000 words per day with all modes and API access.',
  },
  {
    q: 'Can I humanize text from any AI model?',
    a: 'Yes. HumanizeElite works with text from ChatGPT, Claude, Gemini, Llama, Mistral, and any other AI language model. Our analysis is model-agnostic.',
  },
];

export default function AIHumanizerPage() {
  return (
    <div className="min-h-screen bg-background-dark">
      <div className="max-w-5xl mx-auto px-4 py-20">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-sm text-violet-400 mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
            AI Humanization Tool
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-100 mb-6">
            Humanize AI Text <br />
            <span className="gradient-text">Beyond Detection</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
            Transform AI-generated content into natural, human-sounding writing
            that bypasses all major AI detectors. Five specialized modes ensure
            your text sounds exactly right for every context.
          </p>
          <Link
            href="/humanizer"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg font-semibold text-white gradient-primary hover:opacity-90 transition-opacity text-lg"
          >
            Try AI Humanizer Free
          </Link>
        </div>

        {/* Modes */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-gray-100 text-center mb-10">
            5 Specialized Writing Modes
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {modes.map((mode) => (
              <div key={mode.name} className="glass rounded-xl p-5">
                <h3 className="text-lg font-semibold text-gray-100 mb-1">{mode.name}</h3>
                <p className="text-gray-400 text-sm">{mode.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-gray-100 text-center mb-10">
            Powerful Humanization Features
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
