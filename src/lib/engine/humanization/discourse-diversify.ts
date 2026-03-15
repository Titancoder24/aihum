/**
 * Stage 3: Discourse Marker Diversification
 * Replaces repetitive AI transition phrases with varied, natural discourse markers.
 * Sometimes removes transitions entirely to let sentences flow.
 */

import type { HumanizationStage, ModeConfig } from '@/types';

// ---------------------------------------------------------------------------
// Seeded PRNG
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
// Types
// ---------------------------------------------------------------------------

interface MarkerEntry {
  /** Regex to match the discourse marker (typically at sentence start) */
  pattern: RegExp;
  /** Replacement options. Empty string = remove entirely. */
  neutral: string[];
  /** Extra informal alternatives */
  informal?: string[];
}

// ---------------------------------------------------------------------------
// 100+ discourse marker replacement entries
// ---------------------------------------------------------------------------

const MARKER_ENTRIES: MarkerEntry[] = [
  // ===== Additive markers =====
  {
    pattern: /\bAdditionally,?\s*/gi,
    neutral: ['Also, ', 'On top of that, ', 'Plus, ', 'And, ', ''],
  },
  {
    pattern: /\bFurthermore,?\s*/gi,
    neutral: ["What's more, ", 'Beyond that, ', "There's also, ", 'And, ', ''],
  },
  {
    pattern: /\bMoreover,?\s*/gi,
    neutral: ['And, ', 'Plus, ', 'Not only that, ', ''],
    informal: ['Also, ', 'On top of that, '],
  },
  {
    pattern: /\bIn addition,?\s*/gi,
    neutral: ['Also, ', 'Plus, ', 'And, ', ''],
  },
  {
    pattern: /\bIn addition to this,?\s*/gi,
    neutral: ['Also, ', 'Beyond this, ', 'And, ', ''],
  },
  {
    pattern: /\bIn addition to that,?\s*/gi,
    neutral: ['Also, ', 'Beyond that, ', 'And, ', ''],
  },
  {
    pattern: /\bBesides,?\s*/gi,
    neutral: ['Also, ', 'Plus, ', 'On top of that, ', ''],
  },
  {
    pattern: /\bBesides this,?\s*/gi,
    neutral: ['Also, ', 'And, ', ''],
  },
  {
    pattern: /\bWhat is more,?\s*/gi,
    neutral: ['Also, ', 'Plus, ', 'And, ', ''],
  },
  {
    pattern: /\bBy the same token,?\s*/gi,
    neutral: ['Similarly, ', 'In the same way, ', 'Along those lines, '],
  },
  {
    pattern: /\bCoupled with this,?\s*/gi,
    neutral: ['Along with this, ', 'And, ', 'Plus, '],
  },
  {
    pattern: /\bEqually important,?\s*/gi,
    neutral: ['Just as important, ', 'Also key, ', ''],
  },
  {
    pattern: /\bNot to mention,?\s*/gi,
    neutral: ['And, ', 'Plus, ', 'Also, ', ''],
    informal: ['Oh, and ', "Let's not forget, "],
  },
  {
    pattern: /\bTo say nothing of\b/gi,
    neutral: ['Not to mention', 'And also', 'Plus'],
  },

  // ===== Contrastive markers =====
  {
    pattern: /\bHowever,?\s*/gi,
    neutral: ['But, ', 'That said, ', 'Still, ', 'Then again, '],
  },
  {
    pattern: /\bNevertheless,?\s*/gi,
    neutral: ['Still, ', 'Even so, ', 'That said, ', 'But, '],
  },
  {
    pattern: /\bNonetheless,?\s*/gi,
    neutral: ['Still, ', 'Even so, ', 'That said, ', 'But, '],
  },
  {
    pattern: /\bOn the other hand,?\s*/gi,
    neutral: ['Then again, ', 'But, ', 'That said, '],
    informal: ['Flip side, '],
  },
  {
    pattern: /\bOn the contrary,?\s*/gi,
    neutral: ['Actually, ', 'In fact, ', 'But really, '],
  },
  {
    pattern: /\bConversely,?\s*/gi,
    neutral: ['On the flip side, ', 'But, ', 'Then again, '],
  },
  {
    pattern: /\bIn contrast,?\s*/gi,
    neutral: ['But, ', 'On the other hand, ', 'Meanwhile, '],
  },
  {
    pattern: /\bBy contrast,?\s*/gi,
    neutral: ['But, ', 'Meanwhile, ', 'That said, '],
  },
  {
    pattern: /\bDespite this,?\s*/gi,
    neutral: ['Still, ', 'Even so, ', 'But, '],
  },
  {
    pattern: /\bDespite that,?\s*/gi,
    neutral: ['Still, ', 'Even so, ', 'But, '],
  },
  {
    pattern: /\bEven though,?\s*/gi,
    neutral: ['Although, ', 'While, ', 'Despite, '],
  },
  {
    pattern: /\bHaving said that,?\s*/gi,
    neutral: ['That said, ', 'Still, ', 'But, '],
  },
  {
    pattern: /\bThat being said,?\s*/gi,
    neutral: ['That said, ', 'Still, ', 'But, ', ''],
  },
  {
    pattern: /\bWith that being said,?\s*/gi,
    neutral: ['That said, ', 'Still, ', 'But, '],
  },
  {
    pattern: /\bAt the same time,?\s*/gi,
    neutral: ['But, ', 'Still, ', 'Meanwhile, ', ''],
  },
  {
    pattern: /\bAlbeit\b/gi,
    neutral: ['Although', 'Even though', 'Though'],
  },
  {
    pattern: /\bNotwithstanding,?\s*/gi,
    neutral: ['Despite this, ', 'Still, ', 'Even so, '],
  },
  {
    pattern: /\bRegardless,?\s*/gi,
    neutral: ['Either way, ', 'No matter what, ', 'Still, '],
  },
  {
    pattern: /\bIrrespective of this,?\s*/gi,
    neutral: ['Regardless, ', 'Either way, ', 'Still, '],
  },

  // ===== Causal markers =====
  {
    pattern: /\bConsequently,?\s*/gi,
    neutral: ['So, ', 'Because of that, ', 'As a result, ', ''],
  },
  {
    pattern: /\bAs a result,?\s*/gi,
    neutral: ['So, ', 'Because of this, ', 'That meant, ', ''],
  },
  {
    pattern: /\bAs a consequence,?\s*/gi,
    neutral: ['So, ', 'Because of that, ', 'As a result, '],
  },
  {
    pattern: /\bTherefore,?\s*/gi,
    neutral: ['So, ', 'That means, ', 'Because of this, '],
  },
  {
    pattern: /\bThus,?\s*/gi,
    neutral: ['So, ', 'This way, ', 'Because of this, ', ''],
  },
  {
    pattern: /\bHence,?\s*/gi,
    neutral: ['So, ', 'That is why, ', 'Because of this, '],
  },
  {
    pattern: /\bAccordingly,?\s*/gi,
    neutral: ['So, ', 'As a result, ', 'Because of this, '],
  },
  {
    pattern: /\bFor this reason,?\s*/gi,
    neutral: ["That's why, ", 'So, ', 'Because of this, '],
  },
  {
    pattern: /\bFor these reasons,?\s*/gi,
    neutral: ["That's why, ", 'So, ', 'Because of all this, '],
  },
  {
    pattern: /\bOwing to this,?\s*/gi,
    neutral: ['Because of this, ', 'So, ', 'As a result, '],
  },
  {
    pattern: /\bDue to this,?\s*/gi,
    neutral: ['Because of this, ', 'So, ', ''],
  },
  {
    pattern: /\bThis means that\b/gi,
    neutral: ['So', 'That means', 'Which means'],
  },
  {
    pattern: /\bThis implies that\b/gi,
    neutral: ['So', 'That means', 'Which suggests'],
  },
  {
    pattern: /\bThis suggests that\b/gi,
    neutral: ['So', 'That hints that', 'Which means'],
  },

  // ===== Concluding markers =====
  {
    pattern: /\bIn conclusion,?\s*/gi,
    neutral: ['So, ', 'All in all, ', 'Bottom line, ', 'At the end of the day, '],
    informal: ['To wrap up, '],
  },
  {
    pattern: /\bTo conclude,?\s*/gi,
    neutral: ['So, ', 'All in all, ', 'To sum up, '],
  },
  {
    pattern: /\bTo summarize,?\s*/gi,
    neutral: ['So, ', 'In short, ', 'To sum it up, '],
  },
  {
    pattern: /\bTo sum up,?\s*/gi,
    neutral: ['So, ', 'In short, ', 'All in all, '],
  },
  {
    pattern: /\bIn summary,?\s*/gi,
    neutral: ['In short, ', 'So, ', 'All in all, '],
  },
  {
    pattern: /\bAll things considered,?\s*/gi,
    neutral: ['All in all, ', 'Overall, ', 'When you add it up, '],
  },
  {
    pattern: /\bUltimately,?\s*/gi,
    neutral: ['In the end, ', 'When it comes down to it, ', ''],
  },
  {
    pattern: /\bIn essence,?\s*/gi,
    neutral: ['Basically, ', 'At its core, ', 'Really, '],
  },
  {
    pattern: /\bBy and large,?\s*/gi,
    neutral: ['Mostly, ', 'Overall, ', 'For the most part, '],
  },
  {
    pattern: /\bOn the whole,?\s*/gi,
    neutral: ['Overall, ', 'Generally, ', 'All in all, '],
  },
  {
    pattern: /\bTaken together,?\s*/gi,
    neutral: ['All in all, ', 'Combined, ', 'Overall, '],
  },
  {
    pattern: /\bOverall,?\s*/gi,
    neutral: ['All in all, ', 'In general, ', ''],
  },

  // ===== Sequential / temporal markers =====
  {
    pattern: /\bFirstly,?\s*/gi,
    neutral: ['First, ', 'First off, ', 'To start, '],
    informal: ['So first, '],
  },
  {
    pattern: /\bSecondly,?\s*/gi,
    neutral: ['Second, ', 'Next, ', 'Then, '],
  },
  {
    pattern: /\bThirdly,?\s*/gi,
    neutral: ['Third, ', 'Then, ', 'After that, '],
  },
  {
    pattern: /\bFinally,?\s*/gi,
    neutral: ['Last, ', 'Lastly, ', 'And then, ', ''],
  },
  {
    pattern: /\bSubsequently,?\s*/gi,
    neutral: ['Then, ', 'After that, ', 'Later, ', 'Next, '],
  },
  {
    pattern: /\bPrior to this,?\s*/gi,
    neutral: ['Before this, ', 'Earlier, ', 'Before that, '],
  },
  {
    pattern: /\bFollowing this,?\s*/gi,
    neutral: ['After this, ', 'Then, ', 'Next, '],
  },
  {
    pattern: /\bIn the first place,?\s*/gi,
    neutral: ['First of all, ', 'For starters, ', 'To begin with, '],
  },
  {
    pattern: /\bFirst and foremost,?\s*/gi,
    neutral: ['First, ', 'Above all, ', 'Most importantly, '],
  },
  {
    pattern: /\bLast but not least,?\s*/gi,
    neutral: ['Finally, ', 'And also, ', 'One more thing — '],
  },
  {
    pattern: /\bMeanwhile,?\s*/gi,
    neutral: ['At the same time, ', 'While this was happening, ', ''],
  },
  {
    pattern: /\bSimultaneously,?\s*/gi,
    neutral: ['At the same time, ', 'Meanwhile, ', 'Together, '],
  },
  {
    pattern: /\bHenceforth,?\s*/gi,
    neutral: ['From now on, ', 'Going forward, ', 'After this, '],
  },

  // ===== Exemplifying markers =====
  {
    pattern: /\bFor instance,?\s*/gi,
    neutral: ['For example, ', 'Like, ', 'Say, ', ''],
    informal: ['Take, '],
  },
  {
    pattern: /\bFor example,?\s*/gi,
    neutral: ['Like, ', 'Say, ', 'Such as, ', ''],
  },
  {
    pattern: /\bTo illustrate,?\s*/gi,
    neutral: ['For example, ', 'Like, ', 'To show this, '],
  },
  {
    pattern: /\bAs an illustration,?\s*/gi,
    neutral: ['For example, ', 'To show this, ', ''],
  },
  {
    pattern: /\bNamely,?\s*/gi,
    neutral: ['Specifically, ', 'That is, ', 'In other words, '],
  },
  {
    pattern: /\bSpecifically,?\s*/gi,
    neutral: ['In particular, ', 'More precisely, ', ''],
  },
  {
    pattern: /\bIn particular,?\s*/gi,
    neutral: ['Especially, ', 'Specifically, ', ''],
  },
  {
    pattern: /\bNotably,?\s*/gi,
    neutral: ['Especially, ', 'In particular, ', ''],
  },

  // ===== Emphasizing markers =====
  {
    pattern: /\bIndeed,?\s*/gi,
    neutral: ['In fact, ', 'Really, ', 'Actually, ', ''],
  },
  {
    pattern: /\bCertainly,?\s*/gi,
    neutral: ['Sure, ', 'Of course, ', 'Definitely, ', ''],
  },
  {
    pattern: /\bUndoubtedly,?\s*/gi,
    neutral: ['Without a doubt, ', 'Clearly, ', 'For sure, '],
  },
  {
    pattern: /\bUnquestionably,?\s*/gi,
    neutral: ['Without question, ', 'Clearly, ', 'Definitely, '],
  },
  {
    pattern: /\bSignificantly,?\s*/gi,
    neutral: ['Importantly, ', 'Notably, ', ''],
  },
  {
    pattern: /\bImportantly,?\s*/gi,
    neutral: ['Key point: ', 'Worth noting, ', ''],
  },
  {
    pattern: /\bCrucially,?\s*/gi,
    neutral: ['Key point: ', 'Most importantly, ', ''],
  },
  {
    pattern: /\bFundamentally,?\s*/gi,
    neutral: ['At its core, ', 'Basically, ', ''],
  },
  {
    pattern: /\bEssentially,?\s*/gi,
    neutral: ['Basically, ', 'Really, ', 'At its core, '],
  },
  {
    pattern: /\bInherently,?\s*/gi,
    neutral: ['By nature, ', 'Naturally, ', ''],
  },
  {
    pattern: /\bAbove all,?\s*/gi,
    neutral: ['Most importantly, ', 'More than anything, ', ''],
  },
  {
    pattern: /\bAs a matter of fact,?\s*/gi,
    neutral: ['Actually, ', 'In fact, ', 'Really, '],
  },

  // ===== Clarifying / rephrasing markers =====
  {
    pattern: /\bIn other words,?\s*/gi,
    neutral: ['Put differently, ', 'Basically, ', 'That is, '],
    informal: ['Meaning, '],
  },
  {
    pattern: /\bThat is to say,?\s*/gi,
    neutral: ['In other words, ', 'Meaning, ', 'Put simply, '],
  },
  {
    pattern: /\bTo put it simply,?\s*/gi,
    neutral: ['Simply put, ', 'Basically, ', 'In plain terms, '],
  },
  {
    pattern: /\bTo put it another way,?\s*/gi,
    neutral: ['Put differently, ', 'Or, to rephrase, ', 'In other words, '],
  },
  {
    pattern: /\bTo be more precise,?\s*/gi,
    neutral: ['More precisely, ', 'Specifically, ', 'To be exact, '],
  },
  {
    pattern: /\bTo clarify,?\s*/gi,
    neutral: ['To be clear, ', 'Just to be clear, ', 'Meaning, '],
  },
  {
    pattern: /\bMore specifically,?\s*/gi,
    neutral: ['In particular, ', 'Specifically, ', 'More precisely, '],
  },
  {
    pattern: /\bThat said,?\s*/gi,
    neutral: ['But, ', 'Still, ', 'Even so, ', ''],
  },

  // ===== Conditional / concessive markers =====
  {
    pattern: /\bProvided that\b/gi,
    neutral: ['As long as', 'If', 'Assuming'],
  },
  {
    pattern: /\bAssuming that\b/gi,
    neutral: ['If', 'Provided', 'Given that'],
  },
  {
    pattern: /\bGiven that\b/gi,
    neutral: ['Since', 'Because', 'Considering'],
  },
  {
    pattern: /\bIn the event that\b/gi,
    neutral: ['If', 'Should', 'In case'],
  },
  {
    pattern: /\bGranted,?\s*/gi,
    neutral: ['Sure, ', 'True, ', 'Fair enough, '],
  },
  {
    pattern: /\bAdmittedly,?\s*/gi,
    neutral: ['True, ', 'Granted, ', 'To be fair, '],
  },

  // ===== Stance / opinion markers =====
  {
    pattern: /\bIt is evident that\b/gi,
    neutral: ['Clearly,', 'Obviously,', 'You can see that'],
  },
  {
    pattern: /\bIt is apparent that\b/gi,
    neutral: ['Clearly,', 'Obviously,', 'It seems clear that'],
  },
  {
    pattern: /\bIt is clear that\b/gi,
    neutral: ['Clearly,', 'Obviously,', 'You can see that'],
  },
  {
    pattern: /\bIt is undeniable that\b/gi,
    neutral: ["There's no denying that", 'Clearly,', 'No one would argue that'],
  },
  {
    pattern: /\bIt is noteworthy that\b/gi,
    neutral: ['Worth noting,', 'Interesting enough,', ''],
  },
  {
    pattern: /\bIt is crucial to\b/gi,
    neutral: ['You need to', "It's key to", "It's important to"],
  },
  {
    pattern: /\bIt is imperative that\b/gi,
    neutral: ['You must', "It's essential that", "It's critical that"],
  },
  {
    pattern: /\bIt is worth emphasizing that\b/gi,
    neutral: ['Worth stressing,', 'Key point:', 'Remember,'],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pickRandom<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

// ---------------------------------------------------------------------------
// Main stage
// ---------------------------------------------------------------------------

const discourseDiversify: HumanizationStage = {
  name: 'Discourse Marker Diversification',
  order: 3,

  process(text: string, config: ModeConfig): string {
    if (!text || !text.trim()) return text;

    const seed = hashCode(text);
    const rand = createSeededRandom(seed);
    let result = text;

    // Track how many markers we've replaced vs. total found,
    // so we can control density.
    let totalFound = 0;
    let totalReplaced = 0;

    for (const entry of MARKER_ENTRIES) {
      result = result.replace(entry.pattern, (match) => {
        totalFound++;

        // 20% chance to just remove the transition entirely
        if (rand() < 0.20) {
          totalReplaced++;
          // If removal, capitalize next word if needed
          return '';
        }

        // Don't replace every single one — aim to replace ~60-80%
        // to vary density naturally
        if (rand() < 0.25) {
          return match; // keep original
        }

        totalReplaced++;

        const pool = config.preserveFormalTone
          ? entry.neutral.filter((s) => s !== '')
          : [...entry.neutral, ...(entry.informal ?? [])].filter((s) => s !== '');

        if (pool.length === 0) return '';

        const replacement = pickRandom(pool, rand);

        // Preserve sentence-initial capitalization
        if (/^[A-Z]/.test(match) && replacement.length > 0) {
          return replacement.charAt(0).toUpperCase() + replacement.slice(1);
        }

        return replacement;
      });
    }

    // Fix any double spaces or missing capitalization from removals
    result = result
      .replace(/\s{2,}/g, ' ')
      .replace(/\.\s+([a-z])/g, (_m, letter: string) => `. ${letter.toUpperCase()}`)
      .replace(/^\s+/, '')
      .replace(/\s+$/, '');

    return result;
  },
};

export default discourseDiversify;
