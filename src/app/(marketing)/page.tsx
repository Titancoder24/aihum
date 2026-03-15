import type { Metadata } from 'next';
import { Hero } from '@/components/marketing/hero';
import { LiveDemo } from '@/components/marketing/live-demo';
import { FeaturesGrid } from '@/components/marketing/features-grid';
import { ComparisonTable } from '@/components/marketing/comparison-table';
import { PricingSection } from '@/components/marketing/pricing-section';
import { Testimonials } from '@/components/marketing/testimonials';
import { FAQSection } from '@/components/marketing/faq-section';
import { CTASection } from '@/components/marketing/cta-section';

export const metadata: Metadata = {
  title: 'HumanizeElite — AI Text Detection & Humanization Platform',
  description:
    'Detect AI content with surgical precision. Humanize it beyond detection. The world\'s most advanced AI text platform, trusted by 50,000+ users.',
  openGraph: {
    title: 'HumanizeElite — AI Text Detection & Humanization Platform',
    description: 'Detect AI content with surgical precision. Humanize it beyond detection.',
    type: 'website',
  },
};

export default function MarketingPage() {
  return (
    <>
      <Hero />
      <LiveDemo />
      <FeaturesGrid />
      <ComparisonTable />
      <PricingSection />
      <Testimonials />
      <FAQSection />
      <CTASection />
    </>
  );
}
