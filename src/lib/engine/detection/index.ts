/**
 * Detection engine barrel exports.
 *
 * Re-exports the main ensemble scorer and all individual detection modules.
 */

// Main detection function
export { detectAIContent } from './ensemble';

// Individual detection modules
export { default as perplexityModule } from './perplexity';
export { default as burstinessModule } from './burstiness';
export { default as vocabularyDiversityModule } from './vocabulary-diversity';
export { default as structuralPatternsModule } from './structural-patterns';
export { default as coherenceFlowModule } from './coherence-flow';
export { default as stylometricModule } from './stylometric';
export { default as statisticalSignatureModule } from './statistical-signature';

// Constants
export {
  AI_COMMON_WORDS,
  TRANSITION_PHRASES,
  HEDGING_PHRASES,
  POSITIVE_WORDS,
  NEGATIVE_WORDS,
} from './constants';
