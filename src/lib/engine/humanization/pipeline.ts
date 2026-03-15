/**
 * Humanization Pipeline Orchestrator
 *
 * Runs text through all 7 humanization stages sequentially, measures
 * AI detection scores before and after, and iterates if the score
 * remains above the mode's target threshold.
 */

import type {
  HumanizationMode,
  HumanizationResult,
  HumanizationStage,
  StageResult,
  TextChange,
} from '@/types';

import { getModeConfig } from './modes';
import { detectAIContent } from '@/lib/engine/detection';

// Import all 7 stages
import sentenceRestructure from './sentence-restructure';
import vocabularyNaturalize from './vocabulary-naturalize';
import discourseDiversify from './discourse-diversify';
import rhythmInjection from './rhythm-injection';
import coherenceHumanize from './coherence-humanize';
import paragraphRestructure from './paragraph-restructure';
import statisticalDisrupt from './statistical-disrupt';

// ---------------------------------------------------------------------------
// All stages, sorted by order
// ---------------------------------------------------------------------------

const ALL_STAGES: HumanizationStage[] = [
  sentenceRestructure,
  vocabularyNaturalize,
  discourseDiversify,
  rhythmInjection,
  coherenceHumanize,
  paragraphRestructure,
  statisticalDisrupt,
].sort((a, b) => a.order - b.order);

// Retry stages: stages 1, 4, 7 for iterative refinement
const RETRY_STAGES: HumanizationStage[] = ALL_STAGES.filter(
  (s) => s.order === 1 || s.order === 4 || s.order === 7,
);

// ---------------------------------------------------------------------------
// Text diffing — extract TextChanges between two strings
// ---------------------------------------------------------------------------

/**
 * Compare input and output text to extract a list of TextChanges.
 * Uses a simple word-level diff to identify changed segments.
 */
function extractChanges(input: string, output: string, stageName: string): TextChange[] {
  const changes: TextChange[] = [];

  if (input === output) return changes;

  const inputWords = input.split(/(\s+)/);
  const outputWords = output.split(/(\s+)/);

  let iIdx = 0;
  let oIdx = 0;
  let inputPos = 0;

  while (iIdx < inputWords.length && oIdx < outputWords.length) {
    if (inputWords[iIdx] === outputWords[oIdx]) {
      inputPos += inputWords[iIdx].length;
      iIdx++;
      oIdx++;
    } else {
      // Find the next matching point
      const originalStart = iIdx;
      const replacementStart = oIdx;

      // Look ahead in output for the next match with input
      let foundMatch = false;
      for (let lookAhead = 1; lookAhead < 20 && !foundMatch; lookAhead++) {
        // Try advancing input
        if (iIdx + lookAhead < inputWords.length) {
          for (let j = oIdx; j < Math.min(oIdx + 20, outputWords.length); j++) {
            if (inputWords[iIdx + lookAhead] === outputWords[j]) {
              const originalText = inputWords.slice(originalStart, iIdx + lookAhead).join('');
              const replacementText = outputWords.slice(replacementStart, j).join('');
              if (originalText.trim() || replacementText.trim()) {
                changes.push({
                  original: originalText,
                  replacement: replacementText,
                  stage: stageName,
                  position: inputPos,
                });
              }
              inputPos += originalText.length;
              iIdx = iIdx + lookAhead;
              oIdx = j;
              foundMatch = true;
              break;
            }
          }
        }
      }

      if (!foundMatch) {
        // No match found nearby — record the remaining difference and break
        const originalText = inputWords.slice(originalStart).join('');
        const replacementText = outputWords.slice(replacementStart).join('');
        if (originalText !== replacementText) {
          changes.push({
            original: originalText,
            replacement: replacementText,
            stage: stageName,
            position: inputPos,
          });
        }
        break;
      }
    }
  }

  // Handle remaining words in either side
  if (iIdx < inputWords.length || oIdx < outputWords.length) {
    const remaining = inputWords.slice(iIdx).join('');
    const outputRemaining = outputWords.slice(oIdx).join('');
    if (remaining !== outputRemaining && (remaining.trim() || outputRemaining.trim())) {
      changes.push({
        original: remaining,
        replacement: outputRemaining,
        stage: stageName,
        position: inputPos,
      });
    }
  }

  return changes;
}

// ---------------------------------------------------------------------------
// Pipeline orchestrator
// ---------------------------------------------------------------------------

/**
 * Run the full humanization pipeline on the provided text.
 *
 * 1. Loads mode configuration
 * 2. Runs all 7 stages sequentially
 * 3. Checks AI detection score; re-runs stages 1, 4, 7 if above threshold
 * 4. Returns complete HumanizationResult with timing and change tracking
 */
export function humanizeText(
  text: string,
  mode: HumanizationMode,
): HumanizationResult {
  const startTime = performance.now();
  const config = getModeConfig(mode);

  // Edge case: empty or whitespace-only text
  if (!text || !text.trim()) {
    return {
      original: text,
      humanized: text,
      beforeScore: 0,
      afterScore: 0,
      mode,
      changes: [],
      stageResults: [],
      processingTimeMs: 0,
    };
  }

  const allStageResults: StageResult[] = [];
  const allChanges: TextChange[] = [];
  let currentText = text;

  // --- Initial pass: run all 7 stages ---
  for (const stage of ALL_STAGES) {
    const inputText = currentText;
    const outputText = stage.process(inputText, config);

    const changes = extractChanges(inputText, outputText, stage.name);
    allChanges.push(...changes);

    allStageResults.push({
      stageName: stage.name,
      inputText,
      outputText,
      changesCount: changes.length,
    });

    currentText = outputText;
  }

  // --- Detection scoring ---
  const afterDetection = detectAIContent(currentText);
  let afterScore = afterDetection.overallScore;

  // --- Iterative refinement if score is still too high ---
  let iterationsRemaining = config.maxIterations - 1;

  while (afterScore > config.targetScoreThreshold && iterationsRemaining > 0) {
    iterationsRemaining--;

    for (const stage of RETRY_STAGES) {
      const inputText = currentText;
      const outputText = stage.process(inputText, config);

      const changes = extractChanges(inputText, outputText, `${stage.name} (retry)`);
      allChanges.push(...changes);

      allStageResults.push({
        stageName: `${stage.name} (retry)`,
        inputText,
        outputText,
        changesCount: changes.length,
      });

      currentText = outputText;
    }

    const recheck = detectAIContent(currentText);
    afterScore = recheck.overallScore;
  }

  // --- Before score (run detection on original) ---
  const beforeDetection = detectAIContent(text);

  const processingTimeMs = performance.now() - startTime;

  return {
    original: text,
    humanized: currentText,
    beforeScore: beforeDetection.overallScore,
    afterScore,
    mode,
    changes: allChanges,
    stageResults: allStageResults,
    processingTimeMs,
  };
}
