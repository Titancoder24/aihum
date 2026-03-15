/**
 * Stage 4: Rhythm & Cadence Injection
 *
 * Breaks the monotonous rhythm of AI-generated text by injecting
 * rhetorical devices, deliberate imperfections, varied punctuation,
 * and natural flow-breaking patterns that humans naturally use.
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
// Rhetorical question banks
// ---------------------------------------------------------------------------

const RHETORICAL_QUESTIONS: string[] = [
  'But does that actually work?',
  'Sound familiar?',
  'What does this mean in practice?',
  'Why does this matter?',
  'But is that really the case?',
  'So what changed?',
  'Where does that leave us?',
  'But wait — is it that simple?',
  'Does that hold up under scrutiny?',
  'And the result?',
];

// ---------------------------------------------------------------------------
// Emphasis repetition templates
// ---------------------------------------------------------------------------

const EMPHASIS_TEMPLATES: Array<(sentence: string) => string> = [
  (s) => {
    // "This matters. It really matters."
    const core = s.replace(/[.!?]+$/, '').trim();
    return `${core}. It really ${extractKeyVerb(core)}.`;
  },
  (s) => {
    // "X is important. Truly important."
    const lastWord = extractTrailingAdjective(s);
    if (lastWord) {
      return `${s} Truly ${lastWord}.`;
    }
    return s;
  },
];

function extractKeyVerb(sentence: string): string {
  // Try to grab the main verb phrase — fallback to "matters"
  const match = sentence.match(/\b(matters|works|counts|helps|changes everything)\b/i);
  return match ? match[1].toLowerCase() : 'matters';
}

function extractTrailingAdjective(sentence: string): string | null {
  const cleaned = sentence.replace(/[.!?]+$/, '').trim();
  const words = cleaned.split(/\s+/);
  const last = words[words.length - 1];
  if (last && last.length > 3 && /^[a-z]+$/i.test(last)) {
    return last.toLowerCase();
  }
  return null;
}

// ---------------------------------------------------------------------------
// Conjunction starters
// ---------------------------------------------------------------------------

const CONJUNCTION_STARTERS = ['And', 'But', 'So', 'Yet', 'Or'];

// ---------------------------------------------------------------------------
// Helper: split text into paragraphs, preserving blank lines
// ---------------------------------------------------------------------------

function splitParagraphs(text: string): string[] {
  return text.split(/\n\s*\n/);
}

function joinParagraphs(paragraphs: string[]): string {
  return paragraphs.join('\n\n');
}

// ---------------------------------------------------------------------------
// Core transformation functions
// ---------------------------------------------------------------------------

/**
 * Occasionally inject a rhetorical question at the end of a paragraph.
 * Target: ~5% of paragraphs.
 */
function injectRhetoricalQuestions(
  paragraphs: string[],
  rng: () => number,
  config: ModeConfig,
): string[] {
  if (!config.addColloquialisms) return paragraphs;

  return paragraphs.map((p) => {
    if (rng() < 0.05 && p.trim().length > 40) {
      const question = RHETORICAL_QUESTIONS[Math.floor(rng() * RHETORICAL_QUESTIONS.length)];
      return `${p.trimEnd()} ${question}`;
    }
    return p;
  });
}

/**
 * Add emphasis through repetition — sparingly, ~3% of paragraphs.
 */
function addEmphasisRepetition(
  paragraphs: string[],
  rng: () => number,
  config: ModeConfig,
): string[] {
  if (!config.addColloquialisms) return paragraphs;

  return paragraphs.map((p) => {
    if (rng() < 0.03 && p.trim().length > 60) {
      const sentences = splitSentences(p);
      if (sentences.length >= 2) {
        const targetIdx = Math.floor(rng() * Math.min(sentences.length, 3));
        const template = EMPHASIS_TEMPLATES[Math.floor(rng() * EMPHASIS_TEMPLATES.length)];
        sentences[targetIdx] = template(sentences[targetIdx]);
        return sentences.join(' ');
      }
    }
    return p;
  });
}

/**
 * Start ~10% of sentences with a conjunction ("And", "But", etc.)
 * Only when the sentence doesn't already start with one.
 */
function injectConjunctionStarters(
  sentences: string[],
  rng: () => number,
  config: ModeConfig,
): string[] {
  if (!config.addColloquialisms) return sentences;

  return sentences.map((s) => {
    const trimmed = s.trim();
    if (!trimmed) return s;

    // Skip if already starts with a conjunction
    const firstWord = trimmed.split(/\s+/)[0]?.replace(/[^a-zA-Z]/g, '');
    if (firstWord && CONJUNCTION_STARTERS.some((c) => c.toLowerCase() === firstWord.toLowerCase())) {
      return s;
    }

    if (rng() < 0.10 && trimmed.length > 20) {
      const conjunction = CONJUNCTION_STARTERS[Math.floor(rng() * CONJUNCTION_STARTERS.length)];
      // Lowercase the first character of the original sentence
      const lowered = trimmed[0].toLowerCase() + trimmed.slice(1);
      return `${conjunction} ${lowered}`;
    }
    return s;
  });
}

