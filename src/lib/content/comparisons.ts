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
    tagline: 'A smarter alternative to Undetectable AI',
    description:
      'See how HumanizeElite compares to Undetectable AI for AI text humanization. We offer superior detection accuracy, more writing modes, and better preservation of your original meaning.',
    features: [
      { feature: 'Real-time AI detection scoring', us: true, them: true },
      { feature: 'Per-sentence analysis', us: true, them: false },
      { feature: 'Multiple humanization modes', us: true, them: true },
      { feature: 'Academic-specific mode', us: true, them: false },
      { feature: 'SEO-optimized mode', us: true, them: false },
      { feature: 'Meaning preservation guarantee', us: true, them: false },
      { feature: 'API access', us: true, them: true },
      { feature: 'Free tier available', us: true, them: true },
      { feature: 'Batch processing', us: true, them: false },
      { feature: 'Multi-language support', us: true, them: true },
    ],
  },
  {
    slug: 'vs-quillbot',
    competitor: 'QuillBot',
    tagline: 'Go beyond paraphrasing with HumanizeElite',
    description:
      'QuillBot is a great paraphrasing tool, but it was not built for AI detection evasion. HumanizeElite is purpose-built to humanize AI text while preserving quality and meaning.',
    features: [
      { feature: 'AI detection scoring', us: true, them: false },
      { feature: 'Per-sentence AI analysis', us: true, them: false },
      { feature: 'Humanization modes (5+)', us: true, them: false },
      { feature: 'Paraphrasing', us: true, them: true },
      { feature: 'Grammar checking', us: false, them: true },
      { feature: 'Plagiarism detection', us: false, them: true },
      { feature: 'API access', us: true, them: true },
      { feature: 'Purpose-built for AI evasion', us: true, them: false },
      { feature: 'Iterative humanization', us: true, them: false },
      { feature: 'Free tier available', us: true, them: true },
    ],
  },
  {
    slug: 'vs-humbot',
    competitor: 'Humbot',
    tagline: 'More powerful humanization than Humbot',
    description:
      'Humbot offers basic AI humanization, but HumanizeElite provides deeper analysis, more modes, and a more reliable detection bypass rate across all major AI detectors.',
    features: [
      { feature: 'Multi-module AI detection', us: true, them: false },
      { feature: 'Per-sentence scoring', us: true, them: false },
      { feature: '5 humanization modes', us: true, them: false },
      { feature: 'Academic mode', us: true, them: false },
      { feature: 'SEO mode', us: true, them: false },
      { feature: 'Meaning preservation', us: true, them: true },
      { feature: 'API access', us: true, them: false },
      { feature: 'Usage analytics', us: true, them: false },
      { feature: 'Batch processing', us: true, them: false },
      { feature: 'Free tier available', us: true, them: true },
    ],
  },
  {
    slug: 'vs-stealthgpt',
    competitor: 'StealthGPT',
    tagline: 'Outsmart detectors better than StealthGPT',
    description:
      'StealthGPT generates AI text that tries to avoid detection. HumanizeElite takes a different approach: we analyze and transform any existing text to be undetectable while keeping your voice.',
    features: [
      { feature: 'Transform existing text', us: true, them: false },
      { feature: 'AI content generation', us: false, them: true },
      { feature: 'Detection scoring built-in', us: true, them: true },
      { feature: 'Per-sentence analysis', us: true, them: false },
      { feature: 'Multiple writing modes', us: true, them: true },
      { feature: 'Preserves original meaning', us: true, them: false },
      { feature: 'API access', us: true, them: true },
      { feature: 'Works with any AI source', us: true, them: false },
      { feature: 'Professional mode', us: true, them: false },
      { feature: 'Free tier available', us: true, them: false },
    ],
  },
  {
    slug: 'vs-gptzero',
    competitor: 'GPTZero',
    tagline: 'Detect and fix — not just detect',
    description:
      'GPTZero is a leading AI detector, but it only tells you the problem. HumanizeElite detects AI content AND provides the solution with advanced humanization to make your text undetectable.',
    features: [
      { feature: 'AI detection', us: true, them: true },
      { feature: 'Per-sentence analysis', us: true, them: true },
      { feature: 'AI humanization', us: true, them: false },
      { feature: 'Multiple humanization modes', us: true, them: false },
      { feature: 'One-click detect + fix', us: true, them: false },
      { feature: 'API access', us: true, them: true },
      { feature: 'Batch scanning', us: true, them: true },
      { feature: 'Academic focus', us: true, them: true },
      { feature: 'Usage dashboard', us: true, them: true },
      { feature: 'Free tier available', us: true, them: true },
    ],
  },
];

export function getComparison(slug: string): ComparisonData | undefined {
  return comparisons.find((c) => c.slug === slug);
}

export function getAllComparisonSlugs(): string[] {
  return comparisons.map((c) => c.slug);
}
