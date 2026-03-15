import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE } from '@/constants';

export const metadata: Metadata = {
  title: 'Pricing — Plans for Every Need',
  description:
    'Choose the HumanizeElite plan that fits your needs. Free tier for casual use, Pro for power users, Enterprise for teams. AI detection and humanization.',
  alternates: { canonical: `${SITE.url}/pricing` },
  openGraph: {
    title: 'Pricing — Plans for Every Need | HumanizeElite',
    description:
      'Transparent pricing for AI detection and humanization. Start free, scale as you grow.',
    url: `${SITE.url}/pricing`,
  },
};

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for trying out HumanizeElite and occasional use.',
    features: [
      '1,000 detection words/day',
      '500 humanization words/day',
      'Standard mode only',
      'Basic detection scoring',
      'No API access',
    ],
    cta: 'Get Started Free',
    href: '/detector',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    description: 'For students, writers, and marketers who need reliable daily access.',
    features: [
      '50,000 detection words/day',
      '50,000 humanization words/day',
      'All 5 writing modes',
      'Per-sentence analysis',
      'API access',
      'Priority processing',
      'Usage analytics',
    ],
    cta: 'Start Pro Trial',
    href: '/detector',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For teams and organizations with high-volume or custom needs.',
    features: [
      'Unlimited detection',
      'Unlimited humanization',
      'All 5 writing modes',
      'Full API access',
      'Batch processing',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    href: '/docs/api',
    highlighted: false,
  },
];

const comparisonFeatures = [
  { feature: 'Daily detection words', free: '1,000', pro: '50,000', enterprise: 'Unlimited' },
  { feature: 'Daily humanization words', free: '500', pro: '50,000', enterprise: 'Unlimited' },
  { feature: 'Writing modes', free: 'Standard', pro: 'All 5', enterprise: 'All 5' },
  { feature: 'Per-sentence analysis', free: false, pro: true, enterprise: true },
  { feature: 'Pattern identification', free: true, pro: true, enterprise: true },
  { feature: 'Change diff view', free: false, pro: true, enterprise: true },
  { feature: 'API access', free: false, pro: true, enterprise: true },
  { feature: 'Batch processing', free: false, pro: false, enterprise: true },
  { feature: 'Usage analytics', free: false, pro: true, enterprise: true },
  { feature: 'Priority processing', free: false, pro: true, enterprise: true },
  { feature: 'Custom integrations', free: false, pro: false, enterprise: true },
  { feature: 'Dedicated support', free: false, pro: false, enterprise: true },
  { feature: 'SLA guarantee', free: false, pro: false, enterprise: true },
];

const billingFaqs = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Pro subscriptions can be cancelled at any time. You will retain access until the end of your current billing period.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards (Visa, Mastercard, American Express) and PayPal. Enterprise plans can be invoiced.',
  },
  {
    q: 'Is there a free trial for Pro?',
    a: 'Yes. Pro comes with a 7-day free trial so you can test all features before committing. No credit card required to start.',
  },
  {
    q: 'What happens if I exceed my daily limit?',
    a: 'Your limits reset every 24 hours. If you hit your daily cap, you can upgrade your plan or wait for the reset. We do not charge overage fees.',
  },
  {
    q: 'Do unused words roll over?',
    a: 'No. Daily word limits reset every 24 hours and do not accumulate. This keeps pricing simple and fair for everyone.',
  },
  {
    q: 'Can I switch plans mid-cycle?',
    a: 'Yes. You can upgrade at any time and the cost difference will be prorated. Downgrades take effect at the next billing period.',
  },
];

function CheckIcon() {
  return (
    <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-5 h-5 text-gray-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background-dark">
      <div className="max-w-6xl mx-auto px-4 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-100 mb-4">
            Simple, Transparent <span className="gradient-text">Pricing</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Start free and upgrade when you need more. No hidden fees, no surprise charges.
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 ${
                plan.highlighted
                  ? 'bg-gradient-to-b from-primary/20 to-transparent border-2 border-primary/50 relative'
                  : 'glass'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-white text-xs font-semibold">
                  Most Popular
                </div>
              )}

              <h2 className="text-xl font-bold text-gray-100 mb-1">{plan.name}</h2>
              <p className="text-gray-400 text-sm mb-4">{plan.description}</p>

              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-100">{plan.price}</span>
                {plan.period && (
                  <span className="text-gray-400 ml-1">{plan.period}</span>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-gray-300 text-sm">
                    <CheckIcon />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`block w-full text-center py-3 rounded-lg font-semibold transition-opacity ${
                  plan.highlighted
                    ? 'gradient-primary text-white hover:opacity-90'
                    : 'border border-white/10 text-gray-300 hover:bg-white/5'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Feature Comparison Matrix */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-gray-100 text-center mb-10">
            Feature Comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-gray-400 font-medium py-3 px-4">Feature</th>
                  <th className="text-center text-gray-400 font-medium py-3 px-4">Free</th>
                  <th className="text-center text-primary font-medium py-3 px-4">Pro</th>
                  <th className="text-center text-gray-400 font-medium py-3 px-4">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row) => (
                  <tr key={row.feature} className="border-b border-white/5">
                    <td className="text-gray-300 py-3 px-4 text-sm">{row.feature}</td>
                    {(['free', 'pro', 'enterprise'] as const).map((plan) => {
                      const value = row[plan];
                      return (
                        <td key={plan} className="text-center py-3 px-4">
                          {typeof value === 'boolean' ? (
                            value ? <span className="inline-flex justify-center"><CheckIcon /></span> : <span className="inline-flex justify-center"><XIcon /></span>
                          ) : (
                            <span className="text-gray-300 text-sm">{value}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Billing FAQ */}
        <section>
          <h2 className="text-2xl font-bold text-gray-100 text-center mb-10">
            Billing FAQ
          </h2>
          <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-4">
            {billingFaqs.map((faq) => (
              <div key={faq.q} className="glass rounded-xl p-6">
                <h3 className="text-base font-semibold text-gray-100 mb-2">{faq.q}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
