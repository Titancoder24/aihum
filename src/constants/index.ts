import type { ModeConfig } from '@/types';

// Detection module weights
export const DEFAULT_DETECTION_WEIGHTS: Record<string, number> = {
  perplexity: 0.20,
  burstiness: 0.18,
  vocabulary: 0.15,
  structural: 0.15,
  coherence: 0.12,
  stylometric: 0.10,
  statistical: 0.10,
};

// Humanization mode configs
export const MODE_CONFIGS: Record<string, ModeConfig> = {
  standard: {
    name: 'standard',
    label: 'Standard',
    description: 'Balanced humanization for blog posts, articles, and general content',
    icon: 'FileText',
    sentenceVariance: 10,
    vocabularyAggressiveness: 0.7,
    preserveFormalTone: false,
    addColloquialisms: true,
    maxIterations: 3,
    targetScoreThreshold: 40,
  },
  academic: {
    name: 'academic',
    label: 'Academic',
    description: 'Optimized for essays, research papers, and academic submissions',
    icon: 'GraduationCap',
    sentenceVariance: 8,
    vocabularyAggressiveness: 0.5,
    preserveFormalTone: true,
    addColloquialisms: false,
    maxIterations: 3,
    targetScoreThreshold: 30,
  },
  creative: {
    name: 'creative',
    label: 'Creative',
    description: 'Maximum humanization for creative writing and opinion pieces',
    icon: 'Palette',
    sentenceVariance: 15,
    vocabularyAggressiveness: 0.9,
    preserveFormalTone: false,
    addColloquialisms: true,
    maxIterations: 3,
    targetScoreThreshold: 20,
  },
  seo: {
    name: 'seo',
    label: 'SEO',
    description: 'Maintains keyword density and SEO structure while humanizing',
    icon: 'Search',
    sentenceVariance: 8,
    vocabularyAggressiveness: 0.6,
    preserveFormalTone: false,
    addColloquialisms: false,
    maxIterations: 2,
    targetScoreThreshold: 45,
  },
  professional: {
    name: 'professional',
    label: 'Professional',
    description: 'For business communications, reports, and professional documents',
    icon: 'Briefcase',
    sentenceVariance: 7,
    vocabularyAggressiveness: 0.5,
    preserveFormalTone: true,
    addColloquialisms: false,
    maxIterations: 3,
    targetScoreThreshold: 35,
  },
};

// App routes
export const ROUTES = {
  home: '/',
  dashboard: '/dashboard',
  detector: '/detector',
  humanizer: '/humanizer',
  analyze: '/analyze',
  settings: '/settings',
  pricing: '/pricing',
  blog: '/blog',
  docs: '/docs/api',
} as const;

// Plan limits
export const PLAN_LIMITS = {
  free: { wordsPerDay: 1000, humanizePerDay: 500 },
  pro: { wordsPerDay: 50000, humanizePerDay: 50000 },
  enterprise: { wordsPerDay: Infinity, humanizePerDay: Infinity },
} as const;

// Site metadata
export const SITE = {
  name: 'HumanizeElite',
  description: 'The world\'s most advanced AI text detection and humanization platform',
  url: 'https://humanizeelite.com',
} as const;
