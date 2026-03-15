/**
 * Module 3: Vocabulary Diversity & Entropy Analysis
 *
 * Detects AI-generated text by analyzing vocabulary patterns:
 * - Type-Token Ratio at multiple window sizes
 * - Shannon entropy of word distributions
 * - Hapax legomena ratio
 * - Lexical density
 * - AI-favorite word/phrase density
 */

import type {
  DetectionModule,
  ModuleAnalysis,
  SentenceContext,
  DetectedPattern,
} from '@/types/index';
import { tokenizeWords } from '@/lib/nlp/tokenizer';
import { shannonEntropy, mean, standardDeviation } from '@/lib/nlp/statistics';
import {
  typeTokenRatio,
  hapaxLegomenaRatio,
  lexicalDensity,
} from '@/lib/nlp/vocabulary';

// ---------------------------------------------------------------------------
// AI-telltale words and phrases (200+)
// ---------------------------------------------------------------------------

const AI_TELLTALE_SINGLE_WORDS: readonly string[] = [
  // Over-formal verbs
  'delve', 'utilize', 'facilitate', 'leverage', 'underscore', 'streamline',
  'encompass', 'encompasses', 'foster', 'fosters', 'fostering', 'navigate',
  'navigating', 'embark', 'embarking', 'elucidate', 'epitomize', 'exemplify',
  'illuminate', 'necessitate', 'necessitates', 'optimize', 'bolster',
  'augment', 'amplify', 'cultivate', 'cultivating', 'catalyze', 'spearhead',
  'harness', 'harnessing', 'propel', 'galvanize', 'invigorate',
  'reinvigorate', 'revolutionize', 'transcend', 'prioritize', 'juxtapose',
  'synthesize', 'orchestrate', 'reimagine', 'recalibrate', 'reconfigure',

  // Overused adjectives / adverbs
  'multifaceted', 'comprehensive', 'crucial', 'pivotal', 'nuanced',
  'holistic', 'robust', 'cutting-edge', 'groundbreaking', 'transformative',
  'innovative', 'intricate', 'noteworthy', 'paramount', 'indispensable',
  'imperative', 'profound', 'meticulous', 'unparalleled', 'unprecedented',
  'ever-evolving', 'dynamic', 'invaluable', 'versatile', 'overarching',
  'foundational', 'instrumental', 'burgeoning', 'vibrant', 'seminal',
  'salient', 'pervasive', 'ubiquitous', 'quintessential', 'myriad',
  'plethora', 'notably', 'significantly', 'essentially', 'fundamentally',
  'ultimately', 'interestingly', 'remarkably', 'arguably', 'undeniably',
  'inherently', 'undoubtedly', 'unequivocally', 'profoundly', 'meticulously',
  'intricately', 'seamlessly', 'effortlessly',

  // Overused nouns
  'tapestry', 'landscape', 'paradigm', 'synergy', 'realm', 'ecosystem',
  'framework', 'cornerstone', 'underpinning', 'bedrock', 'linchpin',
  'catalyst', 'nexus', 'intersection', 'confluence', 'spectrum', 'trajectory',
  'blueprint', 'roadmap', 'hallmark', 'benchmark', 'litmus', 'stakeholder',
  'stakeholders', 'millennia', 'ethos', 'zeitgeist', 'dichotomy',
  'conundrum', 'testament', 'endeavor', 'endeavors', 'resilience',
  'discourse', 'narrative', 'facet', 'facets', 'intricacies',
  'complexities', 'implications', 'ramifications', 'interplay',
  'underpinnings', 'juxtaposition',

  // Connector / transition single words (also see phrases below)
  'moreover', 'furthermore', 'consequently', 'nevertheless', 'nonetheless',
  'henceforth', 'thereby', 'wherein', 'thereof', 'herein',
] as const;

