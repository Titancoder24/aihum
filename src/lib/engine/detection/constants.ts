/**
 * Shared constants for AI text detection modules.
 * Centralized word lists and phrase patterns used across multiple detection modules.
 */

/**
 * Words that AI language models disproportionately favor.
 * These appear with higher frequency in AI-generated text compared to human writing.
 */
export const AI_COMMON_WORDS: string[] = [
  // Overused adjectives
  'comprehensive', 'crucial', 'delve', 'diverse', 'dynamic', 'effective',
  'efficient', 'enhance', 'ensure', 'essential', 'evolving', 'exceptional',
  'exciting', 'explore', 'extensive', 'facilitate', 'foster', 'fundamental',
  'groundbreaking', 'harness', 'holistic', 'impactful', 'implement',
  'important', 'impressive', 'incredible', 'indispensable', 'innovative',
  'insightful', 'integral', 'intricate', 'invaluable', 'key', 'landscape',
  'leverage', 'meticulous', 'multifaceted', 'navigate', 'notably',
  'noteworthy', 'nuanced', 'optimal', 'optimize', 'overarching',
  'paramount', 'passionate', 'pivotal', 'plethora', 'profound',
  'prominent', 'realm', 'remarkable', 'renowned', 'reshape', 'resilient',
  'revolutionary', 'robust', 'seamless', 'significant', 'sophisticated',
  'streamline', 'substantial', 'sustainable', 'synergy', 'tapestry',
  'testament', 'transformative', 'ultimately', 'underscore', 'unique',
  'utilization', 'utilize', 'vast', 'versatile', 'vibrant', 'vital',

  // Overused verbs
  'achieve', 'address', 'align', 'amplify', 'bolster', 'capitalize',
  'catalyze', 'champion', 'collaborate', 'complement', 'contribute',
  'cultivate', 'curate', 'demonstrate', 'elevate', 'embark', 'embrace',
  'empower', 'enable', 'encompass', 'endeavor', 'engage', 'establish',
  'exemplify', 'exhibit', 'forge', 'garner', 'generate', 'illuminate',
  'illustrate', 'immerse', 'incorporate', 'influence', 'inspire',
  'integrate', 'maximize', 'mitigate', 'nurture', 'orchestrate',
  'pioneer', 'possess', 'prioritize', 'propel', 'provide', 'pursue',
  'recognize', 'reflect', 'revolutionize', 'spearhead', 'strengthen',
  'strive', 'transcend', 'transform', 'underscore', 'unleash', 'unveil',

  // Overused nouns
  'abundance', 'advent', 'approach', 'array', 'aspiration', 'beacon',
  'blueprint', 'cadence', 'catalyst', 'commitment', 'complexities',
  'component', 'confluence', 'consideration', 'cornerstone', 'culmination',
  'dedication', 'dimension', 'discourse', 'ecosystem', 'element',
  'embodiment', 'endeavor', 'engagement', 'era', 'essence', 'ethos',
  'evolution', 'expertise', 'exploration', 'facet', 'framework',
  'frontier', 'implications', 'inclusion', 'infrastructure', 'initiative',
  'innovation', 'insight', 'intersection', 'iteration', 'journey',
  'juxtaposition', 'landscape', 'lens', 'manifestation', 'mechanism',
  'methodology', 'milestone', 'mosaic', 'narrative', 'nexus', 'nuance',
  'paradigm', 'pathway', 'perspective', 'phenomenon', 'pinnacle',
  'portfolio', 'potential', 'prerequisite', 'progression', 'proliferation',
  'proposition', 'pursuit', 'ramification', 'repertoire', 'scaffold',
  'spectrum', 'sphere', 'stakeholder', 'strategy', 'synergy', 'synthesis',
  'trajectory', 'underpinning', 'undertaking', 'venture',

  // Overused adverbs/modifiers
  'accordingly', 'additionally', 'arguably', 'certainly', 'consequently',
  'conversely', 'dramatically', 'effectively', 'essentially',
  'fundamentally', 'furthermore', 'generally', 'hence', 'importantly',
  'increasingly', 'indeed', 'inherently', 'interestingly', 'moreover',
  'nevertheless', 'notably', 'particularly', 'precisely', 'predominantly',
  'primarily', 'profoundly', 'progressively', 'remarkably', 'respectively',
  'significantly', 'simultaneously', 'specifically', 'subsequently',
  'thereby', 'therefore', 'thus', 'ultimately', 'undeniably', 'undoubtedly',
];

