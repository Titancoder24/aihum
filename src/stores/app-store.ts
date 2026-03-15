'use client';

import { create } from 'zustand';
import type { DetectionResult, HumanizationResult, HumanizationMode } from '@/types';

export interface AppState {
  currentText: string;
  setCurrentText: (text: string) => void;
  detectionResult: DetectionResult | null;
  setDetectionResult: (result: DetectionResult | null) => void;
  humanizationResult: HumanizationResult | null;
  setHumanizationResult: (result: HumanizationResult | null) => void;
  isDetecting: boolean;
  setIsDetecting: (v: boolean) => void;
  isHumanizing: boolean;
  setIsHumanizing: (v: boolean) => void;
  selectedMode: HumanizationMode;
  setSelectedMode: (mode: HumanizationMode) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentText: '',
  setCurrentText: (text) => set({ currentText: text }),
  detectionResult: null,
  setDetectionResult: (result) => set({ detectionResult: result }),
  humanizationResult: null,
  setHumanizationResult: (result) => set({ humanizationResult: result }),
  isDetecting: false,
  setIsDetecting: (v) => set({ isDetecting: v }),
  isHumanizing: false,
  setIsHumanizing: (v) => set({ isHumanizing: v }),
  selectedMode: 'standard',
  setSelectedMode: (mode) => set({ selectedMode: mode }),
}));
