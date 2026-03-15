/**
 * Module 7: Statistical Signature Detection
 *
 * Analyzes low-level statistical properties of text:
 * - Word length distribution tightness
 * - Zipf's Law compliance
 * - Character-level trigram entropy
 * - Character-level repetition patterns
 * - Word frequency distribution shape
 *
 * Score 0-1 where 1 = definitely AI.
 */

import type {
  DetectionModule,
  ModuleAnalysis,
  SentenceContext,
  DetectedPattern,
} from '@/types';
import { tokenizeWords } from '@/lib/nlp/tokenizer';
import {
  mean,
  standardDeviation,
  coefficientOfVariation,
  shannonEntropy,
  zipfFit,
  normalize,
} from '@/lib/nlp/statistics';
import { generateCharNgrams, ngramFrequencies } from '@/lib/nlp/ngrams';

/** Minimum words needed for statistical analysis. */
const MIN_WORDS = 20;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Analyze word length distribution.
 * AI text tends to have a tighter (lower CV) word length distribution
 * compared to human text.
 */
function wordLengthDistributionScore(words: string[]): { score: number; details: string[] } {
  const details: string[] = [];

  if (words.length < MIN_WORDS) {
    return { score: 0.5, details: ['Too few words for length distribution analysis'] };
  }

  const lengths = words.map((w) => w.length);
  const avg = mean(lengths);
  const sd = standardDeviation(lengths);
  const cv = coefficientOfVariation(lengths);

  details.push(`Mean word length: ${avg.toFixed(2)}`);
  details.push(`Word length std dev: ${sd.toFixed(2)}`);
  details.push(`Word length CV: ${cv.toFixed(3)}`);

  // AI text: CV ~0.35-0.50; Human text: CV ~0.50-0.70+
  const cvScore = 1 - normalize(cv, 0.35, 0.65);

  // AI text tends to favor medium-length words (5-8 chars)
  // Check what fraction of words fall in this range
  const mediumCount = lengths.filter((l) => l >= 5 && l <= 8).length;
  const mediumRatio = mediumCount / lengths.length;
  // AI: ~40-55%; Human: ~25-40%
  const mediumScore = normalize(mediumRatio, 0.25, 0.55);

  details.push(`Medium word ratio (5-8 chars): ${(mediumRatio * 100).toFixed(1)}%`);

  const score = cvScore * 0.6 + mediumScore * 0.4;
  return { score: Math.max(0, Math.min(1, score)), details };
}

/**
 * Measure Zipf's Law compliance using zipfFit.
 * Natural language follows Zipf's law closely. AI text may deviate.
 */
function zipfComplianceScore(words: string[]): { score: number; details: string[] } {
  const details: string[] = [];

  if (words.length < MIN_WORDS) {
    return { score: 0.5, details: ['Too few words for Zipf analysis'] };
  }

  // Build word frequency map
  const freq = new Map<string, number>();
  for (const w of words) {
    const lower = w.toLowerCase();
    freq.set(lower, (freq.get(lower) ?? 0) + 1);
  }

  const result = zipfFit(freq);

  details.push(`Zipf slope: ${result.slope.toFixed(3)}`);
  details.push(`Zipf R-squared: ${result.rSquared.toFixed(3)}`);

  // Perfect Zipf: slope ~ -1, R-squared ~ 0.95+
  // AI text often has slope closer to -1 (too perfect) or slightly off
  // Human text: slope ~-0.8 to -1.2, R-squared ~0.85-0.95
  // AI text: slope closer to -1.0, R-squared ~0.90-0.99

  // Higher R-squared (too perfect fit) => AI
  const fitScore = normalize(result.rSquared, 0.85, 0.98);

  // Slope close to -1.0 => AI (too ideal)
  const slopeDev = Math.abs(result.slope + 1.0);
  const slopeScore = 1 - normalize(slopeDev, 0, 0.3);

  const score = fitScore * 0.6 + slopeScore * 0.4;
  return { score: Math.max(0, Math.min(1, score)), details };
}

