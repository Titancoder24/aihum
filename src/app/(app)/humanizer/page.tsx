'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { ScoreGauge } from '@/components/ui/score-gauge';
import { TextDiff } from '@/components/ui/text-diff';
import { ModeSelector } from '@/components/ui/mode-selector';
import { CopyButton } from '@/components/ui/copy-button';
import { useHumanization } from '@/hooks/use-humanization';
import { useAppStore } from '@/stores/app-store';
import { wordCount } from '@/lib/utils';
import type { HumanizationMode } from '@/types';

export default function HumanizerPage() {
  const [text, setText] = useState('');
  const [mode, setMode] = useState<HumanizationMode>('standard');
  const { humanize, result, isLoading, reset } = useHumanization();
  const { currentText, setCurrentText } = useAppStore();

  // Pre-fill if coming from detector
  useEffect(() => {
    if (currentText) {
      setText(currentText);
      setCurrentText('');
    }
  }, [currentText, setCurrentText]);

  const count = wordCount(text);

  const handleHumanize = useCallback(async () => {
    if (!text.trim() || isLoading) return;
    await humanize(text, mode);
  }, [text, mode, isLoading, humanize]);

  const handleHumanizeAgain = useCallback(async () => {
    if (!result?.humanizedText || isLoading) return;
    await humanize(result.humanizedText, mode);
  }, [result, mode, isLoading, humanize]);

  const handleClear = useCallback(() => {
    setText('');
    reset();
  }, [reset]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Input */}
      <Card className="border-white/[0.06] bg-[#141420]">
        <CardContent className="p-6">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your AI-generated text here to humanize it..."
            className="min-h-[180px] resize-y border-white/[0.06] bg-white/[0.02] text-sm text-white placeholder:text-white/25 focus:border-[#6366F1]/50 focus:ring-[#6366F1]/20"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-white/30">
              {count} {count === 1 ? 'word' : 'words'}
            </span>
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
          </div>
        </CardContent>
      </Card>

      {/* Mode Selector */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-white/70">
          Humanization Mode
        </h2>
        <ModeSelector value={mode} onChange={setMode} />
      </div>

      {/* Humanize Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleHumanize}
          disabled={!text.trim() || isLoading}
          size="lg"
          className="bg-[#6366F1] px-8 text-white hover:bg-[#5558E6] disabled:opacity-40"
        >
          {isLoading ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Humanizing...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Humanize
            </>
          )}
        </Button>
      </div>

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
            {/* Before/After Scores */}
            <div className="grid gap-6 sm:grid-cols-2">
              <Card className="border-white/[0.06] bg-[#141420]">
                <CardContent className="flex flex-col items-center py-8">
                  <p className="mb-4 text-xs font-medium uppercase tracking-wider text-white/40">
                    Before
                  </p>
                  <ScoreGauge value={result.originalScore} size="md" />
                  <p className="mt-3 text-sm text-white/50">
                    AI Score: {Math.round(result.originalScore)}%
                  </p>
                </CardContent>
              </Card>
              <Card className="border-white/[0.06] bg-[#141420]">
                <CardContent className="flex flex-col items-center py-8">
                  <p className="mb-4 text-xs font-medium uppercase tracking-wider text-white/40">
                    After
                  </p>
                  <ScoreGauge value={result.humanizedScore} size="md" />
                  <p className="mt-3 text-sm text-white/50">
                    AI Score: {Math.round(result.humanizedScore)}%
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Diff View */}
            <Card className="border-white/[0.06] bg-[#141420]">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold text-white">
                  Original vs Humanized
                </CardTitle>
                <CopyButton text={result.humanizedText} />
              </CardHeader>
              <CardContent>
                <TextDiff
                  original={text}
                  modified={result.humanizedText}
                />
              </CardContent>
            </Card>

            {/* Stage Breakdown */}
            {result.stages && result.stages.length > 0 && (
              <Card className="border-white/[0.06] bg-[#141420]">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-white">
                    Stage Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.stages.map((stage, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 rounded-lg border border-white/[0.04] bg-white/[0.02] p-4"
                    >
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#6366F1]/10 text-[11px] font-bold text-[#6366F1]">
                        {idx + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white/80">
                          {stage.name}
                        </p>
                        <p className="mt-0.5 text-xs text-white/40">
                          {stage.changesCount} changes applied
                        </p>
                        {stage.details && (
                          <p className="mt-1 text-xs leading-relaxed text-white/30">
                            {stage.details}
                          </p>
                        )}
                      </div>
                      {stage.scoreBefore != null && stage.scoreAfter != null && (
                        <div className="shrink-0 text-right">
                          <span className="text-xs text-white/30">
                            {Math.round(stage.scoreBefore)}%
                          </span>
                          <span className="mx-1.5 text-xs text-white/20">
                            &rarr;
                          </span>
                          <span className="text-xs font-medium text-[#10B981]">
                            {Math.round(stage.scoreAfter)}%
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex items-center justify-center gap-3">
              <Button
                onClick={handleHumanizeAgain}
                disabled={isLoading}
                variant="outline"
                className="border-white/[0.08] text-white/70 hover:bg-white/[0.04] hover:text-white"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Humanize Again
              </Button>
              <CopyButton
                text={result.humanizedText}
                variant="default"
                className="bg-[#10B981] text-white hover:bg-[#0EA472]"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
