'use client';

import { useMutation } from '@tanstack/react-query';
import { detectAIContent } from '@/lib/engine/detection';
import { getStorage } from '@/lib/storage';
import { useAppStore } from '@/stores/app-store';
import type { DetectionResult } from '@/types';

export function useDetection() {
  const setDetectionResult = useAppStore((s) => s.setDetectionResult);
  const setIsDetecting = useAppStore((s) => s.setIsDetecting);

  const mutation = useMutation<DetectionResult, Error, string>({
    mutationFn: async (text: string) => {
      setIsDetecting(true);
      try {
        const result = detectAIContent(text);
        const storage = getStorage();
        const wordCount = text.split(/\s+/).filter(Boolean).length;
        await storage.updateUsage(wordCount);
        return result;
      } finally {
        setIsDetecting(false);
      }
    },
    onSuccess: (result) => {
      setDetectionResult(result);
    },
    onError: () => {
      setIsDetecting(false);
    },
  });

  return {
    detect: mutation.mutate,
    result: mutation.data ?? null,
    isLoading: mutation.isPending,
    error: mutation.error,
    reset: () => {
      mutation.reset();
      setDetectionResult(null);
    },
  };
}