/**
 * Transition phrases heavily favored by AI-generated text.
 * AI text tends to use these formulaic connectors at very high rates.
 */
export const TRANSITION_PHRASES: string[] = [
  // Addition
  'in addition', 'furthermore', 'moreover', 'additionally', 'not only',
  'as well as', 'along with', 'coupled with', 'in conjunction with',
  'on top of that', 'what is more', 'equally important', 'by the same token',
  'in the same vein', 'similarly', 'likewise', 'in a similar fashion',
  'correspondingly', 'in much the same way',

  // Contrast
  'however', 'on the other hand', 'conversely', 'in contrast',
  'nevertheless', 'nonetheless', 'despite this', 'in spite of',
  'on the contrary', 'that being said', 'having said that',
  'at the same time', 'be that as it may', 'even so', 'albeit',
  'notwithstanding', 'while it is true that', 'granted that',

  // Cause/Effect
  'as a result', 'consequently', 'therefore', 'thus', 'hence',
  'accordingly', 'for this reason', 'because of this', 'owing to',
  'due to this', 'this leads to', 'it follows that', 'as a consequence',
  'this results in', 'stemming from', 'arising from',

  // Examples/Elaboration
  'for instance', 'for example', 'to illustrate', 'specifically',
  'in particular', 'namely', 'to be specific', 'such as',
  'to put it differently', 'in other words', 'that is to say',
  'to clarify', 'to elaborate', 'more specifically',

  // Conclusion
  'in conclusion', 'to summarize', 'in summary', 'to sum up',
  'all in all', 'in the final analysis', 'ultimately', 'on the whole',
  'taking everything into account', 'in light of', 'given the above',
  'as we have seen', 'as demonstrated', 'it is clear that',
  'it is evident that', 'this underscores', 'this highlights',

  // Sequence
  'first and foremost', 'to begin with', 'in the first place',
  'subsequently', 'following this', 'afterward', 'in the meantime',
  'at the outset', 'moving forward', 'going forward', 'looking ahead',

  // Emphasis
  'it is important to note', 'it is worth noting', 'it should be noted',
  'it bears mentioning', 'significantly', 'notably', 'crucially',
  'most importantly', 'above all', 'in particular', 'especially',
  'particularly', 'it is essential', 'it is crucial', 'it is vital',
  'it is imperative',

  // AI-specific connectors
  'in today\'s world', 'in the modern era', 'in this day and age',
  'in the realm of', 'when it comes to', 'in terms of',
  'with regard to', 'with respect to', 'pertaining to',
  'as it pertains to', 'in the context of', 'through the lens of',
  'from the perspective of', 'plays a crucial role', 'plays a vital role',
  'plays a significant role', 'serves as a testament',
];

/**
 * Hedging phrases commonly used by AI to soften assertions.
 * AI models use these to avoid making overly definitive statements.
 */
export const HEDGING_PHRASES: string[] = [
  'it is important to note that',
  'it is worth mentioning that',
  'it should be noted that',
  'it could be argued that',
  'it is possible that',
  'it is likely that',
  'it appears that',
  'it seems that',
  'it may be the case that',
  'one could argue that',
  'one might suggest that',
  'this suggests that',
  'this indicates that',
  'this implies that',
  'to some extent',
  'to a certain degree',
  'in some cases',
  'in many ways',
  'in a sense',
  'arguably',
  'perhaps',
  'potentially',
  'presumably',
  'seemingly',
  'apparently',
  'generally speaking',
  'broadly speaking',
  'for the most part',
  'by and large',
  'to a large extent',
  'more often than not',
  'in most cases',
  'tends to',
  'appears to',
  'seems to',
  'is likely to',
  'may well be',
  'might well be',
  'could well be',
  'there is a possibility that',
  'there is evidence to suggest',
  'research suggests that',
  'studies indicate that',
  'it has been suggested that',
  'it has been argued that',
  'some would argue that',
  'while not definitive',
  'not necessarily',
  'not always',
  'depending on the context',
  'under certain circumstances',
  'in certain situations',
  'in particular contexts',
];

