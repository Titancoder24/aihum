import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE } from '@/constants';

export const metadata: Metadata = {
  title: 'AI Tools — Detector & Humanizer',
  description:
    'Explore HumanizeElite\'s suite of AI tools. Detect AI-generated content with precision and humanize it beyond detection.',
  alternates: { canonical: `${SITE.url}/tools` },
  openGraph: {
    title: 'AI Tools — Detector & Humanizer | HumanizeElite',
    description:
      'Explore HumanizeElite\'s suite of AI tools. Detect AI-generated content with precision and humanize it beyond detection.',
    url: `${SITE.url}/tools`,
  },
};

const tools = [
  {
    title: 'AI Detector',
    description:
      'Analyze any text for AI-generated patterns with our multi-module detection engine. Get per-sentence scoring, confidence levels, and detailed pattern breakdowns.',
    href: '/tools/ai-detector',
    appHref: '/detector',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
    ),
    features: ['Per-sentence analysis', '7 detection modules', 'Confidence scoring', 'Pattern identification'],
  },
  {
    title: 'AI Humanizer',
    description:
      'Transform AI-generated text into natural, human-sounding content that passes all major detection tools. Choose from 5 specialized writing modes.',
    href: '/tools/ai-humanizer',
    appHref: '/humanizer',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
      </svg>
    ),
    features: ['5 writing modes', 'Meaning preservation', 'Before/after scoring', 'Iterative refinement'],
  },
];

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-background-dark">
      <div className="max-w-5xl mx-auto px-4 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-100 mb-4">
            Our <span className="gradient-text">AI Tools</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Everything you need to detect AI content and transform it into authentic,
            human-quality writing. Two powerful tools, one platform.
          </p>
        </div>

        {/* Tool Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {tools.map((tool) => (
            <div
              key={tool.title}
              className="glass rounded-2xl p-8 hover:bg-white/[0.08] transition-colors group"
            >
              <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center text-white mb-6">
                {tool.icon}
              </div>

              <h2 className="text-2xl font-bold text-gray-100 mb-3">
                {tool.title}
              </h2>
              <p className="text-gray-400 mb-6 leading-relaxed">
                {tool.description}
              </p>

              <ul className="space-y-2 mb-8">
                {tool.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-gray-300">
                    <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="flex gap-3">
                <Link
                  href={tool.appHref}
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-semibold text-white gradient-primary hover:opacity-90 transition-opacity text-sm"
                >
                  Try Now
                </Link>
                <Link
                  href={tool.href}
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-semibold text-gray-300 border border-white/10 hover:bg-white/5 transition-colors text-sm"
                >
                  Learn More
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
