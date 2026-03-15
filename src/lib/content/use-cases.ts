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
    title: 'AI Humanizer for Students',
    description:
      'Use AI tools responsibly for learning while ensuring your submissions reflect genuine understanding. HumanizeElite helps students refine AI-assisted drafts into authentic, original work that passes academic integrity checks.',
    benefits: [
      'Refine AI-generated study notes into natural, personal language',
      'Ensure essays maintain your unique voice and writing style',
      'Academic mode preserves formal tone and citation structure',
      'Sentence-level analysis shows exactly which parts need revision',
      'Learn to recognize AI-like patterns in your own writing',
      'Free tier perfect for occasional homework assistance',
    ],
    testimonial: {
      quote:
        'I use ChatGPT to brainstorm ideas and outline my essays, then run them through HumanizeElite to make sure the final draft sounds like me. My writing has actually improved because I can see which patterns look too robotic.',
      name: 'Sarah M.',
      role: 'Graduate Student, English Literature',
    },
  },
  {
    slug: 'seo-marketers',
    title: 'AI Humanizer for SEO Marketers',
    description:
      'Scale your content production with AI while keeping every piece genuinely engaging and undetectable. The SEO mode preserves keyword density and heading structure while humanizing the text.',
    benefits: [
      'SEO mode preserves keyword placement and density',
      'Maintain heading hierarchy and content structure',
      'Scale content production without sacrificing quality',
      'Batch process dozens of articles in minutes',
      'Before/after AI scores for quality assurance',
      'API integration for automated content pipelines',
    ],
    testimonial: {
      quote:
        'We produce 50+ articles per month with AI assistance. HumanizeElite is the final step in our pipeline that ensures every piece reads naturally while keeping our keyword strategy intact.',
      name: 'David K.',
      role: 'SEO Director, Digital Agency',
    },
  },
  {
    slug: 'content-writers',
    title: 'AI Humanizer for Content Writers',
    description:
      'Accelerate your writing workflow by using AI for first drafts, then polish them into publication-ready content that feels authentically human. Multiple writing modes adapt to any content type.',
    benefits: [
      'Transform AI drafts into engaging, human-sounding content',
      'Creative mode adds natural flair and personality',
      'Professional mode for business and corporate content',
      'Preserve your unique voice and style across all content',
      'Detailed change tracking shows every modification',
      'Works with blog posts, newsletters, social media, and more',
    ],
    testimonial: {
      quote:
        'As a freelance writer handling multiple clients, AI helps me keep up with demand. HumanizeElite is essential — it turns good AI drafts into great human content that my clients love.',
      name: 'Emily R.',
      role: 'Freelance Content Writer',
    },
  },
  {
    slug: 'academic-researchers',
    title: 'AI Humanizer for Academic Researchers',
    description:
      'Use AI tools to accelerate literature reviews, draft methodology sections, and refine research papers while ensuring every word meets the highest standards of academic integrity.',
    benefits: [
      'Academic mode preserves scholarly tone and terminology',
      'Maintains citation formatting and reference structure',
      'Refine AI-assisted literature reviews into original analysis',
      'Sentence-level detection identifies problematic passages',
      'Pattern reports explain why text appears AI-generated',
      'Supports the research writing workflow without compromising integrity',
    ],
    testimonial: {
      quote:
        'Drafting papers is time-consuming. I use AI to help structure my arguments, then HumanizeElite ensures my writing maintains the academic rigor expected in peer-reviewed journals.',
      name: 'Dr. James L.',
      role: 'Associate Professor, Computer Science',
    },
  },
  {
    slug: 'business-professionals',
    title: 'AI Humanizer for Business Professionals',
    description:
      'Create polished business documents, proposals, and communications efficiently with AI assistance. Professional mode ensures every document maintains corporate quality and authentic tone.',
    benefits: [
      'Professional mode for corporate communications',
      'Polish proposals, reports, and presentations',
      'Maintain brand voice consistency across teams',
      'Batch process multiple documents simultaneously',
      'API integration for enterprise content workflows',
      'Enterprise plan with unlimited processing',
    ],
    testimonial: {
      quote:
        'Our marketing team uses AI to draft client proposals and internal reports. HumanizeElite ensures everything reads like it came from our senior team, maintaining our professional reputation.',
      name: 'Michael T.',
      role: 'VP of Marketing, SaaS Company',
    },
  },
];

export function getUseCase(slug: string): UseCaseData | undefined {
  return useCases.find((uc) => uc.slug === slug);
}

export function getAllUseCaseSlugs(): string[] {
  return useCases.map((uc) => uc.slug);
}
