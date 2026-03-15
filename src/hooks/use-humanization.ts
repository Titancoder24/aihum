'use client';

import { useMutation } from '@tanstack/react-query';
import { humanizeText } from '@/lib/engine/humanization';
import { getStorage } from '@/lib/storage';
import { useAppStore } from '@/stores/app-store';
import type { HumanizationMode, HumanizationResult } from '@/types';

interface HumanizeParams {
  text: string;
  mode: HumanizationMode;
}

export function useHumanization() {
  const setHumanizationResult = useAppStore((s) => s.setHumanizationResult);
  const setIsHumanizing = useAppStore((s) => s.setIsHumanizing);

  const mutation = useMutation<HumanizationResult, Error, HumanizeParams>({
    mutationFn: async ({ text, mode }: HumanizeParams) => {
      setIsHumanizing(true);
      try {
        const result = humanizeText(text, mode);
        const storage = getStorage();
        const wordCount = text.split(/\s+/).filter(Boolean).length;
        await storage.updateUsage(wordCount);
        return result;
      } finally {
        setIsHumanizing(false);
      }
    },
    onSuccess: (result) => {
      setHumanizationResult(result);
    },
    onError: () => {
      setIsHumanizing(false);
    },
  });

  return {
    humanize: (text: string, mode: HumanizationMode) =>
      mutation.mutate({ text, mode }),
    result: mutation.data ?? null,
    isLoading: mutation.isPending,
    error: mutation.error,
    reset: () => {
      mutation.reset();
      setHumanizationResult(null);
    },
  };
}
