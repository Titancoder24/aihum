/**
 * Stage 6: Paragraph Restructuring
 *
 * Varies paragraph lengths, moves topic sentences, splits wall-of-text
 * paragraphs, merges overly fragmented consecutive short paragraphs,
 * and adds one-line emphasis paragraphs after key points.
 */

import type { HumanizationStage, ModeConfig } from '@/types';
import { splitSentences } from '@/lib/nlp/tokenizer';

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
// Emphasis phrases for one-line paragraphs
// ---------------------------------------------------------------------------

const EMPHASIS_OPENERS: string[] = [
  'That last point is key.',
  'This cannot be overstated.',
  'Let that sink in.',
  'Read that again.',
  'This is the part that matters most.',
  'And that makes all the difference.',
];

// ---------------------------------------------------------------------------
// Core transformations
// ---------------------------------------------------------------------------

/**
 * Split wall-of-text paragraphs (>6 sentences) into smaller chunks.
 */
function splitLongParagraphs(paragraphs: string[], rng: () => number): string[] {
  const result: string[] = [];

  for (const p of paragraphs) {
    const sentences = splitSentences(p);

    if (sentences.length <= 6) {
      result.push(p);
      continue;
    }

    // Split into chunks of 2-5 sentences
    let i = 0;
    while (i < sentences.length) {
      const chunkSize = 2 + Math.floor(rng() * 4); // 2-5 sentences
      const chunk = sentences.slice(i, i + chunkSize);
      result.push(chunk.join(' '));
      i += chunkSize;
    }
  }

  return result;
}

/**
 * Merge very short consecutive paragraphs (1-2 sentences each, 3+ in a row).
 */
function mergeShortParagraphs(paragraphs: string[]): string[] {
  const result: string[] = [];
  let consecutiveShort: string[] = [];

  const flushShort = (): void => {
    if (consecutiveShort.length >= 3) {
      // Merge them into one paragraph
      result.push(consecutiveShort.join(' '));
    } else {
      // Not enough consecutive shorts — keep as-is
      for (const p of consecutiveShort) {
        result.push(p);
      }
    }
    consecutiveShort = [];
  };

  for (const p of paragraphs) {
    const sentenceCount = splitSentences(p).length;

    if (sentenceCount <= 2) {
      consecutiveShort.push(p);
    } else {
      flushShort();
      result.push(p);
    }
  }

  flushShort();
  return result;
}

/**
 * Move topic sentences around: not every paragraph starts with the main point.
 * Roughly ~15% of multi-sentence paragraphs get their first sentence moved.
 */
function shuffleTopicSentences(paragraphs: string[], rng: () => number): string[] {
  return paragraphs.map((p) => {
    const sentences = splitSentences(p);
    if (sentences.length < 3 || rng() >= 0.15) return p;

    // Move the first sentence to position 1 or 2
    const first = sentences.shift();
    if (!first) return p;

    const insertAt = 1 + Math.floor(rng() * Math.min(2, sentences.length));
    sentences.splice(insertAt, 0, first);
    return sentences.join(' ');
  });
}

/**
 * Add one-line emphasis paragraphs after key points (~5% of paragraphs).
 */
function addEmphasisParagraphs(
  paragraphs: string[],
  rng: () => number,
  config: ModeConfig,
): string[] {
  if (config.preserveFormalTone) return paragraphs;

  const result: string[] = [];
  for (const p of paragraphs) {
    result.push(p);

    const sentences = splitSentences(p);
    // Only add after substantial paragraphs
    if (sentences.length >= 3 && rng() < 0.05) {
      const emphasis = EMPHASIS_OPENERS[Math.floor(rng() * EMPHASIS_OPENERS.length)];
      result.push(emphasis);
    }
  }
  return result;
}

/**
 * Vary paragraph lengths by occasionally splitting a mid-length paragraph
 * to create a 1-sentence emphasis paragraph followed by the rest.
 */
function createVariedLengths(paragraphs: string[], rng: () => number): string[] {
  const result: string[] = [];

  for (const p of paragraphs) {
    const sentences = splitSentences(p);

    // For paragraphs with 4-6 sentences, occasionally pull out
    // one sentence as a standalone emphasis paragraph
    if (sentences.length >= 4 && sentences.length <= 6 && rng() < 0.10) {
      // Pull out the most impactful sentence (heuristic: the shortest declarative one)
      let bestIdx = 0;
      let bestLen = Infinity;
      for (let i = 1; i < sentences.length - 1; i++) {
        if (sentences[i].length < bestLen && sentences[i].length > 10) {
          bestLen = sentences[i].length;
          bestIdx = i;
        }
      }

      if (bestIdx > 0) {
        const emphasis = sentences.splice(bestIdx, 1)[0];
        result.push(sentences.join(' '));
        result.push(emphasis);
        continue;
      }
    }

    result.push(p);
  }

  return result;
}

// ---------------------------------------------------------------------------
// Stage export
// ---------------------------------------------------------------------------

const paragraphRestructure: HumanizationStage = {
  name: 'Paragraph Restructure',
  order: 6,

  process(text: string, config: ModeConfig): string {
    if (!text || !text.trim()) return text;

    const seed = hashText(text);
    const rng = createRng(seed);

    let paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
    if (paragraphs.length === 0) return text;

    // Apply transformations in order
    paragraphs = splitLongParagraphs(paragraphs, rng);
    paragraphs = mergeShortParagraphs(paragraphs);
    paragraphs = shuffleTopicSentences(paragraphs, rng);
    paragraphs = createVariedLengths(paragraphs, rng);
    paragraphs = addEmphasisParagraphs(paragraphs, rng, config);

    return paragraphs.join('\n\n');
  },
};

export default paragraphRestructure;
