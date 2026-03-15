/**
 * Stage 5: Coherence Humanization
 *
 * Adds human-sounding qualifiers, removes AI summarization patterns,
 * introduces natural hedging, allows slight redundancy, and adds
 * callbacks to earlier points.
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

// ── Patterns & Pools ─────────────────────────────────────────────────────────

/** AI summarization openers that should be removed. */
const SUMMARIZATION_PATTERNS: RegExp[] = [
  /^As\s+mentioned\s+(above|earlier|previously),?\s*/i,
  /^As\s+we('ve|\s+have)\s+(discussed|seen|noted|explored),?\s*/i,
  /^To\s+summarize,?\s*/i,
  /^In\s+summary,?\s*/i,
  /^To\s+sum\s+up,?\s*/i,
  /^As\s+previously\s+(stated|mentioned|noted),?\s*/i,
  /^As\s+noted\s+(above|earlier|previously),?\s*/i,
  /^To\s+recap,?\s*/i,
  /^In\s+conclusion,?\s*/i,
];

/** AI-style stiff hedging patterns and their natural replacements. */
const AI_HEDGING_REPLACEMENTS: Array<{ pattern: RegExp; replacements: string[] }> = [
  {
    pattern: /\bIt is imperative to consider\b/gi,
    replacements: ['You should probably think about', 'It helps to consider', "It's worth considering"],
  },
  {
    pattern: /\bIt is important to note that\b/gi,
    replacements: ['Worth noting:', 'One thing to keep in mind is that', 'Notably,'],
  },
  {
    pattern: /\bIt is worth mentioning that\b/gi,
    replacements: ['Also,', "I'd point out that", 'On that note,'],
  },
  {
    pattern: /\bIt should be noted that\b/gi,
    replacements: ['Mind you,', 'Keep in mind,', 'That said,'],
  },
  {
    pattern: /\bIt is essential to\b/gi,
    replacements: ["You really need to", "It's key to", "Make sure to"],
  },
  {
    pattern: /\bFurthermore,?\s/gi,
    replacements: ['Plus, ', 'On top of that, ', 'Also, '],
  },
  {
    pattern: /\bMoreover,?\s/gi,
    replacements: ['And ', 'Also, ', 'Beyond that, '],
  },
  {
    pattern: /\bAdditionally,?\s/gi,
    replacements: ['Also, ', 'On top of that, ', 'And '],
  },
  {
    pattern: /\bConsequently,?\s/gi,
    replacements: ['So ', 'Because of that, ', 'As a result, '],
  },
  {
    pattern: /\bNevertheless,?\s/gi,
    replacements: ['Still, ', 'Even so, ', 'That said, '],
  },
];

const PERSONAL_QUALIFIERS = [
  'in my experience,',
  "from what I've seen,",
  "I'd argue",
  'I think',
  'honestly,',
  'as far as I can tell,',
  "from what I've gathered,",
];

const NATURAL_HEDGES = [
  'probably',
  'seems like',
  'might be',
  "I'd guess",
  'likely',
  'arguably',
];

const CALLBACK_PHRASES = [
  'going back to what we said about',
  'circling back to',
  'remember when we talked about',
  'as we touched on earlier with',
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function removeSummarizationOpener(sentence: string): string {
  let result = sentence;
  for (const pattern of SUMMARIZATION_PATTERNS) {
    const cleaned = result.replace(pattern, '');
    if (cleaned !== result && cleaned.length > 0) {
      // Capitalize the first letter of the remaining text
      result = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
  }
  return result;
}

function replaceAIHedging(sentence: string, rng: () => number): string {
  let result = sentence;
  for (const { pattern, replacements } of AI_HEDGING_REPLACEMENTS) {
    if (pattern.test(result)) {
      const replacement = replacements[Math.floor(rng() * replacements.length)];
      // Reset lastIndex for global patterns
      pattern.lastIndex = 0;
      result = result.replace(pattern, replacement);
      pattern.lastIndex = 0;
    }
  }
  return result;
}

function extractKeyNoun(sentence: string): string | null {
  // Extract a likely key noun from a sentence (simple heuristic: first noun-like word after an article)
  const match = sentence.match(/\b(?:the|a|an)\s+(\w{4,})/i);
  return match ? match[1].toLowerCase() : null;
}

// ── Stage ────────────────────────────────────────────────────────────────────

const coherenceHumanize: HumanizationStage = {
  name: 'Coherence Humanize',
  order: 5,

  process(text: string, config: ModeConfig): string {
    if (!text || !text.trim()) return text;

    const seed = hashText(text);
    const rng = createRng(seed);

    const paragraphs = text.split(/\n\s*\n/);
    const allProcessed: string[] = [];

    // Collect key nouns across the entire text for callbacks
    const keyNouns: string[] = [];

    for (let pi = 0; pi < paragraphs.length; pi++) {
      const para = paragraphs[pi];
      if (!para.trim()) {
        allProcessed.push(para);
        continue;
      }

      const sentences = splitSentences(para);
      const result: string[] = [];

      for (let si = 0; si < sentences.length; si++) {
        let s = sentences[si];

        // ── Remove AI summarization patterns ─────────────────────────
        s = removeSummarizationOpener(s);

        // If the sentence was entirely a summarization phrase, skip it
        if (!s.trim() || s.trim().length < 5) continue;

        // ── Replace AI hedging with natural hedging ──────────────────
        s = replaceAIHedging(s, rng);

        // ── Add personal qualifiers (when !preserveFormalTone) ───────
        if (
          !config.preserveFormalTone &&
          rng() < 0.06 &&
          si > 0 &&
          s.length > 20
        ) {
          const qualifier = PERSONAL_QUALIFIERS[Math.floor(rng() * PERSONAL_QUALIFIERS.length)];
          // Lowercase the first character and prepend qualifier
          s = `${qualifier.charAt(0).toUpperCase()}${qualifier.slice(1)} ${s.charAt(0).toLowerCase()}${s.slice(1)}`;
        }

        // ── Inject natural hedging words (~5%) ───────────────────────
        if (
          !config.preserveFormalTone &&
          rng() < 0.05 &&
          s.split(/\s+/).length >= 6
        ) {
          const hedge = NATURAL_HEDGES[Math.floor(rng() * NATURAL_HEDGES.length)];
          const words = s.split(/\s+/);
          // Insert hedge after the second or third word
          const pos = Math.min(2, words.length - 1);
          words.splice(pos, 0, hedge);
          s = words.join(' ');
        }

        // ── Add callbacks to earlier points (~2%, after enough text) ─
        if (
          !config.preserveFormalTone &&
          rng() < 0.02 &&
          keyNouns.length >= 3 &&
          pi > 1 &&
          si === 0
        ) {
          const noun = keyNouns[Math.floor(rng() * keyNouns.length)];
          const phrase = CALLBACK_PHRASES[Math.floor(rng() * CALLBACK_PHRASES.length)];
          s = `${phrase.charAt(0).toUpperCase()}${phrase.slice(1)} ${noun}, ${s.charAt(0).toLowerCase()}${s.slice(1)}`;
        }

        // Track key nouns for possible callbacks
        const noun = extractKeyNoun(s);
        if (noun && !keyNouns.includes(noun)) {
          keyNouns.push(noun);
        }

        result.push(s);
      }

      allProcessed.push(result.join(' '));
    }

    return allProcessed.join('\n\n');
  },
};

export default coherenceHumanize;
