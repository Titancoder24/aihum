/**
 * Module 4: Structural Patterns Analysis
 *
 * Detects AI-typical structural patterns such as list formatting,
 * parallel construction, and formulaic paragraph structures.
 */

import type { DetectionModule, ModuleAnalysis, SentenceContext, DetectedPattern } from '@/types';
import { splitSentences, tokenizeWords } from '@/lib/nlp/tokenizer';
import { mean, standardDeviation, normalize } from '@/lib/nlp/statistics';
import { DEFAULT_DETECTION_WEIGHTS } from '@/constants';

function detectListPatterns(text: string): number {
  const lines = text.split('\n').filter((l) => l.trim());
  let listLines = 0;
  for (const line of lines) {
    if (/^\s*[-*]\s/.test(line) || /^\s*\d+[.)]\s/.test(line)) {
      listLines++;
    }
  }
  return lines.length > 0 ? listLines / lines.length : 0;
}

function detectParallelConstruction(sentences: string[]): number {
  if (sentences.length < 3) return 0;

  let parallelCount = 0;
  const firstWords = sentences.map((s) => {
    const words = tokenizeWords(s);
    return words.slice(0, 2).join(' ').toLowerCase();
  });

  // Check for repeated sentence openings
  const openingFreq = new Map<string, number>();
  for (const opening of firstWords) {
    openingFreq.set(opening, (openingFreq.get(opening) ?? 0) + 1);
  }
  for (const count of openingFreq.values()) {
    if (count >= 2) parallelCount += count - 1;
  }

  return parallelCount / sentences.length;
}

function detectFormulaParagraphs(text: string): number {
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim());
  if (paragraphs.length < 3) return 0;

  // AI often writes paragraphs of similar length
  const paraLengths = paragraphs.map((p) => tokenizeWords(p).length);
  const avg = mean(paraLengths);
  const sd = standardDeviation(paraLengths);
  const cv = avg > 0 ? sd / avg : 0;

  // Low CV = formulaic (AI-like)
  return normalize(cv, 0.1, 0.6, 1, 0);
}

const structuralModule: DetectionModule = {
  name: 'structural',
  weight: DEFAULT_DETECTION_WEIGHTS.structural,

  analyze(text: string): ModuleAnalysis {
    const sentences = splitSentences(text);
    const details: string[] = [];
    const patterns: DetectedPattern[] = [];

    if (sentences.length < 3) {
      return { score: 0.5, details: ['Text too short for structural analysis'], patterns: [] };
    }

    // List pattern density
    const listScore = normalize(detectListPatterns(text), 0.1, 0.5, 0, 1);

    // Parallel construction
    const parallelRatio = detectParallelConstruction(sentences);
    const parallelScore = normalize(parallelRatio, 0.1, 0.4, 0, 1);

    // Formulaic paragraph structure
    const formulaScore = detectFormulaParagraphs(text);

    // Sentence length uniformity within paragraphs
    const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim());
    let uniformitySum = 0;
    let uniformityCount = 0;
    for (const para of paragraphs) {
      const paraSentences = splitSentences(para);
      if (paraSentences.length >= 2) {
        const lens = paraSentences.map((s) => tokenizeWords(s).length);
        const avg = mean(lens);
        const sd = standardDeviation(lens);
        const cv = avg > 0 ? sd / avg : 0;
        uniformitySum += normalize(cv, 0.1, 0.5, 1, 0);
        uniformityCount++;
      }
    }
    const uniformityScore = uniformityCount > 0 ? uniformitySum / uniformityCount : 0.5;

    const score = listScore * 0.2 + parallelScore * 0.3 + formulaScore * 0.25 + uniformityScore * 0.25;

    details.push(`List pattern density: ${(detectListPatterns(text) * 100).toFixed(1)}%`);
    details.push(`Parallel construction ratio: ${(parallelRatio * 100).toFixed(1)}%`);
    details.push(`Paragraph formula score: ${formulaScore.toFixed(3)}`);

    if (parallelRatio > 0.2) {
      patterns.push({
        name: 'Parallel Construction',
        description: 'Multiple sentences begin with similar words or structures',
        severity: parallelRatio > 0.4 ? 'high' : 'medium',
        examples: [],
      });
    }

    if (detectListPatterns(text) > 0.3) {
      patterns.push({
        name: 'Heavy List Usage',
        description: 'Text relies heavily on bulleted or numbered lists, common in AI output',
        severity: 'medium',
        examples: [],
      });
    }

    return { score: Math.max(0, Math.min(1, score)), details, patterns };
  },

  analyzeSentence(sentence: string, context: SentenceContext): number {
    const words = tokenizeWords(sentence);
    if (words.length < 2) return 0.5;

    const { sentences, index } = context;
    let score = 0.3; // baseline

    // Check if this sentence starts like neighbors
    const firstTwo = words.slice(0, 2).join(' ').toLowerCase();
    let matchingOpeners = 0;
    for (let i = 0; i < sentences.length; i++) {
      if (i === index) continue;
      const otherWords = tokenizeWords(sentences[i]);
      const otherFirstTwo = otherWords.slice(0, 2).join(' ').toLowerCase();
      if (firstTwo === otherFirstTwo) matchingOpeners++;
    }
    if (matchingOpeners > 0) score += 0.2;

    // Check if it's a list item
    if (/^\s*[-*]\s/.test(sentence) || /^\s*\d+[.)]\s/.test(sentence)) {
      score += 0.15;
    }

    return Math.max(0, Math.min(1, score));
  },
};

export default structuralModule;
