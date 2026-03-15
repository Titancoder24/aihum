/**
 * Module 6: Stylometric Fingerprinting
 *
 * Analyzes stylistic patterns that distinguish AI from human writing:
 * - Function word frequency distribution
 * - Punctuation patterns per 1000 characters
 * - Contraction usage consistency
 * - Sentence-opening word distribution
 * - Passive voice frequency
 *
 * Score 0-1 where 1 = definitely AI.
 */

import type {
  DetectionModule,
  ModuleAnalysis,
  SentenceContext,
  DetectedPattern,
} from '@/types';
import { splitSentences, tokenizeWords } from '@/lib/nlp/tokenizer';
import { FUNCTION_WORDS } from '@/lib/nlp/vocabulary';
import {
  mean,
  standardDeviation,
  shannonEntropy,
  normalize,
} from '@/lib/nlp/statistics';
import { ngramFrequencies } from '@/lib/nlp/ngrams';

/** Minimum words needed for stylometric analysis. */
const MIN_WORDS = 30;

/** Common contractions and their expanded forms. */
const CONTRACTIONS: readonly string[] = [
  "don't", "doesn't", "didn't", "won't", "wouldn't", "can't", "couldn't",
  "shouldn't", "isn't", "aren't", "wasn't", "weren't", "hasn't", "haven't",
  "hadn't", "it's", "he's", "she's", "that's", "there's", "here's",
  "what's", "who's", "let's", "i'm", "you're", "we're", "they're",
  "i've", "you've", "we've", "they've", "i'll", "you'll", "he'll",
  "she'll", "we'll", "they'll", "i'd", "you'd", "he'd", "she'd",
  "we'd", "they'd",
] as const;

/** Expanded forms corresponding to contractions above. */
const EXPANDED_FORMS: readonly string[] = [
  'do not', 'does not', 'did not', 'will not', 'would not', 'cannot',
  'could not', 'should not', 'is not', 'are not', 'was not', 'were not',
  'has not', 'have not', 'had not', 'it is', 'he is', 'she is',
  'that is', 'there is', 'here is', 'what is', 'who is', 'let us',
  'i am', 'you are', 'we are', 'they are', 'i have', 'you have',
  'we have', 'they have', 'i will', 'you will', 'he will', 'she will',
  'we will', 'they will', 'i would', 'you would', 'he would', 'she would',
  'we would', 'they would',
] as const;

/** Past participle endings for passive voice detection. */
const PAST_PARTICIPLE_SUFFIXES = ['ed', 'en', 'wn', 'ne', 'ht', 'lt', 'rn', 'un'];

/** Words that are commonly irregular past participles. */
const IRREGULAR_PAST_PARTICIPLES = new Set([
  'been', 'done', 'gone', 'seen', 'taken', 'given', 'known', 'shown',
  'made', 'found', 'said', 'told', 'thought', 'brought', 'bought',
  'caught', 'taught', 'felt', 'left', 'held', 'kept', 'led', 'lost',
  'met', 'paid', 'put', 'read', 'run', 'sent', 'set', 'sat', 'spent',
  'stood', 'understood', 'won', 'written', 'spoken', 'broken', 'chosen',
  'driven', 'eaten', 'fallen', 'forgotten', 'frozen', 'gotten', 'hidden',
  'risen', 'stolen', 'torn', 'worn', 'born', 'built', 'cut', 'hurt',
  'shut', 'split', 'spread',
]);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Analyze function word frequency distribution.
 * AI text tends to have a more uniform distribution of function words.
 * Returns a score 0-1 where higher = more AI-like.
 */
function functionWordDistributionScore(words: string[]): number {
  if (words.length < MIN_WORDS) return 0.5;

  const lowerWords = words.map((w) => w.toLowerCase());
  const fwCounts = new Map<string, number>();
  let totalFW = 0;

  for (const w of lowerWords) {
    if (FUNCTION_WORDS.has(w)) {
      fwCounts.set(w, (fwCounts.get(w) ?? 0) + 1);
      totalFW++;
    }
  }

  if (totalFW < 10) return 0.5;

  // Shannon entropy of function word distribution
  const entropy = shannonEntropy(fwCounts);
  // AI text tends to have higher entropy (more uniform distribution)
  // Human text is more idiosyncratic
  // Human: entropy ~3.5-4.5; AI: ~4.5-5.5
  return normalize(entropy, 3.5, 5.5);
}

/**
 * Analyze punctuation patterns per 1000 characters.
 * AI tends to use colons and semicolons more, and exclamation marks less.
 */
