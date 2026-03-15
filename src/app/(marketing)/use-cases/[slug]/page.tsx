import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { SITE } from '@/constants';
import { getUseCase, getAllUseCaseSlugs } from '@/lib/content/use-cases';

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return getAllUseCaseSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const data = getUseCase(params.slug);
  if (!data) return {};

  return {
    title: `${data.title} — AI Detection & Humanization`,
    description: data.description,
    alternates: { canonical: `${SITE.url}/use-cases/${data.slug}` },
    openGraph: {
      title: `${data.title} | HumanizeElite`,
      description: data.description,
      url: `${SITE.url}/use-cases/${data.slug}`,
    },
  };
}

export default function UseCasePage({ params }: Props) {
  const data = getUseCase(params.slug);
  if (!data) notFound();

  return (
    <div className="min-h-screen bg-background-dark">
      <div className="max-w-4xl mx-auto px-4 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-sm text-primary mb-6">
            Use Case
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-100 mb-6">
            HumanizeElite{' '}
            <span className="gradient-text">{data.title}</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            {data.description}
          </p>
        </div>

        {/* Benefits */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-100 mb-8">Key Benefits</h2>
          <div className="space-y-4">
            {data.benefits.map((benefit, index) => (
              <div key={index} className="glass rounded-xl p-5 flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <p className="text-gray-300 leading-relaxed">{benefit}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonial */}
        <section className="mb-16">
          <div className="glass rounded-2xl p-8 relative">
            <svg
              className="absolute top-6 left-6 w-10 h-10 text-primary/20"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            <blockquote className="relative z-10">
              <p className="text-lg text-gray-300 leading-relaxed italic mb-6 pl-8">
                &ldquo;{data.testimonial.quote}&rdquo;
              </p>
              <footer className="pl-8">
                <div className="text-gray-100 font-semibold">{data.testimonial.name}</div>
                <div className="text-gray-500 text-sm">{data.testimonial.role}</div>
              </footer>
            </blockquote>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center glass rounded-2xl p-10">
          <h2 className="text-2xl font-bold text-gray-100 mb-3">
            Ready to Get Started?
          </h2>
          <p className="text-gray-400 mb-6">
            Join thousands of users who trust HumanizeElite for AI detection and humanization.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/detector"
              className="inline-flex items-center justify-center px-8 py-3 rounded-lg font-semibold text-white gradient-primary hover:opacity-90 transition-opacity"
            >
              Try AI Detector
            </Link>
            <Link
              href="/humanizer"
              className="inline-flex items-center justify-center px-8 py-3 rounded-lg font-semibold text-gray-300 border border-white/10 hover:bg-white/5 transition-colors"
            >
              Try AI Humanizer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
