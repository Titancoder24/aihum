import { describe, it, expect } from 'vitest';
import { detectAIContent } from '@/lib/engine/detection';

const AI_TEXT = `The implementation of artificial intelligence in modern healthcare represents a multifaceted approach to improving patient outcomes. Furthermore, the integration of machine learning algorithms has demonstrated significant potential in diagnostic accuracy. It is important to delve into the various methodologies that underpin these technological advancements. Moreover, the systematic evaluation of these approaches reveals noteworthy improvements across multiple metrics. Additionally, the comprehensive analysis of clinical data provides valuable insights into treatment efficacy. In conclusion, the utilization of these sophisticated tools represents a paradigm shift in contemporary medical practice. Consequently, stakeholders must carefully consider the implications of widespread adoption.`;

const HUMAN_TEXT = `I went to the store yesterday. Grabbed some milk, bread, and eggs. The cashier was super nice — we chatted about the weather for a bit. It was raining. Not the kind of rain you hate, though. More like a soft drizzle that makes everything smell good. Anyway, I drove home and made an omelette. Pretty decent one, too.`;

describe('detectAIContent', () => {
  it('returns a DetectionResult with all required fields', () => {
    const result = detectAIContent(HUMAN_TEXT);
    expect(result).toHaveProperty('overallScore');
    expect(result).toHaveProperty('confidence');
    expect(result).toHaveProperty('sentences');
    expect(result).toHaveProperty('modules');
    expect(result).toHaveProperty('patterns');
    expect(result).toHaveProperty('wordCount');
    expect(result).toHaveProperty('processingTimeMs');
  });

  it('overallScore is between 0 and 100', () => {
    const result = detectAIContent(HUMAN_TEXT);
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.overallScore).toBeLessThanOrEqual(100);
  });

  it('each sentence has score, color, and text', () => {
    const result = detectAIContent(HUMAN_TEXT);
    for (const sentence of result.sentences) {
      expect(sentence).toHaveProperty('score');
      expect(sentence).toHaveProperty('color');
      expect(sentence).toHaveProperty('text');
      expect(typeof sentence.score).toBe('number');
      expect(['green', 'yellow', 'orange', 'red']).toContain(sentence.color);
      expect(sentence.text.length).toBeGreaterThan(0);
    }
  });

  it('modules array has 7 entries', () => {
    const result = detectAIContent(HUMAN_TEXT);
    expect(result.modules).toHaveLength(7);
  });

  it('AI-generated text scores higher than human text', () => {
    const aiResult = detectAIContent(AI_TEXT);
    const humanResult = detectAIContent(HUMAN_TEXT);
    expect(aiResult.overallScore).toBeGreaterThan(humanResult.overallScore);
  });

  it('handles empty string gracefully', () => {
    const result = detectAIContent('');
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.overallScore).toBeLessThanOrEqual(100);
    expect(result.sentences).toHaveLength(0);
    expect(result.modules).toHaveLength(7);
  });

  it('handles short text gracefully', () => {
    const result = detectAIContent('Hello world.');
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.overallScore).toBeLessThanOrEqual(100);
    expect(result.wordCount).toBeGreaterThan(0);
  });
});