/**
 * Measure character-level trigram entropy.
 * AI text may have lower character trigram entropy (more predictable character sequences).
 */
function charTrigramEntropyScore(text: string): { score: number; details: string[] } {
  const details: string[] = [];
  const cleaned = text.toLowerCase().replace(/[^a-z\s]/g, '');

  if (cleaned.length < 50) {
    return { score: 0.5, details: ['Text too short for character trigram analysis'] };
  }

  const trigrams = generateCharNgrams(cleaned, 3);
  const freq = ngramFrequencies(trigrams);
  const entropy = shannonEntropy(freq);

  details.push(`Character trigram entropy: ${entropy.toFixed(3)} bits`);
  details.push(`Unique trigrams: ${freq.size}`);

  // Human text: entropy ~8-10 bits; AI: ~6-8 bits (lower, more predictable)
  const score = 1 - normalize(entropy, 6, 10);

  return { score: Math.max(0, Math.min(1, score)), details };
}

/**
 * Detect character-level repetition patterns.
 * Measures how often the most frequent character trigrams repeat.
 */
function charRepetitionScore(text: string): { score: number; details: string[] } {
  const details: string[] = [];
  const cleaned = text.toLowerCase().replace(/[^a-z\s]/g, '');

  if (cleaned.length < 50) {
    return { score: 0.5, details: ['Text too short for repetition analysis'] };
  }

  const trigrams = generateCharNgrams(cleaned, 3);
  const freq = ngramFrequencies(trigrams);
  const total = trigrams.length;

  // Sort by frequency descending
  const sorted = Array.from(freq.values()).sort((a, b) => b - a);

  // Top-10 trigram concentration
  const top10Sum = sorted.slice(0, 10).reduce((s, v) => s + v, 0);
  const top10Ratio = total > 0 ? top10Sum / total : 0;

  details.push(`Top-10 trigram concentration: ${(top10Ratio * 100).toFixed(1)}%`);

  // AI text tends to have higher concentration in top trigrams
  // AI: ~15-25%; Human: ~10-15%
  const score = normalize(top10Ratio, 0.10, 0.25);

  return { score: Math.max(0, Math.min(1, score)), details };
}

/**
 * Analyze word frequency distribution shape.
 * AI text tends to have a flatter distribution (fewer very-high-frequency
 * and very-low-frequency words).
 */
function wordFrequencyShapeScore(words: string[]): { score: number; details: string[] } {
  const details: string[] = [];

  if (words.length < MIN_WORDS) {
    return { score: 0.5, details: ['Too few words for frequency distribution analysis'] };
  }

  const freq = new Map<string, number>();
  for (const w of words) {
    const lower = w.toLowerCase();
    freq.set(lower, (freq.get(lower) ?? 0) + 1);
  }

  const counts = Array.from(freq.values()).sort((a, b) => b - a);

  // Ratio of hapax legomena (words appearing once) to total unique
  const hapax = counts.filter((c) => c === 1).length;
  const hapaxRatio = hapax / freq.size;

  // Ratio of top-5 most frequent words to total word count
  const top5Sum = counts.slice(0, 5).reduce((s, v) => s + v, 0);
  const top5Ratio = top5Sum / words.length;

  details.push(`Hapax ratio: ${(hapaxRatio * 100).toFixed(1)}%`);
  details.push(`Top-5 word concentration: ${(top5Ratio * 100).toFixed(1)}%`);

  // AI text: lower hapax ratio (~30-45%) vs human (~50-65%)
  const hapaxScore = 1 - normalize(hapaxRatio, 0.30, 0.60);

  // AI text: higher top-5 concentration (~15-25%) vs human (~10-18%)
  const top5Score = normalize(top5Ratio, 0.10, 0.25);

  const score = hapaxScore * 0.5 + top5Score * 0.5;
  return { score: Math.max(0, Math.min(1, score)), details };
}

// ---------------------------------------------------------------------------
// Module
// ---------------------------------------------------------------------------

