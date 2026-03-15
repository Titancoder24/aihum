import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE } from '@/constants';
import { getBlogPost, getAllBlogSlugs, blogPosts } from '@/lib/content/blog-posts';

interface PageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
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
  // Simple markdown-like rendering for headings, bold, lists, and paragraphs
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let key = 0;

  function flushList() {
    if (listItems.length > 0) {
      elements.push(
        <ul key={key++} className="list-disc list-inside space-y-1 text-gray-300 mb-6 ml-4">
          {listItems.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  }

  function renderInline(text: string): React.ReactNode {
    // Handle bold text: **text**
    const parts = text.split(/\*\*(.*?)\*\*/g);
    if (parts.length === 1) return text;
    return parts.map((part, i) =>
      i % 2 === 1 ? (
        <strong key={i} className="text-gray-100 font-semibold">
          {part}
        </strong>
      ) : (
        part
      )
    );
  }

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === '') {
      flushList();
      continue;
    }

    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={key++} className="text-2xl font-bold text-gray-100 mt-10 mb-4">
          {trimmed.slice(3)}
        </h2>
      );
    } else if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={key++} className="text-xl font-semibold text-gray-100 mt-8 mb-3">
          {trimmed.slice(4)}
        </h3>
      );
    } else if (trimmed.startsWith('- ')) {
      listItems.push(trimmed.slice(2));
    } else if (/^\d+\.\s/.test(trimmed)) {
      listItems.push(trimmed.replace(/^\d+\.\s/, ''));
    } else {
      flushList();
      elements.push(
        <p key={key++} className="text-gray-300 leading-relaxed mb-4">
          {renderInline(trimmed)}
        </p>
      );
    }
  }
  flushList();

  return elements;
}

export default function BlogPostPage({ params }: PageProps) {
  const post = getBlogPost(params.slug);
  if (!post) notFound();

  const relatedPosts = blogPosts.filter((p) => p.slug !== post.slug);

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
    },
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      url: SITE.url,
    },
    mainEntityOfPage: `${SITE.url}/blog/${post.slug}`,
  };

  return (
    <div className="min-h-screen bg-background-dark">
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="max-w-3xl mx-auto px-4 py-20">
        {/* Back link */}
        <Link
          href="/blog"
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors mb-8 inline-block"
        >
          &larr; Back to Blog
        </Link>

        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                categoryColors[post.category] ?? 'bg-gray-700 text-gray-300'
              }`}
            >
              {post.category}
            </span>
            <span className="text-xs text-gray-500">{post.readTime}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-100 mb-4 leading-tight">
            {post.title}
          </h1>

          <time className="text-sm text-gray-500" dateTime={post.date}>
            {new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        </header>

        {/* Content */}
        <div className="prose-dark">{renderContent(post.content)}</div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-16 pt-12 border-t border-white/10">
            <h2 className="text-xl font-bold text-gray-100 mb-6">
              Related Articles
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {relatedPosts.map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="glass rounded-xl p-5 hover:bg-white/[0.08] transition-colors group"
                >
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${
                      categoryColors[related.category] ?? 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {related.category}
                  </span>
                  <h3 className="text-base font-semibold text-gray-200 group-hover:text-primary transition-colors line-clamp-2">
                    {related.title}
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">{related.readTime}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}
