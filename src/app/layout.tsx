import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'HumanizeElite — AI Text Detection & Humanization',
    template: '%s | HumanizeElite',
  },
  description: 'The world\'s most advanced AI text detection and humanization platform. Detect AI content with surgical precision. Humanize it beyond detection.',
  keywords: ['AI detection', 'AI humanizer', 'humanize AI text', 'bypass AI detection', 'GPTZero', 'Turnitin'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen font-sans">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
