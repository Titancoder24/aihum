import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE } from '@/constants';
import { blogPosts } from '@/lib/content/blog-posts';

export const metadata: Metadata = {
  title: 'Blog — AI Detection & Humanization Insights',
  description:
    'Expert insights on AI detection, text humanization, and content authenticity. Tips, guides, and industry analysis from the HumanizeElite team.',
  alternates: { canonical: `${SITE.url}/blog` },
  openGraph: {
    title: 'Blog — AI Detection & Humanization Insights | HumanizeElite',
    description:
      'Expert insights on AI detection, text humanization, and content authenticity.',
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
            The HumanizeElite <span className="gradient-text">Blog</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Expert insights on AI detection, text humanization, and the evolving
            landscape of AI-generated content.
          </p>
        </div>

        {/* Post Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="glass rounded-2xl overflow-hidden group hover:bg-white/[0.08] transition-colors"
            >
              {/* Gradient placeholder for image */}
              <div className="h-40 bg-gradient-to-br from-primary/20 to-violet-500/20" />

              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      categoryColors[post.category] ?? 'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    {post.category}
                  </span>
                  <span className="text-xs text-gray-500">{post.readTime}</span>
                </div>

                <h2 className="text-lg font-semibold text-gray-100 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h2>

                <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>

                <div className="mt-4 text-xs text-gray-500">
                  {new Date(post.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
