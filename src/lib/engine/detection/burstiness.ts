/**
 * Burstiness-based AI detection module.
 *
 * Measures variation in sentence length and structure. Human writing is
 * "bursty" — mixing short, punchy sentences with longer complex ones.
 * AI-generated text tends toward uniform sentence lengths clustered
 * around 15-25 words with low variance.
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
  coefficientOfVariation,
  normalize,
} from '@/lib/nlp/statistics';

/** Minimum sentences needed for meaningful burstiness analysis. */
const MIN_SENTENCES = 3;

/** Sentence length thresholds. */
const SHORT_SENTENCE_THRESHOLD = 8;
const LONG_SENTENCE_THRESHOLD = 30;

/** AI-typical sentence length cluster range. */
const AI_CLUSTER_LOW = 15;
const AI_CLUSTER_HIGH = 25;

/**
 * Calculate the coefficient of variation of sentence lengths.
 * AI text: CV typically 0.1-0.3, Human text: CV typically 0.4-0.8+.
 */
function sentenceLengthCV(lengths: number[]): number {
  if (lengths.length < MIN_SENTENCES) return 0.35; // neutral default
  return coefficientOfVariation(lengths);
}

/**
 * Measure paragraph length variation.
 * Splits text into paragraphs and measures CV of paragraph word counts.
 * Returns a neutral 0.35 if fewer than 2 paragraphs exist.
 */
function paragraphLengthCV(text: string): number {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  if (paragraphs.length < 2) return 0.35;

  const lengths = paragraphs.map((p) => tokenizeWords(p).length);
  return coefficientOfVariation(lengths);
}

/**
 * Detect "AI flatness" — the proportion of sentences whose word count
 * falls within the 15-25 word cluster that AI models favor.
 * Returns 0-1 where 1 = all sentences in the AI cluster.
 */
function aiFlatnessRatio(lengths: number[]): number {
  if (lengths.length === 0) return 0;
  const inCluster = lengths.filter(
    (len) => len >= AI_CLUSTER_LOW && len <= AI_CLUSTER_HIGH,
  ).length;
  return inCluster / lengths.length;
}

/**
 * Measure the ratio of extreme sentences (short + long) to total sentences.
 * Humans produce more extremes; AI stays in the middle.
 */
function extremeRatio(lengths: number[]): number {
  if (lengths.length === 0) return 0;
  const extremes = lengths.filter(
    (len) => len < SHORT_SENTENCE_THRESHOLD || len > LONG_SENTENCE_THRESHOLD,
  ).length;
  return extremes / lengths.length;
}

/**
 * Burstiness detection module.
 *
 * Scoring logic:
 * - AI text: low sentence-length CV, high AI-cluster ratio, low extreme ratio => score near 1
 * - Human text: high CV, low AI-cluster ratio, high extreme ratio => score near 0
 */
