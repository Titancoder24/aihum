'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { ModeSelector } from '@/components/ui/mode-selector';
import { useThemeStore } from '@/stores/theme-store';
import { DEFAULT_DETECTION_WEIGHTS } from '@/constants';
import type { HumanizationMode } from '@/types';

const moduleLabels: Record<string, string> = {
  perplexity: 'Perplexity',
  burstiness: 'Burstiness',
  vocabulary: 'Vocabulary Diversity',
  structural: 'Structural Analysis',
  coherence: 'Coherence Patterns',
  stylometric: 'Stylometric Features',
  statistical: 'Statistical Patterns',
};

export default function SettingsPage() {
  const { theme, toggleTheme } = useThemeStore();
  const [defaultMode, setDefaultMode] = useState<HumanizationMode>('standard');
  const [weights, setWeights] = useState<Record<string, number>>({
    ...DEFAULT_DETECTION_WEIGHTS,
  });
  const [saved, setSaved] = useState(false);

  const handleWeightChange = useCallback((key: string, value: number[]) => {
    setWeights((prev) => ({ ...prev, [key]: value[0] }));
    setSaved(false);
  }, []);

  const handleReset = useCallback(() => {
    setWeights({ ...DEFAULT_DETECTION_WEIGHTS });
    setDefaultMode('standard');
    setSaved(false);
  }, []);

  const handleSave = useCallback(() => {
    // Persist via localStorage or hook
    try {
      localStorage.setItem(
        'humanize-elite-settings',
        JSON.stringify({ defaultMode, weights })
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // noop
    }
  }, [defaultMode, weights]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-3xl space-y-6"
    >
      {/* Theme */}
      <Card className="border-white/[0.06] bg-[#141420]">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-white">
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Dark Mode</p>
              <p className="text-xs text-white/40">
                Toggle between dark and light theme
              </p>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={toggleTheme}
            />
          </div>
        </CardContent>
      </Card>

      {/* Default Mode */}
      <Card className="border-white/[0.06] bg-[#141420]">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-white">
            Default Humanization Mode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ModeSelector value={defaultMode} onChange={setDefaultMode} />
        </CardContent>
      </Card>

      {/* Detection Weights */}
      <Card className="border-white/[0.06] bg-[#141420]">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-white">
            Detection Module Weights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-xs text-white/40">
            Adjust the influence of each detection module. Weights are
            normalized automatically.
          </p>
          {Object.entries(weights).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-white/70">
                  {moduleLabels[key] ?? key}
                </label>
                <span className="text-xs font-mono text-white/40">
                  {value.toFixed(2)}
                </span>
              </div>
              <Slider
                value={[value]}
                onValueChange={(v) => handleWeightChange(key, v)}
                min={0}
                max={1}
                step={0.01}
                className="w-full"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-white/[0.06] pt-6">
        <Button
          variant="ghost"
          onClick={handleReset}
          className="text-white/50 hover:text-white"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset to Defaults
        </Button>
        <Button
          onClick={handleSave}
          className="bg-[#6366F1] text-white hover:bg-[#5558E6]"
        >
          <Save className="mr-2 h-4 w-4" />
          {saved ? 'Saved!' : 'Save Changes'}
        </Button>
      </div>
    </motion.div>
  );
}
