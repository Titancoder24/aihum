/**
 * Module 1: Perplexity Analysis.
 * Measures how "predictable" the text is at a character/word level.
 * AI-generated text tends to have lower perplexity (more predictable).
 */

import type { DetectionModule, ModuleAnalysis, SentenceContext, DetectedPattern } from '@/types';
import { splitSentences, tokenizeWords } from '@/lib/nlp/tokenizer';
import { generateCharNgrams, ngramFrequencies } from '@/lib/nlp/ngrams';
import { shannonEntropy, normalize, mean } from '@/lib/nlp/statistics';
import { DEFAULT_DETECTION_WEIGHTS } from '@/constants';

/**
 * Calculate pseudo-perplexity using character n-gram entropy.
 * Lower entropy = more predictable = more likely AI.
 */
function calculateCharPerplexity(text: string): number {
  const trigrams = generateCharNgrams(text.toLowerCase(), 3);
  if (trigrams.length === 0) return 0.5;

  const freq = ngramFrequencies(trigrams);
  const entropy = shannonEntropy(freq);

  // Typical English text has char trigram entropy around 4-7 bits.
  // AI text tends toward the lower end (4-5), human text higher (5-7+).
  // Normalize: low entropy -> high score (AI-like)
  return normalize(entropy, 3.5, 7.0, 1.0, 0.0);
}

/**
 * Calculate word-level predictability using bigram transition probabilities.
 */
function calculateWordPredictability(words: string[]): number {
  if (words.length < 10) return 0.5;

  const lower = words.map((w) => w.toLowerCase());
  const bigrams = new Map<string, Map<string, number>>();

  for (let i = 0; i < lower.length - 1; i++) {
    const w1 = lower[i];
    const w2 = lower[i + 1];
    if (!bigrams.has(w1)) bigrams.set(w1, new Map());
    const following = bigrams.get(w1)!;
    following.set(w2, (following.get(w2) ?? 0) + 1);
  }

  // Calculate average conditional entropy
  let totalEntropy = 0;
  let count = 0;

  for (const [, following] of bigrams) {
    const total = Array.from(following.values()).reduce((s, v) => s + v, 0);
    if (total < 2) continue;
    let h = 0;
    for (const freq of following.values()) {
      const p = freq / total;
      if (p > 0) h -= p * Math.log2(p);
    }
    totalEntropy += h;
    count++;
  }

  if (count === 0) return 0.5;
  const avgEntropy = totalEntropy / count;

  // Lower conditional entropy = more predictable = AI
  return normalize(avgEntropy, 0.5, 4.0, 0.8, 0.1);
}

const perplexityModule: DetectionModule = {
  name: 'perplexity',
  weight: DEFAULT_DETECTION_WEIGHTS.perplexity,

  analyze(text: string): ModuleAnalysis {
    const words = tokenizeWords(text);
    const details: string[] = [];
    const patterns: DetectedPattern[] = [];

    if (words.length < 5) {
      return { score: 0.5, details: ['Text too short for reliable perplexity analysis.'], patterns: [] };
    }

    const charPerplexity = calculateCharPerplexity(text);
    const wordPredictability = calculateWordPredictability(words);

    details.push(`Character-level perplexity score: ${charPerplexity.toFixed(3)}`);
    details.push(`Word-level predictability score: ${wordPredictability.toFixed(3)}`);

    const score = charPerplexity * 0.5 + wordPredictability * 0.5;

    if (score > 0.65) {
      patterns.push({
        name: 'Low Perplexity',
        description: 'Text exhibits unusually low perplexity, suggesting highly predictable word choices.',
        severity: score > 0.8 ? 'high' : 'medium',
        examples: [],
      });
    }

    details.push(`Combined perplexity score: ${score.toFixed(3)}`);
    return { score: Math.max(0, Math.min(1, score)), details, patterns };
  },

  analyzeSentence(sentence: string, context: SentenceContext): number {
    const words = tokenizeWords(sentence);
    if (words.length < 3) return 0.5;

    const charScore = calculateCharPerplexity(sentence);

    // Also check if this sentence's vocabulary is predictable given context
    const contextWords = new Set(
      context.sentences
        .filter((_, i) => Math.abs(i - context.index) <= 2 && i !== context.index)
        .flatMap((s) => tokenizeWords(s).map((w) => w.toLowerCase()))
    );

    const sentenceWords = words.map((w) => w.toLowerCase());
    const overlapRatio = sentenceWords.filter((w) => contextWords.has(w)).length / sentenceWords.length;

    // High overlap with nearby sentences suggests predictable continuation
    const contextScore = normalize(overlapRatio, 0.1, 0.6, 0.2, 0.8);

    return Math.max(0, Math.min(1, charScore * 0.6 + contextScore * 0.4));
  },
};

export default perplexityModule;
