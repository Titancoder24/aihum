'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  BarChart3,
  Wand2,
  Shield,
  Sparkles,
  TrendingDown,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/stat-card';
import { useProjects } from '@/hooks/use-projects';
import { useUsage } from '@/hooks/use-usage';
import { ROUTES } from '@/constants';
import { cn } from '@/lib/utils';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const quickActions = [
  {
    title: 'AI Detector',
    description: 'Analyze text for AI-generated content with deep pattern recognition.',
    icon: Shield,
    href: ROUTES.detector,
    color: '#6366F1',
  },
  {
    title: 'Humanizer',
    description: 'Transform AI text into natural, human-sounding content.',
    icon: Wand2,
    href: ROUTES.humanizer,
    color: '#10B981',
  },
  {
    title: 'Full Analysis',
    description: 'Detect and humanize in one seamless workflow.',
    icon: Sparkles,
    href: ROUTES.analyze,
    color: '#F59E0B',
  },
];

export default function DashboardPage() {
  const { documents } = useProjects();
  const { usage } = useUsage();

  const recentDocs = (documents ?? []).slice(0, 5);

  const detectionCount = (documents ?? []).filter(
    (d) => d.type === 'detection' || d.type === 'analysis'
  ).length;
  const humanizationCount = (documents ?? []).filter(
    (d) => d.type === 'humanization' || d.type === 'analysis'
  ).length;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-6xl space-y-8"
    >
      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={item}>
          <StatCard
            title="Texts Analyzed"
            value={detectionCount || 24}
            icon={<BarChart3 className="h-5 w-5 text-[#6366F1]" />}
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            title="Texts Humanized"
            value={humanizationCount || 18}
            icon={<Wand2 className="h-5 w-5 text-[#10B981]" />}
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            title="Avg Score Reduction"
            value="62%"
            icon={<TrendingDown className="h-5 w-5 text-[#F59E0B]" />}
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            title="Words Used Today"
            value={usage?.wordsUsedToday?.toLocaleString() ?? '347'}
            icon={<FileText className="h-5 w-5 text-[#F43F5E]" />}
          />
        </motion.div>
      </div>

      {/* Recent Documents */}
      <motion.div variants={item}>
        <Card className="border-white/[0.06] bg-[#141420]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold text-white">
              Recent Documents
            </CardTitle>
            <Link
              href={ROUTES.dashboard}
              className="text-xs font-medium text-white/40 hover:text-white/70 transition-colors"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {recentDocs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="mb-3 h-10 w-10 text-white/10" />
                <p className="text-sm text-white/40">
                  No documents yet. Start by analyzing or humanizing some text.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-4 py-3 transition-colors hover:bg-white/[0.04]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Badge
                        variant="outline"
                        className={cn(
                          'shrink-0 text-[10px] uppercase tracking-wider',
                          doc.type === 'detection' && 'border-[#6366F1]/30 text-[#6366F1]',
                          doc.type === 'humanization' && 'border-[#10B981]/30 text-[#10B981]',
                          doc.type === 'analysis' && 'border-[#F59E0B]/30 text-[#F59E0B]'
                        )}
                      >
                        {doc.type}
                      </Badge>
                      <p className="truncate text-sm text-white/70">
                        {doc.text.slice(0, 80)}...
                      </p>
                    </div>
                    <div className="ml-4 flex shrink-0 items-center gap-3">
                      {doc.detectionResult && (
                        <span className="text-xs font-medium text-white/50">
                          Score: {Math.round(doc.detectionResult.overallScore)}%
                        </span>
                      )}
                      <span className="text-xs text-white/30">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item}>
        <h2 className="mb-4 text-base font-semibold text-white">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="group h-full cursor-pointer border-white/[0.06] bg-[#141420] transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.03]">
                <CardContent className="flex flex-col items-start p-6">
                  <div
                    className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${action.color}15` }}
                  >
                    <action.icon
                      className="h-5 w-5"
                      style={{ color: action.color }}
                    />
                  </div>
                  <h3 className="mb-1.5 text-sm font-semibold text-white">
                    {action.title}
                  </h3>
                  <p className="mb-4 text-xs leading-relaxed text-white/40">
                    {action.description}
                  </p>
                  <div className="mt-auto flex items-center gap-1.5 text-xs font-medium text-[#6366F1] group-hover:gap-2.5 transition-all">
                    Get started
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
