/**
 * Humanization engine — barrel exports.
 */

// Pipeline orchestrator
export { humanizeText } from './pipeline';

// Mode config helpers
export { getModeConfig, MODE_CONFIGS } from './modes';

// Individual stages
export { default as sentenceRestructure } from './sentence-restructure';
export { default as vocabularyNaturalize } from './vocabulary-naturalize';
export { default as discourseDiversify } from './discourse-diversify';
export { default as rhythmInjection } from './rhythm-injection';
export { default as coherenceHumanize } from './coherence-humanize';
export { default as paragraphRestructure } from './paragraph-restructure';
export { default as statisticalDisrupt } from './statistical-disrupt';
