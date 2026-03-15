/**
 * Stage 4: Rhythm & Cadence Injection
 *
 * Breaks the monotonous cadence typical of AI text by introducing
 * natural rhythm variations: rhetorical questions, em dashes,
 * deliberate imperfections, ellipses, and punctuation variety.
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

// ── Pools ────────────────────────────────────────────────────────────────────

const RHETORICAL_QUESTIONS = [
  'But does that actually work?',
  'Sound familiar?',
  'What does this mean in practice?',
  'Why does this matter?',
  'Makes sense, right?',
  'But is it really that simple?',
  'So what changed?',
  'The real question is: does it hold up?',
];

const EMPHASIS_TEMPLATES = [
  (core: string): string => `${core} It really does.`,
  (core: string): string => `${core} And that matters.`,
  (core: string): string => `${core} Seriously.`,
];

const CONJUNCTION_STARTERS = ['And', 'But'];

// ── Helpers ──────────────────────────────────────────────────────────────────

function isDeclarativeSentence(s: string): boolean {
  const trimmed = s.trim();
  return trimmed.endsWith('.') && !trimmed.endsWith('...');
}

function insertEmDash(sentence: string, rng: () => number): string {
  // Try to find a comma-separated aside and replace the commas with em dashes
  const commaPattern = /^(.+?),\s*(.{8,}?),\s*(.+)$/;
  const match = sentence.match(commaPattern);
  if (match) {
    return `${match[1]} \u2014 ${match[2]} \u2014 ${match[3]}`;
  }

  // Otherwise insert an em dash before the last clause of a long sentence
  const words = sentence.split(/\s+/);
  if (words.length >= 8) {
    const insertPoint = Math.floor(words.length * (0.4 + rng() * 0.2));
    words.splice(insertPoint, 0, '\u2014');
    return words.join(' ');
  }
  return sentence;
}

function addEllipsis(sentence: string): string {
  const trimmed = sentence.trimEnd();
  if (trimmed.endsWith('.') && !trimmed.endsWith('...')) {
    return trimmed.slice(0, -1) + '...';
  }
  return trimmed + '...';
}

// ── Stage ────────────────────────────────────────────────────────────────────

const rhythmInjection: HumanizationStage = {
  name: 'Rhythm Injection',
  order: 4,

  process(text: string, config: ModeConfig): string {
    if (!text || !text.trim()) return text;

    const seed = hashText(text);
    const rng = createRng(seed);

    const paragraphs = text.split(/\n\s*\n/);
    const processed: string[] = [];

    for (let pi = 0; pi < paragraphs.length; pi++) {
      const para = paragraphs[pi];
      if (!para.trim()) {
        processed.push(para);
        continue;
      }

      let sentences = splitSentences(para);
      if (sentences.length === 0) {
        processed.push(para);
        continue;
      }

      // ── Rhetorical questions (~5% of paragraphs) ─────────────────────
      if (config.addColloquialisms && rng() < 0.05 && sentences.length >= 2) {
        const q = RHETORICAL_QUESTIONS[Math.floor(rng() * RHETORICAL_QUESTIONS.length)];
        const insertIdx = Math.floor(rng() * (sentences.length - 1)) + 1;
        sentences.splice(insertIdx, 0, q);
      }

      // ── Process individual sentences ─────────────────────────────────
      const result: string[] = [];

      for (let si = 0; si < sentences.length; si++) {
        let s = sentences[si];

        // Deliberate "imperfections": start with "And" or "But" (~10%)
        if (
          config.addColloquialisms &&
          rng() < 0.10 &&
          si > 0 &&
          isDeclarativeSentence(s) &&
          !s.startsWith('And ') &&
          !s.startsWith('But ')
        ) {
          const conj = CONJUNCTION_STARTERS[Math.floor(rng() * CONJUNCTION_STARTERS.length)];
          // Lowercase the first character of the original sentence
          s = `${conj} ${s.charAt(0).toLowerCase()}${s.slice(1)}`;
        }

        // Em dashes for interjections (~8%)
        if (rng() < 0.08 && s.split(/\s+/).length >= 8) {
          s = insertEmDash(s, rng);
        }

        // Ellipses for trailing thoughts (~3%)
        if (config.addColloquialisms && rng() < 0.03 && isDeclarativeSentence(s)) {
          s = addEllipsis(s);
        }

        // Vary punctuation: periods to exclamation marks in non-formal modes (~4%)
        if (
          !config.preserveFormalTone &&
          rng() < 0.04 &&
          isDeclarativeSentence(s) &&
          s.split(/\s+/).length >= 4
        ) {
          s = s.trimEnd().replace(/\.$/, '!');
        }

        // Emphasis through repetition (~3%, colloquial only)
        if (
          config.addColloquialisms &&
          rng() < 0.03 &&
          isDeclarativeSentence(s) &&
          s.split(/\s+/).length >= 4
        ) {
          const template = EMPHASIS_TEMPLATES[Math.floor(rng() * EMPHASIS_TEMPLATES.length)];
          s = template(s.trimEnd());
        }

        result.push(s);
      }

      processed.push(result.join(' '));
    }

    return processed.join('\n\n');
  },
};

export default rhythmInjection;