const burstinessModule: DetectionModule = {
  name: 'burstiness',
  weight: 0.25,

  analyze(text: string): ModuleAnalysis {
    const details: string[] = [];
    const patterns: DetectedPattern[] = [];

    const sentences = splitSentences(text);

    if (sentences.length < MIN_SENTENCES) {
      details.push(
        `Too few sentences for burstiness analysis (${sentences.length}, need ${MIN_SENTENCES}+).`,
      );
      return { score: 0.5, details, patterns };
    }

    const lengths = sentences.map((s) => tokenizeWords(s).length);
    const avgLength = mean(lengths);
    const cv = sentenceLengthCV(lengths);
    const paraCV = paragraphLengthCV(text);
    const flatness = aiFlatnessRatio(lengths);
    const extremes = extremeRatio(lengths);

    details.push(`Sentence count: ${sentences.length}`);
    details.push(`Mean sentence length: ${avgLength.toFixed(1)} words`);
    details.push(`Sentence length CV: ${cv.toFixed(3)}`);
    details.push(`Paragraph length CV: ${paraCV.toFixed(3)}`);
    details.push(`AI flatness ratio (15-25 words): ${(flatness * 100).toFixed(1)}%`);
    details.push(`Extreme sentence ratio (<${SHORT_SENTENCE_THRESHOLD} or >${LONG_SENTENCE_THRESHOLD}): ${(extremes * 100).toFixed(1)}%`);

    // Score component 1: Sentence length CV
    // Low CV => AI => high score
    // AI range: 0.1-0.3, Human range: 0.4-0.8+
    const cvScore = 1 - normalize(cv, 0.1, 0.7);

    // Score component 2: Paragraph length CV
    // Low para CV => AI => high score
    const paraCVScore = 1 - normalize(paraCV, 0.1, 0.6);

    // Score component 3: AI flatness
    // High flatness => AI => high score
    const flatnessScore = normalize(flatness, 0.1, 0.7);

    // Score component 4: Extreme ratio
    // Low extremes => AI => high score
    const extremeScore = 1 - normalize(extremes, 0.05, 0.4);

    // Weighted combination
    const combinedScore =
      cvScore * 0.35 +
      flatnessScore * 0.25 +
      extremeScore * 0.2 +
      paraCVScore * 0.2;

    const finalScore = Math.max(0, Math.min(1, combinedScore));

    details.push(`CV score: ${cvScore.toFixed(3)}`);
    details.push(`Paragraph CV score: ${paraCVScore.toFixed(3)}`);
    details.push(`Flatness score: ${flatnessScore.toFixed(3)}`);
    details.push(`Extreme ratio score: ${extremeScore.toFixed(3)}`);
    details.push(`Combined score: ${finalScore.toFixed(3)}`);

    // Detect patterns
    if (cvScore > 0.65) {
      patterns.push({
        name: 'Low Burstiness',
        description:
          'Sentences are unusually uniform in length, lacking the natural length variation of human writing.',
        severity: cvScore > 0.8 ? 'high' : 'medium',
        examples: sentences.slice(0, 3),
      });
    }

    if (flatnessScore > 0.65) {
      patterns.push({
        name: 'AI Sentence Length Clustering',
        description:
          `${(flatness * 100).toFixed(0)}% of sentences fall within the 15-25 word range typical of AI-generated text.`,
        severity: flatnessScore > 0.8 ? 'high' : 'medium',
        examples: sentences
          .filter((s) => {
            const len = tokenizeWords(s).length;
            return len >= AI_CLUSTER_LOW && len <= AI_CLUSTER_HIGH;
          })
          .slice(0, 3),
      });
    }

    if (extremeScore > 0.75) {
      patterns.push({
        name: 'Lack of Sentence Length Extremes',
        description:
          'Text lacks the very short and very long sentences commonly found in human writing.',
        severity: 'medium',
        examples: [],
      });
    }

    return { score: finalScore, details, patterns };
  },

  analyzeSentence(sentence: string, context: SentenceContext): number {
    const words = tokenizeWords(sentence);

    if (context.sentences.length < MIN_SENTENCES) {
      return 0.5;
    }

    const allLengths = context.sentences.map((s) => tokenizeWords(s).length);
    const avg = mean(allLengths);

    if (avg === 0) return 0.5;

    // How close is this sentence to the average? Closer = more AI-like.
    const deviationRatio = Math.abs(words.length - avg) / avg;
    const closenessScore = 1 - normalize(deviationRatio, 0, 0.8);

    // Is the sentence in the AI cluster range?
    const inCluster =
      words.length >= AI_CLUSTER_LOW && words.length <= AI_CLUSTER_HIGH ? 0.7 : 0.3;

    // Combine: 60% closeness to average, 40% cluster membership
    const score = closenessScore * 0.6 + inCluster * 0.4;
    return Math.max(0, Math.min(1, score));
  },
};

export default burstinessModule;
