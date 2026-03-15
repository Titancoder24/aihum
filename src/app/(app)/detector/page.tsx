'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ArrowRight, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { ScoreGauge } from '@/components/ui/score-gauge';
import { HighlightedText } from '@/components/ui/highlighted-text';
import { ChartBar } from '@/components/ui/chart-bar';
import { useDetection } from '@/hooks/use-detection';
import { useAppStore } from '@/stores/app-store';
import { wordCount } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants';

const confidenceConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  low: { label: 'Low Confidence', color: '#10B981', icon: CheckCircle },
  medium: { label: 'Medium Confidence', color: '#F59E0B', icon: Info },
  high: { label: 'High Confidence', color: '#F43F5E', icon: AlertTriangle },
  'very-high': { label: 'Very High Confidence', color: '#F43F5E', icon: AlertTriangle },
};

export default function DetectorPage() {
  const router = useRouter();
  const [text, setText] = useState('');
  const { detect, result, isLoading, reset } = useDetection();
  const { setCurrentText } = useAppStore();

  const count = wordCount(text);

  const handleDetect = useCallback(async () => {
    if (!text.trim() || isLoading) return;
    await detect(text);
  }, [text, isLoading, detect]);

  const handleHumanize = useCallback(() => {
    setCurrentText(text);
    router.push(ROUTES.humanizer);
  }, [text, setCurrentText, router]);

  const handleClear = useCallback(() => {
    setText('');
    reset();
  }, [reset]);

  const conf = result ? confidenceConfig[result.confidence] : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Input Section */}
      <Card className="border-white/[0.06] bg-[#141420]">
        <CardContent className="p-6">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your text here to detect AI content..."
            className="min-h-[200px] resize-y border-white/[0.06] bg-white/[0.02] text-sm text-white placeholder:text-white/25 focus:border-[#6366F1]/50 focus:ring-[#6366F1]/20"
          />
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-white/30">
              {count} {count === 1 ? 'word' : 'words'}
            </span>
            <div className="flex items-center gap-2">
              {result && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="text-xs text-white/40 hover:text-white"
                >
                  Clear
                </Button>
              )}
              <Button
                onClick={handleDetect}
                disabled={!text.trim() || isLoading}
                className="bg-[#6366F1] text-white hover:bg-[#5558E6] disabled:opacity-40"
              >
                {isLoading ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Detect AI Content
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="space-y-6"
          >
            {/* Score + Confidence */}
            <Card className="border-white/[0.06] bg-[#141420]">
              <CardContent className="flex flex-col items-center py-10">
                <ScoreGauge value={result.overallScore} size="lg" />
                <p className="mt-4 text-sm font-medium text-white/60">
                  AI Detection Score
                </p>
                {conf && (
                  <Badge
                    className="mt-3 gap-1.5 border-transparent px-3 py-1"
                    style={{
                      backgroundColor: `${conf.color}15`,
                      color: conf.color,
                    }}
                  >
                    <conf.icon className="h-3.5 w-3.5" />
                    {conf.label}
                  </Badge>
                )}
                <p className="mt-2 text-xs text-white/30">
                  Processed {result.wordCount} words in {result.processingTimeMs}ms
                </p>
              </CardContent>
            </Card>

            {/* Highlighted Text */}
            <Card className="border-white/[0.06] bg-[#141420]">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-white">
                  Sentence-Level Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <HighlightedText sentences={result.sentences} />
                <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-white/[0.04] pt-4">
                  {[
                    { label: 'Human', color: '#10B981' },
                    { label: 'Likely Human', color: '#F59E0B' },
                    { label: 'Likely AI', color: '#F97316' },
                    { label: 'AI Generated', color: '#F43F5E' },
                  ].map((legend) => (
                    <div key={legend.label} className="flex items-center gap-1.5">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: legend.color }}
                      />
                      <span className="text-[11px] text-white/40">{legend.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Module Breakdown */}
            <Card className="border-white/[0.06] bg-[#141420]">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-white">
                  Module Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.modules.map((mod) => (
                  <ChartBar
                    key={mod.name}
                    label={mod.name}
                    value={Math.round(mod.score * 100)}
                    maxValue={100}
                    weight={mod.weight}
                  />
                ))}
              </CardContent>
            </Card>

            {/* Detected Patterns */}
            {result.patterns.length > 0 && (
              <Card className="border-white/[0.06] bg-[#141420]">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-white">
                    Detected Patterns
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.patterns.map((pattern, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-4"
                    >
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-sm font-medium text-white/80">
                          {pattern.name}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] uppercase',
                            pattern.severity === 'high' && 'border-[#F43F5E]/30 text-[#F43F5E]',
                            pattern.severity === 'medium' && 'border-[#F59E0B]/30 text-[#F59E0B]',
                            pattern.severity === 'low' && 'border-[#10B981]/30 text-[#10B981]'
                          )}
                        >
                          {pattern.severity}
                        </Badge>
                      </div>
                      <p className="text-xs leading-relaxed text-white/40">
                        {pattern.description}
                      </p>
                      {pattern.examples.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {pattern.examples.slice(0, 2).map((ex, i) => (
                            <p
                              key={i}
                              className="text-xs italic text-white/25 before:content-['\u201C'] after:content-['\u201D']"
                            >
                              {ex}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Humanize CTA */}
            <div className="flex justify-center">
              <Button
                onClick={handleHumanize}
                size="lg"
                className="bg-[#10B981] text-white hover:bg-[#0EA472]"
              >
                Humanize This Text
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
