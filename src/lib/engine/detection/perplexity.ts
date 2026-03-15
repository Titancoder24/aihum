/**
 * Perplexity-based AI detection module.
 *
 * Builds a trigram language model from the input text and measures how
 * predictable (low perplexity) the text is. AI-generated text tends to
 * have low, uniform perplexity; human text has higher and more variable
 * perplexity across sentences.
 */

import type {
  DetectionModule,
  ModuleAnalysis,
  SentenceContext,
  DetectedPattern,
} from '@/types';
import { splitSentences, tokenizeWords } from '@/lib/nlp/tokenizer';
import { generateWordNgrams, ngramFrequencies } from '@/lib/nlp/ngrams';
import {
  mean,
  standardDeviation,
  coefficientOfVariation,
  normalize,
} from '@/lib/nlp/statistics';

/** Minimum words needed for meaningful perplexity analysis. */
const MIN_WORDS = 20;

/** N-gram order for the language model. */
const NGRAM_ORDER = 3;

/** Small probability floor for unseen n-grams (Laplace-like smoothing). */
const SMOOTHING_EPSILON = 1e-6;

/**
 * Build trigram and bigram frequency maps from an array of words.
 */
function buildTrigramModel(words: string[]): {
  trigramFreq: Map<string, number>;
  bigramFreq: Map<string, number>;
} {
  const lowerWords = words.map((w) => w.toLowerCase());
  const trigrams = generateWordNgrams(lowerWords, 3);
  const bigrams = generateWordNgrams(lowerWords, 2);
  return {
    trigramFreq: ngramFrequencies(trigrams),
    bigramFreq: ngramFrequencies(bigrams),
  };
}

/**
 * Calculate perplexity of a sentence given the trigram and bigram frequency maps.
 * Uses conditional probability: P(w3 | w1 w2) = count(w1 w2 w3) / count(w1 w2).
 * Perplexity = 2^(-1/N * sum(log2(P(w_i | context)))).
 */
function sentencePerplexity(
  sentenceWords: string[],
  trigramFreq: Map<string, number>,
  bigramFreq: Map<string, number>,
): number {
  const lowerWords = sentenceWords.map((w) => w.toLowerCase());

  if (lowerWords.length < NGRAM_ORDER) {
    // Too short for trigram analysis — return a neutral perplexity
    return 50;
  }

  let logProbSum = 0;
  let count = 0;

  for (let i = 0; i <= lowerWords.length - NGRAM_ORDER; i++) {
    const trigram = `${lowerWords[i]} ${lowerWords[i + 1]} ${lowerWords[i + 2]}`;
    const bigram = `${lowerWords[i]} ${lowerWords[i + 1]}`;

    const trigramCount = trigramFreq.get(trigram) ?? 0;
    const bigramCount = bigramFreq.get(bigram) ?? 0;

    // Conditional probability with smoothing
    const prob = bigramCount > 0
      ? (trigramCount + SMOOTHING_EPSILON) / (bigramCount + SMOOTHING_EPSILON * bigramFreq.size)
      : SMOOTHING_EPSILON;

    logProbSum += Math.log2(prob);
    count++;
  }

  if (count === 0) return 50;

  // Perplexity = 2^(-1/N * sum(log2(p)))
  const avgLogProb = logProbSum / count;
  return Math.pow(2, -avgLogProb);
}

/**
 * Perplexity detection module.
 *
 * Scoring logic:
 * - AI text: low average perplexity + low perplexity variance => score near 1
 * - Human text: high average perplexity + high perplexity variance => score near 0
 */
const perplexityModule: DetectionModule = {
  name: 'perplexity',
  weight: 0.3,

  analyze(text: string): ModuleAnalysis {
    const details: string[] = [];
    const patterns: DetectedPattern[] = [];

    const words = tokenizeWords(text);

    if (words.length < MIN_WORDS) {
      details.push(
        `Text too short for perplexity analysis (${words.length} words, need ${MIN_WORDS}+).`,
      );
      return { score: 0.5, details, patterns };
    }

    const sentences = splitSentences(text);
    if (sentences.length < 2) {
      details.push('Only one sentence detected; perplexity variance unavailable.');
      return { score: 0.5, details, patterns };
    }

    // Build trigram model from the full text
    const { trigramFreq, bigramFreq } = buildTrigramModel(words);

    // Calculate per-sentence perplexity
    const perplexities: number[] = [];
    for (const sentence of sentences) {
      const sentWords = tokenizeWords(sentence);
      if (sentWords.length >= NGRAM_ORDER) {
        perplexities.push(sentencePerplexity(sentWords, trigramFreq, bigramFreq));
      }
    }

    if (perplexities.length < 2) {
      details.push('Not enough sentences with 3+ words for perplexity analysis.');
      return { score: 0.5, details, patterns };
    }

    const avgPerplexity = mean(perplexities);
    const perplexityStd = standardDeviation(perplexities);
    const perplexityCV = coefficientOfVariation(perplexities);

    details.push(`Average perplexity: ${avgPerplexity.toFixed(2)}`);
    details.push(`Perplexity std dev: ${perplexityStd.toFixed(2)}`);
    details.push(`Perplexity CV: ${perplexityCV.toFixed(3)}`);

    // Score component 1: Average perplexity level
    // AI text typically has perplexity in range [2, 20], human text [20, 200+]
    // Low perplexity => high AI score
    const perplexityScore = 1 - normalize(avgPerplexity, 2, 150);

    // Score component 2: Perplexity variance (CV)
    // AI text: CV typically 0.05-0.2, Human text: CV typically 0.3-1.0+
    // Low CV => high AI score
    const varianceScore = 1 - normalize(perplexityCV, 0.05, 0.8);

    // Combine: 60% perplexity level, 40% variance
    const combinedScore = perplexityScore * 0.6 + varianceScore * 0.4;
    const finalScore = Math.max(0, Math.min(1, combinedScore));

    details.push(`Perplexity level score: ${perplexityScore.toFixed(3)}`);
    details.push(`Variance score: ${varianceScore.toFixed(3)}`);
    details.push(`Combined score: ${finalScore.toFixed(3)}`);

    // Detect patterns
    if (perplexityScore > 0.7) {
      patterns.push({
        name: 'Low Perplexity',
        description:
          'Text has unusually low perplexity, suggesting highly predictable token sequences typical of AI generation.',
        severity: perplexityScore > 0.85 ? 'high' : 'medium',
        examples: sentences.slice(0, 2),
      });
    }

    if (varianceScore > 0.7) {
      patterns.push({
        name: 'Uniform Perplexity',
        description:
          'Perplexity is very consistent across sentences, lacking the natural variation seen in human writing.',
        severity: varianceScore > 0.85 ? 'high' : 'medium',
        examples: [],
      });
    }

    return { score: finalScore, details, patterns };
  },

  analyzeSentence(sentence: string, context: SentenceContext): number {
    const allWords = tokenizeWords(context.fullText);

    if (allWords.length < MIN_WORDS) {
      return 0.5;
    }

    const { trigramFreq, bigramFreq } = buildTrigramModel(allWords);
    const sentWords = tokenizeWords(sentence);

    if (sentWords.length < NGRAM_ORDER) {
      return 0.5;
    }

    const perplexity = sentencePerplexity(sentWords, trigramFreq, bigramFreq);

    // Low perplexity => high AI score
    const score = 1 - normalize(perplexity, 2, 150);
    return Math.max(0, Math.min(1, score));
  },
};

export default perplexityModule;
