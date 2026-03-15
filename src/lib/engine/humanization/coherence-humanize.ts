/**
 * Stage 5: Coherence Humanization
 *
 * Adds personal-sounding qualifiers, removes AI summarization patterns,
 * replaces AI hedging with natural hedging, and adds occasional callbacks
 * to earlier points — all the small signals that make text feel written
 * by a real person rather than generated.
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
// Personal qualifiers (only used when !preserveFormalTone)
// ---------------------------------------------------------------------------

const PERSONAL_QUALIFIERS: string[] = [
  'In my experience,',
  'From what I\'ve seen,',
  'I\'d argue',
  'I think',
  'Honestly,',
  'If you ask me,',
  'In my view,',
  'The way I see it,',
];

// ---------------------------------------------------------------------------
// AI summarization patterns to remove
// ---------------------------------------------------------------------------

const AI_SUMMARY_PATTERNS: RegExp[] = [
  /^As mentioned above,?\s*/i,
  /^As we('ve| have) discussed,?\s*/i,
  /^To summarize,?\s*/i,
  /^In summary,?\s*/i,
  /^To sum up,?\s*/i,
  /^As previously (mentioned|stated|noted),?\s*/i,
  /^As (noted|stated) (earlier|above|previously),?\s*/i,
  /^In conclusion,?\s*/i,
  /^To (recap|reiterate),?\s*/i,
  /^All in all,?\s*/i,
];

// ---------------------------------------------------------------------------
// AI hedging replacements — stiff hedging -> natural hedging
// ---------------------------------------------------------------------------

const AI_HEDGING_MAP: Array<{ pattern: RegExp; replacements: string[] }> = [
  {
    pattern: /\bIt is (imperative|crucial|essential) to consider\b/gi,
    replacements: ['You should probably think about', 'It\'s worth considering', 'It helps to think about'],
  },
  {
    pattern: /\bIt is (important|worth noting) (to note |)that\b/gi,
    replacements: ['The thing is,', 'Here\'s the deal:', 'Notably,'],
  },
  {
    pattern: /\bIt (should|must) be noted that\b/gi,
    replacements: ['Worth mentioning:', 'Keep in mind that', 'One thing to note:'],
  },
  {
    pattern: /\bIt is (widely|generally) (acknowledged|recognized|accepted) that\b/gi,
    replacements: ['Most people agree that', 'It\'s pretty well known that', 'The consensus is that'],
  },
  {
    pattern: /\bFurthermore,?\s/gi,
    replacements: ['On top of that, ', 'Also, ', 'Plus, '],
  },
  {
    pattern: /\bMoreover,?\s/gi,
    replacements: ['And ', 'What\'s more, ', 'Also, '],
  },
  {
    pattern: /\bNevertheless,?\s/gi,
    replacements: ['Still, ', 'Even so, ', 'That said, '],
  },
  {
    pattern: /\bConsequently,?\s/gi,
    replacements: ['So ', 'As a result, ', 'Because of that, '],
  },
  {
    pattern: /\bAdditionally,?\s/gi,
    replacements: ['Also, ', 'On top of that, ', 'Plus, '],
  },
  {
    pattern: /\bIn order to\b/gi,
    replacements: ['To'],
  },
  {
    pattern: /\bDue to the fact that\b/gi,
    replacements: ['Because', 'Since'],
  },
  {
    pattern: /\bAt the present time\b/gi,
    replacements: ['Right now', 'Currently', 'These days'],
  },
  {
    pattern: /\bA significant (number|amount|portion) of\b/gi,
    replacements: ['A lot of', 'Many', 'Plenty of'],
  },
];

// ---------------------------------------------------------------------------
// Natural hedging insertions
// ---------------------------------------------------------------------------

const NATURAL_HEDGES: string[] = [
  'probably',
  'seems like',
  'might be',
  'I\'d guess',
  'likely',
  'arguably',
];

// ---------------------------------------------------------------------------
// Callback phrases
// ---------------------------------------------------------------------------

const CALLBACK_PHRASES: string[] = [
  'Going back to what we said about',
  'Remember when we talked about',
  'This ties back to',
  'Like I mentioned with',
  'Circling back to',
];

// ---------------------------------------------------------------------------
// Core transformations
// ---------------------------------------------------------------------------

/**
 * Add personal qualifiers to ~6% of sentences when informal tone is allowed.
 */
function addPersonalQualifiers(
  sentences: string[],
  rng: () => number,
  config: ModeConfig,
): string[] {
  if (config.preserveFormalTone) return sentences;

  return sentences.map((s, idx) => {
    // Don't add to the very first sentence or very short ones
    if (idx === 0 || s.trim().length < 25) return s;

    if (rng() < 0.06) {
      const qualifier = PERSONAL_QUALIFIERS[Math.floor(rng() * PERSONAL_QUALIFIERS.length)];
      const trimmed = s.trim();
      // Lowercase the first character when prepending a qualifier
      const lowered = trimmed[0].toLowerCase() + trimmed.slice(1);
      return `${qualifier} ${lowered}`;
    }
    return s;
  });
}

