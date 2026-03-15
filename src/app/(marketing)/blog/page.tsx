import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE } from '@/constants';
import { blogPosts } from '@/lib/content/blog-posts';

export const metadata: Metadata = {
  title: 'Blog — AI Detection & Humanization Insights',
  description:
    'Expert articles on AI detection, humanization techniques, academic integrity, and content creation. Stay ahead of the curve.',
  alternates: { canonical: `${SITE.url}/blog` },
  openGraph: {
    title: 'Blog — AI Detection & Humanization Insights | HumanizeElite',
    description:
      'Expert articles on AI detection, humanization techniques, and content creation.',
    url: `${SITE.url}/blog`,
  },
};

const categoryColors: Record<string, string> = {
  Technology: 'bg-primary/20 text-primary',
  Guide: 'bg-success/20 text-success',
  Education: 'bg-violet-500/20 text-violet-400',
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background-dark">
      <div className="max-w-5xl mx-auto px-4 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-100 mb-4">
            The <span className="gradient-text">HumanizeElite</span> Blog
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Insights on AI detection, humanization techniques, academic integrity,
            and the future of AI-assisted content creation.
          </p>
        </div>

        {/* Post Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="glass rounded-2xl overflow-hidden hover:bg-white/[0.08] transition-colors group flex flex-col"
            >
              {/* Decorative header */}
              <div className="h-2 gradient-primary" />

              <div className="p-6 flex flex-col flex-1">
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

                <h2 className="text-lg font-semibold text-gray-100 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h2>

                <p className="text-gray-400 text-sm leading-relaxed flex-1 line-clamp-3">
                  {post.excerpt}
                </p>

                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                  <time className="text-xs text-gray-500" dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                  <span className="text-primary text-sm font-medium group-hover:underline">
                    Read more
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
