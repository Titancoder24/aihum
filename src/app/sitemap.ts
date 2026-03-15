import type { MetadataRoute } from 'next';
import { SITE } from '@/constants';
import { getAllComparisonSlugs } from '@/lib/content/comparisons';
import { getAllUseCaseSlugs } from '@/lib/content/use-cases';
import { getAllBlogSlugs } from '@/lib/content/blog-posts';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE.url;

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/detector`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/humanizer`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/analyze`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/docs/api`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/tools`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/tools/ai-detector`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/tools/ai-humanizer`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  ];

  const comparisonPages: MetadataRoute.Sitemap = getAllComparisonSlugs().map((slug) => ({
    url: `${baseUrl}/compare/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const useCasePages: MetadataRoute.Sitemap = getAllUseCaseSlugs().map((slug) => ({
    url: `${baseUrl}/use-cases/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const blogPages: MetadataRoute.Sitemap = getAllBlogSlugs().map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...comparisonPages, ...useCasePages, ...blogPages];
}
