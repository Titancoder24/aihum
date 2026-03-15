/**
 * Stage 6: Paragraph Restructuring
 *
 * Varies paragraph lengths, moves topic sentences, splits walls of text,
 * merges overly short consecutive paragraphs, and adds one-line emphasis
 * paragraphs after key points.
 */

import type { HumanizationStage, ModeConfig } from '@/types';
import { splitSentences } from '@/lib/nlp/tokenizer';

// ── Deterministic seeded PRNG ────────────────────────────────────────────────

function hashText(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    hash = ((hash << 5) - hash + ch) | 0;
  }
  return Math.abs(hash);
}

function createRng(seed: number): () => number {
  let s = seed | 0 || 1;
  return (): number => {
    s = (s * 1664525 + 1013904223) | 0;
    return (s >>> 0) / 0x100000000;
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

interface Paragraph {
  sentences: string[];
}

function sentenceCount(para: Paragraph): number {
  return para.sentences.length;
}

function joinParagraph(para: Paragraph): string {
  return para.sentences.join(' ');
}

function isEmphasisCandidate(sentence: string): boolean {
  // Short, punchy sentences are good emphasis candidates
  const words = sentence.trim().split(/\s+/);
  return (
    words.length >= 3 &&
    words.length <= 10 &&
    (sentence.endsWith('.') || sentence.endsWith('!'))
  );
}

// ── Stage ────────────────────────────────────────────────────────────────────

const paragraphRestructure: HumanizationStage = {
  name: 'Paragraph Restructure',
  order: 6,

  process(text: string, config: ModeConfig): string {
    if (!text || !text.trim()) return text;

    const seed = hashText(text);
    const rng = createRng(seed);

    // Parse into paragraphs, each paragraph into sentences
    const rawParagraphs = text.split(/\n\s*\n/);
    let paragraphs: Paragraph[] = rawParagraphs
      .map((p) => ({
        sentences: p.trim() ? splitSentences(p.trim()) : [],
      }))
      .filter((p) => p.sentences.length > 0);

    if (paragraphs.length === 0) return text;

    // ── Pass 1: Split wall-of-text paragraphs (>6 sentences) ─────────
    const afterSplit: Paragraph[] = [];
    for (const para of paragraphs) {
      if (sentenceCount(para) > 6) {
        // Split into chunks of 3-5 sentences
        let remaining = [...para.sentences];
        while (remaining.length > 0) {
          const chunkSize = Math.min(
            remaining.length,
            3 + Math.floor(rng() * 3), // 3-5
          );
          afterSplit.push({ sentences: remaining.splice(0, chunkSize) });
        }
      } else {
        afterSplit.push(para);
      }
    }
    paragraphs = afterSplit;

    // ── Pass 2: Merge very short consecutive paragraphs ──────────────
    // (1-2 sentences each, 3+ in a row)
    const afterMerge: Paragraph[] = [];
    let shortStreak: Paragraph[] = [];

    const flushShortStreak = (): void => {
      if (shortStreak.length >= 3) {
        // Merge them into one paragraph
        const merged: string[] = [];
        for (const p of shortStreak) {
          merged.push(...p.sentences);
        }
        afterMerge.push({ sentences: merged });
      } else {
        afterMerge.push(...shortStreak);
      }
      shortStreak = [];
    };

    for (const para of paragraphs) {
      if (sentenceCount(para) <= 2) {
        shortStreak.push(para);
      } else {
        flushShortStreak();
        afterMerge.push(para);
      }
    }
    flushShortStreak();
    paragraphs = afterMerge;

    // ── Pass 3: Move topic sentences (~15% of multi-sentence paras) ──
    for (const para of paragraphs) {
      if (sentenceCount(para) >= 4 && rng() < 0.15) {
        // Move the first sentence to position 2 or 3
        const topicSentence = para.sentences.shift()!;
        const newPos = Math.min(
          1 + Math.floor(rng() * 2), // position 1 or 2
          para.sentences.length,
        );
        para.sentences.splice(newPos, 0, topicSentence);
      }
    }

    // ── Pass 4: Add one-line emphasis paragraphs after key points ────
    // (~8% chance after paragraphs with 4+ sentences)
    const withEmphasis: Paragraph[] = [];
    for (const para of paragraphs) {
      withEmphasis.push(para);

      if (
        sentenceCount(para) >= 4 &&
        rng() < 0.08 &&
        !config.preserveFormalTone
      ) {
        // Extract the last sentence if it's a good emphasis candidate
        const lastSentence = para.sentences[para.sentences.length - 1];
        if (isEmphasisCandidate(lastSentence)) {
          // Remove it from the paragraph and make it its own paragraph
          para.sentences.pop();
          withEmphasis.push({ sentences: [lastSentence] });
        }
      }
    }
    paragraphs = withEmphasis;

    // ── Reconstruct text ─────────────────────────────────────────────
    return paragraphs.map(joinParagraph).join('\n\n');
  },
};

export default paragraphRestructure;
