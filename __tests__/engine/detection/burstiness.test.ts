import { describe, it, expect } from 'vitest';
import burstinessModule from '@/lib/engine/detection/burstiness';

describe('burstiness module', () => {
  it('scores uniform sentence lengths HIGH (close to 1 = AI)', () => {
    // All sentences ~20 words — uniform, AI-like
    const uniformText = [
      'The implementation of modern artificial intelligence systems requires careful consideration of multiple important factors and variables.',
      'Furthermore the development of sophisticated machine learning algorithms has demonstrated remarkable potential in numerous applications today.',
      'Additionally the comprehensive evaluation of these advanced technological approaches reveals significant improvements across many different metrics.',
      'Moreover the systematic analysis of large clinical datasets provides extremely valuable insights into overall treatment efficacy rates.',
      'Consequently the integration of these powerful computational tools represents a notable shift in current professional practice methods.',
    ].join(' ');

    const result = burstinessModule.analyze(uniformText);
    expect(result.score).toBeGreaterThan(0.5);
  });

  it('scores varied sentence lengths LOW (close to 0 = human)', () => {
    // Mix of very short and very long sentences — bursty, human-like
    const variedText = [
      'Wait.',
      'I just realized something really important that changes everything about how we should be thinking about this entire project and its implications for the future of our organization and all the stakeholders involved.',
      'No way.',
      'The thing is that when you actually sit down and carefully examine all the evidence from multiple different sources and perspectives you start to see patterns that were completely invisible before.',
      'Huh.',
      'So what happened next was absolutely incredible and nobody could have predicted it in a million years.',
      'Right.',
    ].join(' ');

    const result = burstinessModule.analyze(variedText);
    expect(result.score).toBeLessThan(0.5);
  });

  it('returns 0.5 for empty text (too few sentences)', () => {
    const result = burstinessModule.analyze('');
    expect(result.score).toBe(0.5);
  });

  it('returns 0.5 for single sentence (too few sentences)', () => {
    const result = burstinessModule.analyze('This is just one sentence with a few words.');
    expect(result.score).toBe(0.5);
  });

  it('returns a score between 0 and 1', () => {
    const text = 'First sentence here. Second one follows. Third sentence is the last.';
    const result = burstinessModule.analyze(text);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(1);
  });
});
