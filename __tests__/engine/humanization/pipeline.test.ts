import { describe, it, expect } from 'vitest';
import { humanizeText } from '@/lib/engine/humanization';

const AI_PARAGRAPH = `The implementation of artificial intelligence in modern healthcare represents a multifaceted approach to improving patient outcomes. Furthermore, the integration of machine learning algorithms has demonstrated significant potential in diagnostic accuracy. It is important to delve into the various methodologies that underpin these technological advancements. Moreover, the systematic evaluation of these approaches reveals noteworthy improvements across multiple metrics. Additionally, the comprehensive analysis of clinical data provides valuable insights into treatment efficacy. In conclusion, the utilization of these sophisticated tools represents a paradigm shift in contemporary medical practice.`;

describe('humanizeText', () => {
  it('returns a HumanizationResult with all required fields', () => {
    const result = humanizeText(AI_PARAGRAPH, 'standard');
    expect(result).toHaveProperty('original');
    expect(result).toHaveProperty('humanized');
    expect(result).toHaveProperty('beforeScore');
    expect(result).toHaveProperty('afterScore');
    expect(result).toHaveProperty('mode');
    expect(result).toHaveProperty('changes');
    expect(result).toHaveProperty('stageResults');
    expect(result).toHaveProperty('processingTimeMs');
  });

  it('output text differs from input', () => {
    const result = humanizeText(AI_PARAGRAPH, 'standard');
    expect(result.humanized).not.toBe(result.original);
  });

  it('beforeScore and afterScore are numbers', () => {
    const result = humanizeText(AI_PARAGRAPH, 'standard');
    expect(typeof result.beforeScore).toBe('number');
    expect(typeof result.afterScore).toBe('number');
  });

  it('afterScore should be <= beforeScore (humanization reduces AI score)', () => {
    const result = humanizeText(AI_PARAGRAPH, 'standard');
    expect(result.afterScore).toBeLessThanOrEqual(result.beforeScore);
  });

  it('different modes produce different outputs', () => {
    const standard = humanizeText(AI_PARAGRAPH, 'standard');
    const creative = humanizeText(AI_PARAGRAPH, 'creative');
    // At minimum, the modes should be recorded differently
    expect(standard.mode).toBe('standard');
    expect(creative.mode).toBe('creative');
    // The humanized text should differ between modes
    expect(standard.humanized).not.toBe(creative.humanized);
  });

  it('processingTimeMs is positive', () => {
    const result = humanizeText(AI_PARAGRAPH, 'standard');
    expect(result.processingTimeMs).toBeGreaterThan(0);
  });

  it('handles empty string gracefully', () => {
    const result = humanizeText('', 'standard');
    expect(result.humanized).toBe('');
    expect(result.beforeScore).toBe(0);
    expect(result.afterScore).toBe(0);
    expect(result.changes).toEqual([]);
  });
});
