/**
 * Module 5: Coherence & Flow Analysis
 *
 * Measures inter-sentence coherence and emotional tone variation.
 * AI-generated text maintains unnaturally HIGH coherence (smooth flow everywhere)
 * with LOW variance. Human text has natural coherence drops due to topic shifts,
 * tangents, and varied emotional expression.
 *
 * Score 0-1 where 1 = definitely AI (unnaturally smooth coherence).
 */

import type {
  DetectionModule,
  ModuleAnalysis,
  SentenceContext,
  DetectedPattern,
} from '@/types';
import { splitSentences, tokenizeWords } from '@/lib/nlp/tokenizer';
import {
  mean,
  standardDeviation,
  coefficientOfVariation,
  normalize,
} from '@/lib/nlp/statistics';
import { POSITIVE_WORDS, NEGATIVE_WORDS } from './constants';

/** Minimum sentences needed for coherence analysis. */
const MIN_SENTENCES = 3;

/** Pre-built sets for fast sentiment lookup. */
const POSITIVE_SET = new Set(POSITIVE_WORDS.map((w) => w.toLowerCase()));
const NEGATIVE_SET = new Set(NEGATIVE_WORDS.map((w) => w.toLowerCase()));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Compute Jaccard similarity between two sets of words.
 * Returns 0-1 where 1 = identical word sets.
 */
