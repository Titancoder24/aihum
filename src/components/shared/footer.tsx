import { Logo } from './logo';
import { cn } from '@/lib/utils';

const footerSections = [
  {
    title: 'Product',
    links: [
      { label: 'Detector', href: '/app/detect' },
      { label: 'Humanizer', href: '/app/humanize' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'API', href: '/docs/api' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Blog', href: '/blog' },
      { label: 'Docs', href: '/docs' },
      { label: 'Guides', href: '/guides' },
      { label: 'FAQ', href: '#faq' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
  {
    title: 'Connect',
    links: [
      { label: 'Twitter', href: 'https://twitter.com/humanizeelite' },
      { label: 'GitHub', href: 'https://github.com/humanizeelite' },
      { label: 'Discord', href: 'https://discord.gg/humanizeelite' },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="bg-surface-dark border-t border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Logo size="sm" />
            <p className="mt-4 text-sm text-gray-500 leading-relaxed max-w-xs">
              The world&apos;s most advanced AI text detection and humanization platform.
            </p>
          </div>

          {/* Link columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-gray-200 mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className={cn(
                        'text-sm text-gray-500 hover:text-gray-300',
                        'transition-colors duration-200'
                      )}
                      {...(link.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-white/5">
          <p className="text-sm text-gray-600 text-center">
            &copy; {new Date().getFullYear()} HumanizeElite. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