const AI_TELLTALE_PHRASES: readonly string[] = [
  // "In [X]" patterns
  'in conclusion', 'in summary', 'in essence', 'in today\'s',
  'in the realm of', 'in this article', 'in this context',
  'in the ever-evolving', 'in the digital age', 'in light of',
  'in order to', 'in a world where', 'in the landscape of',
  'in the tapestry of', 'in the grand scheme',

  // "It is/It's" patterns
  'it\'s important to note', 'it\'s worth mentioning',
  'it is worth noting', 'it is important to consider',
  'it is essential to', 'it should be noted that',
  'it could be said that', 'it goes without saying',
  'it bears mentioning', 'it remains to be seen',
  'it is crucial to', 'it is imperative to',
  'it is no secret that', 'it is widely acknowledged',

  // Verb phrase patterns
  'plays a crucial role', 'plays a pivotal role', 'plays a vital role',
  'serves as a testament', 'serves as a reminder', 'serves as a catalyst',
  'shed light on', 'sheds light on', 'shedding light on',
  'pave the way', 'paves the way', 'paving the way',
  'dive into', 'diving into', 'dive deep into',
  'embark on', 'embarking on', 'embark on a journey',
  'stands as', 'stands as a testament',
  'at its core', 'at the forefront', 'at the heart of',
  'at the intersection of', 'at the crossroads of',
  'take a closer look', 'taking a closer look',
  'gain a deeper understanding', 'gain insights into',
  'make informed decisions', 'make no mistake',
  'bridge the gap', 'bridging the gap',
  'push the boundaries', 'pushing the boundaries',
  'break new ground', 'breaking new ground',

  // Filler / hedging
  'one might argue', 'one could argue', 'it can be argued',
  'when it comes to', 'not only but also', 'not only ... but also',
  'whether or not', 'more importantly', 'to put it simply',
  'to be more specific', 'to that end', 'by the same token',
  'on the other hand', 'on the flip side', 'from this perspective',
  'with that in mind', 'with this in mind', 'given the fact that',

  // Conclusion / summary phrases
  'all things considered', 'in the final analysis', 'as we move forward',
  'as we navigate', 'as we delve', 'as we explore',
  'looking ahead', 'moving forward', 'going forward',
  'the bottom line is', 'to sum it up', 'to sum up',
  'last but not least', 'first and foremost',

  // Discourse connectors
  'that being said', 'having said that', 'with that said',
  'it is also worth noting', 'equally important',
  'by and large', 'for all intents and purposes',
  'on a broader scale', 'from a broader perspective',
  'in a broader context', 'in a nutshell',

  // Superlative / emphasis
  'a wide range of', 'a diverse range of', 'a myriad of',
  'a plethora of', 'a wealth of', 'a testament to',
  'a paradigm shift', 'a game changer', 'a pivotal moment',
  'a holistic approach', 'a comprehensive overview',
  'a nuanced understanding', 'a deeper understanding',
  'a key takeaway', 'a critical component', 'a driving force',
  'a fundamental aspect', 'an integral part', 'a significant impact',
  'a profound impact', 'a growing body of', 'a notable example',

  // Miscellaneous
  'the ever-changing landscape', 'the digital landscape',
  'the global landscape', 'the broader implications',
  'the key takeaway', 'the importance of', 'the significance of',
  'the intricacies of', 'the complexities of',
  'this is particularly true', 'this is especially true',
  'this underscores', 'this highlights',
  'have become increasingly', 'has become increasingly',
  'continue to evolve', 'continues to evolve',
  'poised to', 'slated to', 'set to revolutionize',
  'remains a cornerstone', 'remains paramount',
  'cannot be overstated', 'can not be overstated',
  'is no exception', 'is of utmost importance',
] as const;

// Pre-build a Set of lowered single words for O(1) lookup
const AI_WORD_SET = new Set<string>(
  AI_TELLTALE_SINGLE_WORDS.map((w) => w.toLowerCase()),
);

// Pre-sort phrases by length (longest first) for greedy matching
const AI_PHRASES_SORTED = [...AI_TELLTALE_PHRASES]
  .map((p) => p.toLowerCase())
  .sort((a, b) => b.length - a.length);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Count how many AI single-words appear in the token list. */
function countAiSingleWords(tokens: string[]): number {
  let count = 0;
  for (const t of tokens) {
    if (AI_WORD_SET.has(t.toLowerCase())) {
      count++;
    }
  }
  return count;
}

/** Count AI-phrase occurrences in text (case-insensitive). */
function countAiPhrases(text: string): { count: number; found: string[] } {
  const lower = text.toLowerCase();
  let count = 0;
  const found: string[] = [];

  for (const phrase of AI_PHRASES_SORTED) {
    let searchStart = 0;
    let idx = lower.indexOf(phrase, searchStart);
    while (idx !== -1) {
      count++;
      if (!found.includes(phrase)) {
        found.push(phrase);
      }
      searchStart = idx + phrase.length;
      idx = lower.indexOf(phrase, searchStart);
    }
  }

  return { count, found };
}

