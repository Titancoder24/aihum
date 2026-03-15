'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Shield,
  Wand2,
  CheckCircle,
  ArrowRight,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { ScoreGauge } from '@/components/ui/score-gauge';
import { HighlightedText } from '@/components/ui/highlighted-text';
import { ChartBar } from '@/components/ui/chart-bar';
import { TextDiff } from '@/components/ui/text-diff';
import { ModeSelector } from '@/components/ui/mode-selector';
import { CopyButton } from '@/components/ui/copy-button';
import { useDetection } from '@/hooks/use-detection';
import { useHumanization } from '@/hooks/use-humanization';
import { wordCount, cn } from '@/lib/utils';
import type { HumanizationMode } from '@/types';

type Step = 1 | 2 | 3 | 4;

const steps = [
  { num: 1, label: 'Input', icon: FileText },
  { num: 2, label: 'Detect', icon: Shield },
  { num: 3, label: 'Humanize', icon: Wand2 },
  { num: 4, label: 'Done', icon: CheckCircle },
] as const;

export default function AnalyzePage() {
  const [text, setText] = useState('');
  const [step, setStep] = useState<Step>(1);
  const [mode, setMode] = useState<HumanizationMode>('standard');
  const {
    detect,
    result: detectionResult,
    isLoading: isDetecting,
    reset: resetDetection,
  } = useDetection();
  const {
    humanize,
    result: humanizationResult,
    isLoading: isHumanizing,
    reset: resetHumanization,
  } = useHumanization();

  const count = wordCount(text);

  const handleAnalyze = useCallback(async () => {
    if (!text.trim() || isDetecting) return;
    await detect(text);
    setStep(2);
  }, [text, isDetecting, detect]);

  const handleHumanize = useCallback(async () => {
    if (!text.trim() || isHumanizing) return;
    await humanize(text, mode);
    setStep(4);
  }, [text, mode, isHumanizing, humanize]);

  const handleReset = useCallback(() => {
    setText('');
    setStep(1);
    resetDetection();
    resetHumanization();
  }, [resetDetection, resetHumanization]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-1">
        {steps.map((s, idx) => {
          const isActive = s.num === step;
          const isCompleted = s.num < step;
          return (
            <div key={s.num} className="flex items-center">
              <div
                className={cn(
                  'flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all duration-200',
                  isActive && 'bg-[#6366F1] text-white',
                  isCompleted && 'bg-[#6366F1]/15 text-[#6366F1]',
                  !isActive && !isCompleted && 'bg-white/[0.04] text-white/30'
                )}
              >
                <s.icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    'mx-1 h-px w-6 sm:w-10',
                    s.num < step ? 'bg-[#6366F1]/40' : 'bg-white/[0.06]'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step 1: Input */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <Card className="border-white/[0.06] bg-[#141420]">
              <CardContent className="p-6">
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste your text here for full analysis..."
                  className="min-h-[200px] resize-y border-white/[0.06] bg-white/[0.02] text-sm text-white placeholder:text-white/25 focus:border-[#6366F1]/50 focus:ring-[#6366F1]/20"
                />
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-white/30">
                    {count} {count === 1 ? 'word' : 'words'}
                  </span>
                  <Button
                    onClick={handleAnalyze}
                    disabled={!text.trim() || isDetecting}
                    className="bg-[#6366F1] text-white hover:bg-[#5558E6] disabled:opacity-40"
                  >
                    {isDetecting ? (
                      <>
                        <Spinner className="mr-2 h-4 w-4" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Analyze
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Detection Results */}
        {step === 2 && detectionResult && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Score */}
            <Card className="border-white/[0.06] bg-[#141420]">
              <CardContent className="flex flex-col items-center py-8">
                <ScoreGauge value={detectionResult.overallScore} size="lg" />
                <p className="mt-3 text-sm text-white/50">AI Detection Score</p>
                <Badge
                  className="mt-2 border-transparent"
                  style={{
                    backgroundColor:
                      detectionResult.overallScore > 60
                        ? '#F43F5E15'
                        : detectionResult.overallScore > 30
                        ? '#F59E0B15'
                        : '#10B98115',
                    color:
                      detectionResult.overallScore > 60
                        ? '#F43F5E'
                        : detectionResult.overallScore > 30
                        ? '#F59E0B'
                        : '#10B981',
                  }}
                >
                  {detectionResult.confidence} confidence
                </Badge>
              </CardContent>
            </Card>

            {/* Highlighted Text */}
            <Card className="border-white/[0.06] bg-[#141420]">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-white">
                  Sentence Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <HighlightedText sentences={detectionResult.sentences} />
              </CardContent>
            </Card>

            {/* Module Breakdown */}
            <Card className="border-white/[0.06] bg-[#141420]">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-white">
                  Module Scores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {detectionResult.modules.map((mod) => (
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

            {/* Continue to Humanize */}
            <div className="flex justify-center">
              <Button
                onClick={() => setStep(3)}
                size="lg"
                className="bg-[#6366F1] px-8 text-white hover:bg-[#5558E6]"
              >
                Continue to Humanize
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Mode Selection + Humanize */}
        {step === 3 && (
          <motion.div
            key="step-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <Card className="border-white/[0.06] bg-[#141420]">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-white">
                  Choose Humanization Mode
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ModeSelector value={mode} onChange={setMode} />
              </CardContent>
            </Card>

            <div className="flex justify-center">
              <Button
                onClick={handleHumanize}
                disabled={isHumanizing}
                size="lg"
                className="bg-[#10B981] px-8 text-white hover:bg-[#0EA472] disabled:opacity-40"
              >
                {isHumanizing ? (
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
          </motion.div>
        )}

        {/* Step 4: Final Results */}
        {step === 4 && detectionResult && humanizationResult && (
          <motion.div
            key="step-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Score Comparison */}
            <div className="grid gap-6 sm:grid-cols-2">
              <Card className="border-white/[0.06] bg-[#141420]">
                <CardContent className="flex flex-col items-center py-8">
                  <p className="mb-4 text-xs font-medium uppercase tracking-wider text-white/40">
                    Original Score
                  </p>
                  <ScoreGauge value={detectionResult.overallScore} size="md" />
                  <p className="mt-3 text-sm text-white/50">
                    {Math.round(detectionResult.overallScore)}% AI Detected
                  </p>
                </CardContent>
              </Card>
              <Card className="border-white/[0.06] bg-[#141420]">
                <CardContent className="flex flex-col items-center py-8">
                  <p className="mb-4 text-xs font-medium uppercase tracking-wider text-white/40">
                    Humanized Score
                  </p>
                  <ScoreGauge value={humanizationResult.humanizedScore} size="md" />
                  <p className="mt-3 text-sm text-white/50">
                    {Math.round(humanizationResult.humanizedScore)}% AI Detected
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Reduction Badge */}
            <div className="flex justify-center">
              <Badge className="bg-[#10B981]/15 px-4 py-2 text-sm text-[#10B981] border-transparent">
                Score reduced by{' '}
                {Math.round(
                  detectionResult.overallScore - humanizationResult.humanizedScore
                )}
                %
              </Badge>
            </div>

            {/* Diff */}
            <Card className="border-white/[0.06] bg-[#141420]">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold text-white">
                  Text Comparison
                </CardTitle>
                <CopyButton text={humanizationResult.humanizedText} />
              </CardHeader>
              <CardContent>
                <TextDiff
                  original={text}
                  modified={humanizationResult.humanizedText}
                />
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-center gap-3">
              <Button
                onClick={handleReset}
                variant="outline"
                className="border-white/[0.08] text-white/70 hover:bg-white/[0.04] hover:text-white"
              >
                Analyze Another
              </Button>
              <CopyButton
                text={humanizationResult.humanizedText}
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
