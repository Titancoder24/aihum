/**
 * Stage 2: Vocabulary Naturalization
 * Replaces AI-telltale words/phrases with natural alternatives.
 * Contains 500+ replacement entries with 3-10 alternatives each, plus
 * phrase pattern replacement, contraction insertion, and colloquialism injection.
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

interface ReplacementEntry {
  /** Alternatives safe for any tone */
  neutral: string[];
  /** Extra informal alternatives (only used when !preserveFormalTone) */
  informal?: string[];
}

type ReplacementMap = Record<string, ReplacementEntry>;

// ---------------------------------------------------------------------------
// Massive replacement map: AI-telltale words → natural alternatives
// Each key is lowercase. Matching is case-insensitive; casing is restored.
// ---------------------------------------------------------------------------

const WORD_REPLACEMENTS: ReplacementMap = {
  // ===== The classic AI overused words =====
  utilize: { neutral: ['use', 'work with', 'rely on', 'turn to'], informal: ['go with'] },
  utilizes: { neutral: ['uses', 'works with', 'relies on', 'turns to'] },
  utilizing: { neutral: ['using', 'working with', 'relying on', 'turning to'] },
  utilization: { neutral: ['use', 'usage', 'application'] },
  facilitate: { neutral: ['help', 'make easier', 'support', 'enable', 'allow'] },
  facilitates: { neutral: ['helps', 'supports', 'enables', 'allows'] },
  facilitating: { neutral: ['helping', 'supporting', 'enabling', 'allowing'] },
  facilitation: { neutral: ['support', 'help', 'assistance'] },
  leverage: { neutral: ['take advantage of', 'use', 'build on', 'tap into', 'make use of'] },
  leverages: { neutral: ['uses', 'builds on', 'taps into', 'makes use of'] },
  leveraging: { neutral: ['using', 'building on', 'tapping into', 'making use of'] },
  comprehensive: { neutral: ['thorough', 'complete', 'full', 'in-depth', 'detailed', 'wide-ranging'] },
  crucial: { neutral: ['key', 'important', 'critical', 'major', 'vital'], informal: ['big'] },
  delve: { neutral: ['dig into', 'explore', 'look at', 'examine', 'get into'] },
  delves: { neutral: ['digs into', 'explores', 'looks at', 'examines'] },
  delving: { neutral: ['digging into', 'exploring', 'looking at', 'examining'] },
  multifaceted: { neutral: ['complex', 'layered', 'nuanced', 'varied', 'many-sided'] },
  pivotal: { neutral: ['important', 'key', 'central', 'defining', 'critical'] },
  underscore: { neutral: ['highlight', 'show', 'point to', 'stress', 'emphasize'] },
  underscores: { neutral: ['highlights', 'shows', 'points to', 'stresses'] },
  underscoring: { neutral: ['highlighting', 'showing', 'pointing to', 'stressing'] },
  tapestry: { neutral: ['mix', 'blend', 'combination', 'range', 'patchwork'] },
  landscape: { neutral: ['scene', 'world', 'space', 'field', 'area', 'environment'] },
  robust: { neutral: ['strong', 'solid', 'reliable', 'sturdy', 'dependable'] },
  streamline: { neutral: ['simplify', 'speed up', 'make smoother', 'cut down on'] },
  streamlines: { neutral: ['simplifies', 'speeds up', 'cuts down on'] },
  streamlining: { neutral: ['simplifying', 'speeding up', 'cutting down on'] },
  'cutting-edge': { neutral: ['latest', 'newest', 'advanced', 'modern', 'state-of-the-art'] },
  groundbreaking: { neutral: ['new', 'novel', 'pioneering', 'first-of-its-kind', 'trailblazing'] },
  transformative: { neutral: ['game-changing', 'major', 'powerful', 'radical', 'far-reaching'] },
  innovative: { neutral: ['creative', 'new', 'fresh', 'original', 'inventive'] },
  innovation: { neutral: ['creativity', 'new idea', 'advancement', 'breakthrough'] },
  innovations: { neutral: ['new ideas', 'advancements', 'breakthroughs'] },
  paradigm: { neutral: ['model', 'framework', 'approach', 'way of thinking', 'lens'] },
  paradigms: { neutral: ['models', 'frameworks', 'approaches'] },
  synergy: { neutral: ['teamwork', 'collaboration', 'combined effort', 'cooperation'] },
  synergies: { neutral: ['partnerships', 'collaborations', 'combined efforts'] },
  holistic: { neutral: ['overall', 'complete', 'whole', 'broad', 'all-around'] },
  realm: { neutral: ['area', 'field', 'world', 'domain', 'space'] },
  realms: { neutral: ['areas', 'fields', 'worlds', 'domains'] },
  navigating: { neutral: ['dealing with', 'working through', 'handling', 'figuring out', 'managing'] },
  navigate: { neutral: ['deal with', 'work through', 'handle', 'figure out', 'manage'] },
  navigates: { neutral: ['deals with', 'works through', 'handles', 'manages'] },
  fostering: { neutral: ['building', 'encouraging', 'growing', 'supporting', 'nurturing'] },
  foster: { neutral: ['build', 'encourage', 'grow', 'support', 'nurture'] },
  fosters: { neutral: ['builds', 'encourages', 'grows', 'supports'] },
  encompasses: { neutral: ['covers', 'includes', 'spans', 'takes in'] },
  encompass: { neutral: ['cover', 'include', 'span', 'take in'] },
  encompassing: { neutral: ['covering', 'including', 'spanning'] },
  intricate: { neutral: ['detailed', 'complex', 'involved', 'elaborate', 'sophisticated'] },
  notably: { neutral: ['especially', 'particularly', 'in particular'] },
  significantly: { neutral: ['a lot', 'greatly', 'considerably', 'quite a bit', 'substantially'] },
  essentially: { neutral: ['basically', 'really', 'at its core', 'in simple terms'] },
  fundamentally: { neutral: ['at heart', 'basically', 'at its core', 'deep down'] },
  ultimately: { neutral: ['in the end', 'when it comes down to it', 'at the end of the day', 'finally'] },

  // ===== More AI-overused vocabulary =====
  plethora: { neutral: ['lots', 'many', 'a wide range', 'plenty', 'a bunch'], informal: ['a ton'] },
  myriad: { neutral: ['many', 'countless', 'a range of', 'all kinds of', 'numerous'] },
  endeavor: { neutral: ['effort', 'attempt', 'project', 'venture', 'undertaking'] },
  endeavors: { neutral: ['efforts', 'attempts', 'projects', 'ventures'] },
  endeavoring: { neutral: ['trying', 'working', 'attempting', 'striving'] },
  elucidate: { neutral: ['explain', 'clarify', 'spell out', 'shed light on', 'make clear'] },
  elucidates: { neutral: ['explains', 'clarifies', 'spells out'] },
  elucidating: { neutral: ['explaining', 'clarifying', 'spelling out'] },
  meticulous: { neutral: ['careful', 'thorough', 'precise', 'detailed', 'painstaking'] },
  meticulously: { neutral: ['carefully', 'thoroughly', 'precisely'] },
  paramount: { neutral: ['most important', 'top', 'primary', 'number one', 'critical'] },
  exemplify: { neutral: ['show', 'demonstrate', 'illustrate', 'represent'] },
  exemplifies: { neutral: ['shows', 'demonstrates', 'illustrates'] },
  exemplifying: { neutral: ['showing', 'demonstrating', 'illustrating'] },
  proliferate: { neutral: ['spread', 'grow', 'multiply', 'increase', 'expand'] },
  proliferates: { neutral: ['spreads', 'grows', 'multiplies'] },
  proliferation: { neutral: ['spread', 'growth', 'rise', 'expansion'] },
  juxtaposition: { neutral: ['contrast', 'comparison', 'side-by-side', 'pairing'] },
  propensity: { neutral: ['tendency', 'habit', 'inclination', 'leaning'] },
  nomenclature: { neutral: ['naming', 'terminology', 'terms', 'labels'] },
  dichotomy: { neutral: ['divide', 'split', 'contrast', 'tension'] },
  nuanced: { neutral: ['subtle', 'detailed', 'layered', 'complex', 'refined'] },
  nuance: { neutral: ['subtlety', 'detail', 'shade', 'fine point'] },
  nuances: { neutral: ['subtleties', 'details', 'shades', 'fine points'] },
  efficacy: { neutral: ['effectiveness', 'success rate', 'how well it works', 'results'] },
  salient: { neutral: ['key', 'main', 'important', 'notable', 'standout'] },
  ubiquitous: { neutral: ['everywhere', 'widespread', 'common', 'all over'] },
  cognizant: { neutral: ['aware', 'mindful', 'conscious'] },
  delineate: { neutral: ['outline', 'describe', 'lay out', 'define', 'map out'] },
  delineates: { neutral: ['outlines', 'describes', 'lays out'] },
  delineating: { neutral: ['outlining', 'describing', 'laying out'] },
  subsequently: { neutral: ['then', 'after that', 'later', 'next'] },
  aforementioned: { neutral: ['earlier', 'previous', 'above', 'already mentioned'] },
  interplay: { neutral: ['interaction', 'relationship', 'connection', 'dynamic'] },
  intrinsic: { neutral: ['built-in', 'natural', 'core', 'inherent', 'deep'] },
  extrinsic: { neutral: ['external', 'outside', 'outer'] },
  ramifications: { neutral: ['consequences', 'effects', 'results', 'impact', 'fallout'] },
  ramification: { neutral: ['consequence', 'effect', 'result', 'impact'] },
  pertinent: { neutral: ['relevant', 'related', 'applicable', 'fitting'] },
  commence: { neutral: ['start', 'begin', 'kick off', 'get going'] },
  commences: { neutral: ['starts', 'begins', 'kicks off'] },
  commencing: { neutral: ['starting', 'beginning', 'kicking off'] },
  ascertain: { neutral: ['find out', 'determine', 'figure out', 'confirm'] },
  ascertains: { neutral: ['finds out', 'determines', 'figures out'] },
  implement: { neutral: ['put in place', 'set up', 'carry out', 'build', 'create'] },
  implements: { neutral: ['puts in place', 'sets up', 'carries out', 'builds'] },
  implementing: { neutral: ['putting in place', 'setting up', 'carrying out', 'building'] },
  implementation: { neutral: ['setup', 'rollout', 'execution', 'deployment'] },
  methodology: { neutral: ['method', 'approach', 'process', 'system', 'technique'] },
  methodologies: { neutral: ['methods', 'approaches', 'processes', 'techniques'] },
  optimize: { neutral: ['improve', 'fine-tune', 'make better', 'tweak', 'enhance'] },
  optimizes: { neutral: ['improves', 'fine-tunes', 'tweaks'] },
  optimizing: { neutral: ['improving', 'fine-tuning', 'tweaking'] },
  optimization: { neutral: ['improvement', 'fine-tuning', 'tweaking'] },
  optimal: { neutral: ['best', 'ideal', 'top', 'most effective'] },
  prioritize: { neutral: ['focus on', 'put first', 'rank', 'give priority to'] },
  prioritizes: { neutral: ['focuses on', 'puts first', 'ranks'] },
  prioritizing: { neutral: ['focusing on', 'putting first', 'ranking'] },
  substantial: { neutral: ['large', 'big', 'major', 'significant', 'sizable'] },
  substantially: { neutral: ['a lot', 'greatly', 'considerably', 'much'] },
  overarching: { neutral: ['main', 'overall', 'central', 'broad', 'big-picture'] },
  augment: { neutral: ['add to', 'boost', 'increase', 'enhance', 'supplement'] },
  augments: { neutral: ['adds to', 'boosts', 'increases'] },
  augmenting: { neutral: ['adding to', 'boosting', 'increasing'] },
  bolster: { neutral: ['strengthen', 'support', 'boost', 'back up'] },
  bolsters: { neutral: ['strengthens', 'supports', 'boosts'] },
  bolstering: { neutral: ['strengthening', 'supporting', 'boosting'] },
  catalyst: { neutral: ['trigger', 'spark', 'driver', 'cause'] },
  catalysts: { neutral: ['triggers', 'sparks', 'drivers'] },
  cultivate: { neutral: ['build', 'develop', 'grow', 'create', 'nurture'] },
  cultivates: { neutral: ['builds', 'develops', 'grows'] },
  cultivating: { neutral: ['building', 'developing', 'growing'] },
  curtail: { neutral: ['cut', 'reduce', 'limit', 'hold back'] },
  curtails: { neutral: ['cuts', 'reduces', 'limits'] },
  curtailing: { neutral: ['cutting', 'reducing', 'limiting'] },
  demonstrate: { neutral: ['show', 'prove', 'reveal', 'make clear'] },
  demonstrates: { neutral: ['shows', 'proves', 'reveals'] },
  demonstrating: { neutral: ['showing', 'proving', 'revealing'] },
  discern: { neutral: ['see', 'spot', 'notice', 'tell', 'pick up on'] },
  discerns: { neutral: ['sees', 'spots', 'notices'] },
  discerning: { neutral: ['seeing', 'spotting', 'noticing'] },
  disseminate: { neutral: ['spread', 'share', 'distribute', 'pass on'] },
  disseminates: { neutral: ['spreads', 'shares', 'distributes'] },
  disseminating: { neutral: ['spreading', 'sharing', 'distributing'] },
  ecosystem: { neutral: ['system', 'network', 'environment', 'community'] },
  ecosystems: { neutral: ['systems', 'networks', 'environments'] },
  empower: { neutral: ['help', 'enable', 'give power to', 'equip', 'support'] },
  empowers: { neutral: ['helps', 'enables', 'equips'] },
  empowering: { neutral: ['helping', 'enabling', 'equipping'] },
  empowerment: { neutral: ['support', 'strength', 'capability'] },
  eradicate: { neutral: ['wipe out', 'eliminate', 'get rid of', 'remove'] },
  eradicates: { neutral: ['wipes out', 'eliminates', 'removes'] },
  exacerbate: { neutral: ['worsen', 'make worse', 'aggravate', 'intensify'] },
  exacerbates: { neutral: ['worsens', 'makes worse', 'aggravates'] },
  exacerbating: { neutral: ['worsening', 'making worse', 'aggravating'] },
  expedite: { neutral: ['speed up', 'fast-track', 'hurry', 'accelerate'] },
  expedites: { neutral: ['speeds up', 'fast-tracks', 'accelerates'] },
  exponential: { neutral: ['rapid', 'massive', 'huge', 'dramatic'] },
  exponentially: { neutral: ['rapidly', 'massively', 'hugely', 'dramatically'] },
  formidable: { neutral: ['tough', 'impressive', 'serious', 'daunting'] },
  garner: { neutral: ['get', 'gain', 'earn', 'attract', 'collect'] },
  garners: { neutral: ['gets', 'gains', 'earns', 'attracts'] },
  garnering: { neutral: ['getting', 'gaining', 'earning'] },
  harness: { neutral: ['use', 'tap into', 'channel', 'capture'] },
  harnesses: { neutral: ['uses', 'taps into', 'channels'] },
  harnessing: { neutral: ['using', 'tapping into', 'channeling'] },
  illuminate: { neutral: ['light up', 'show', 'reveal', 'explain', 'clarify'] },
  illuminates: { neutral: ['shows', 'reveals', 'explains'] },
  illuminating: { neutral: ['showing', 'revealing', 'explaining'] },
  imperative: { neutral: ['essential', 'necessary', 'critical', 'a must'] },
  inception: { neutral: ['start', 'beginning', 'launch', 'founding'] },
  indispensable: { neutral: ['essential', 'necessary', 'critical', 'vital'] },
  juxtapose: { neutral: ['compare', 'contrast', 'place side by side', 'set against'] },
  juxtaposes: { neutral: ['compares', 'contrasts'] },
  juxtaposing: { neutral: ['comparing', 'contrasting'] },
  mitigate: { neutral: ['reduce', 'lessen', 'ease', 'soften', 'limit'] },
  mitigates: { neutral: ['reduces', 'lessens', 'eases'] },
  mitigating: { neutral: ['reducing', 'lessening', 'easing'] },
  mitigation: { neutral: ['reduction', 'relief', 'easing'] },
  necessitate: { neutral: ['require', 'call for', 'need', 'demand'] },
  necessitates: { neutral: ['requires', 'calls for', 'needs'] },
  perpetuate: { neutral: ['keep going', 'continue', 'maintain', 'carry on'] },
  perpetuates: { neutral: ['keeps going', 'continues', 'maintains'] },
  perpetuating: { neutral: ['keeping going', 'continuing', 'maintaining'] },
  postulate: { neutral: ['suggest', 'propose', 'argue', 'claim'] },
  postulates: { neutral: ['suggests', 'proposes', 'argues'] },
  precipitate: { neutral: ['trigger', 'cause', 'bring about', 'spark'] },
  precipitates: { neutral: ['triggers', 'causes', 'sparks'] },
  quintessential: { neutral: ['classic', 'perfect', 'typical', 'ideal', 'textbook'] },
  recapitulate: { neutral: ['sum up', 'recap', 'go over', 'review'] },
  recapitulates: { neutral: ['sums up', 'recaps', 'reviews'] },
  scrutinize: { neutral: ['examine', 'look closely at', 'inspect', 'study'] },
  scrutinizes: { neutral: ['examines', 'inspects', 'studies'] },
  scrutinizing: { neutral: ['examining', 'inspecting', 'studying'] },
  substantiate: { neutral: ['back up', 'support', 'prove', 'confirm'] },
  substantiates: { neutral: ['backs up', 'supports', 'proves'] },
  transcend: { neutral: ['go beyond', 'rise above', 'surpass', 'exceed'] },
  transcends: { neutral: ['goes beyond', 'rises above', 'surpasses'] },
  transcending: { neutral: ['going beyond', 'rising above', 'surpassing'] },
  unprecedented: { neutral: ['never seen before', 'first-ever', 'unheard of', 'record-breaking'] },
  vernacular: { neutral: ['language', 'speech', 'terms', 'lingo', 'way of speaking'] },

  // ===== Common "fancy" adjectives =====
  advantageous: { neutral: ['helpful', 'useful', 'beneficial', 'favorable'] },
  adept: { neutral: ['skilled', 'good at', 'capable', 'proficient'] },
  ample: { neutral: ['plenty of', 'enough', 'lots of', 'generous'] },
  astute: { neutral: ['sharp', 'clever', 'smart', 'perceptive'] },
  burgeoning: { neutral: ['growing', 'expanding', 'rising', 'booming'] },
  cogent: { neutral: ['convincing', 'strong', 'compelling', 'solid'] },
  commensurate: { neutral: ['matching', 'proportional', 'in line with', 'equal to'] },
  concomitant: { neutral: ['accompanying', 'related', 'connected'] },
  conducive: { neutral: ['helpful', 'favorable', 'good for', 'encouraging'] },
  copious: { neutral: ['lots of', 'plenty of', 'abundant', 'generous'] },
  deleterious: { neutral: ['harmful', 'damaging', 'bad', 'destructive'] },
  disparate: { neutral: ['different', 'varied', 'unequal', 'diverse'] },
  efficacious: { neutral: ['effective', 'successful', 'working'] },
  egregious: { neutral: ['terrible', 'awful', 'outrageous', 'shocking'] },
  elusive: { neutral: ['hard to find', 'tricky', 'slippery', 'rare'] },
  enigmatic: { neutral: ['mysterious', 'puzzling', 'hard to read'] },
  ephemeral: { neutral: ['short-lived', 'fleeting', 'brief', 'temporary'] },
  equitable: { neutral: ['fair', 'just', 'balanced', 'equal'] },
  erroneous: { neutral: ['wrong', 'incorrect', 'mistaken', 'false'] },
  exorbitant: { neutral: ['very high', 'excessive', 'outrageous', 'sky-high'] },
  fervent: { neutral: ['passionate', 'intense', 'strong', 'eager'] },
  flagrant: { neutral: ['obvious', 'blatant', 'clear', 'glaring'] },
  fortuitous: { neutral: ['lucky', 'fortunate', 'chance', 'happy'] },
  gratuitous: { neutral: ['unnecessary', 'uncalled for', 'unneeded', 'excessive'] },
  homogeneous: { neutral: ['uniform', 'same', 'consistent', 'alike'] },
  idiosyncratic: { neutral: ['quirky', 'unique', 'individual', 'peculiar'] },
  immutable: { neutral: ['unchanging', 'fixed', 'permanent', 'constant'] },
  impeccable: { neutral: ['flawless', 'perfect', 'spotless', 'excellent'] },
  inadvertent: { neutral: ['accidental', 'unintended', 'by mistake'] },
  indigenous: { neutral: ['native', 'local', 'original'] },
  indelible: { neutral: ['lasting', 'permanent', 'unforgettable'] },
  inherent: { neutral: ['built-in', 'natural', 'fundamental', 'core'] },
  insurmountable: { neutral: ['impossible', 'overwhelming', 'unbeatable'] },
  laudable: { neutral: ['praiseworthy', 'admirable', 'commendable'] },
  lucrative: { neutral: ['profitable', 'money-making', 'rewarding'] },
  magnanimous: { neutral: ['generous', 'big-hearted', 'gracious'] },
  nascent: { neutral: ['new', 'emerging', 'young', 'early-stage'] },
  nebulous: { neutral: ['vague', 'unclear', 'fuzzy', 'hazy'] },
  nefarious: { neutral: ['evil', 'wicked', 'criminal', 'shady'] },
  obligatory: { neutral: ['required', 'mandatory', 'necessary'] },
  onerous: { neutral: ['burdensome', 'tough', 'demanding', 'heavy'] },
  ostensible: { neutral: ['apparent', 'seeming', 'supposed', 'alleged'] },
  ostensibly: { neutral: ['apparently', 'seemingly', 'supposedly'] },
  palpable: { neutral: ['obvious', 'clear', 'noticeable', 'real'] },
  pervasive: { neutral: ['widespread', 'common', 'everywhere'] },
  plausible: { neutral: ['believable', 'reasonable', 'possible', 'likely'] },
  poignant: { neutral: ['touching', 'moving', 'emotional', 'heartfelt'] },
  pragmatic: { neutral: ['practical', 'realistic', 'sensible', 'down-to-earth'] },
  precarious: { neutral: ['risky', 'unstable', 'dangerous', 'shaky'] },
  proficient: { neutral: ['skilled', 'good at', 'capable', 'competent'] },
  prolific: { neutral: ['productive', 'active', 'busy', 'abundant'] },
  propitious: { neutral: ['favorable', 'promising', 'good'] },
  prudent: { neutral: ['wise', 'careful', 'sensible', 'smart'] },
  redundant: { neutral: ['unnecessary', 'extra', 'unneeded', 'surplus'] },
  resilient: { neutral: ['tough', 'strong', 'adaptable', 'hardy'] },
  resurgent: { neutral: ['returning', 'reviving', 'coming back'] },
  salubrious: { neutral: ['healthy', 'wholesome', 'good'] },
  scrupulous: { neutral: ['careful', 'thorough', 'meticulous', 'exact'] },
  seminal: { neutral: ['groundbreaking', 'landmark', 'key', 'influential'] },
  spurious: { neutral: ['fake', 'false', 'bogus', 'phony'] },
  stringent: { neutral: ['strict', 'tight', 'tough', 'rigid'] },
  superfluous: { neutral: ['extra', 'unnecessary', 'unneeded', 'excess'] },
  tangible: { neutral: ['real', 'concrete', 'solid', 'clear', 'actual'] },
  tenacious: { neutral: ['persistent', 'determined', 'stubborn', 'tough'] },
  unequivocal: { neutral: ['clear', 'definite', 'absolute', 'certain'] },
  unparalleled: { neutral: ['unmatched', 'one-of-a-kind', 'unique', 'exceptional'] },
  utilitarian: { neutral: ['practical', 'functional', 'useful'] },
  venerable: { neutral: ['respected', 'honored', 'distinguished'] },
  volatile: { neutral: ['unstable', 'unpredictable', 'shaky', 'changeable'] },
  voluminous: { neutral: ['huge', 'massive', 'extensive', 'bulky'] },
  wholesome: { neutral: ['healthy', 'good', 'positive', 'uplifting'] },
  zealous: { neutral: ['eager', 'enthusiastic', 'passionate', 'devoted'] },

  // ===== Common "fancy" adverbs =====
  accordingly: { neutral: ['so', 'therefore', 'as a result'] },
  admittedly: { neutral: ['granted', 'true', 'to be fair'] },
  arguably: { neutral: ['possibly', 'maybe', 'some would say'] },
  categorically: { neutral: ['absolutely', 'completely', 'totally'] },
  conceivably: { neutral: ['possibly', 'maybe', 'potentially'] },
  concomitantly: { neutral: ['at the same time', 'alongside', 'together'] },
  conversely: { neutral: ['on the other hand', 'in contrast', 'flip side'] },
  demonstrably: { neutral: ['clearly', 'obviously', 'provably'] },
  efficaciously: { neutral: ['effectively', 'successfully'] },
  exorbitantly: { neutral: ['extremely', 'outrageously', 'sky-high'] },
  holistically: { neutral: ['as a whole', 'overall', 'broadly'] },
  inadvertently: { neutral: ['accidentally', 'by mistake', 'unintentionally'] },
  indiscriminately: { neutral: ['randomly', 'without care', 'blindly'] },
  inherently: { neutral: ['naturally', 'by nature', 'at its core'] },
  invariably: { neutral: ['always', 'without fail', 'every time'] },
  irrevocably: { neutral: ['permanently', 'for good', 'forever'] },
  judiciously: { neutral: ['wisely', 'carefully', 'smartly'] },
  markedly: { neutral: ['noticeably', 'clearly', 'obviously'] },
  overwhelmingly: { neutral: ['mostly', 'hugely', 'by far'] },
  paradoxically: { neutral: ['oddly', 'strangely', 'surprisingly'] },
  predominantly: { neutral: ['mostly', 'mainly', 'largely', 'for the most part'] },
  profoundly: { neutral: ['deeply', 'greatly', 'hugely', 'very much'] },
  quintessentially: { neutral: ['perfectly', 'classically', 'typically'] },
  remarkably: { neutral: ['surprisingly', 'impressively', 'strikingly'] },
  systematically: { neutral: ['step by step', 'methodically', 'in order'] },
  unequivocally: { neutral: ['clearly', 'without a doubt', 'absolutely'] },

  // ===== Common "fancy" verbs =====
  accommodate: { neutral: ['fit', 'handle', 'support', 'cater to'] },
  accommodates: { neutral: ['fits', 'handles', 'supports'] },
  alleviate: { neutral: ['ease', 'reduce', 'relieve', 'lessen'] },
  alleviates: { neutral: ['eases', 'reduces', 'relieves'] },
  ameliorate: { neutral: ['improve', 'make better', 'fix', 'enhance'] },
  ameliorates: { neutral: ['improves', 'makes better'] },
  articulate: { neutral: ['express', 'put into words', 'state', 'describe'] },
  articulates: { neutral: ['expresses', 'states', 'describes'] },
  coalesce: { neutral: ['merge', 'come together', 'unite', 'combine'] },
  coalesces: { neutral: ['merges', 'comes together', 'unites'] },
  cognize: { neutral: ['understand', 'realize', 'recognize'] },
  collaborate: { neutral: ['work together', 'team up', 'partner', 'join forces'] },
  collaborates: { neutral: ['works with', 'teams up', 'partners'] },
  compensate: { neutral: ['make up for', 'offset', 'balance', 'pay for'] },
  compensates: { neutral: ['makes up for', 'offsets', 'balances'] },
  conceptualize: { neutral: ['imagine', 'picture', 'think of', 'envision'] },
  conceptualizes: { neutral: ['imagines', 'pictures', 'envisions'] },
  consolidate: { neutral: ['combine', 'merge', 'bring together', 'unite'] },
  consolidates: { neutral: ['combines', 'merges', 'brings together'] },
  constitute: { neutral: ['make up', 'form', 'represent', 'be'] },
  constitutes: { neutral: ['makes up', 'forms', 'represents', 'is'] },
  corroborate: { neutral: ['confirm', 'support', 'back up', 'verify'] },
  corroborates: { neutral: ['confirms', 'supports', 'backs up'] },
  culminate: { neutral: ['end in', 'lead to', 'result in', 'peak at'] },
  culminates: { neutral: ['ends in', 'leads to', 'results in'] },
  demystify: { neutral: ['explain', 'simplify', 'clear up', 'unpack'] },
  demystifies: { neutral: ['explains', 'simplifies', 'clears up'] },
  depict: { neutral: ['show', 'portray', 'describe', 'present'] },
  depicts: { neutral: ['shows', 'portrays', 'describes'] },
  designate: { neutral: ['name', 'assign', 'label', 'mark'] },
  designates: { neutral: ['names', 'assigns', 'labels'] },
  deteriorate: { neutral: ['worsen', 'decline', 'get worse', 'fall apart'] },
  deteriorates: { neutral: ['worsens', 'declines', 'gets worse'] },
  diminish: { neutral: ['reduce', 'shrink', 'lessen', 'weaken'] },
  diminishes: { neutral: ['reduces', 'shrinks', 'lessens'] },
  distinguish: { neutral: ['tell apart', 'separate', 'set apart'] },
  distinguishes: { neutral: ['tells apart', 'separates', 'sets apart'] },
  elaborate: { neutral: ['explain more', 'go into detail', 'expand on'] },
  elaborates: { neutral: ['explains more', 'goes into detail'] },
  emanate: { neutral: ['come from', 'flow from', 'arise from'] },
  emanates: { neutral: ['comes from', 'flows from'] },
  embody: { neutral: ['represent', 'capture', 'stand for', 'reflect'] },
  embodies: { neutral: ['represents', 'captures', 'reflects'] },
  engender: { neutral: ['create', 'cause', 'produce', 'bring about'] },
  engenders: { neutral: ['creates', 'causes', 'produces'] },
  enumerate: { neutral: ['list', 'count', 'name', 'spell out'] },
  enumerates: { neutral: ['lists', 'counts', 'names'] },
  epitomize: { neutral: ['represent', 'capture', 'stand for', 'define'] },
  epitomizes: { neutral: ['represents', 'captures', 'defines'] },
  extrapolate: { neutral: ['guess', 'estimate', 'project', 'infer'] },
  extrapolates: { neutral: ['guesses', 'estimates', 'projects'] },
  fabricate: { neutral: ['make up', 'invent', 'create', 'build'] },
  fabricates: { neutral: ['makes up', 'invents', 'creates'] },
  fluctuate: { neutral: ['change', 'vary', 'shift', 'swing'] },
  fluctuates: { neutral: ['changes', 'varies', 'shifts'] },
  galvanize: { neutral: ['motivate', 'energize', 'inspire', 'push'] },
  galvanizes: { neutral: ['motivates', 'energizes', 'inspires'] },
  hypothesize: { neutral: ['guess', 'suggest', 'theorize', 'propose'] },
  hypothesizes: { neutral: ['guesses', 'suggests', 'theorizes'] },
  inaugurate: { neutral: ['start', 'launch', 'open', 'begin'] },
  inaugurates: { neutral: ['starts', 'launches', 'opens'] },
  incapacitate: { neutral: ['disable', 'weaken', 'stop'] },
  inculcate: { neutral: ['teach', 'instill', 'drill in'] },
  manifest: { neutral: ['show', 'appear', 'display', 'reveal'] },
  manifests: { neutral: ['shows', 'appears', 'displays'] },
  negate: { neutral: ['cancel out', 'undo', 'deny', 'reverse'] },
  negates: { neutral: ['cancels out', 'undoes', 'denies'] },
  obfuscate: { neutral: ['confuse', 'hide', 'muddle', 'cloud'] },
  obfuscates: { neutral: ['confuses', 'hides', 'muddles'] },
  obviate: { neutral: ['prevent', 'avoid', 'eliminate'] },
  obviates: { neutral: ['prevents', 'avoids', 'eliminates'] },
  orchestrate: { neutral: ['organize', 'arrange', 'coordinate', 'plan'] },
  orchestrates: { neutral: ['organizes', 'arranges', 'coordinates'] },
  oscillate: { neutral: ['swing', 'go back and forth', 'shift', 'waver'] },
  oscillates: { neutral: ['swings', 'goes back and forth', 'shifts'] },
  permeate: { neutral: ['spread through', 'fill', 'soak into'] },
  permeates: { neutral: ['spreads through', 'fills'] },
  predicate: { neutral: ['base', 'found', 'build on'] },
  predicates: { neutral: ['bases', 'builds on'] },
  presuppose: { neutral: ['assume', 'take for granted', 'expect'] },
  presupposes: { neutral: ['assumes', 'takes for granted'] },
  promulgate: { neutral: ['announce', 'spread', 'promote', 'declare'] },
  promulgates: { neutral: ['announces', 'spreads', 'promotes'] },
  propagate: { neutral: ['spread', 'promote', 'pass on'] },
  propagates: { neutral: ['spreads', 'promotes', 'passes on'] },
  propel: { neutral: ['drive', 'push', 'move forward', 'fuel'] },
  propels: { neutral: ['drives', 'pushes', 'fuels'] },
  reiterate: { neutral: ['repeat', 'say again', 'restate'] },
  reiterates: { neutral: ['repeats', 'says again', 'restates'] },
  relegate: { neutral: ['push down', 'demote', 'assign'] },
  relegates: { neutral: ['pushes down', 'demotes', 'assigns'] },
  reverberate: { neutral: ['echo', 'ring out', 'resound'] },
  reverberates: { neutral: ['echoes', 'rings out'] },
  stipulate: { neutral: ['require', 'specify', 'set out', 'state'] },
  stipulates: { neutral: ['requires', 'specifies', 'sets out'] },
  surmise: { neutral: ['guess', 'assume', 'figure', 'suspect'] },
  surmises: { neutral: ['guesses', 'assumes', 'figures'] },
  synergize: { neutral: ['work together', 'combine', 'team up'] },
  synthesize: { neutral: ['combine', 'blend', 'merge', 'put together'] },
  synthesizes: { neutral: ['combines', 'blends', 'merges'] },
  tantalize: { neutral: ['tempt', 'tease', 'attract'] },
  tantalizes: { neutral: ['tempts', 'teases', 'attracts'] },
  vindicate: { neutral: ['justify', 'prove right', 'clear'] },
  vindicates: { neutral: ['justifies', 'proves right', 'clears'] },

  // ===== Common "fancy" nouns =====
  acumen: { neutral: ['skill', 'insight', 'ability', 'know-how'] },
  amalgamation: { neutral: ['mix', 'blend', 'combination', 'merger'] },
  anomaly: { neutral: ['oddity', 'exception', 'outlier', 'glitch'] },
  anomalies: { neutral: ['oddities', 'exceptions', 'outliers'] },
  antithesis: { neutral: ['opposite', 'reverse', 'contrast'] },
  archetype: { neutral: ['model', 'example', 'template', 'standard'] },
  archetypes: { neutral: ['models', 'examples', 'templates'] },
  benchmark: { neutral: ['standard', 'target', 'goal', 'reference point'] },
  benchmarks: { neutral: ['standards', 'targets', 'goals'] },
  bottleneck: { neutral: ['slowdown', 'obstacle', 'chokepoint', 'holdup'] },
  bottlenecks: { neutral: ['slowdowns', 'obstacles', 'holdups'] },
  breadth: { neutral: ['range', 'scope', 'width', 'extent'] },
  cadence: { neutral: ['rhythm', 'pace', 'flow', 'beat'] },
  caveat: { neutral: ['warning', 'catch', 'condition', 'note'] },
  caveats: { neutral: ['warnings', 'catches', 'conditions'] },
  conundrum: { neutral: ['puzzle', 'problem', 'dilemma', 'riddle'] },
  conundrums: { neutral: ['puzzles', 'problems', 'dilemmas'] },
  cornerstone: { neutral: ['foundation', 'base', 'key part', 'pillar'] },
  cornerstones: { neutral: ['foundations', 'pillars', 'key parts'] },
  culmination: { neutral: ['peak', 'result', 'climax', 'end point'] },
  detriment: { neutral: ['harm', 'damage', 'downside', 'disadvantage'] },
  disparity: { neutral: ['gap', 'difference', 'imbalance', 'inequality'] },
  disparities: { neutral: ['gaps', 'differences', 'imbalances'] },
  disposition: { neutral: ['tendency', 'nature', 'attitude', 'temperament'] },
  enigma: { neutral: ['mystery', 'puzzle', 'riddle'] },
  epitome: { neutral: ['perfect example', 'model', 'ideal'] },
  facet: { neutral: ['side', 'part', 'angle', 'aspect'] },
  facets: { neutral: ['sides', 'parts', 'angles', 'aspects'] },
  impetus: { neutral: ['push', 'motivation', 'drive', 'spark'] },
  implication: { neutral: ['effect', 'consequence', 'meaning', 'result'] },
  implications: { neutral: ['effects', 'consequences', 'results'] },
  infrastructure: { neutral: ['foundation', 'setup', 'framework', 'backbone'] },
  magnitude: { neutral: ['size', 'scale', 'extent', 'level'] },
  manifestation: { neutral: ['sign', 'expression', 'example', 'form'] },
  manifestations: { neutral: ['signs', 'expressions', 'examples'] },
  moniker: { neutral: ['name', 'title', 'label', 'nickname'] },
  nexus: { neutral: ['connection', 'link', 'center', 'hub'] },
  panacea: { neutral: ['cure-all', 'fix', 'solution', 'answer'] },
  paradox: { neutral: ['contradiction', 'puzzle', 'oddity'] },
  paradoxes: { neutral: ['contradictions', 'puzzles', 'oddities'] },
  pedagogy: { neutral: ['teaching', 'education', 'instruction'] },
  phenomenon: { neutral: ['event', 'occurrence', 'thing', 'trend'] },
  phenomena: { neutral: ['events', 'occurrences', 'trends'] },
  pinnacle: { neutral: ['peak', 'top', 'high point', 'height'] },
  precursor: { neutral: ['forerunner', 'early sign', 'predecessor'] },
  precursors: { neutral: ['forerunners', 'early signs', 'predecessors'] },
  prerequisite: { neutral: ['requirement', 'must-have', 'condition'] },
  prerequisites: { neutral: ['requirements', 'must-haves', 'conditions'] },
  proximity: { neutral: ['closeness', 'nearness', 'distance'] },
  quintessence: { neutral: ['essence', 'heart', 'core', 'perfect example'] },
  rationale: { neutral: ['reason', 'thinking', 'logic', 'explanation'] },
  repertoire: { neutral: ['range', 'collection', 'set', 'toolkit'] },
  repercussion: { neutral: ['consequence', 'effect', 'result', 'fallout'] },
  repercussions: { neutral: ['consequences', 'effects', 'results', 'fallout'] },
  resilience: { neutral: ['toughness', 'strength', 'grit', 'staying power'] },
  sentiment: { neutral: ['feeling', 'opinion', 'mood', 'view'] },
  sentiments: { neutral: ['feelings', 'opinions', 'moods', 'views'] },
  spectrum: { neutral: ['range', 'scale', 'spread', 'variety'] },
  stakeholder: { neutral: ['participant', 'party', 'interested person', 'player'] },
  stakeholders: { neutral: ['participants', 'parties', 'players'] },
  trajectory: { neutral: ['path', 'direction', 'course', 'trend'] },
  trajectories: { neutral: ['paths', 'directions', 'courses'] },
  underpinning: { neutral: ['foundation', 'basis', 'support', 'backbone'] },
  underpinnings: { neutral: ['foundations', 'bases', 'supports'] },
  zeitgeist: { neutral: ['spirit of the times', 'mood', 'trend', 'vibe'] },

  // ===== More common AI adjectives =====
  actionable: { neutral: ['practical', 'useful', 'doable'] },
  bespoke: { neutral: ['custom', 'tailored', 'made-to-order'] },
  compelling: { neutral: ['strong', 'convincing', 'powerful', 'engaging'] },
  contentious: { neutral: ['controversial', 'disputed', 'debated'] },
  deliberate: { neutral: ['intentional', 'planned', 'careful', 'on purpose'] },
  discrete: { neutral: ['separate', 'distinct', 'individual'] },
  dynamic: { neutral: ['active', 'changing', 'lively', 'energetic'] },
  exquisite: { neutral: ['beautiful', 'stunning', 'fine', 'lovely'] },
  feasible: { neutral: ['doable', 'possible', 'realistic', 'achievable'] },
  granular: { neutral: ['detailed', 'fine-grained', 'specific'] },
  imminent: { neutral: ['upcoming', 'about to happen', 'near', 'close'] },
  integral: { neutral: ['key', 'essential', 'central', 'core'] },
  judicious: { neutral: ['wise', 'careful', 'smart', 'sensible'] },
  meager: { neutral: ['small', 'thin', 'limited', 'scant'] },
  notable: { neutral: ['important', 'significant', 'worth mentioning', 'standout'] },
  noteworthy: { neutral: ['interesting', 'important', 'remarkable', 'significant'] },
  perpetual: { neutral: ['constant', 'ongoing', 'endless', 'nonstop'] },
  prevalent: { neutral: ['common', 'widespread', 'frequent'] },
  profound: { neutral: ['deep', 'major', 'significant', 'intense'] },
  prospective: { neutral: ['potential', 'possible', 'future', 'likely'] },
  rigorous: { neutral: ['strict', 'thorough', 'tough', 'demanding'] },
  seamless: { neutral: ['smooth', 'easy', 'effortless', 'fluid'] },
  seamlessly: { neutral: ['smoothly', 'easily', 'effortlessly'] },
  sophisticated: { neutral: ['advanced', 'complex', 'refined', 'polished'] },
  sustainable: { neutral: ['lasting', 'long-term', 'viable', 'maintainable'] },
  versatile: { neutral: ['flexible', 'adaptable', 'multi-purpose', 'all-around'] },
  viable: { neutral: ['workable', 'doable', 'practical', 'possible'] },

  // ===== Miscellaneous AI-favored words =====
  albeit: { neutral: ['although', 'even though', 'though', 'even if'] },
  amid: { neutral: ['in the middle of', 'during', 'among'] },
  amidst: { neutral: ['in the middle of', 'during', 'among'] },
  akin: { neutral: ['similar', 'like', 'comparable', 'close to'] },
  conclude: { neutral: ['end', 'finish', 'wrap up'] },
  concludes: { neutral: ['ends', 'finishes', 'wraps up'] },
  denote: { neutral: ['mean', 'show', 'indicate', 'represent'] },
  denotes: { neutral: ['means', 'shows', 'indicates'] },
  derive: { neutral: ['get', 'come from', 'draw'] },
  derives: { neutral: ['gets', 'comes from', 'draws'] },
  devise: { neutral: ['create', 'come up with', 'plan', 'think up'] },
  devises: { neutral: ['creates', 'comes up with', 'plans'] },
  entail: { neutral: ['involve', 'require', 'mean', 'include'] },
  entails: { neutral: ['involves', 'requires', 'means'] },
  evident: { neutral: ['clear', 'obvious', 'plain', 'apparent'] },
  hence: { neutral: ['so', 'therefore', 'that is why', 'because of this'] },
  hitherto: { neutral: ['until now', 'so far', 'up to this point'] },
  incur: { neutral: ['face', 'run into', 'take on', 'suffer'] },
  incurs: { neutral: ['faces', 'runs into', 'takes on'] },
  innate: { neutral: ['natural', 'built-in', 'inborn'] },
  notwithstanding: { neutral: ['despite', 'regardless of', 'even with'] },
  pertain: { neutral: ['relate', 'apply', 'be about'] },
  pertains: { neutral: ['relates', 'applies', 'is about'] },
  potent: { neutral: ['powerful', 'strong', 'effective'] },
  procure: { neutral: ['get', 'obtain', 'buy', 'acquire'] },
  procures: { neutral: ['gets', 'obtains', 'buys'] },
  purport: { neutral: ['claim', 'say', 'allege'] },
  purports: { neutral: ['claims', 'says', 'alleges'] },
  thereof: { neutral: ['of it', 'of that', 'of this'] },
  therein: { neutral: ['in it', 'in that', 'in this'] },
  thereby: { neutral: ['by doing so', 'in this way', 'as a result'] },
  vis: { neutral: ['compared to', 'regarding', 'about'] },
  wherein: { neutral: ['where', 'in which', 'inside which'] },
  whereby: { neutral: ['by which', 'through which', 'where'] },
  whilst: { neutral: ['while', 'as', 'during'] },
};

