/**
 * Module 4: Structural Pattern Analysis
 *
 * Detects AI-generated text through structural telltales:
 * - Transition phrase overuse & density
 * - Paragraph structure rigidity (topic -> support -> conclusion)
 * - Over-structured formatting (lists, bullets)
 * - Hedging language frequency
 * - Repetitive discourse markers at paragraph starts
 * - Limited sentence-opening word distribution
 */

import type {
  DetectionModule,
  ModuleAnalysis,
  SentenceContext,
  DetectedPattern,
} from '@/types/index';
import { splitSentences, tokenizeWords } from '@/lib/nlp/tokenizer';
import { mean, standardDeviation } from '@/lib/nlp/statistics';

// ---------------------------------------------------------------------------
// AI Transition Phrases (100+)
// ---------------------------------------------------------------------------

const AI_TRANSITIONS: readonly string[] = [
  // Additive
  'additionally', 'furthermore', 'moreover', 'in addition',
  'in addition to this', 'in addition to that', 'equally important',
  'by the same token', 'not only that', 'what is more',
  'on top of that', 'to add to this', 'coupled with',
  'along with this', 'besides this', 'apart from this',

  // Contrast
  'on the other hand', 'however', 'nevertheless', 'nonetheless',
  'in contrast', 'conversely', 'on the contrary', 'despite this',
  'despite that', 'even so', 'be that as it may', 'that being said',
  'having said that', 'with that said', 'at the same time',
  'on the flip side', 'while this may be true', 'albeit',
  'notwithstanding',

  // Similarity
  'similarly', 'likewise', 'in the same way', 'in a similar vein',
  'by comparison', 'along the same lines', 'in much the same way',
  'correspondingly',

  // Cause / effect
  'as a result', 'therefore', 'thus', 'hence', 'consequently',
  'for this reason', 'because of this', 'as a consequence',
  'this means that', 'it follows that', 'this leads to',
  'this results in', 'owing to this', 'due to this',
  'this is why', 'accordingly',

  // Summary / conclusion
  'in summary', 'to sum up', 'in conclusion', 'to conclude',
  'overall', 'ultimately', 'all in all', 'in short', 'in brief',
  'to summarize', 'in a nutshell', 'the bottom line is',
  'in the final analysis', 'all things considered',
  'taking everything into account', 'on the whole', 'to put it briefly',
  'in essence',

  // Sequence
  'first and foremost', 'firstly', 'secondly', 'thirdly',
  'last but not least', 'to begin with', 'to start with',
  'in the first place', 'next', 'subsequently', 'following this',
  'after that', 'finally', 'in the meantime', 'meanwhile',

  // Emphasis / example
  'in fact', 'indeed', 'more importantly', 'most importantly',
  'above all', 'particularly', 'especially', 'for example',
  'for instance', 'specifically', 'in particular', 'notably',
  'significantly', 'it is important to note that',
  'it is worth noting that', 'it should be noted that',

  // Forward-looking
  'moving forward', 'going forward', 'looking ahead',
  'as we move forward', 'as we navigate', 'as we look to the future',
  'with this in mind', 'with that in mind', 'given this',
  'in light of this',
] as const;

// Pre-sort longest first for greedy matching
const TRANSITIONS_SORTED = [...AI_TRANSITIONS]
  .map((t) => t.toLowerCase())
  .sort((a, b) => b.length - a.length);

// ---------------------------------------------------------------------------
// Hedging Phrases
// ---------------------------------------------------------------------------

const HEDGING_PHRASES: readonly string[] = [
  "it's important to consider", 'it is important to consider',
  'one might argue', 'one could argue', 'it could be said that',
  'it can be argued that', 'it is essential to', 'it should be noted that',
  'it is worth noting that', 'it is worth mentioning that',
  'it bears mentioning', 'it remains to be seen',
  'it goes without saying', 'it is no secret that',
  'it is widely acknowledged', 'it is generally accepted',
  'it is commonly believed', 'it is fair to say',
  'it would be remiss not to', 'it stands to reason',
  'to some extent', 'in many ways', 'in some respects',
  'from a certain perspective', 'from this perspective',
  'arguably', 'perhaps', 'conceivably',
  'one might suggest', 'one could contend',
  'it may be worth considering', 'there is reason to believe',
  'it is plausible that', 'it seems reasonable to',
  'broadly speaking', 'generally speaking',
  'it is important to recognize', 'it is crucial to understand',
  'it is vital to acknowledge', 'we must consider',
  'we should also consider', 'we cannot ignore',
  'it would be an oversimplification', 'while there is no one-size-fits-all',
] as const;

