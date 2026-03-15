/**
 * Stage 1: Sentence Structure Randomization
 * Breaks AI's uniform sentence length pattern through splitting, merging,
 * fragment insertion, opening variation, voice switching, and parenthetical asides.
 */

import type { HumanizationStage, ModeConfig } from '@/types';
import { splitSentences, tokenizeWords } from '@/lib/nlp/tokenizer';

// ---------------------------------------------------------------------------
// Seeded PRNG — deterministic randomness based on text content
// ---------------------------------------------------------------------------

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash + ch) | 0;
  }
  return hash >>> 0;
}

function createSeededRandom(seed: number): () => number {
  let s = seed;
  return (): number => {
    s = (s * 1664525 + 1013904223) | 0;
    return (s >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Constant pools
// ---------------------------------------------------------------------------

const MERGE_CONJUNCTIONS = ['and', 'but', 'so', 'which', 'while', 'though', 'yet'];

const SENTENCE_FRAGMENTS = [
  'Not exactly ideal.',
  'Weird, right?',
  'Pretty straightforward.',
  'Fair enough.',
  'Go figure.',
  'Makes sense.',
  'Not always, though.',
  'At least in theory.',
  'Hard to say.',
  'Big difference.',
  'Worth noting.',
  'Interesting, right?',
  'No surprises there.',
  'Just something to think about.',
  'Easier said than done.',
  'Not a huge deal.',
  'Kind of tricky.',
  'Simple as that.',
  'That matters.',
  'True story.',
];

const PARENTHETICAL_ASIDES = [
  '(at least in theory)',
  '(not always the case)',
  '(for better or worse)',
  '(or so they say)',
  '(surprisingly enough)',
  '(more on that later)',
  '(broadly speaking)',
  '(no pun intended)',
  '(in most cases)',
  '(give or take)',
  '(to some degree)',
  '(depending on who you ask)',
  '(believe it or not)',
  '(in a nutshell)',
  '(roughly speaking)',
];

const VARIED_OPENERS = [
  'In practice, ',
  'Generally, ',
  'On the whole, ',
  'Looking at it differently, ',
  'That said, ',
  'Along those lines, ',
  'To put it another way, ',
  'From another angle, ',
  'As it turns out, ',
  'Realistically, ',
  'In most cases, ',
  'When you think about it, ',
  'Broadly speaking, ',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function wc(sentence: string): number {
  return tokenizeWords(sentence).length;
}

/**
 * Split a long sentence at a natural break point.
 * Returns either two shorter sentences or the original in an array.
 */
function splitLongSentence(sentence: string, rand: () => number): string[] {
  const breakPatterns: RegExp[] = [
    /,\s+(and|but|so|yet|while|although|though|however|because|since|whereas)\s+/i,
    /;\s+/,
    /\s+—\s+/,
    /,\s+(which|where|when)\s+/i,
  ];

  for (const pattern of breakPatterns) {
    const match = pattern.exec(sentence);
    if (match && match.index > 10) {
      const firstPart = sentence.slice(0, match.index).replace(/[,;]$/, '').trim();
      const secondPart = sentence.slice(match.index + match[0].length).trim();

      if (firstPart.length > 5 && secondPart.length > 5) {
        const first = /[.!?]$/.test(firstPart) ? firstPart : firstPart + '.';
        const cappedSecond = secondPart.charAt(0).toUpperCase() + secondPart.slice(1);
        return [first, cappedSecond];
      }
    }
  }

  // Fallback: try splitting at a comma roughly in the middle
  const commaIndices: number[] = [];
  for (let i = 0; i < sentence.length; i++) {
    if (sentence[i] === ',') commaIndices.push(i);
  }

  if (commaIndices.length > 0) {
    const midChar = Math.floor(sentence.length / 2);
    let bestIdx = commaIndices[0];
    let bestDist = Math.abs(commaIndices[0] - midChar);
    for (const ci of commaIndices) {
      const dist = Math.abs(ci - midChar);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = ci;
      }
    }

    if (bestIdx > 10 && bestIdx < sentence.length - 10) {
      const first = sentence.slice(0, bestIdx).trim();
      const second = sentence.slice(bestIdx + 1).trim();
      if (first.length > 5 && second.length > 5) {
        const firstDone = /[.!?]$/.test(first) ? first : first + '.';
        const cappedSecond = second.charAt(0).toUpperCase() + second.slice(1);
        return [firstDone, cappedSecond];
      }
    }
  }

  return [sentence];
}

/**
 * Merge two short sentences with a natural conjunction.
 */
function mergeSentences(a: string, b: string, rand: () => number): string {
  const conjunction = MERGE_CONJUNCTIONS[Math.floor(rand() * MERGE_CONJUNCTIONS.length)];

  const cleanA = a.replace(/[.!?]+$/, '').trim();

  let startB = b.trim();
  // Lowercase second sentence start unless it's "I" or an acronym
  if (startB.length > 0 && /^[A-Z]/.test(startB) && !/^(I\b|[A-Z]{2,})/.test(startB)) {
    startB = startB.charAt(0).toLowerCase() + startB.slice(1);
  }

  const endPunct = b.match(/[.!?]+$/)?.[0] ?? '.';
  const cleanB = startB.replace(/[.!?]+$/, '').trim();

  return `${cleanA}, ${conjunction} ${cleanB}${endPunct}`;
}

/**
 * Simple heuristic to toggle passive/active voice.
 */
function toggleVoice(sentence: string, _rand: () => number): string {
  // Passive → Active: "X was/were [verb]ed by Y"
  const passiveByPattern = /^(.+?)\s+(was|were)\s+(\w+ed)\s+by\s+(.+?)([.!?]*)$/i;
  const passiveMatch = passiveByPattern.exec(sentence);
  if (passiveMatch) {
    const [, subject, , verb, agent, punct] = passiveMatch;
    const agentCapped = agent.charAt(0).toUpperCase() + agent.slice(1);
    const subjectLower = subject.charAt(0).toLowerCase() + subject.slice(1);
    return `${agentCapped} ${verb} ${subjectLower}${punct}`;
  }

  // Active → Passive: "Subject verbed the Object"
  const simpleActivePattern = /^([A-Z][\w]+)\s+(\w+ed)\s+(the\s+\w[\w\s]{0,30}?)([.!?]*)$/i;
  const activeMatch = simpleActivePattern.exec(sentence);
  if (activeMatch) {
    const [, subject, verb, object, punct] = activeMatch;
    const objectCapped = object.trim().charAt(0).toUpperCase() + object.trim().slice(1);
    const subjectLower = subject.charAt(0).toLowerCase() + subject.slice(1);
    const wasWere = /s$/i.test(subject) ? 'were' : 'was';
    return `${objectCapped} ${wasWere} ${verb} by ${subjectLower}${punct}`;
  }

  return sentence;
}

/**
 * Detect 3+ consecutive sentences starting with the same word and restructure.
 */
function varyOpenings(sentences: string[], rand: () => number): string[] {
  const result = [...sentences];

  for (let i = 0; i < result.length - 2; i++) {
    const firstWord = (s: string): string => {
      const m = s.match(/^\w+/);
      return m ? m[0].toLowerCase() : '';
    };

    const w1 = firstWord(result[i]);
    const w2 = firstWord(result[i + 1]);
    const w3 = firstWord(result[i + 2]);

    if (w1 && w1 === w2 && w2 === w3) {
      const opener = VARIED_OPENERS[Math.floor(rand() * VARIED_OPENERS.length)];
      const middleSentence = result[i + 1];
      const stripped = middleSentence.replace(/^\w+\s+/, '');
      if (stripped.length > 5) {
        const lowered = stripped.charAt(0).toLowerCase() + stripped.slice(1);
        result[i + 1] = opener + lowered;
      }
    }
  }

  return result;
}

/**
 * Insert a parenthetical aside into a sentence.
 */
function insertParenthetical(sentence: string, rand: () => number): string {
  const aside = PARENTHETICAL_ASIDES[Math.floor(rand() * PARENTHETICAL_ASIDES.length)];
  const words = sentence.split(/\s+/);
  if (words.length < 6) return sentence;

  const midPoint = Math.floor(words.length / 2);
  let insertIdx = -1;

  // Prefer inserting after a comma near the middle
  for (let offset = 0; offset < Math.floor(words.length / 3); offset++) {
    const checkIdx = midPoint + (offset % 2 === 0 ? Math.floor(offset / 2) : -Math.floor((offset + 1) / 2));
    if (checkIdx >= 2 && checkIdx < words.length - 2) {
      if (words[checkIdx].endsWith(',')) {
        insertIdx = checkIdx + 1;
        break;
      }
    }
  }

  if (insertIdx === -1) {
    insertIdx = midPoint;
  }

  words.splice(insertIdx, 0, aside);
  return words.join(' ');
}

// ---------------------------------------------------------------------------
// Main stage
// ---------------------------------------------------------------------------

const sentenceRestructure: HumanizationStage = {
  name: 'Sentence Structure Randomization',
  order: 1,

  process(text: string, config: ModeConfig): string {
    if (!text || !text.trim()) return text;

    const seed = hashCode(text);
    const rand = createSeededRandom(seed);

    let sentences = splitSentences(text);
    if (sentences.length === 0) return text;

    // ---- 1. Split long sentences (~40% of the time) ----
    const expanded: string[] = [];
    for (const sentence of sentences) {
      if (wc(sentence) > 30 && rand() < 0.4) {
        expanded.push(...splitLongSentence(sentence, rand));
      } else {
        expanded.push(sentence);
      }
    }
    sentences = expanded;

    // ---- 2. Merge short consecutive sentences (~30% of the time) ----
    const merged: string[] = [];
    let idx = 0;
    while (idx < sentences.length) {
      if (
        idx + 1 < sentences.length &&
        wc(sentences[idx]) < 10 &&
        wc(sentences[idx + 1]) < 10 &&
        rand() < 0.3
      ) {
        merged.push(mergeSentences(sentences[idx], sentences[idx + 1], rand));
        idx += 2;
      } else {
        merged.push(sentences[idx]);
        idx++;
      }
    }
    sentences = merged;

    // ---- 3. Add sentence fragments (if addColloquialisms) ----
    if (config.addColloquialisms) {
      const withFragments: string[] = [];
      for (const sentence of sentences) {
        withFragments.push(sentence);
        if (rand() < 0.08 && sentences.length > 3) {
          const fragment = SENTENCE_FRAGMENTS[Math.floor(rand() * SENTENCE_FRAGMENTS.length)];
          withFragments.push(fragment);
        }
      }
      sentences = withFragments;
    }

    // ---- 4. Vary sentence openings ----
    sentences = varyOpenings(sentences, rand);

    // ---- 5. Toggle active/passive voice (~15% of sentences) ----
    sentences = sentences.map((s) => {
      if (rand() < 0.15) {
        return toggleVoice(s, rand);
      }
      return s;
    });

    // ---- 6. Add parenthetical asides (if addColloquialisms) ----
    if (config.addColloquialisms) {
      sentences = sentences.map((s) => {
        if (wc(s) > 8 && rand() < 0.07) {
          return insertParenthetical(s, rand);
        }
        return s;
      });
    }

    // ---- 7. Target sentence length variance ----
    const lengths = sentences.map(wc);
    if (lengths.length > 0) {
      const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
      const variance = lengths.reduce((a, b) => a + (b - mean) ** 2, 0) / lengths.length;
      const stddev = Math.sqrt(variance);

      if (stddev < config.sentenceVariance && sentences.length > 2) {
        let maxIdx = 0;
        let maxLen = 0;
        for (let j = 0; j < sentences.length; j++) {
          const len = wc(sentences[j]);
          if (len > maxLen) {
            maxLen = len;
            maxIdx = j;
          }
        }

        if (maxLen > 15) {
          const parts = splitLongSentence(sentences[maxIdx], rand);
          if (parts.length > 1) {
            sentences.splice(maxIdx, 1, ...parts);
          }
        }
      }
    }

    return sentences.join(' ');
  },
};

export default sentenceRestructure;
