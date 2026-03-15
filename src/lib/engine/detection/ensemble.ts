/**
 * Ensemble AI Detection Scorer
 *
 * Combines all 7 detection modules into a single weighted score.
 * Provides both overall document-level and per-sentence analysis.
 */

import type {
  DetectionModule,
  DetectionResult,
  SentenceScore,
  ModuleScore,
  DetectedPattern,
  ConfidenceLevel,
  SentenceContext,
} from '@/types';
import { splitSentences, tokenizeWords } from '@/lib/nlp/tokenizer';
import { DEFAULT_DETECTION_WEIGHTS } from '@/constants';

import perplexityModule from './perplexity';
import burstinessModule from './burstiness';
import vocabularyDiversityModule from './vocabulary-diversity';
import structuralPatternsModule from './structural-patterns';
import coherenceFlowModule from './coherence-flow';
import stylometricModule from './stylometric';
import statisticalSignatureModule from './statistical-signature';

// ---------------------------------------------------------------------------
// Module registry
// ---------------------------------------------------------------------------

/** All detection modules indexed by their weight key. */
const ALL_MODULES: ReadonlyArray<{ weightKey: string; module: DetectionModule }> = [
  { weightKey: 'perplexity', module: perplexityModule },
  { weightKey: 'burstiness', module: burstinessModule },
  { weightKey: 'vocabulary', module: vocabularyDiversityModule },
  { weightKey: 'structural', module: structuralPatternsModule },
  { weightKey: 'coherence', module: coherenceFlowModule },
  { weightKey: 'stylometric', module: stylometricModule },
  { weightKey: 'statistical', module: statisticalSignatureModule },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Assign a color based on the sentence AI score (0-100 scale).
 */
function scoreToColor(score: number): 'green' | 'yellow' | 'orange' | 'red' {
  if (score <= 25) return 'green';
  if (score <= 50) return 'yellow';
  if (score <= 75) return 'orange';
  return 'red';
}

/**
 * Determine confidence level based on overall score.
 * Extreme scores (very low or very high) yield higher confidence.
 */
function determineConfidence(score: number): ConfidenceLevel {
  if (score < 20 || score > 80) return 'very-high';
  if (score < 35 || score > 65) return 'high';
  if (score < 50 || score > 50) return 'medium';
  return 'low';
}

/**
 * Resolve weights: merge user-provided overrides with defaults,
 * then normalize so they sum to 1.
 */
function resolveWeights(userWeights?: Record<string, number>): Record<string, number> {
  const merged: Record<string, number> = { ...DEFAULT_DETECTION_WEIGHTS };

  if (userWeights) {
    for (const [key, value] of Object.entries(userWeights)) {
      if (key in merged && typeof value === 'number' && value >= 0) {
        merged[key] = value;
      }
    }
  }

  // Normalize to sum to 1
  const total = Object.values(merged).reduce((sum, v) => sum + v, 0);
  if (total > 0 && total !== 1) {
    for (const key of Object.keys(merged)) {
      merged[key] = merged[key] / total;
    }
  }

  return merged;
}

// ---------------------------------------------------------------------------
// Main detection function
// ---------------------------------------------------------------------------

/**
 * Run all 7 detection modules on the input text and produce a comprehensive
 * detection result with overall score, per-sentence breakdown, and patterns.
 *
 * @param text - The text to analyze
 * @param weights - Optional weight overrides (keys must match DEFAULT_DETECTION_WEIGHTS)
 * @returns Complete detection result
 */
export function detectAIContent(
  text: string,
  weights?: Record<string, number>,
): DetectionResult {
  const startTime = performance.now();

  const resolvedWeights = resolveWeights(weights);
  const sentences = splitSentences(text);
  const allWords = tokenizeWords(text);
  const wordCount = allWords.length;

  // ------ Run all modules (document level) ------
  const moduleScores: ModuleScore[] = [];
  const allPatterns: DetectedPattern[] = [];
  let weightedSum = 0;

  for (const { weightKey, module } of ALL_MODULES) {
    const weight = resolvedWeights[weightKey] ?? 0;
    const analysis = module.analyze(text);

    moduleScores.push({
      name: module.name,
      score: analysis.score,
      weight,
      details: analysis.details,
    });

    weightedSum += analysis.score * weight;
    allPatterns.push(...analysis.patterns);
  }

  // Overall score on 0-100 scale
  const overallScore = Math.round(Math.max(0, Math.min(100, weightedSum * 100)));

  // ------ Per-sentence analysis ------
  const sentenceScores: SentenceScore[] = sentences.map((sentenceText, index) => {
    const context: SentenceContext = {
      sentences,
      index,
      fullText: text,
    };

    const perModuleScores: Record<string, number> = {};
    let sentWeightedSum = 0;

    for (const { weightKey, module } of ALL_MODULES) {
      const weight = resolvedWeights[weightKey] ?? 0;
      const sentScore = module.analyzeSentence(sentenceText, context);
      perModuleScores[module.name] = sentScore;
      sentWeightedSum += sentScore * weight;
    }

    const sentenceScore100 = Math.max(0, Math.min(100, sentWeightedSum * 100));

    return {
      text: sentenceText,
      index,
      score: sentenceScore100 / 100, // 0-1 as per type
      color: scoreToColor(sentenceScore100),
      moduleScores: perModuleScores,
    };
  });

  // ------ Confidence ------
  const confidence = determineConfidence(overallScore);

  // ------ Processing time ------
  const processingTimeMs = Math.round(performance.now() - startTime);

  // ------ Deduplicate patterns ------
  const seenPatterns = new Set<string>();
  const uniquePatterns: DetectedPattern[] = [];
  for (const pattern of allPatterns) {
    if (!seenPatterns.has(pattern.name)) {
      seenPatterns.add(pattern.name);
      uniquePatterns.push(pattern);
    }
  }

  return {
    overallScore,
    confidence,
    sentences: sentenceScores,
    modules: moduleScores,
    patterns: uniquePatterns,
    wordCount,
    processingTimeMs,
  };
}
