'use client';

import { useQuery } from '@tanstack/react-query';
import { getStorage } from '@/lib/storage';
import type { UsageRecord } from '@/types';

const USAGE_KEY = ['usage'] as const;

export function useUsage() {
  const storage = getStorage();

  const usageQuery = useQuery<UsageRecord>({
    queryKey: USAGE_KEY,
    queryFn: () => storage.getUsage(),
    refetchInterval: 60_000, // Refresh every minute to catch resets
  });

  const usage = usageQuery.data ?? {
    wordsUsedToday: 0,
    wordsLimit: 1000,
    plan: 'free' as const,
    resetsAt: new Date().toISOString(),
  };

  function canUse(words: number): boolean {
    return usage.wordsUsedToday + words <= usage.wordsLimit;
  }

  return {
    usage,
    isLoading: usageQuery.isLoading,
    canUse,
  };
}
