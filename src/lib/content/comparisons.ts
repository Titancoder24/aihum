export interface ComparisonFeature {
  feature: string;
  us: boolean;
  them: boolean;
}

export interface ComparisonData {
  slug: string;
  competitor: string;
  tagline: string;
  description: string;
  features: ComparisonFeature[];
}

export const comparisons: ComparisonData[] = [
  {
    slug: 'vs-undetectable-ai',
    competitor: 'Undetectable AI',
    tagline: 'More accurate detection, smarter humanization',
    description:
      'See how HumanizeElite compares to Undetectable AI for AI text detection and humanization. We offer higher accuracy, more writing modes, and a more intuitive interface.',
    features: [
      { feature: 'AI Detection Engine', us: true, them: false },
      { feature: 'Multi-mode Humanization', us: true, them: true },
      { feature: 'Academic Mode', us: true, them: false },
      { feature: 'SEO Preservation Mode', us: true, them: false },
      { feature: 'Sentence-level Analysis', us: true, them: false },
      { feature: 'Detailed Pattern Reports', us: true, them: false },
      { feature: 'API Access', us: true, them: true },
      { feature: 'Batch Processing', us: true, them: true },
      { feature: 'Free Tier Available', us: true, them: true },
      { feature: 'Real-time Score Preview', us: true, them: false },
    ],
  },
  {
    slug: 'vs-quillbot',
    competitor: 'QuillBot',
    tagline: 'Purpose-built for AI detection, not just paraphrasing',
    description:
      'QuillBot is a general paraphrasing tool. HumanizeElite is purpose-built for AI detection and humanization, delivering results that actually bypass detectors.',
    features: [
      { feature: 'AI Detection Engine', us: true, them: false },
      { feature: 'AI-specific Humanization', us: true, them: false },
      { feature: 'Multi-mode Humanization', us: true, them: true },
      { feature: 'Academic Mode', us: true, them: true },
      { feature: 'SEO Preservation Mode', us: true, them: false },
      { feature: 'Sentence-level AI Analysis', us: true, them: false },
      { feature: 'Detection Score Tracking', us: true, them: false },
      { feature: 'Grammar Checking', us: false, them: true },
      { feature: 'Citation Generator', us: false, them: true },
      { feature: 'API Access', us: true, them: true },
    ],
  },
  {
    slug: 'vs-humbot',
    competitor: 'Humbot',
    tagline: 'Advanced detection analysis meets intelligent rewriting',
    description:
      'HumanizeElite goes beyond simple text spinning. Our detection engine pinpoints exactly which sentences trigger AI detectors, so humanization is precise and targeted.',
    features: [
      { feature: 'Built-in Detection Engine', us: true, them: false },
      { feature: 'Multi-mode Humanization', us: true, them: true },
      { feature: 'Academic Mode', us: true, them: false },
      { feature: 'SEO Preservation Mode', us: true, them: false },
      { feature: 'Professional Mode', us: true, them: false },
      { feature: 'Sentence-level Analysis', us: true, them: false },
      { feature: 'Before/After Score Comparison', us: true, them: true },
      { feature: 'Pattern Detection Reports', us: true, them: false },
      { feature: 'API Access', us: true, them: false },
      { feature: 'Free Tier Available', us: true, them: true },
    ],
  },
  {
    slug: 'vs-stealthgpt',
    competitor: 'StealthGPT',
    tagline: 'Transparent detection analysis, not a black box',
    description:
      'StealthGPT generates text meant to evade detection. HumanizeElite takes your existing text and intelligently transforms it while preserving your voice and meaning.',
    features: [
      { feature: 'AI Detection Engine', us: true, them: false },
      { feature: 'Works with Any Input Text', us: true, them: false },
      { feature: 'Multi-mode Humanization', us: true, them: true },
      { feature: 'Academic Mode', us: true, them: false },
      { feature: 'SEO Preservation Mode', us: true, them: false },
      { feature: 'Sentence-level Analysis', us: true, them: false },
      { feature: 'Transparent Scoring', us: true, them: false },
      { feature: 'AI Text Generation', us: false, them: true },
      { feature: 'API Access', us: true, them: true },
      { feature: 'Free Tier Available', us: true, them: false },
    ],
  },
  {
    slug: 'vs-gptzero',
    competitor: 'GPTZero',
    tagline: 'Detection and humanization in a single platform',
    description:
      'GPTZero only detects AI text. HumanizeElite detects AND humanizes, giving you a complete workflow in one tool. Our detection is equally thorough, plus you can fix what it finds.',
    features: [
      { feature: 'AI Detection', us: true, them: true },
      { feature: 'AI Humanization', us: true, them: false },
      { feature: 'Sentence-level Analysis', us: true, them: true },
      { feature: 'Multi-mode Humanization', us: true, them: false },
      { feature: 'Academic Mode', us: true, them: false },
      { feature: 'SEO Preservation Mode', us: true, them: false },
      { feature: 'Before/After Comparison', us: true, them: false },
      { feature: 'Batch Processing', us: true, them: true },
      { feature: 'API Access', us: true, them: true },
      { feature: 'Free Tier Available', us: true, them: true },
    ],
  },
];

export function getComparison(slug: string): ComparisonData | undefined {
  return comparisons.find((c) => c.slug === slug);
}

export function getAllComparisonSlugs(): string[] {
  return comparisons.map((c) => c.slug);
}
