/**
 * Regex-based NLP tokenizer utilities for sentence splitting,
 * word tokenization, and syllable counting.
 */

/** Common abbreviations that should not trigger sentence boundaries. */
const ABBREVIATIONS = new Set([
  'mr', 'mrs', 'ms', 'dr', 'prof', 'sr', 'jr', 'st', 'ave', 'blvd',
  'gen', 'gov', 'sgt', 'cpl', 'pvt', 'lt', 'col', 'maj', 'capt',
  'cmdr', 'adm', 'rev', 'hon', 'pres', 'dept', 'univ', 'assn',
  'bros', 'inc', 'ltd', 'co', 'corp', 'vs', 'est', 'approx',
  'dept', 'div', 'govt', 'natl', 'intl',
  'jan', 'feb', 'mar', 'apr', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
  'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun',
  'fig', 'eq', 'vol', 'no', 'al', 'etc', 'ie', 'eg',
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
  'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
]);

/**
 * Split text into sentences using regex-based boundary detection.
 * Handles abbreviations, decimal numbers, ellipses, and quoted text.
 */
export function splitSentences(text: string): string[] {
  if (!text || !text.trim()) {
    return [];
  }

  const trimmed = text.trim();

  // Approach: walk through the text and identify sentence boundaries.
  // A sentence boundary is a period, question mark, or exclamation mark
  // followed by whitespace and an uppercase letter (or end of text),
  // but NOT if the period is part of an abbreviation or decimal number.

  const sentences: string[] = [];
  let current = 0;

  // Match potential sentence-ending punctuation
  const boundaryPattern = /([.!?]+)(\s+|$)/g;
  let match: RegExpExecArray | null;
  let lastEnd = 0;

  while ((match = boundaryPattern.exec(trimmed)) !== null) {
    const punctuation = match[1];
    const punctEnd = match.index + punctuation.length;
    const afterSpace = match.index + match[0].length;

    // Check if this is an ellipsis (three or more dots) — not a sentence boundary
    // unless followed by a capital letter after space
    const isEllipsis = punctuation.length >= 3 || (
      punctuation === '.' && match.index >= 2 &&
      trimmed[match.index - 1] === '.' && trimmed[match.index - 2] === '.'
    );

    if (isEllipsis && afterSpace < trimmed.length) {
      const nextChar = trimmed[afterSpace];
      if (nextChar && /[A-Z]/.test(nextChar)) {
        // Ellipsis followed by capital letter — treat as boundary
        sentences.push(trimmed.slice(lastEnd, punctEnd).trim());
        lastEnd = afterSpace;
        continue;
      }
      // Ellipsis not followed by capital — not a boundary
      continue;
    }

    // For periods only (not ! or ?)
    if (punctuation === '.') {
      // Check for decimal numbers: digit.digit
      if (match.index > 0 && match.index < trimmed.length - 1) {
        const charBefore = trimmed[match.index - 1];
        const charAfter = trimmed[punctEnd];
        if (/\d/.test(charBefore) && charAfter !== undefined && /\d/.test(charAfter)) {
          continue; // decimal number
        }
      }

      // Check for abbreviations: extract the word before the period
      const beforePeriod = trimmed.slice(lastEnd, match.index);
      const wordMatch = beforePeriod.match(/(\w+)$/);
      if (wordMatch) {
        const word = wordMatch[1].toLowerCase();
        if (ABBREVIATIONS.has(word)) {
          // Check if the next character after the space is uppercase
          // If so, it might still be a sentence boundary for single-letter abbreviations
          // But generally abbreviations don't end sentences
          if (afterSpace < trimmed.length) {
            const nextChar = trimmed[afterSpace];
            // For single-letter abbreviations or known abbreviations,
            // only break if the next word starts with uppercase AND the abbreviation
            // is not commonly followed by names (like Mr., Dr.)
            if (word.length === 1) {
              continue; // Single letter abbreviations like initials: J. K. Rowling
            }
            // For multi-letter abbreviations, don't split
            continue;
          }
        }
      }
    }

    // This is a sentence boundary
    if (afterSpace <= trimmed.length) {
      const sentence = trimmed.slice(lastEnd, punctEnd).trim();
      if (sentence) {
        sentences.push(sentence);
      }
      lastEnd = afterSpace;
    }
  }

  // Add remaining text as the last sentence
  if (lastEnd < trimmed.length) {
    const remaining = trimmed.slice(lastEnd).trim();
    if (remaining) {
      sentences.push(remaining);
    }
  }

  // If no boundaries were found, return the whole text as one sentence
  if (sentences.length === 0) {
    return [trimmed];
  }

  return sentences;
}