const statisticalSignatureModule: DetectionModule = {
  name: 'statistical',
  weight: 0.10,

  analyze(text: string): ModuleAnalysis {
    const details: string[] = [];
    const patterns: DetectedPattern[] = [];

    const words = tokenizeWords(text);

    if (words.length < MIN_WORDS) {
      details.push(
        `Text too short for statistical analysis (${words.length} words, need ${MIN_WORDS}+).`,
      );
      return { score: 0.5, details, patterns };
    }

    // ------ 1. Word length distribution ------
    const wlResult = wordLengthDistributionScore(words);
    details.push(...wlResult.details);

    // ------ 2. Zipf's Law compliance ------
    const zipfResult = zipfComplianceScore(words);
    details.push(...zipfResult.details);

    // ------ 3. Character trigram entropy ------
    const trigramResult = charTrigramEntropyScore(text);
    details.push(...trigramResult.details);

    // ------ 4. Character repetition patterns ------
    const repResult = charRepetitionScore(text);
    details.push(...repResult.details);

    // ------ 5. Word frequency shape ------
    const wfResult = wordFrequencyShapeScore(words);
    details.push(...wfResult.details);

    // ------ Aggregate ------
    const finalScore = Math.max(0, Math.min(1,
      wlResult.score * 0.20 +
      zipfResult.score * 0.25 +
      trigramResult.score * 0.20 +
      repResult.score * 0.15 +
      wfResult.score * 0.20,
    ));

    details.push(`Final statistical signature score: ${finalScore.toFixed(3)}`);

    // Detect patterns
    if (wlResult.score > 0.65) {
      patterns.push({
        name: 'Tight Word Length Distribution',
        description:
          'Word lengths are unusually uniform, lacking the natural variation of human writing.',
        severity: wlResult.score > 0.8 ? 'high' : 'medium',
        examples: [],
      });
    }

    if (zipfResult.score > 0.65) {
      patterns.push({
        name: 'Too-Perfect Zipf Compliance',
        description:
          'Word frequency distribution follows Zipf\'s Law too perfectly, suggesting algorithmic generation.',
        severity: zipfResult.score > 0.8 ? 'high' : 'medium',
        examples: [],
      });
    }

    if (trigramResult.score > 0.65) {
      patterns.push({
        name: 'Low Character Entropy',
        description:
          'Character-level patterns are unusually predictable, a statistical signature of AI text.',
        severity: trigramResult.score > 0.8 ? 'high' : 'medium',
        examples: [],
      });
    }

    if (repResult.score > 0.65) {
      patterns.push({
        name: 'Character Repetition',
        description:
          'Character trigram distribution shows high concentration in top patterns.',
        severity: 'medium',
        examples: [],
      });
    }

    return { score: finalScore, details, patterns };
  },

  analyzeSentence(sentence: string, _context: SentenceContext): number {
    const words = tokenizeWords(sentence);
    if (words.length < 5) return 0.5;

    const scores: number[] = [];

    // Word length distribution for this sentence
    const lengths = words.map((w) => w.length);
    const cv = coefficientOfVariation(lengths);
    scores.push(1 - normalize(cv, 0.35, 0.65));

    // Character trigram entropy for this sentence
    const cleaned = sentence.toLowerCase().replace(/[^a-z\s]/g, '');
    if (cleaned.length >= 20) {
      const trigrams = generateCharNgrams(cleaned, 3);
      const freq = ngramFrequencies(trigrams);
      const entropy = shannonEntropy(freq);
      scores.push(1 - normalize(entropy, 3, 7));
    }

    // Medium word ratio
    const mediumCount = lengths.filter((l) => l >= 5 && l <= 8).length;
    const mediumRatio = mediumCount / lengths.length;
    scores.push(normalize(mediumRatio, 0.25, 0.55));

    return scores.length > 0
      ? Math.max(0, Math.min(1, mean(scores)))
      : 0.5;
  },
};

export default statisticalSignatureModule;
