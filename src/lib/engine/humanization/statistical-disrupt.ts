/**
 * Stage 7: Statistical Signature Disruption
 *
 * Final light-touch pass that targets what AI detectors specifically measure:
 * word-length distribution, punctuation variety, paragraph uniformity, and
 * other statistical fingerprints. This stage makes minimal semantic changes
 * while shifting the text's statistical profile toward human norms.
 */

import type { HumanizationStage, ModeConfig } from '@/types';
import { splitSentences, tokenizeWords } from '@/lib/nlp/tokenizer';

// ---------------------------------------------------------------------------
// Deterministic seeded PRNG (Mulberry32)
// ---------------------------------------------------------------------------

function createRng(seed: number): () => number {
  let s = seed | 0;
  return (): number => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashText(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = (Math.imul(31, h) + text.charCodeAt(i)) | 0;
  }
  return h;
}

// ---------------------------------------------------------------------------
// Word-length normalization synonyms
// Short word -> longer synonym (and vice versa) to adjust distribution
// ---------------------------------------------------------------------------

const SHORT_TO_LONG: Record<string, string[]> = {
  'use': ['utilize', 'employ', 'leverage'],
  'big': ['significant', 'substantial', 'considerable'],
  'get': ['obtain', 'acquire', 'receive'],
  'show': ['demonstrate', 'illustrate', 'reveal'],
  'help': ['assist', 'facilitate', 'support'],
  'make': ['create', 'produce', 'generate'],
  'need': ['require', 'necessitate'],
  'give': ['provide', 'supply', 'furnish'],
  'keep': ['maintain', 'preserve', 'retain'],
  'try': ['attempt', 'endeavor'],
};

const LONG_TO_SHORT: Record<string, string[]> = {
  'utilize': ['use'],
  'implement': ['use', 'apply'],
  'demonstrate': ['show'],
  'facilitate': ['help', 'ease'],
  'approximately': ['about', 'roughly', 'around'],
  'subsequently': ['then', 'later', 'next'],
  'comprehensive': ['full', 'thorough', 'complete'],
  'communicate': ['share', 'tell', 'convey'],
  'nevertheless': ['still', 'yet', 'even so'],
  'functionality': ['feature', 'ability'],
  'methodology': ['method', 'approach', 'way'],
  'infrastructure': ['setup', 'framework', 'base'],
};

// ---------------------------------------------------------------------------
// Punctuation variety injection
// ---------------------------------------------------------------------------

/**
 * Add occasional semicolons or colons if the text lacks them entirely.
 */
function diversifyPunctuation(
  sentences: string[],
  rng: () => number,
): string[] {
  const fullText = sentences.join(' ');
  const hasSemicolons = fullText.includes(';');
  const hasColons = fullText.includes(':');

  if (hasSemicolons && hasColons) return sentences;

  return sentences.map((s) => {
    const trimmed = s.trim();
    if (trimmed.length < 30) return s;

    // Try to insert a semicolon by finding a comma that separates independent clauses
    if (!hasSemicolons && rng() < 0.06) {
      // Look for ", and " or ", but " patterns — good candidates for semicolons
      const andPattern = /,\s+(and|but)\s+/;
      const match = trimmed.match(andPattern);
      if (match && match.index !== undefined && match.index > 10) {
        const before = trimmed.slice(0, match.index);
        const after = trimmed.slice(match.index + match[0].length);
        // Only convert if the part after is long enough to be an independent clause
        if (after.length > 15) {
          return `${before}; ${after}`;
        }
      }
    }

    // Try to insert a colon before a list-like or explanatory clause
    if (!hasColons && rng() < 0.04) {
      const colonCandidates = [
        /\b(namely|specifically|that is)\b/i,
        /\b(including|such as)\b/i,
      ];
      for (const pattern of colonCandidates) {
        const match = trimmed.match(pattern);
        if (match && match.index !== undefined && match.index > 10) {
          const before = trimmed.slice(0, match.index).replace(/,?\s*$/, '');
          const after = trimmed.slice(match.index + match[0].length).replace(/^\s*/, '');
          return `${before}: ${after}`;
        }
      }
    }

    return s;
  });
}

/**
 * Adjust word-length distribution by swapping some words with
 * shorter or longer synonyms to match human writing patterns.
 *
 * Human text typically has a higher ratio of short words than AI text.
 */