function punctuationPatternScore(text: string): { score: number; details: string[] } {
  const details: string[] = [];
  const len = text.length;
  if (len < 100) return { score: 0.5, details: ['Text too short for punctuation analysis'] };

  const per1k = (count: number) => (count / len) * 1000;

  const semicolons = per1k((text.match(/;/g) ?? []).length);
  const emDashes = per1k((text.match(/[—–]/g) ?? []).length);
  const colons = per1k((text.match(/:/g) ?? []).length);
  const exclamations = per1k((text.match(/!/g) ?? []).length);
  const questions = per1k((text.match(/\?/g) ?? []).length);
  const commas = per1k((text.match(/,/g) ?? []).length);

  details.push(`Semicolons/1k: ${semicolons.toFixed(2)}`);
  details.push(`Em dashes/1k: ${emDashes.toFixed(2)}`);
  details.push(`Colons/1k: ${colons.toFixed(2)}`);
  details.push(`Exclamation marks/1k: ${exclamations.toFixed(2)}`);
  details.push(`Question marks/1k: ${questions.toFixed(2)}`);

  const scores: number[] = [];

  // AI uses more semicolons (1-3/1k) than humans (<0.5/1k)
  scores.push(normalize(semicolons, 0.3, 2.5));

  // AI uses em dashes moderately uniformly; high usage can be AI
  scores.push(normalize(emDashes, 0.5, 3.0));

  // AI uses more colons (1-3/1k) than casual human text (<0.5/1k)
  scores.push(normalize(colons, 0.5, 2.5));

  // Low exclamation marks => AI (AI rarely uses them)
  scores.push(1 - normalize(exclamations, 0.0, 2.0));

  // Moderate question mark usage: AI is predictable
  // This is weaker signal, low weight
  scores.push(normalize(questions, 0.5, 2.0) * 0.5 + 0.25);

  // High comma rate can indicate AI's complex sentence structures
  scores.push(normalize(commas, 20, 45));

  return { score: mean(scores), details };
}

/**
 * Check contraction usage consistency.
 * AI often mixes contractions and expanded forms inconsistently.
 * Returns a score 0-1 where higher = more AI-like.
 */
function contractionConsistencyScore(text: string): { score: number; details: string } {
  const lower = text.toLowerCase();

  let contractedCount = 0;
  let expandedCount = 0;

  for (const contraction of CONTRACTIONS) {
    const regex = new RegExp(`\\b${contraction.replace("'", "'")}\\b`, 'gi');
    const matches = lower.match(regex);
    if (matches) contractedCount += matches.length;
  }

  for (const expanded of EXPANDED_FORMS) {
    const regex = new RegExp(`\\b${expanded}\\b`, 'gi');
    const matches = lower.match(regex);
    if (matches) expandedCount += matches.length;
  }

  const total = contractedCount + expandedCount;
  if (total < 3) {
    return { score: 0.5, details: `Contractions: ${contractedCount}, Expanded: ${expandedCount} (too few)` };
  }

  // Mixing ratio: AI texts often have ~40-60% contraction rate (inconsistent)
  // while human text tends to be consistently high (>80%) or consistently low (<20%)
  const contractionRate = contractedCount / total;
  const mixingScore = 1 - Math.abs(contractionRate - 0.5) * 2; // peaks at 50% mixing
  const normalizedScore = normalize(mixingScore, 0.2, 0.8);

  return {
    score: normalizedScore,
    details: `Contractions: ${contractedCount}, Expanded: ${expandedCount}, Rate: ${(contractionRate * 100).toFixed(1)}%`,
  };
}

/**
 * Analyze sentence-opening word distribution.
 * AI tends to start sentences with a limited set of words (e.g., "The", "This", "It").
 * Returns a score 0-1 where higher = more AI-like.
 */
function sentenceOpeningScore(sentences: string[]): number {
  if (sentences.length < 5) return 0.5;

  const firstWords = sentences.map((s) => {
    const words = tokenizeWords(s);
    return words.length > 0 ? words[0].toLowerCase() : '';
  }).filter((w) => w.length > 0);

  if (firstWords.length < 5) return 0.5;

  // Entropy of first-word distribution
  const freq = ngramFrequencies(firstWords);
  const entropy = shannonEntropy(freq);

  // Max possible entropy = log2(uniqueFirstWords)
  const maxEntropy = Math.log2(freq.size);
  const normalizedEntropy = maxEntropy > 0 ? entropy / maxEntropy : 1;

  // AI text tends to have lower entropy in first words (more repetitive)
  // Human text: normalized entropy ~0.85-0.95; AI: ~0.60-0.80
  return 1 - normalize(normalizedEntropy, 0.6, 0.95);
}

/**
 * Detect passive voice constructions using heuristics.
 * Pattern: was/were/is/are/been/being/be + past participle
 * Returns the passive voice ratio (passive sentences / total sentences).
 */
function passiveVoiceRatio(sentences: string[]): number {
  if (sentences.length === 0) return 0;

  const passiveAux = new Set(['was', 'were', 'is', 'are', 'been', 'being', 'be', 'am']);
  let passiveCount = 0;

  for (const sentence of sentences) {
    const words = tokenizeWords(sentence).map((w) => w.toLowerCase());
    for (let i = 0; i < words.length - 1; i++) {
      if (passiveAux.has(words[i])) {
        const nextWord = words[i + 1];
        const isPastParticiple =
          IRREGULAR_PAST_PARTICIPLES.has(nextWord) ||
          PAST_PARTICIPLE_SUFFIXES.some((suffix) => nextWord.endsWith(suffix) && nextWord.length > suffix.length + 2);
        if (isPastParticiple) {
          passiveCount++;
          break; // count each sentence only once
        }
      }
    }
  }

  return passiveCount / sentences.length;
}

