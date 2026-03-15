export interface UseCaseTestimonial {
  quote: string;
  name: string;
  role: string;
}

export interface UseCaseData {
  slug: string;
  title: string;
  description: string;
  benefits: string[];
  testimonial: UseCaseTestimonial;
}

export const useCases: UseCaseData[] = [
  {
    slug: 'students',
    title: 'For Students',
    description:
      'Use AI as a learning tool without triggering plagiarism detectors. HumanizeElite helps students refine AI-assisted drafts into authentic, personal writing that reflects their own understanding.',
    benefits: [
      'Bypass Turnitin and GPTZero AI detection with confidence',
      'Preserve your original arguments and thesis while humanizing the language',
      'Academic mode specifically tuned for essays, research papers, and dissertations',
      'Learn to write better by comparing AI patterns with human writing styles',
      'Process long documents up to 10,000 words in a single pass',
      'Free tier gives you 1,000 words per day — enough for daily assignments',
    ],
    testimonial: {
      quote:
        'I use ChatGPT to help me brainstorm and outline my essays, but my university runs everything through Turnitin. HumanizeElite lets me refine the AI draft into something that genuinely sounds like me.',
      name: 'Sarah K.',
      role: 'Graduate Student, NYU',
    },
  },
  {
    slug: 'seo-marketers',
    title: 'For SEO Marketers',
    description:
      'Scale your content production with AI while keeping it undetectable. HumanizeElite\'s SEO mode preserves keyword density and structure while making every article sound naturally written.',
    benefits: [
      'SEO mode preserves keyword placement and density during humanization',
      'Produce 10x more content without sacrificing quality or authenticity',
      'Avoid Google\'s AI content penalties with text that reads as human-written',
      'Batch process multiple articles through the API for maximum efficiency',
      'Maintain consistent brand voice across all humanized content',
      'Built-in detection scoring ensures every piece passes before publishing',
    ],
    testimonial: {
      quote:
        'We went from publishing 5 articles a week to 30 — all passing AI detection. Our organic traffic grew 400% in three months. HumanizeElite is the backbone of our content strategy.',
      name: 'Marcus R.',
      role: 'Head of Content, GrowthPulse Agency',
    },
  },
  {
    slug: 'content-writers',
    title: 'For Content Writers',
    description:
      'Enhance your AI-assisted workflow without losing your creative voice. HumanizeElite transforms AI drafts into polished pieces that sound authentically human and pass all detection tools.',
    benefits: [
      'Creative mode adds natural variation, idioms, and personal flair',
      'Standard mode balances readability with detection evasion',
      'Preserve your unique writing style while removing AI fingerprints',
      'Process blog posts, newsletters, social media copy, and more',
      'Side-by-side comparison of original vs humanized text',
      'Detailed change log shows exactly what was modified and why',
    ],
    testimonial: {
      quote:
        'As a freelance writer, I use AI to beat writer\'s block and speed up first drafts. HumanizeElite makes sure my clients never question the authenticity of my work. It\'s become indispensable.',
      name: 'Jennifer L.',
      role: 'Freelance Content Writer',
    },
  },
  {
    slug: 'academic-researchers',
    title: 'For Academic Researchers',
    description:
      'Ensure your AI-assisted research writing meets the highest academic integrity standards. HumanizeElite\'s academic mode is tuned for formal, citation-heavy text common in research.',
    benefits: [
      'Academic mode preserves formal tone, citations, and technical vocabulary',
      'Process abstracts, literature reviews, and methodology sections',
      'Maintain precise scientific terminology while humanizing prose',
      'Ensure compliance with institutional AI usage policies',
      'Detailed per-sentence scoring identifies the most AI-like passages',
      'Iterative refinement until detection score drops below threshold',
    ],
    testimonial: {
      quote:
        'I needed help writing my literature review in English, which is my second language. HumanizeElite preserved all my citations and technical terms while making the prose flow naturally.',
      name: 'Dr. Wei Chen',
      role: 'Postdoctoral Researcher, MIT',
    },
  },
  {
    slug: 'business-professionals',
    title: 'For Business Professionals',
    description:
      'Draft reports, proposals, and communications with AI assistance — then humanize them to maintain professional credibility. HumanizeElite\'s professional mode is built for business writing.',
    benefits: [
      'Professional mode maintains formal, corporate-appropriate tone',
      'Perfect for reports, proposals, executive summaries, and memos',
      'Ensure AI-assisted communications pass internal compliance checks',
      'API integration for automated document processing workflows',
      'Enterprise plan with unlimited processing for large teams',
      'SOC 2 compliant processing — your data is never stored or shared',
    ],
    testimonial: {
      quote:
        'Our consulting team uses AI to draft client deliverables, but quality and authenticity matter. HumanizeElite\'s professional mode ensures every report reads as if a senior consultant wrote it.',
      name: 'David M.',
      role: 'Managing Director, Apex Consulting',
    },
  },
];

export function getUseCase(slug: string): UseCaseData | undefined {
  return useCases.find((uc) => uc.slug === slug);
}

export function getAllUseCaseSlugs(): string[] {
  return useCases.map((uc) => uc.slug);
}