/**
 * Remove AI summarization pattern openings.
 */
function removeAISummarization(sentences: string[]): string[] {
  return sentences
    .map((s) => {
      let cleaned = s;
      for (const pattern of AI_SUMMARY_PATTERNS) {
        cleaned = cleaned.replace(pattern, '');
      }
      // If we stripped the opening, capitalize the new first letter
      if (cleaned !== s && cleaned.length > 0) {
        cleaned = cleaned[0].toUpperCase() + cleaned.slice(1);
      }
      return cleaned;
    })
    .filter((s) => s.trim().length > 0);
}

/**
 * Replace AI hedging phrases with natural alternatives.
 */
function replaceAIHedging(text: string, rng: () => number): string {
  let result = text;
  for (const entry of AI_HEDGING_MAP) {
    result = result.replace(entry.pattern, () => {
      return entry.replacements[Math.floor(rng() * entry.replacements.length)];
    });
  }
  return result;
}

/**
 * Insert natural hedging words into ~4% of declarative sentences.
 */
function insertNaturalHedging(
  sentences: string[],
  rng: () => number,
  config: ModeConfig,
): string[] {
  if (config.preserveFormalTone) return sentences;

  return sentences.map((s) => {
    const trimmed = s.trim();
    if (rng() >= 0.04 || trimmed.length < 30 || trimmed.endsWith('?')) return s;

    const hedge = NATURAL_HEDGES[Math.floor(rng() * NATURAL_HEDGES.length)];
    const words = trimmed.split(/\s+/);

    // Insert after the subject (roughly after the 2nd or 3rd word)
    if (words.length > 4) {
      const insertPos = 2 + Math.floor(rng() * 2);
      words.splice(insertPos, 0, hedge);
      return words.join(' ');
    }
    return s;
  });
}

/**
 * Add callbacks to earlier points — very sparingly (~2% of sentences
 * that appear in the latter half of the text).
 */
function addCallbacks(
  sentences: string[],
  rng: () => number,
  config: ModeConfig,
): string[] {
  if (config.preserveFormalTone) return sentences;
  if (sentences.length < 6) return sentences;

  const halfwayPoint = Math.floor(sentences.length / 2);

  // Extract a key noun from an early sentence for the callback reference
  const earlyNouns = extractKeyNouns(sentences.slice(0, halfwayPoint));

  return sentences.map((s, idx) => {
    if (idx < halfwayPoint || earlyNouns.length === 0) return s;

    if (rng() < 0.02) {
      const phrase = CALLBACK_PHRASES[Math.floor(rng() * CALLBACK_PHRASES.length)];
      const noun = earlyNouns[Math.floor(rng() * earlyNouns.length)];
      const trimmed = s.trim();
      const lowered = trimmed[0].toLowerCase() + trimmed.slice(1);
      return `${phrase} ${noun}, ${lowered}`;
    }
    return s;
  });
}

/**
 * Extract candidate key nouns from a set of sentences.
 * Simple heuristic: look for longer capitalized words that aren't sentence starters.
 */
function extractKeyNouns(sentences: string[]): string[] {
  const nouns: string[] = [];
  for (const s of sentences) {
    const words = s.split(/\s+/);
    for (let i = 1; i < words.length; i++) {
      const w = words[i].replace(/[^a-zA-Z]/g, '');
      if (w.length >= 4 && /^[a-z]/.test(w)) {
        nouns.push(w);
      }
    }
  }
  // Deduplicate and limit
  return Array.from(new Set(nouns)).slice(0, 10);
}

// ---------------------------------------------------------------------------
// Stage export
// ---------------------------------------------------------------------------

const coherenceHumanize: HumanizationStage = {
  name: 'Coherence Humanize',
  order: 5,

  process(text: string, config: ModeConfig): string {
    if (!text || !text.trim()) return text;

    const seed = hashText(text);
    const rng = createRng(seed);

    // First pass: replace AI hedging at the full-text level
    let processed = replaceAIHedging(text, rng);

    // Split into paragraphs, then sentences
    const paragraphs = processed.split(/\n\s*\n/);

    const result = paragraphs.map((paragraph) => {
      let sentences = splitSentences(paragraph);
      if (sentences.length === 0) return paragraph;

      sentences = removeAISummarization(sentences);
      sentences = addPersonalQualifiers(sentences, rng, config);
      sentences = insertNaturalHedging(sentences, rng, config);
      sentences = addCallbacks(sentences, rng, config);

      return sentences.join(' ');
    });

    return result.join('\n\n');
  },
};

export default coherenceHumanize;