/**
 * Tokenize text into words, handling punctuation, contractions, and hyphens.
 */
export function tokenizeWords(text: string): string[] {
  if (!text || !text.trim()) {
    return [];
  }

  // Replace hyphens between words with spaces (compound words become separate tokens)
  // but keep hyphens in well-known patterns
  let processed = text;

  // Remove leading/trailing punctuation from words but keep contractions
  // Strategy: split on whitespace, then clean each token
  const rawTokens = processed.split(/\s+/).filter(Boolean);
  const words: string[] = [];

  for (const token of rawTokens) {
    // Strip leading punctuation (quotes, parens, brackets, etc.)
    let cleaned = token.replace(/^[^\w']+/, '');
    // Strip trailing punctuation but keep apostrophes that are part of contractions
    cleaned = cleaned.replace(/[^\w']+$/, '');
    // Remove any remaining trailing apostrophes that aren't part of contractions
    cleaned = cleaned.replace(/'$/, '');

    if (!cleaned) {
      continue;
    }

    // Split hyphenated words into separate tokens
    if (cleaned.includes('-')) {
      const parts = cleaned.split('-').filter(Boolean);
      words.push(...parts);
    } else {
      words.push(cleaned);
    }
  }

  return words;
}

/**
 * Estimate the syllable count of a word using heuristics.
 * Uses the vowel-group counting method with common English adjustments.
 */
export function countSyllables(word: string): number {
  if (!word || !word.trim()) {
    return 0;
  }

  const w = word.toLowerCase().trim().replace(/[^a-z]/g, '');
  if (!w) {
    return 0;
  }

  // Single and two letter words
  if (w.length <= 2) {
    return 1;
  }

  let count = 0;

  // Count vowel groups
  const vowelGroups = w.match(/[aeiouy]+/gi);
  if (vowelGroups) {
    count = vowelGroups.length;
  }

  // Subtract silent 'e' at the end
  if (w.endsWith('e') && !w.endsWith('le') && count > 1) {
    count--;
  }

  // Subtract for common suffixes that don't add syllables
  if (w.endsWith('es') && !w.endsWith('ses') && !w.endsWith('zes') && !w.endsWith('ces') && !w.endsWith('xes')) {
    if (count > 1) count--;
  }

  if (w.endsWith('ed') && !w.endsWith('ted') && !w.endsWith('ded')) {
    if (count > 1) count--;
  }

  // Add for common patterns that add syllables
  // -le at end of word (like "table", "apple")
  if (w.endsWith('le') && w.length > 2 && !/[aeiouy]/.test(w[w.length - 3])) {
    count++;
  }

  // -ion adds a syllable when preceded by 't' or 's'
  if (/[ts]ion/.test(w)) {
    count++;
  }

  // -ia, -iu, -io in the middle/end (like "material", "medium")
  const hiatus = w.match(/[aeiou][aeiou]/g);
  if (hiatus) {
    for (const h of hiatus) {
      if (['ia', 'io', 'iu', 'ua', 'uo'].includes(h)) {
        count++;
      }
    }
  }

  return Math.max(1, count);
}

/**
 * Get the word count for each sentence in the text.
 */
export function getSentenceLengths(text: string): number[] {
  const sentences = splitSentences(text);
  return sentences.map((sentence) => tokenizeWords(sentence).length);
}