/**
 * Insert em dashes for interjections in ~8% of sentences.
 * Looks for comma-separated parenthetical phrases and converts them.
 */
function injectEmDashes(
  sentences: string[],
  rng: () => number,
  config: ModeConfig,
): string[] {
  if (!config.addColloquialisms) return sentences;

  return sentences.map((s) => {
    if (rng() >= 0.08 || s.length < 30) return s;

    // Look for a comma-offset clause: ", some words,"
    const commaClause = /,\s+([^,]{5,30}),/;
    const match = s.match(commaClause);
    if (match && match.index !== undefined) {
      const before = s.slice(0, match.index);
      const clause = match[1];
      const after = s.slice(match.index + match[0].length);
      return `${before} \u2014 ${clause} \u2014${after}`;
    }

    // Fallback: insert an em dash interjection before the last clause
    const lastComma = s.lastIndexOf(',');
    if (lastComma > 10 && lastComma < s.length - 10) {
      return `${s.slice(0, lastComma)} \u2014${s.slice(lastComma + 1)}`;
    }

    return s;
  });
}

/**
 * Add trailing ellipses to ~3% of sentences for a trailing-thought effect.
 */
function injectEllipses(
  sentences: string[],
  rng: () => number,
  config: ModeConfig,
): string[] {
  if (!config.addColloquialisms) return sentences;

  return sentences.map((s) => {
    const trimmed = s.trim();
    if (rng() < 0.03 && trimmed.length > 20 && !trimmed.endsWith('...') && !trimmed.endsWith('?')) {
      // Replace terminal punctuation with ellipsis
      return trimmed.replace(/[.!]+$/, '...');
    }
    return s;
  });
}

/**
 * Vary punctuation: occasionally convert periods to exclamation marks
 * in non-formal modes. ~4% of declarative sentences.
 */
function varyPunctuation(
  sentences: string[],
  rng: () => number,
  config: ModeConfig,
): string[] {
  if (config.preserveFormalTone) return sentences;

  return sentences.map((s) => {
    const trimmed = s.trim();
    if (rng() < 0.04 && trimmed.endsWith('.') && trimmed.length > 15) {
      return trimmed.slice(0, -1) + '!';
    }
    return s;
  });
}

/**
 * Break perfect grammar with acceptable informal constructions.
 * E.g., fragment sentences, starting with "Because" without a main clause.
 */
function injectInformalConstructions(
  sentences: string[],
  rng: () => number,
  config: ModeConfig,
): string[] {
  if (!config.addColloquialisms) return sentences;

  return sentences.map((s, idx) => {
    // Skip first sentence and very short ones
    if (idx === 0 || s.trim().length < 30) return s;

    if (rng() < 0.04) {
      // Create a sentence fragment from a dependent clause
      const trimmed = s.trim();
      if (trimmed.toLowerCase().startsWith('this is because ')) {
        return 'Because ' + trimmed.slice('this is because '.length);
      }
      if (trimmed.toLowerCase().startsWith('this happens when ')) {
        return 'Especially when ' + trimmed.slice('this happens when '.length);
      }
    }
    return s;
  });
}

// ---------------------------------------------------------------------------
// Stage export
// ---------------------------------------------------------------------------

const rhythmInjection: HumanizationStage = {
  name: 'Rhythm Injection',
  order: 4,

  process(text: string, config: ModeConfig): string {
    if (!text || !text.trim()) return text;

    const seed = hashText(text);
    const rng = createRng(seed);

    // Work at paragraph level for rhetorical questions and emphasis
    let paragraphs = splitParagraphs(text);
    paragraphs = injectRhetoricalQuestions(paragraphs, rng, config);
    paragraphs = addEmphasisRepetition(paragraphs, rng, config);

    // Work at sentence level for the remaining transformations
    const result = paragraphs.map((paragraph) => {
      let sentences = splitSentences(paragraph);
      if (sentences.length === 0) return paragraph;

      sentences = injectConjunctionStarters(sentences, rng, config);
      sentences = injectEmDashes(sentences, rng, config);
      sentences = injectEllipses(sentences, rng, config);
      sentences = varyPunctuation(sentences, rng, config);
      sentences = injectInformalConstructions(sentences, rng, config);

      return sentences.join(' ');
    });

    return joinParagraphs(result);
  },
};

export default rhythmInjection;