const HEDGING_SORTED = [...HEDGING_PHRASES]
  .map((h) => h.toLowerCase())
  .sort((a, b) => b.length - a.length);

// ---------------------------------------------------------------------------
// Common AI sentence-opening words (used to check distribution)
// ---------------------------------------------------------------------------

const AI_SENTENCE_STARTERS: readonly string[] = [
  'this', 'these', 'those', 'it', 'the', 'however', 'moreover',
  'furthermore', 'additionally', 'in', 'by', 'as', 'while',
  'overall', 'ultimately', 'consequently', 'therefore', 'thus',
  'similarly', 'notably', 'importantly', 'significantly',
  'essentially', 'fundamentally', 'one', 'when',
] as const;

const AI_STARTER_SET = new Set<string>(
  AI_SENTENCE_STARTERS.map((s) => s.toLowerCase()),
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Count phrase occurrences (case-insensitive) and return count + found list. */
function countPhrases(
  text: string,
  sortedPhrases: readonly string[],
): { count: number; found: string[] } {
  const lower = text.toLowerCase();
  let count = 0;
  const found: string[] = [];

  for (const phrase of sortedPhrases) {
    let start = 0;
    let idx = lower.indexOf(phrase, start);
    while (idx !== -1) {
      count++;
      if (!found.includes(phrase)) found.push(phrase);
      start = idx + phrase.length;
      idx = lower.indexOf(phrase, start);
    }
  }

  return { count, found };
}

/** Split text into paragraphs (double newline or significant whitespace). */
function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

/** Map a value to 0-1 AI score within a range. */
function rangeScore(value: number, humanEnd: number, aiEnd: number): number {
  const range = aiEnd - humanEnd;
  if (range === 0) return 0.5;
  const score = (value - humanEnd) / range;
  return Math.max(0, Math.min(1, score));
}

/**
 * Detect the rigid "topic -> supporting -> concluding" paragraph pattern.
 * Returns a score 0-1 for each paragraph, indicating how formulaic it is.
 */
function paragraphStructureScore(paragraph: string): number {
  const sentences = splitSentences(paragraph);
  if (sentences.length < 3) return 0;

  let signals = 0;

  // Check if first sentence is a broad/topic statement (shorter, declarative)
  const firstTokens = tokenizeWords(sentences[0]);
  const avgTokens = mean(sentences.map((s) => tokenizeWords(s).length));
  if (firstTokens.length <= avgTokens * 1.1) signals++;

  // Check if last sentence contains concluding language
  const lastLower = sentences[sentences.length - 1].toLowerCase();
  const concludingMarkers = [
    'therefore', 'thus', 'in conclusion', 'overall', 'ultimately',
    'consequently', 'as a result', 'this demonstrates', 'this shows',
    'this highlights', 'this underscores', 'this illustrates',
    'in summary', 'to sum up', 'it is clear', 'it is evident',
    'clearly', 'evidently',
  ];
  if (concludingMarkers.some((m) => lastLower.includes(m))) signals += 2;

  // Check if middle sentences all follow a similar pattern (supporting evidence)
  const middleSentences = sentences.slice(1, -1);
  if (middleSentences.length >= 2) {
    const middleLengths = middleSentences.map((s) => tokenizeWords(s).length);
    const midStd = standardDeviation(middleLengths);
    const midMean = mean(middleLengths);
    // Very uniform middle sentence lengths -> AI-like
    if (midMean > 0 && midStd / midMean < 0.2) signals++;
  }

  // Check for transition words at sentence starts in middle
  const middleWithTransitions = middleSentences.filter((s) => {
    const lower = s.toLowerCase().trimStart();
    return TRANSITIONS_SORTED.some(
      (t) => lower.startsWith(t) && (lower.length === t.length || /\W/.test(lower[t.length])),
    );
  });
  if (middleSentences.length > 0) {
    const transitionRatio = middleWithTransitions.length / middleSentences.length;
    if (transitionRatio > 0.5) signals++;
  }

  return Math.min(1, signals / 4);
}

/**
 * Detect list/bullet formatting overuse.
 * Returns ratio of lines that are list items.
 */
function listFormatRatio(text: string): number {
  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  if (lines.length === 0) return 0;

  const listPattern = /^\s*(?:[-*\u2022]\s|(?:\d+[.)]\s)|(?:[a-z][.)]\s)|(?:#{1,6}\s))/;
  const listLines = lines.filter((l) => listPattern.test(l));
  return listLines.length / lines.length;
}

/**
 * Analyze sentence-opening word distribution.
 * AI text uses a smaller set of starters more frequently.
 */
function sentenceStarterAnalysis(sentences: string[]): {
  aiStarterRatio: number;
  uniqueStarterRatio: number;
} {
  if (sentences.length === 0) return { aiStarterRatio: 0, uniqueStarterRatio: 1 };

  const starters = sentences
    .map((s) => {
      const tokens = tokenizeWords(s.trimStart());
      return tokens.length > 0 ? tokens[0].toLowerCase() : '';
    })
    .filter((s) => s.length > 0);

  if (starters.length === 0) return { aiStarterRatio: 0, uniqueStarterRatio: 1 };

  const aiStarterCount = starters.filter((s) => AI_STARTER_SET.has(s)).length;
  const uniqueStarters = new Set(starters);

  return {
    aiStarterRatio: aiStarterCount / starters.length,
    uniqueStarterRatio: uniqueStarters.size / starters.length,
  };
}

/**
 * Detect repetitive discourse markers at paragraph starts.
 */
function paragraphStartRepetition(paragraphs: string[]): number {
  if (paragraphs.length < 2) return 0;

  const starts = paragraphs.map((p) => {
    const firstSentence = splitSentences(p)[0] || '';
    const lower = firstSentence.toLowerCase().trimStart();
    // Check if it starts with a transition
    for (const t of TRANSITIONS_SORTED) {
      if (lower.startsWith(t) && (lower.length === t.length || /\W/.test(lower[t.length]))) {
        return t;
      }
    }
    // Return first word as fallback
    const tokens = tokenizeWords(firstSentence);
    return tokens.length > 0 ? tokens[0].toLowerCase() : '';
  });

  // Count paragraphs starting with transition phrases
  const transitionStarts = starts.filter((s) =>
    TRANSITIONS_SORTED.includes(s),
  ).length;

  // Count repeated starters
  const starterCounts = new Map<string, number>();
  for (const s of starts) {
    starterCounts.set(s, (starterCounts.get(s) || 0) + 1);
  }
  const maxRepeat = Math.max(...Array.from(starterCounts.values()), 0);
  const repeatRatio = paragraphs.length > 1 ? maxRepeat / paragraphs.length : 0;

  const transitionRatio = transitionStarts / paragraphs.length;

  // Combine: heavy use of transitions at paragraph starts + repetition = AI
  return Math.min(1, transitionRatio * 0.6 + repeatRatio * 0.4);
}

// ---------------------------------------------------------------------------
// Module
// ---------------------------------------------------------------------------

const structuralPatternsModule: DetectionModule = {
  name: 'structural-patterns',
  weight: 0.2,

  analyze(text: string): ModuleAnalysis {
    const details: string[] = [];
    const patterns: DetectedPattern[] = [];

    // Edge case: empty / trivially short text
    if (!text || text.trim().length === 0) {
      return { score: 0, details: ['Text is empty — skipped structural analysis.'], patterns: [] };
    }

    const tokens = tokenizeWords(text);
    if (tokens.length < 10) {
      return {
        score: 0,
        details: ['Text too short for meaningful structural analysis.'],
        patterns: [],
      };
    }

    const sentences = splitSentences(text);
    const paragraphs = splitParagraphs(text);
    const scores: number[] = [];

    // ------ 1. Transition phrase density ------
    const transResult = countPhrases(text, TRANSITIONS_SORTED);
    const transitionsPer100 = tokens.length > 0
      ? (transResult.count / tokens.length) * 100
      : 0;

    // Human ~ 1-2 per 100 words; AI ~ 3-6+
    const transScore = rangeScore(transitionsPer100, 1.5, 5.0);
    scores.push(transScore);
    scores.push(transScore); // Double-weight: very diagnostic
    details.push(
      `Transition phrase density: ${transitionsPer100.toFixed(2)} per 100 words (${transResult.count} total) -> AI score ${transScore.toFixed(2)}`,
    );

    if (transScore > 0.4 && transResult.found.length > 0) {
      patterns.push({
        name: 'Excessive transition phrases',
        description: `${transResult.count} transition phrases detected (${transitionsPer100.toFixed(1)} per 100 words).`,
        severity: transScore > 0.7 ? 'high' : 'medium',
        examples: transResult.found.slice(0, 10),
      });
    }

    // ------ 2. Paragraph structure rigidity ------
    if (paragraphs.length >= 2) {
      const paraScores = paragraphs
        .filter((p) => splitSentences(p).length >= 3)
        .map((p) => paragraphStructureScore(p));

      if (paraScores.length > 0) {
        const avgParaScore = mean(paraScores);
        scores.push(avgParaScore);
        details.push(
          `Paragraph structure rigidity: ${avgParaScore.toFixed(3)} (${paraScores.length} paragraphs analyzed) -> AI score ${avgParaScore.toFixed(2)}`,
        );

        if (avgParaScore > 0.5) {
          patterns.push({
            name: 'Rigid paragraph structure',
            description: 'Paragraphs follow a formulaic topic->support->conclusion pattern.',
            severity: avgParaScore > 0.75 ? 'high' : 'medium',
            examples: [],
          });
        }
      }
    }

    // ------ 3. Over-structured formatting (lists, bullets) ------
    const listRatio = listFormatRatio(text);
    if (listRatio > 0) {
      // Having some lists is fine (0.1-0.2); excessive is AI-like
      const listScore = rangeScore(listRatio, 0.15, 0.50);
      scores.push(listScore);
      details.push(
        `List/bullet ratio: ${(listRatio * 100).toFixed(1)}% of lines -> AI score ${listScore.toFixed(2)}`,
      );

      if (listScore > 0.5) {
        patterns.push({
          name: 'Over-structured formatting',
          description: `${(listRatio * 100).toFixed(0)}% of lines are formatted as list items.`,
          severity: listScore > 0.75 ? 'high' : 'medium',
          examples: [],
        });
      }
    }

    // ------ 4. Hedging language frequency ------
    const hedgeResult = countPhrases(text, HEDGING_SORTED);
    const hedgingPer100 = tokens.length > 0
      ? (hedgeResult.count / tokens.length) * 100
      : 0;

    // Human ~ 0-0.5 per 100 words; AI ~ 1-3+
    const hedgeScore = rangeScore(hedgingPer100, 0.3, 2.0);
    scores.push(hedgeScore);
    details.push(
      `Hedging language density: ${hedgingPer100.toFixed(2)} per 100 words (${hedgeResult.count} total) -> AI score ${hedgeScore.toFixed(2)}`,
    );

    if (hedgeScore > 0.4 && hedgeResult.found.length > 0) {
      patterns.push({
        name: 'Excessive hedging language',
        description: `${hedgeResult.count} hedging phrases detected.`,
        severity: hedgeScore > 0.7 ? 'high' : 'medium',
        examples: hedgeResult.found.slice(0, 8),
      });
    }

    // ------ 5. Repetitive discourse markers at paragraph starts ------
    if (paragraphs.length >= 3) {
      const paraRepScore = paragraphStartRepetition(paragraphs);
      scores.push(paraRepScore);
      details.push(
        `Paragraph-start repetition score: ${paraRepScore.toFixed(3)} -> AI score ${paraRepScore.toFixed(2)}`,
      );

      if (paraRepScore > 0.5) {
        patterns.push({
          name: 'Repetitive paragraph openings',
          description: 'Paragraphs frequently begin with similar transition phrases or discourse markers.',
          severity: paraRepScore > 0.75 ? 'high' : 'medium',
          examples: [],
        });
      }
    }

    // ------ 6. Sentence-opening word distribution ------
    if (sentences.length >= 5) {
      const { aiStarterRatio, uniqueStarterRatio } = sentenceStarterAnalysis(sentences);

      // High AI-starter ratio -> more AI-like
      const starterScore1 = rangeScore(aiStarterRatio, 0.40, 0.80);
      // Low unique-starter ratio -> more AI-like (limited variety)
      const starterScore2 = rangeScore(uniqueStarterRatio, 0.70, 0.30);
      const combinedStarterScore = (starterScore1 + starterScore2) / 2;

      scores.push(combinedStarterScore);
      details.push(
        `Sentence starter analysis: AI-starter ratio ${(aiStarterRatio * 100).toFixed(1)}%, unique ratio ${(uniqueStarterRatio * 100).toFixed(1)}% -> AI score ${combinedStarterScore.toFixed(2)}`,
      );

      if (combinedStarterScore > 0.5) {
        patterns.push({
          name: 'Limited sentence-opening variety',
          description: `Only ${(uniqueStarterRatio * 100).toFixed(0)}% of sentences start with unique words; ${(aiStarterRatio * 100).toFixed(0)}% use common AI starter words.`,
          severity: combinedStarterScore > 0.75 ? 'high' : 'medium',
          examples: [],
        });
      }
    }

    // ------ Aggregate ------
    const finalScore = scores.length > 0
      ? Math.max(0, Math.min(1, mean(scores)))
      : 0;
    details.push(`Final structural patterns score: ${finalScore.toFixed(3)}`);

    return { score: finalScore, details, patterns };
  },

  analyzeSentence(sentence: string, context: SentenceContext): number {
    if (!sentence || sentence.trim().length === 0) return 0;

    const tokens = tokenizeWords(sentence);
    if (tokens.length < 3) return 0;

    const scores: number[] = [];

    // 1. Does the sentence start with a transition phrase?
    const lower = sentence.toLowerCase().trimStart();
    let startsWithTransition = false;
    for (const t of TRANSITIONS_SORTED) {
      if (lower.startsWith(t) && (lower.length === t.length || /\W/.test(lower[t.length]))) {
        startsWithTransition = true;
        break;
      }
    }
    scores.push(startsWithTransition ? 0.7 : 0.2);

    // 2. Contains hedging language?
    const hedgeResult = countPhrases(sentence, HEDGING_SORTED);
    scores.push(hedgeResult.count > 0 ? Math.min(1, 0.4 + hedgeResult.count * 0.2) : 0.1);

    // 3. Sentence starter is in AI-common set?
    const firstWord = tokens[0]?.toLowerCase() || '';
    if (AI_STARTER_SET.has(firstWord)) {
      scores.push(0.5);
    } else {
      scores.push(0.15);
    }

    // 4. Position-based structural check: is this sentence playing a formulaic role?
    if (context.sentences.length >= 3) {
      const paraText = context.fullText;
      const paragraphs = splitParagraphs(paraText);

      // Find which paragraph this sentence belongs to
      for (const para of paragraphs) {
        if (para.includes(sentence.trim())) {
          const paraSentences = splitSentences(para);
          const posInPara = paraSentences.findIndex((s) =>
            s.trim() === sentence.trim(),
          );

          if (posInPara === 0 && paraSentences.length >= 3) {
            // Topic sentence: mild signal
            scores.push(0.4);
          } else if (
            posInPara === paraSentences.length - 1 &&
            paraSentences.length >= 3
          ) {
            // Concluding sentence
            const concludingMarkers = [
              'therefore', 'thus', 'overall', 'ultimately', 'consequently',
              'this demonstrates', 'this shows', 'this highlights',
              'in summary', 'as a result',
            ];
            if (concludingMarkers.some((m) => lower.includes(m))) {
              scores.push(0.8);
            }
          }
          break;
        }
      }
    }

    return Math.max(0, Math.min(1, mean(scores)));
  },
};

export default structuralPatternsModule;
