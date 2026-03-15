/**
 * Vocabulary analysis utilities for measuring lexical richness and diversity.
 */

/**
 * Common English function words (determiners, prepositions, conjunctions,
 * pronouns, auxiliary verbs, etc.). ~150 words.
 */
export const FUNCTION_WORDS: Set<string> = new Set([
  // Determiners / Articles
  'the', 'a', 'an', 'this', 'that', 'these', 'those', 'my', 'your', 'his',
  'her', 'its', 'our', 'their', 'some', 'any', 'no', 'every', 'each', 'all',
  'both', 'few', 'more', 'most', 'other', 'another', 'such', 'what', 'which',
  'much', 'many', 'several', 'enough',

  // Prepositions
  'in', 'on', 'at', 'to', 'for', 'with', 'by', 'from', 'of', 'about',
  'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between',
  'under', 'over', 'up', 'down', 'out', 'off', 'against', 'along', 'among',
  'around', 'behind', 'beside', 'beyond', 'near', 'since', 'until', 'upon',
  'within', 'without', 'across', 'toward', 'towards',

  // Conjunctions
  'and', 'but', 'or', 'nor', 'so', 'yet', 'because', 'although',
  'though', 'while', 'if', 'unless', 'whether', 'than', 'as', 'once',
  'when', 'where', 'how', 'why',

  // Pronouns
  'i', 'me', 'we', 'us', 'you', 'he', 'him', 'she', 'it', 'they', 'them',
  'myself', 'yourself', 'himself', 'herself', 'itself', 'ourselves',
  'themselves', 'who', 'whom', 'whose', 'whoever', 'whatever', 'whichever',

  // Auxiliary / Modal verbs
  'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'having',
  'do', 'does', 'did',
  'will', 'would', 'shall', 'should', 'may', 'might', 'can', 'could', 'must',

  // Other function words / adverbs
  'not', 'very', 'also', 'just', 'only', 'still', 'already', 'even',
  'never', 'always', 'often', 'sometimes',
  'too', 'quite', 'rather', 'well', 'almost',
  'here', 'there', 'then', 'now',
]);

/**
 * Type-token ratio: unique words / total words.
 * A higher ratio indicates greater lexical diversity.
 */
export function typeTokenRatio(words: string[]): number {
  if (words.length === 0) return 0;
  const unique = new Set(words.map((w) => w.toLowerCase()));
  return unique.size / words.length;
}

/**
 * Hapax legomena ratio: words appearing exactly once / total unique words.
 * A higher ratio suggests more diverse or uncommon vocabulary usage.
 */
export function hapaxLegomenaRatio(words: string[]): number {
  if (words.length === 0) return 0;

  const freq = new Map<string, number>();
  for (const word of words) {
    const lower = word.toLowerCase();
    freq.set(lower, (freq.get(lower) ?? 0) + 1);
  }

  const uniqueCount = freq.size;
  if (uniqueCount === 0) return 0;

  let hapaxCount = 0;
  for (const count of freq.values()) {
    if (count === 1) hapaxCount++;
  }

  return hapaxCount / uniqueCount;
}

/**
 * Lexical density: content words / total words.
 * Content words are all words that are NOT function words.
 * A higher ratio indicates denser, more information-rich text.
 */
export function lexicalDensity(words: string[]): number {
  if (words.length === 0) return 0;

  let contentWordCount = 0;
  for (const word of words) {
    if (!FUNCTION_WORDS.has(word.toLowerCase())) {
      contentWordCount++;
    }
  }

  return contentWordCount / words.length;
}
