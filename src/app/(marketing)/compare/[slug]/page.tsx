import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { SITE } from '@/constants';
import { getComparison, getAllComparisonSlugs } from '@/lib/content/comparisons';

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return getAllComparisonSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const data = getComparison(params.slug);
  if (!data) return {};

  return {
    title: `HumanizeElite ${data.slug.replace('vs-', 'vs ').replace(/-/g, ' ')} — Feature Comparison`,
    description: data.description,
    alternates: { canonical: `${SITE.url}/compare/${data.slug}` },
    openGraph: {
      title: `HumanizeElite vs ${data.competitor} | HumanizeElite`,
      description: data.description,
      url: `${SITE.url}/compare/${data.slug}`,
    },
  };
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={`w-5 h-5 ${className ?? ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

function XMark({ className }: { className?: string }) {
  return (
    <svg className={`w-5 h-5 ${className ?? ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

export default function ComparisonPage({ params }: Props) {
  const data = getComparison(params.slug);
  if (!data) notFound();

  const ourWins = data.features.filter((f) => f.us && !f.them).length;
  const theirWins = data.features.filter((f) => !f.us && f.them).length;

  return (
    <div className="min-h-screen bg-background-dark">
      <div className="max-w-4xl mx-auto px-4 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-sm text-gray-400 mb-6">
            Comparison
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-100 mb-4">
            HumanizeElite vs{' '}
            <span className="gradient-text">{data.competitor}</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            {data.tagline}
          </p>
        </div>

        {/* Score Summary */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          <div className="glass rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-1">{ourWins}</div>
            <div className="text-sm text-gray-400">HumanizeElite advantages</div>
          </div>
          <div className="glass rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-gray-400 mb-1">
              {data.features.filter((f) => f.us === f.them).length}
            </div>
            <div className="text-sm text-gray-400">Shared features</div>
          </div>
          <div className="glass rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-gray-500 mb-1">{theirWins}</div>
            <div className="text-sm text-gray-400">{data.competitor} advantages</div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="glass rounded-2xl overflow-hidden mb-12">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-gray-400 font-medium py-4 px-6">Feature</th>
                <th className="text-center text-primary font-medium py-4 px-4 w-36">HumanizeElite</th>
                <th className="text-center text-gray-400 font-medium py-4 px-4 w-36">{data.competitor}</th>
              </tr>
            </thead>
            <tbody>
              {data.features.map((row) => (
                <tr key={row.feature} className="border-b border-white/5">
                  <td className="text-gray-300 py-3.5 px-6 text-sm">{row.feature}</td>
                  <td className="text-center py-3.5 px-4">
                    {row.us ? (
                      <span className="inline-flex justify-center"><CheckIcon className="text-primary" /></span>
                    ) : (
                      <span className="inline-flex justify-center"><XMark className="text-gray-600" /></span>
                    )}
                  </td>
                  <td className="text-center py-3.5 px-4">
                    {row.them ? (
                      <span className="inline-flex justify-center"><CheckIcon className="text-gray-400" /></span>
                    ) : (
                      <span className="inline-flex justify-center"><XMark className="text-gray-600" /></span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Description */}
        <div className="glass rounded-2xl p-8 mb-12">
          <h2 className="text-xl font-bold text-gray-100 mb-4">Why Choose HumanizeElite</h2>
          <p className="text-gray-400 leading-relaxed">{data.description}</p>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/detector"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg font-semibold text-white gradient-primary hover:opacity-90 transition-opacity text-lg"
          >
            Try HumanizeElite Free
          </Link>
          <p className="text-gray-500 text-sm mt-3">No credit card required</p>
        </div>
      </div>
    </div>
  );
}
