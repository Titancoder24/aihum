'use client';

import { usePathname } from 'next/navigation';
import { Moon, Sun } from 'lucide-react';
import { Sidebar } from '@/components/shared/sidebar';
import { Button } from '@/components/ui/button';
import { useThemeStore } from '@/stores/theme-store';
import { cn } from '@/lib/utils';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/detector': 'AI Detector',
  '/humanizer': 'AI Humanizer',
  '/analyze': 'Analyze',
  '/settings': 'Settings',
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useThemeStore();

  const pageTitle = pageTitles[pathname] ?? 'HumanizeElite';

  return (
    <div className={cn('min-h-screen bg-[#0A0A0F] text-white', theme)}>
      <Sidebar />

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/[0.06] bg-[#0A0A0F]/80 backdrop-blur-xl px-6 lg:px-8">
          {/* Spacer for mobile menu button */}
          <div className="w-10 lg:hidden" />

          <h1 className="text-lg font-semibold tracking-tight text-white">
            {pageTitle}
          </h1>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 rounded-lg text-white/50 hover:bg-white/[0.06] hover:text-white"
          >
            {theme === 'dark' ? (
              <Sun className="h-[18px] w-[18px]" />
            ) : (
              <Moon className="h-[18px] w-[18px]" />
            )}
          </Button>
        </header>

        {/* Page content */}
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