function jaccardSimilarity(wordsA: string[], wordsB: string[]): number {
  const setA = new Set(wordsA.map((w) => w.toLowerCase()));
  const setB = new Set(wordsB.map((w) => w.toLowerCase()));

  if (setA.size === 0 && setB.size === 0) return 1;

  let intersection = 0;
  Array.from(setA).forEach((w) => {
    if (setB.has(w)) intersection++;
  });

  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Compute word-overlap ratio between two token lists.
 * Counts how many words from listA appear in listB, normalized by listA length.
 */
function wordOverlap(wordsA: string[], wordsB: string[]): number {
  if (wordsA.length === 0) return 0;
  const setB = new Set(wordsB.map((w) => w.toLowerCase()));
  let overlap = 0;
  for (const w of wordsA) {
    if (setB.has(w.toLowerCase())) overlap++;
  }
  return overlap / wordsA.length;
}

/**
 * Calculate a simple sentiment score for a sentence.
 * Returns a value from -1 (very negative) to +1 (very positive).
 */
function sentimentScore(words: string[]): number {
  if (words.length === 0) return 0;

  let positive = 0;
  let negative = 0;

  for (const w of words) {
    const lower = w.toLowerCase();
    if (POSITIVE_SET.has(lower)) positive++;
    if (NEGATIVE_SET.has(lower)) negative++;
  }

  const total = positive + negative;
  if (total === 0) return 0;
  return (positive - negative) / total;
}

/**
 * Compute adjacent-sentence coherence scores (Jaccard similarity).
 * Returns an array of similarity values for each consecutive pair.
 */
function adjacentCoherenceScores(sentences: string[]): number[] {
  if (sentences.length < 2) return [];

  const tokenized = sentences.map((s) => tokenizeWords(s));
  const scores: number[] = [];

  for (let i = 1; i < tokenized.length; i++) {
    scores.push(jaccardSimilarity(tokenized[i - 1], tokenized[i]));
  }

  return scores;
}

/**
 * Detect the "perfectly balanced" pattern: AI gives roughly equal weight
 * (word count) to all points in the text, leading to very uniform paragraph
 * or section sizes.
 */
function perfectBalanceScore(sentences: string[]): number {
  if (sentences.length < 4) return 0;

  const lengths = sentences.map((s) => tokenizeWords(s).length);
  const cv = coefficientOfVariation(lengths);

  // Very low CV means unnaturally balanced => AI-like
  // AI text: CV ~0.1-0.25; Human: CV ~0.3-0.7+
  return 1 - normalize(cv, 0.1, 0.5);
}

// ---------------------------------------------------------------------------
// Module
// ---------------------------------------------------------------------------

const coherenceFlowModule: DetectionModule = {
  name: 'coherence',
  weight: 0.12,

  analyze(text: string): ModuleAnalysis {
    const details: string[] = [];
    const patterns: DetectedPattern[] = [];

    const sentences = splitSentences(text);

    if (sentences.length < MIN_SENTENCES) {
      details.push(
        `Too few sentences for coherence analysis (${sentences.length}, need ${MIN_SENTENCES}+).`,
      );
      return { score: 0.5, details, patterns };
    }

    // ------ 1. Adjacent coherence (Jaccard similarity) ------
    const coherenceScores = adjacentCoherenceScores(sentences);
    const avgCoherence = mean(coherenceScores);
    const coherenceCV = coherenceScores.length >= 2
      ? coefficientOfVariation(coherenceScores)
      : 0.3;

    // AI text: high average coherence (0.15-0.30), low CV (0.2-0.4)
    // Human text: lower/variable coherence (0.05-0.15), high CV (0.5-1.0+)
    const avgCoherenceScore = normalize(avgCoherence, 0.05, 0.25);
    const coherenceVarianceScore = 1 - normalize(coherenceCV, 0.2, 0.8);

    details.push(`Average adjacent coherence: ${avgCoherence.toFixed(3)}`);
    details.push(`Coherence CV: ${coherenceCV.toFixed(3)}`);
    details.push(`Coherence level score: ${avgCoherenceScore.toFixed(3)}`);
    details.push(`Coherence variance score: ${coherenceVarianceScore.toFixed(3)}`);

    // ------ 2. Emotional tone variation ------
    const tokenizedSentences = sentences.map((s) => tokenizeWords(s));
    const sentimentScores = tokenizedSentences.map((words) => sentimentScore(words));
    const sentimentSD = standardDeviation(sentimentScores);
    const avgSentiment = mean(sentimentScores.map(Math.abs));

    // AI text: low sentiment variation (SD ~0.0-0.15)
    // Human text: higher variation (SD ~0.2-0.5+)
    const sentimentVarScore = 1 - normalize(sentimentSD, 0.05, 0.4);

    // AI tends to stay moderately positive (avg absolute sentiment ~0.3-0.6)
    // while human text has more extremes or neutrality
    const sentimentUniformityScore = normalize(avgSentiment, 0.1, 0.5);

    details.push(`Sentiment std dev: ${sentimentSD.toFixed(3)}`);
    details.push(`Average |sentiment|: ${avgSentiment.toFixed(3)}`);
    details.push(`Sentiment variance score: ${sentimentVarScore.toFixed(3)}`);

    // ------ 3. Perfect balance detection ------
    const balanceScore = perfectBalanceScore(sentences);
    details.push(`Perfect balance score: ${balanceScore.toFixed(3)}`);

    // ------ 4. Topic continuity (word overlap with 2-sentence window) ------
    let highOverlapCount = 0;
    for (let i = 2; i < tokenizedSentences.length; i++) {
      const overlap = wordOverlap(
        tokenizedSentences[i],
        [...tokenizedSentences[i - 1], ...tokenizedSentences[i - 2]],
      );
      if (overlap > 0.4) highOverlapCount++;
    }
    const overlapRatio = tokenizedSentences.length > 2
      ? highOverlapCount / (tokenizedSentences.length - 2)
      : 0;
    const overlapScore = normalize(overlapRatio, 0.1, 0.6);
    details.push(`High overlap ratio: ${(overlapRatio * 100).toFixed(1)}%`);

    // ------ Aggregate ------
    const finalScore = Math.max(0, Math.min(1,
      avgCoherenceScore * 0.20 +
      coherenceVarianceScore * 0.25 +
      sentimentVarScore * 0.20 +
      balanceScore * 0.15 +
      overlapScore * 0.10 +
      sentimentUniformityScore * 0.10,
    ));

    details.push(`Final coherence score: ${finalScore.toFixed(3)}`);

    // Detect patterns
    if (coherenceVarianceScore > 0.65) {
      patterns.push({
        name: 'Unnaturally Smooth Flow',
        description:
          'Coherence between sentences is unusually uniform, lacking the natural topic shifts and tangents of human writing.',
        severity: coherenceVarianceScore > 0.8 ? 'high' : 'medium',
        examples: [],
      });
    }

    if (sentimentVarScore > 0.65) {
      patterns.push({
        name: 'Flat Emotional Tone',
        description:
          'Emotional tone remains remarkably consistent throughout, without the natural variation of human expression.',
        severity: sentimentVarScore > 0.8 ? 'high' : 'medium',
        examples: [],
      });
    }

    if (balanceScore > 0.7) {
      patterns.push({
        name: 'Perfectly Balanced Structure',
        description:
          'All points receive nearly equal elaboration, a hallmark of AI-generated outlines.',
        severity: 'medium',
        examples: [],
      });
    }

    return { score: finalScore, details, patterns };
  },

  analyzeSentence(sentence: string, context: SentenceContext): number {
    const { sentences, index } = context;

    if (sentences.length < MIN_SENTENCES) return 0.5;

    const currentWords = tokenizeWords(sentence);
    if (currentWords.length < 2) return 0.5;

    const scores: number[] = [];

    // Coherence with neighbors
    const neighborIndices: number[] = [];
    if (index > 0) neighborIndices.push(index - 1);
    if (index < sentences.length - 1) neighborIndices.push(index + 1);

    if (neighborIndices.length > 0) {
      const similarities = neighborIndices.map((ni) => {
        const neighborWords = tokenizeWords(sentences[ni]);
        return jaccardSimilarity(currentWords, neighborWords);
      });
      const avgSim = mean(similarities);
      // High similarity with neighbors => AI-like
      scores.push(normalize(avgSim, 0.05, 0.25));
    }

    // Sentiment similarity with neighbors
    const currentSentiment = sentimentScore(currentWords);
    if (neighborIndices.length > 0) {
      const neighborSentiments = neighborIndices.map((ni) =>
        sentimentScore(tokenizeWords(sentences[ni])),
      );
      const sentimentDiffs = neighborSentiments.map((ns) =>
        Math.abs(currentSentiment - ns),
      );
      const avgDiff = mean(sentimentDiffs);
      // Low sentiment difference => AI-like
      scores.push(1 - normalize(avgDiff, 0.05, 0.5));
    }

    // Sentence length relative to mean (very close to mean = AI-like)
    const allLengths = sentences.map((s) => tokenizeWords(s).length);
    const avgLen = mean(allLengths);
    if (avgLen > 0) {
      const devRatio = Math.abs(currentWords.length - avgLen) / avgLen;
      scores.push(1 - normalize(devRatio, 0, 0.6));
    }

    return scores.length > 0
      ? Math.max(0, Math.min(1, mean(scores)))
      : 0.5;
  },
};

export default coherenceFlowModule;