/**
 * Simple positive sentiment words for tone analysis.
 */
export const POSITIVE_WORDS: string[] = [
  'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic',
  'brilliant', 'outstanding', 'superb', 'magnificent', 'remarkable',
  'exceptional', 'impressive', 'incredible', 'marvelous', 'splendid',
  'terrific', 'fabulous', 'phenomenal', 'extraordinary', 'beautiful',
  'delightful', 'pleasant', 'enjoyable', 'satisfying', 'fulfilling',
  'rewarding', 'beneficial', 'advantageous', 'favorable', 'positive',
  'promising', 'encouraging', 'inspiring', 'uplifting', 'heartwarming',
  'happy', 'joyful', 'cheerful', 'grateful', 'thankful', 'blessed',
  'fortunate', 'lucky', 'excited', 'enthusiastic', 'passionate',
  'optimistic', 'hopeful', 'confident', 'proud', 'successful',
  'accomplished', 'effective', 'efficient', 'productive', 'innovative',
  'creative', 'imaginative', 'insightful', 'thoughtful', 'considerate',
  'kind', 'generous', 'compassionate', 'caring', 'supportive',
  'helpful', 'friendly', 'warm', 'loving', 'gentle', 'peaceful',
  'calm', 'serene', 'tranquil', 'harmonious', 'balanced', 'perfect',
  'ideal', 'optimal', 'best', 'top', 'premier', 'leading', 'superior',
  'elite', 'premium', 'valuable', 'precious', 'essential', 'vital',
  'important', 'significant', 'meaningful', 'profound', 'powerful',
  'strong', 'robust', 'resilient', 'dynamic', 'vibrant', 'thriving',
  'flourishing', 'prosperous', 'wealthy', 'abundant',
];

/**
 * Simple negative sentiment words for tone analysis.
 */
export const NEGATIVE_WORDS: string[] = [
  'bad', 'terrible', 'horrible', 'awful', 'dreadful', 'appalling',
  'atrocious', 'abysmal', 'miserable', 'wretched', 'pathetic',
  'deplorable', 'disastrous', 'catastrophic', 'devastating', 'tragic',
  'unfortunate', 'regrettable', 'disappointing', 'frustrating',
  'annoying', 'irritating', 'infuriating', 'maddening', 'aggravating',
  'troublesome', 'problematic', 'difficult', 'challenging', 'complicated',
  'complex', 'confusing', 'bewildering', 'perplexing', 'puzzling',
  'concerning', 'alarming', 'disturbing', 'unsettling', 'troubling',
  'worrying', 'frightening', 'terrifying', 'scary', 'dangerous',
  'harmful', 'damaging', 'destructive', 'detrimental', 'adverse',
  'negative', 'unfavorable', 'poor', 'weak', 'inferior', 'inadequate',
  'insufficient', 'lacking', 'deficient', 'flawed', 'faulty',
  'broken', 'damaged', 'ruined', 'destroyed', 'failed', 'unsuccessful',
  'ineffective', 'inefficient', 'unproductive', 'wasteful', 'useless',
  'pointless', 'meaningless', 'worthless', 'hopeless', 'helpless',
  'powerless', 'vulnerable', 'fragile', 'unstable', 'unreliable',
  'inconsistent', 'unpredictable', 'uncertain', 'doubtful', 'skeptical',
  'pessimistic', 'cynical', 'hostile', 'aggressive', 'violent',
  'cruel', 'harsh', 'severe', 'brutal', 'ruthless', 'merciless',
  'painful', 'suffering', 'agonizing', 'torturous', 'unbearable',
  'intolerable', 'unacceptable', 'outrageous', 'ridiculous', 'absurd',
];
