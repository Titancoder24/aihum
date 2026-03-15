'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Shield,
  Wand2,
  Sparkles,
  Settings,
  Menu,
  X,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useUsage } from '@/hooks/use-usage';
import { ROUTES } from '@/constants';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: ROUTES.dashboard },
  { label: 'Detector', icon: Shield, href: ROUTES.detector },
  { label: 'Humanizer', icon: Wand2, href: ROUTES.humanizer },
  { label: 'Analyze', icon: Sparkles, href: ROUTES.analyze },
  { label: 'Settings', icon: Settings, href: ROUTES.settings },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { usage } = useUsage();

  const usagePercent = usage
    ? Math.min((usage.wordsUsedToday / usage.wordsLimit) * 100, 100)
    : 0;

  return (
    <div className="flex h-full flex-col bg-[#141420] border-r border-white/[0.06]">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-white/[0.06]">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-semibold text-white"
          onClick={onClose}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6366F1]">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-base tracking-tight">HumanizeElite</span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-white/50 hover:bg-white/[0.06] hover:text-white transition-colors lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-[#6366F1] text-white shadow-lg shadow-[#6366F1]/20'
                  : 'text-white/50 hover:bg-white/[0.06] hover:text-white'
              )}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Usage Meter */}
      <div className="border-t border-white/[0.06] p-4">
        <div className="rounded-xl bg-white/[0.03] p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium text-white/50">
              Words Today
            </span>
            <span className="text-xs font-semibold text-white/80">
              {usage?.wordsUsedToday?.toLocaleString() ?? 0} /{' '}
              {usage?.wordsLimit?.toLocaleString() ?? '1,000'}
            </span>
          </div>
          <Progress
            value={usagePercent}
            className="h-2"
          />
          {usagePercent >= 80 && (
            <p className="mt-2 text-[11px] text-[#F59E0B]">
              Running low on words. Upgrade for more.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-lg bg-[#141420] p-2 text-white/70 shadow-lg border border-white/[0.06] hover:text-white transition-colors lg:hidden"
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-64">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] lg:hidden"
            >
              <SidebarContent onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