/** Compute TTR over sliding windows of a given size, returning mean TTR. */
function windowedTTR(tokens: string[], windowSize: number): number {
  if (tokens.length < windowSize) {
    return typeTokenRatio(tokens);
  }

  const ratios: number[] = [];
  const step = Math.max(1, Math.floor(windowSize / 2)); // 50 % overlap
  for (let i = 0; i <= tokens.length - windowSize; i += step) {
    const window = tokens.slice(i, i + windowSize);
    ratios.push(typeTokenRatio(window));
  }

  return mean(ratios);
}

/**
 * Convert a raw metric value to a 0-1 AI score by mapping it through
 * a linear range [humanEnd, aiEnd]. Values outside the range are clamped.
 *
 * When `invert` is true the scale is flipped (higher value → lower AI score).
 */
function rangeScore(
  value: number,
  humanEnd: number,
  aiEnd: number,
  invert = false,
): number {
  const range = aiEnd - humanEnd;
  if (range === 0) return 0.5;
  let score = (value - humanEnd) / range;
  score = Math.max(0, Math.min(1, score));
  return invert ? 1 - score : score;
}

// ---------------------------------------------------------------------------
// Module
// ---------------------------------------------------------------------------

const vocabularyDiversityModule: DetectionModule = {
  name: 'vocabulary-diversity',
  weight: 0.2,

  analyze(text: string): ModuleAnalysis {
    const details: string[] = [];
    const patterns: DetectedPattern[] = [];

    // Edge case: empty / trivially short text
    if (!text || text.trim().length === 0) {
      return { score: 0, details: ['Text is empty — skipped vocabulary analysis.'], patterns: [] };
    }

    const tokens = tokenizeWords(text);
    if (tokens.length < 10) {
      return {
        score: 0,
        details: ['Text too short for meaningful vocabulary analysis.'],
        patterns: [],
      };
    }

    const scores: number[] = [];

    // ------ 1. Multi-window TTR ------
    const ttrWindows: [number, number][] = [];
    for (const size of [100, 200, 500]) {
      if (tokens.length >= size) {
        const val = windowedTTR(tokens, size);
        ttrWindows.push([size, val]);
      }
    }

    if (ttrWindows.length > 0) {
      // Typical human TTR ≈ 0.65-0.80 at 100-word windows; AI ≈ 0.45-0.60
      const avgTTR = mean(ttrWindows.map(([, v]) => v));
      // Higher TTR → more human → invert
      const ttrScore = rangeScore(avgTTR, 0.75, 0.45);
      scores.push(ttrScore);
      details.push(
        `Type-Token Ratio (avg across windows): ${avgTTR.toFixed(3)} → AI score ${ttrScore.toFixed(2)}`,
      );

      if (ttrScore > 0.6) {
        patterns.push({
          name: 'Low vocabulary diversity',
          description: `Average TTR of ${avgTTR.toFixed(3)} suggests repetitive word usage typical of AI.`,
          severity: ttrScore > 0.8 ? 'high' : 'medium',
          examples: ttrWindows.map(([s, v]) => `Window ${s}: TTR ${v.toFixed(3)}`),
        });
      }
    }

    // ------ 2. Shannon entropy ------
    const entropy = shannonEntropy(tokens);
    // Human English text ≈ 9-11 bits; AI tends ≈ 7-9 bits
    const entropyScore = rangeScore(entropy, 10.5, 7.5);
    scores.push(entropyScore);
    details.push(
      `Shannon entropy: ${entropy.toFixed(3)} bits → AI score ${entropyScore.toFixed(2)}`,
    );

    if (entropyScore > 0.6) {
      patterns.push({
        name: 'Low vocabulary entropy',
        description: `Entropy of ${entropy.toFixed(3)} bits indicates predictable word distribution.`,
        severity: entropyScore > 0.8 ? 'high' : 'medium',
        examples: [],
      });
    }

    // ------ 3. Hapax legomena ratio ------
    const hapax = hapaxLegomenaRatio(tokens);
    // Human ≈ 0.50-0.65; AI ≈ 0.30-0.45
    const hapaxScore = rangeScore(hapax, 0.55, 0.30);
    scores.push(hapaxScore);
    details.push(
      `Hapax legomena ratio: ${hapax.toFixed(3)} → AI score ${hapaxScore.toFixed(2)}`,
    );

    // ------ 4. Lexical density ------
    const ld = lexicalDensity(tokens);
    // Human casual ≈ 0.40-0.55; AI often ≈ 0.55-0.70 (over-formal)
    const ldScore = rangeScore(ld, 0.50, 0.70);
    scores.push(ldScore);
    details.push(
      `Lexical density: ${ld.toFixed(3)} → AI score ${ldScore.toFixed(2)}`,
    );

    // ------ 5. AI-word density (KEY FEATURE) ------
    const aiSingleCount = countAiSingleWords(tokens);
    const phraseResult = countAiPhrases(text);
    const totalAiHits = aiSingleCount + phraseResult.count;
    const aiDensity = totalAiHits / tokens.length;

    // AI-heavy text: density > 0.04; human: < 0.01
    const aiWordScore = rangeScore(aiDensity, 0.008, 0.05);
    // Give this sub-score extra weight by pushing it twice
    scores.push(aiWordScore);
    scores.push(aiWordScore);
    details.push(
      `AI-favorite word density: ${(aiDensity * 100).toFixed(2)}% (${totalAiHits} hits in ${tokens.length} words) → AI score ${aiWordScore.toFixed(2)}`,
    );

    if (totalAiHits > 0) {
      const exampleWords: string[] = [];
      // Collect sample single-word hits
      const seenWords = new Set<string>();
      for (const t of tokens) {
        if (AI_WORD_SET.has(t.toLowerCase()) && !seenWords.has(t.toLowerCase())) {
          seenWords.add(t.toLowerCase());
          exampleWords.push(t);
          if (exampleWords.length >= 8) break;
        }
      }
      const examplePhrases = phraseResult.found.slice(0, 8);

      if (aiWordScore > 0.3) {
        patterns.push({
          name: 'AI-favorite vocabulary',
          description: `Found ${totalAiHits} AI-telltale words/phrases (${(aiDensity * 100).toFixed(2)}% density).`,
          severity: aiWordScore > 0.7 ? 'high' : aiWordScore > 0.4 ? 'medium' : 'low',
          examples: [...exampleWords, ...examplePhrases].slice(0, 10),
        });
      }
    }

    // ------ 6. TTR standard deviation across windows (consistency check) ------
    if (ttrWindows.length >= 2) {
      const ttrVals = ttrWindows.map(([, v]) => v);
      const ttrStd = standardDeviation(ttrVals);
      // AI is extremely consistent; humans vary more
      // Low std → AI
      const consistencyScore = rangeScore(ttrStd, 0.06, 0.01);
      scores.push(consistencyScore);
      details.push(
        `TTR consistency (std dev): ${ttrStd.toFixed(4)} → AI score ${consistencyScore.toFixed(2)}`,
      );
    }

    // ------ Aggregate ------
    const finalScore = Math.max(0, Math.min(1, mean(scores)));
    details.push(`Final vocabulary diversity score: ${finalScore.toFixed(3)}`);

    return { score: finalScore, details, patterns };
  },

  analyzeSentence(sentence: string, context: SentenceContext): number {
    if (!sentence || sentence.trim().length === 0) return 0;

    const tokens = tokenizeWords(sentence);
    if (tokens.length < 3) return 0;

    const scores: number[] = [];

    // AI-word density within the sentence
    const aiSingleCount = countAiSingleWords(tokens);
    const phraseResult = countAiPhrases(sentence);
    const totalAiHits = aiSingleCount + phraseResult.count;
    const aiDensity = totalAiHits / tokens.length;
    scores.push(rangeScore(aiDensity, 0.02, 0.12));

    // Sentence-level lexical density
    const ld = lexicalDensity(tokens);
    scores.push(rangeScore(ld, 0.50, 0.75));

    // Compare sentence vocabulary against surrounding sentences for uniformity
    if (context.sentences.length > 2) {
      const neighborIndices: number[] = [];
      if (context.index > 0) neighborIndices.push(context.index - 1);
      if (context.index < context.sentences.length - 1) neighborIndices.push(context.index + 1);

      const neighborTokenSets = neighborIndices.map((i) => {
        const t = tokenizeWords(context.sentences[i]);
        return new Set(t.map((w) => w.toLowerCase()));
      });

      const currentSet = new Set(tokens.map((w) => w.toLowerCase()));
      const overlaps = neighborTokenSets.map((ns) => {
        let shared = 0;
        for (const w of currentSet) {
          if (ns.has(w)) shared++;
        }
        return shared / Math.max(1, currentSet.size);
      });

      const avgOverlap = mean(overlaps);
      // High overlap with neighbors suggests AI repetitiveness
      scores.push(rangeScore(avgOverlap, 0.25, 0.55));
    }

    return Math.max(0, Math.min(1, mean(scores)));
  },
};

export default vocabularyDiversityModule;
