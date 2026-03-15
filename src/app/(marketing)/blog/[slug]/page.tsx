import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { SITE } from '@/constants';
import { getBlogPost, getAllBlogSlugs, blogPosts } from '@/lib/content/blog-posts';

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const post = getBlogPost(params.slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `${SITE.url}/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `${SITE.url}/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.date,
    },
    other: {
      'article:published_time': post.date,
      'article:section': post.category,
    },
  };
}

const categoryColors: Record<string, string> = {
  Technology: 'bg-primary/20 text-primary',
  Guide: 'bg-success/20 text-success',
  Education: 'bg-violet-500/20 text-violet-400',
};

function renderContent(content: string) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={key++} className="text-2xl font-bold text-gray-100 mt-10 mb-4">
          {trimmed.slice(3)}
        </h2>
      );
    } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      elements.push(
        <p key={key++} className="text-gray-200 font-semibold mt-4 mb-2">
          {trimmed.slice(2, -2)}
        </p>
      );
    } else if (trimmed.startsWith('- ')) {
      elements.push(
        <li key={key++} className="text-gray-400 leading-relaxed ml-4 list-disc">
          {trimmed.slice(2)}
        </li>
      );
    } else if (trimmed.startsWith('1. ') || trimmed.startsWith('2. ') || trimmed.startsWith('3. ') || trimmed.startsWith('4. ') || trimmed.startsWith('5. ')) {
      elements.push(
        <li key={key++} className="text-gray-400 leading-relaxed ml-4 list-decimal">
          {trimmed.slice(trimmed.indexOf(' ') + 1)}
        </li>
      );
    } else if (trimmed === '') {
      // skip empty lines
    } else {
      // Process inline bold markers
      const parts = trimmed.split(/(\*\*[^*]+\*\*)/g);
      const processed = parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="text-gray-200">{part.slice(2, -2)}</strong>;
        }
        return part;
      });
      elements.push(
        <p key={key++} className="text-gray-400 leading-relaxed mb-4">
          {processed}
        </p>
      );
    }
  }

  return elements;
}

export default function BlogPostPage({ params }: Props) {
  const post = getBlogPost(params.slug);
  if (!post) notFound();

  const relatedPosts = blogPosts
    .filter((p) => p.slug !== post.slug)
    .slice(0, 2);

  // Article structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: {
      '@type': 'Organization',
      name: SITE.name,
      url: SITE.url,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      url: SITE.url,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE.url}/blog/${post.slug}`,
    },
  };

  return (
    <div className="min-h-screen bg-background-dark">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="max-w-3xl mx-auto px-4 py-20">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-6"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back to Blog
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                categoryColors[post.category] ?? 'bg-gray-500/20 text-gray-400'
              }`}
            >
              {post.category}
            </span>
            <span className="text-xs text-gray-500">{post.readTime}</span>
            <span className="text-xs text-gray-500">
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-100 leading-tight">
            {post.title}
          </h1>
        </div>

        {/* Content */}
        <div className="prose-custom">{renderContent(post.content)}</div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 pb-20">
          <h2 className="text-xl font-bold text-gray-100 mb-6">Related Articles</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {relatedPosts.map((related) => (
              <Link
                key={related.slug}
                href={`/blog/${related.slug}`}
                className="glass rounded-xl p-6 hover:bg-white/[0.08] transition-colors group"
              >
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-3 ${
                    categoryColors[related.category] ?? 'bg-gray-500/20 text-gray-400'
                  }`}
                >
                  {related.category}
                </span>
                <h3 className="text-base font-semibold text-gray-100 group-hover:text-primary transition-colors line-clamp-2">
                  {related.title}
                </h3>
                <p className="text-gray-400 text-sm mt-2 line-clamp-2">{related.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