// ---------------------------------------------------------------------------
// Module
// ---------------------------------------------------------------------------

const stylometricModule: DetectionModule = {
  name: 'stylometric',
  weight: 0.10,

  analyze(text: string): ModuleAnalysis {
    const details: string[] = [];
    const patterns: DetectedPattern[] = [];

    const words = tokenizeWords(text);

    if (words.length < MIN_WORDS) {
      details.push(
        `Text too short for stylometric analysis (${words.length} words, need ${MIN_WORDS}+).`,
      );
      return { score: 0.5, details, patterns };
    }

    const sentences = splitSentences(text);

    // ------ 1. Function word distribution ------
    const fwScore = functionWordDistributionScore(words);
    details.push(`Function word distribution score: ${fwScore.toFixed(3)}`);

    // ------ 2. Punctuation patterns ------
    const punctResult = punctuationPatternScore(text);
    details.push(...punctResult.details);
    details.push(`Punctuation pattern score: ${punctResult.score.toFixed(3)}`);

    // ------ 3. Contraction consistency ------
    const contractionResult = contractionConsistencyScore(text);
    details.push(`Contraction analysis: ${contractionResult.details}`);
    details.push(`Contraction consistency score: ${contractionResult.score.toFixed(3)}`);

    // ------ 4. Sentence opening distribution ------
    const openingScore = sentenceOpeningScore(sentences);
    details.push(`Sentence opening score: ${openingScore.toFixed(3)}`);

    // ------ 5. Passive voice frequency ------
    const passiveRatio = passiveVoiceRatio(sentences);
    // AI tends to use more passive voice (~15-30% of sentences)
    // Human casual writing: ~5-10%
    const passiveScore = normalize(passiveRatio, 0.05, 0.30);
    details.push(`Passive voice ratio: ${(passiveRatio * 100).toFixed(1)}%`);
    details.push(`Passive voice score: ${passiveScore.toFixed(3)}`);

    // ------ Aggregate ------
    const finalScore = Math.max(0, Math.min(1,
      fwScore * 0.20 +
      punctResult.score * 0.25 +
      contractionResult.score * 0.15 +
      openingScore * 0.20 +
      passiveScore * 0.20,
    ));

    details.push(`Final stylometric score: ${finalScore.toFixed(3)}`);

    // Detect patterns
    if (fwScore > 0.65) {
      patterns.push({
        name: 'Uniform Function Word Usage',
        description:
          'Function words are distributed unusually uniformly, suggesting machine-generated text.',
        severity: fwScore > 0.8 ? 'high' : 'medium',
        examples: [],
      });
    }

    if (contractionResult.score > 0.65) {
      patterns.push({
        name: 'Inconsistent Contraction Usage',
        description:
          'Text alternates between contractions and expanded forms inconsistently, a common AI trait.',
        severity: 'medium',
        examples: [],
      });
    }

    if (openingScore > 0.65) {
      patterns.push({
        name: 'Repetitive Sentence Openings',
        description:
          'Sentences begin with a limited variety of words, suggesting formulaic generation.',
        severity: openingScore > 0.8 ? 'high' : 'medium',
        examples: [],
      });
    }

    if (passiveScore > 0.65) {
      patterns.push({
        name: 'High Passive Voice',
        description:
          'Text uses passive voice constructions at rates typical of AI-generated text.',
        severity: 'medium',
        examples: [],
      });
    }

    return { score: finalScore, details, patterns };
  },

  analyzeSentence(sentence: string, context: SentenceContext): number {
    const words = tokenizeWords(sentence);
    if (words.length < 3) return 0.5;

    const scores: number[] = [];

    // Function word ratio in this sentence
    const fwCount = words.filter((w) => FUNCTION_WORDS.has(w.toLowerCase())).length;
    const fwRatio = fwCount / words.length;
    // AI tends toward a consistent ~40-55% function word ratio
    const fwDev = Math.abs(fwRatio - 0.47);
    scores.push(1 - normalize(fwDev, 0, 0.2));

    // Passive voice in this sentence
    const passiveRatio = passiveVoiceRatio([sentence]);
    scores.push(passiveRatio > 0 ? 0.7 : 0.3);

    // Sentence opening repetition
    const { sentences, index } = context;
    if (sentences.length > 3) {
      const firstWord = words[0]?.toLowerCase() ?? '';
      let sameOpener = 0;
      for (let i = 0; i < sentences.length; i++) {
        if (i === index) continue;
        const otherFirst = tokenizeWords(sentences[i])[0]?.toLowerCase() ?? '';
        if (firstWord === otherFirst) sameOpener++;
      }
      const openerRatio = sameOpener / (sentences.length - 1);
      scores.push(normalize(openerRatio, 0.05, 0.3));
    }

    return scores.length > 0
      ? Math.max(0, Math.min(1, mean(scores)))
      : 0.5;
  },
};

export default stylometricModule;