// ---------------------------------------------------------------------------
// AI phrase patterns → replacements (multi-word)
// ---------------------------------------------------------------------------

interface PhraseReplacement {
  pattern: RegExp;
  /** Replacements. Empty string = remove the phrase entirely. */
  neutral: string[];
  informal?: string[];
}

const PHRASE_REPLACEMENTS: PhraseReplacement[] = [
  {
    pattern: /\bit(?:'s| is) important to note that\b/gi,
    neutral: ['Worth pointing out,', 'One thing to keep in mind:', 'Note that'],
    informal: ["Here's the thing:", ''],
  },
  {
    pattern: /\bit(?:'s| is) worth mentioning that\b/gi,
    neutral: ['Also,', 'One more thing —', 'Note that'],
    informal: ['Oh, and', ''],
  },
  {
    pattern: /\bit(?:'s| is) worth noting that\b/gi,
    neutral: ['Note that', 'Keep in mind that', 'Also,'],
    informal: ["Here's the thing:", ''],
  },
  {
    pattern: /\bit(?:'s| is) essential to\b/gi,
    neutral: ['You need to', 'Make sure to', "It's key to"],
    informal: ["You've got to", "Don't skip"],
  },
  {
    pattern: /\bin today(?:'s| 's) (\w+)/gi,
    neutral: ['in the current $1', 'in modern $1', 'in the $1 we see now'],
  },
  {
    pattern: /\bplays a crucial role\b/gi,
    neutral: ['matters a lot', 'is a big deal', 'really counts', 'is important'],
  },
  {
    pattern: /\bplays a vital role\b/gi,
    neutral: ['is essential', 'matters a lot', 'is key'],
  },
  {
    pattern: /\bplays a significant role\b/gi,
    neutral: ['matters', 'is a big part of', 'has a major part'],
  },
  {
    pattern: /\bplays an important role\b/gi,
    neutral: ['matters', 'is a big part', 'is key'],
  },
  {
    pattern: /\bserves as a testament to\b/gi,
    neutral: ['shows', 'proves', 'is proof that', 'stands as proof of'],
  },
  {
    pattern: /\bin the realm of\b/gi,
    neutral: ['in', 'when it comes to', 'in the area of', 'in the world of'],
  },
  {
    pattern: /\bin the landscape of\b/gi,
    neutral: ['in', 'across', 'in the world of'],
  },
  {
    pattern: /\ba wide range of\b/gi,
    neutral: ['many', 'lots of', 'all sorts of', 'various'],
  },
  {
    pattern: /\ba wide variety of\b/gi,
    neutral: ['many', 'lots of', 'all kinds of', 'various'],
  },
  {
    pattern: /\ba myriad of\b/gi,
    neutral: ['many', 'countless', 'all kinds of', 'a range of'],
  },
  {
    pattern: /\bat the end of the day\b/gi,
    neutral: ['ultimately', 'when it comes down to it', 'in the end'],
  },
  {
    pattern: /\bon a daily basis\b/gi,
    neutral: ['every day', 'daily', 'day after day'],
  },
  {
    pattern: /\bon a regular basis\b/gi,
    neutral: ['regularly', 'often', 'frequently'],
  },
  {
    pattern: /\bin order to\b/gi,
    neutral: ['to', 'so that you can', 'for'],
  },
  {
    pattern: /\bdue to the fact that\b/gi,
    neutral: ['because', 'since', 'given that'],
  },
  {
    pattern: /\bin light of\b/gi,
    neutral: ['given', 'because of', 'considering'],
  },
  {
    pattern: /\bin light of the fact that\b/gi,
    neutral: ['since', 'because', 'given that'],
  },
  {
    pattern: /\bwith regard to\b/gi,
    neutral: ['about', 'regarding', 'when it comes to'],
  },
  {
    pattern: /\bwith regards to\b/gi,
    neutral: ['about', 'regarding', 'when it comes to'],
  },
  {
    pattern: /\bwith respect to\b/gi,
    neutral: ['about', 'regarding', 'for'],
  },
  {
    pattern: /\bin the context of\b/gi,
    neutral: ['in', 'for', 'when it comes to', 'with'],
  },
  {
    pattern: /\bfor the purpose of\b/gi,
    neutral: ['to', 'for', 'in order to'],
  },
  {
    pattern: /\bin the process of\b/gi,
    neutral: ['currently', 'busy', 'working on'],
  },
  {
    pattern: /\bas a matter of fact\b/gi,
    neutral: ['actually', 'in fact', 'really'],
  },
  {
    pattern: /\bby and large\b/gi,
    neutral: ['mostly', 'overall', 'for the most part'],
  },
  {
    pattern: /\bby virtue of\b/gi,
    neutral: ['because of', 'through', 'thanks to'],
  },
  {
    pattern: /\bin conjunction with\b/gi,
    neutral: ['with', 'along with', 'together with'],
  },
  {
    pattern: /\bin accordance with\b/gi,
    neutral: ['following', 'based on', 'per'],
  },
  {
    pattern: /\btake into consideration\b/gi,
    neutral: ['consider', 'think about', 'keep in mind'],
  },
  {
    pattern: /\btakes into consideration\b/gi,
    neutral: ['considers', 'thinks about', 'keeps in mind'],
  },
  {
    pattern: /\btaking into consideration\b/gi,
    neutral: ['considering', 'thinking about', 'keeping in mind'],
  },
  {
    pattern: /\btake into account\b/gi,
    neutral: ['consider', 'remember', 'factor in'],
  },
  {
    pattern: /\bmake use of\b/gi,
    neutral: ['use', 'work with'],
  },
  {
    pattern: /\bput into practice\b/gi,
    neutral: ['apply', 'use', 'try out'],
  },
  {
    pattern: /\ba testament to\b/gi,
    neutral: ['proof of', 'a sign of', 'evidence of'],
  },
  {
    pattern: /\ba plethora of\b/gi,
    neutral: ['lots of', 'plenty of', 'many', 'a bunch of'],
  },
  {
    pattern: /\bthe fact that\b/gi,
    neutral: ['that', 'how'],
  },
  {
    pattern: /\bit goes without saying\b/gi,
    neutral: ['obviously', 'clearly', 'of course'],
  },
  {
    pattern: /\bneedless to say\b/gi,
    neutral: ['obviously', 'of course', 'clearly'],
  },
  {
    pattern: /\bit should be noted that\b/gi,
    neutral: ['note that', 'keep in mind', 'remember'],
  },
  {
    pattern: /\bit can be argued that\b/gi,
    neutral: ['arguably', 'you could say', 'some think'],
  },
  {
    pattern: /\bin a nutshell\b/gi,
    neutral: ['basically', 'in short', 'to sum up'],
  },
  {
    pattern: /\bgoes hand in hand with\b/gi,
    neutral: ['works well with', 'pairs with', 'goes along with'],
  },
  {
    pattern: /\bon the cutting edge\b/gi,
    neutral: ['at the forefront', 'leading', 'ahead of the curve'],
  },
  {
    pattern: /\bstate of the art\b/gi,
    neutral: ['latest', 'top-of-the-line', 'best available', 'modern'],
  },
  {
    pattern: /\bstate-of-the-art\b/gi,
    neutral: ['latest', 'top-of-the-line', 'best available', 'modern'],
  },
  {
    pattern: /\bpave the way\b/gi,
    neutral: ['lead to', 'open the door', 'make room for', 'set the stage'],
  },
  {
    pattern: /\bpaves the way\b/gi,
    neutral: ['leads to', 'opens the door to', 'sets the stage for'],
  },
  {
    pattern: /\bthe landscape of\b/gi,
    neutral: ['the world of', 'the field of', ''],
  },
  {
    pattern: /\btip of the iceberg\b/gi,
    neutral: ['just the start', 'only the beginning', 'just a small part'],
  },
  {
    pattern: /\bfood for thought\b/gi,
    neutral: ['something to think about', 'worth considering'],
  },
  {
    pattern: /\bin this day and age\b/gi,
    neutral: ['today', 'now', 'these days'],
  },
  {
    pattern: /\beach and every\b/gi,
    neutral: ['every', 'all'],
  },
  {
    pattern: /\bfirst and foremost\b/gi,
    neutral: ['first', 'above all', 'most importantly'],
  },
  {
    pattern: /\blast but not least\b/gi,
    neutral: ['finally', 'and also', 'one more thing'],
  },
  {
    pattern: /\bthe bottom line is\b/gi,
    neutral: ['basically', 'the point is', 'what matters is'],
  },
];

// ---------------------------------------------------------------------------
// Contraction map
// ---------------------------------------------------------------------------

const CONTRACTIONS: Array<[RegExp, string]> = [
  [/\bdo not\b/gi, "don't"],
  [/\bdoes not\b/gi, "doesn't"],
  [/\bdid not\b/gi, "didn't"],
  [/\bis not\b/gi, "isn't"],
  [/\bare not\b/gi, "aren't"],
  [/\bwas not\b/gi, "wasn't"],
  [/\bwere not\b/gi, "weren't"],
  [/\bhas not\b/gi, "hasn't"],
  [/\bhave not\b/gi, "haven't"],
  [/\bhad not\b/gi, "hadn't"],
  [/\bwill not\b/gi, "won't"],
  [/\bwould not\b/gi, "wouldn't"],
  [/\bcould not\b/gi, "couldn't"],
  [/\bshould not\b/gi, "shouldn't"],
  [/\bcan not\b/gi, "can't"],
  [/\bcannot\b/gi, "can't"],
  [/\bit is\b/gi, "it's"],
  [/\bit has\b/gi, "it's"],
  [/\bthey are\b/gi, "they're"],
  [/\bthey have\b/gi, "they've"],
  [/\bthey will\b/gi, "they'll"],
  [/\bwe are\b/gi, "we're"],
  [/\bwe have\b/gi, "we've"],
  [/\bwe will\b/gi, "we'll"],
  [/\byou are\b/gi, "you're"],
  [/\byou have\b/gi, "you've"],
  [/\byou will\b/gi, "you'll"],
  [/\bI am\b/g, "I'm"],
  [/\bI have\b/g, "I've"],
  [/\bI will\b/g, "I'll"],
  [/\bI would\b/g, "I'd"],
  [/\bhe is\b/gi, "he's"],
  [/\bshe is\b/gi, "she's"],
  [/\bwho is\b/gi, "who's"],
  [/\bwho has\b/gi, "who's"],
  [/\bthat is\b/gi, "that's"],
  [/\bthat has\b/gi, "that's"],
  [/\bthere is\b/gi, "there's"],
  [/\bthere has\b/gi, "there's"],
  [/\bwhat is\b/gi, "what's"],
  [/\bwhere is\b/gi, "where's"],
  [/\blet us\b/gi, "let's"],
];

// ---------------------------------------------------------------------------
// Colloquial injections
// ---------------------------------------------------------------------------

const COLLOQUIAL_STARTERS = [
  'Honestly, ',
  'Look, ',
  "Here's the thing — ",
  'To be fair, ',
  'Truth is, ',
  'Real talk, ',
  'Frankly, ',
  'I mean, ',
  'Thing is, ',
  'No joke, ',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pickRandom<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

/**
 * Preserve the casing pattern of the original word when applying a replacement.
 */
function matchCase(original: string, replacement: string): string {
  if (!original || !replacement) return replacement;

  // ALL CAPS
  if (original === original.toUpperCase() && original.length > 1) {
    return replacement.toUpperCase();
  }

  // Title Case (first letter uppercase)
  if (original[0] === original[0].toUpperCase() && original.slice(1) === original.slice(1).toLowerCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  }

  return replacement;
}

// ---------------------------------------------------------------------------
// Main stage
// ---------------------------------------------------------------------------

const vocabularyNaturalize: HumanizationStage = {
  name: 'Vocabulary Naturalization',
  order: 2,

  process(text: string, config: ModeConfig): string {
    if (!text || !text.trim()) return text;

    const seed = hashCode(text);
    const rand = createSeededRandom(seed);
    const aggressiveness = config.vocabularyAggressiveness;
    let result = text;

    // ---- 1. Multi-word phrase replacements (do these first) ----
    for (const entry of PHRASE_REPLACEMENTS) {
      result = result.replace(entry.pattern, (match) => {
        if (rand() > aggressiveness) return match;

        const pool = config.preserveFormalTone
          ? entry.neutral
          : [...entry.neutral, ...(entry.informal ?? [])];

        const filteredPool = pool.filter((p) => p !== '');
        // 15% chance to just remove the phrase (use empty) if any empties exist
        const hasEmpty = pool.includes('');
        if (hasEmpty && rand() < 0.15) return '';

        if (filteredPool.length === 0) return match;

        const replacement = pickRandom(filteredPool, rand);
        // Try to match original casing
        if (/^[A-Z]/.test(match)) {
          return replacement.charAt(0).toUpperCase() + replacement.slice(1);
        }
        return replacement;
      });
    }

    // ---- 2. Single-word replacements ----
    // Build a single regex that matches any key in our map
    const wordKeys = Object.keys(WORD_REPLACEMENTS);
    // Sort by length descending so longer words match first
    wordKeys.sort((a, b) => b.length - a.length);

    for (const key of wordKeys) {
      const entry = WORD_REPLACEMENTS[key];
      // Escape hyphens for regex
      const escaped = key.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      const pattern = new RegExp(`\\b${escaped}\\b`, 'gi');

      result = result.replace(pattern, (match) => {
        if (rand() > aggressiveness) return match;

        const pool = config.preserveFormalTone
          ? entry.neutral
          : [...entry.neutral, ...(entry.informal ?? [])];

        if (pool.length === 0) return match;

        const replacement = pickRandom(pool, rand);
        return matchCase(match, replacement);
      });
    }

    // ---- 3. Add contractions (~60% of the time if !preserveFormalTone) ----
    if (!config.preserveFormalTone) {
      for (const [pattern, contraction] of CONTRACTIONS) {
        result = result.replace(pattern, (match) => {
          if (rand() < 0.6) {
            // Preserve sentence-initial casing
            if (/^[A-Z]/.test(match)) {
              return contraction.charAt(0).toUpperCase() + contraction.slice(1);
            }
            return contraction;
          }
          return match;
        });
      }
    }

    // ---- 4. Inject colloquialisms (if enabled) ----
    if (config.addColloquialisms) {
      const sentences = result.split(/(?<=[.!?])\s+/);
      const injected: string[] = [];

      for (let i = 0; i < sentences.length; i++) {
        // ~5% chance to prepend a colloquial starter
        if (rand() < 0.05 && sentences[i].length > 20) {
          const starter = pickRandom(COLLOQUIAL_STARTERS, rand);
          // Lowercase the sentence start
          const s = sentences[i];
          if (/^[A-Z]/.test(s) && !/^(I\b|[A-Z]{2,})/.test(s)) {
            injected.push(starter + s.charAt(0).toLowerCase() + s.slice(1));
          } else {
            injected.push(starter + s);
          }
        } else {
          injected.push(sentences[i]);
        }
      }

      result = injected.join(' ');
    }

    return result;
  },
};

export default vocabularyNaturalize;
