/**
 * N-gram generation and frequency analysis utilities.
 */

/**
 * Generate word-level n-grams from an array of words.
 * Returns n-grams as space-joined strings.
 */
export function generateWordNgrams(words: string[], n: number): string[] {
  if (!words.length || n <= 0 || n > words.length) {
    return [];
  }

  const ngrams: string[] = [];
  for (let i = 0; i <= words.length - n; i++) {
    ngrams.push(words.slice(i, i + n).join(' '));
  }
  return ngrams;
}

/**
 * Generate character-level n-grams from a text string.
 */
export function generateCharNgrams(text: string, n: number): string[] {
  if (!text || n <= 0 || n > text.length) {
    return [];
  }

  const ngrams: string[] = [];
  for (let i = 0; i <= text.length - n; i++) {
    ngrams.push(text.slice(i, i + n));
  }
  return ngrams;
}

/**
 * Compute frequency counts for an array of n-grams.
 */
export function ngramFrequencies(ngrams: string[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const ngram of ngrams) {
    freq.set(ngram, (freq.get(ngram) ?? 0) + 1);
  }
  return freq;
}

/**
 * Compute probability distribution (relative frequencies) for an array of n-grams.
 * Each value is frequency / total, summing to 1.
 */
export function ngramProbabilities(ngrams: string[]): Map<string, number> {
  const probs = new Map<string, number>();
  if (ngrams.length === 0) {
    return probs;
  }

  const freq = ngramFrequencies(ngrams);
  const total = ngrams.length;

  for (const [ngram, count] of freq) {
    probs.set(ngram, count / total);
  }
  return probs;
}