function adjustWordLengthDistribution(
  text: string,
  rng: () => number,
  aggressiveness: number,
): string {
  const words = text.split(/(\s+)/); // preserve whitespace
  const tokens = words.filter((w) => /\w/.test(w));

  // Calculate current average word length
  const avgLen = tokens.reduce((sum, w) => sum + w.replace(/[^\w]/g, '').length, 0) / Math.max(tokens.length, 1);

  // Human average is roughly 4.5-5.0 characters. AI tends to be 5.5+.
  const needsShorter = avgLen > 5.2;
  const needsLonger = avgLen < 4.0;

  if (!needsShorter && !needsLonger) return text;

  const swapMap = needsShorter ? LONG_TO_SHORT : SHORT_TO_LONG;
  const swapRate = 0.03 * aggressiveness;

  return words.map((segment) => {
    if (!/\w/.test(segment)) return segment;

    const cleanWord = segment.replace(/[^\w]/g, '').toLowerCase();
    const alternatives = swapMap[cleanWord];

    if (alternatives && rng() < swapRate) {
      const replacement = alternatives[Math.floor(rng() * alternatives.length)];
      // Preserve original casing of first character
      const cased = /^[A-Z]/.test(segment)
        ? replacement[0].toUpperCase() + replacement.slice(1)
        : replacement;
      // Preserve trailing punctuation
      const trailing = segment.match(/[^\w]+$/)?.[0] ?? '';
      const leading = segment.match(/^[^\w]+/)?.[0] ?? '';
      return `${leading}${cased}${trailing}`;
    }
    return segment;
  }).join('');
}

/**
 * Ensure paragraph structure isn't suspiciously uniform.
 * If all paragraphs have very similar sentence counts, slightly adjust.
 */
function disruptParagraphUniformity(
  text: string,
  rng: () => number,
): string {
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  if (paragraphs.length < 3) return text;

  // Calculate sentence counts
  const sentenceCounts = paragraphs.map((p) => splitSentences(p).length);
  const avg = sentenceCounts.reduce((a, b) => a + b, 0) / sentenceCounts.length;
  const variance = sentenceCounts.reduce((sum, c) => sum + (c - avg) ** 2, 0) / sentenceCounts.length;

  // If variance is very low (suspiciously uniform), break up a paragraph
  if (variance < 0.5 && paragraphs.length >= 3) {
    // Pick a random paragraph to split
    const targetIdx = 1 + Math.floor(rng() * (paragraphs.length - 2));
    const sentences = splitSentences(paragraphs[targetIdx]);

    if (sentences.length >= 3) {
      const splitPoint = 1 + Math.floor(rng() * (sentences.length - 2));
      const part1 = sentences.slice(0, splitPoint).join(' ');
      const part2 = sentences.slice(splitPoint).join(' ');
      paragraphs.splice(targetIdx, 1, part1, part2);
    }
  }

  return paragraphs.join('\n\n');
}

/**
 * Add occasional contractions to reduce formality score in detectors.
 * "do not" -> "don't", "cannot" -> "can't", etc.
 */
function addContractions(text: string, rng: () => number, config: ModeConfig): string {
  if (config.preserveFormalTone) return text;

  const contractionMap: Array<{ pattern: RegExp; replacement: string }> = [
    { pattern: /\bdo not\b/gi, replacement: "don't" },
    { pattern: /\bcannot\b/gi, replacement: "can't" },
    { pattern: /\bwill not\b/gi, replacement: "won't" },
    { pattern: /\bshould not\b/gi, replacement: "shouldn't" },
    { pattern: /\bwould not\b/gi, replacement: "wouldn't" },
    { pattern: /\bcould not\b/gi, replacement: "couldn't" },
    { pattern: /\bdoes not\b/gi, replacement: "doesn't" },
    { pattern: /\bis not\b/gi, replacement: "isn't" },
    { pattern: /\bare not\b/gi, replacement: "aren't" },
    { pattern: /\bwas not\b/gi, replacement: "wasn't" },
    { pattern: /\bhas not\b/gi, replacement: "hasn't" },
    { pattern: /\bhave not\b/gi, replacement: "haven't" },
    { pattern: /\bit is\b/gi, replacement: "it's" },
    { pattern: /\bthat is\b/gi, replacement: "that's" },
    { pattern: /\bthey are\b/gi, replacement: "they're" },
    { pattern: /\bwe are\b/gi, replacement: "we're" },
    { pattern: /\byou are\b/gi, replacement: "you're" },
  ];

  let result = text;
  for (const { pattern, replacement } of contractionMap) {
    result = result.replace(pattern, (match) => {
      if (rng() < 0.7) {
        // Preserve casing of first letter
        if (/^[A-Z]/.test(match)) {
          return replacement[0].toUpperCase() + replacement.slice(1);
        }
        return replacement;
      }
      return match;
    });
  }
  return result;
}

// ---------------------------------------------------------------------------
// Stage export
// ---------------------------------------------------------------------------

const statisticalDisrupt: HumanizationStage = {
  name: 'Statistical Disrupt',
  order: 7,

  process(text: string, config: ModeConfig): string {
    if (!text || !text.trim()) return text;

    const seed = hashText(text);
    const rng = createRng(seed);

    // 1. Adjust word-length distribution
    let result = adjustWordLengthDistribution(text, rng, config.vocabularyAggressiveness);

    // 2. Add contractions where appropriate
    result = addContractions(result, rng, config);

    // 3. Diversify punctuation at sentence level
    const paragraphs = result.split(/\n\s*\n/);
    const processed = paragraphs.map((p) => {
      let sentences = splitSentences(p);
      sentences = diversifyPunctuation(sentences, rng);
      return sentences.join(' ');
    });
    result = processed.join('\n\n');

    // 4. Disrupt paragraph uniformity
    result = disruptParagraphUniformity(result, rng);

    return result;
  },
};

export default statisticalDisrupt;
