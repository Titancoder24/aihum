import { describe, it, expect } from 'vitest';
import {
  splitSentences,
  tokenizeWords,
  countSyllables,
  getSentenceLengths,
} from '@/lib/nlp/tokenizer';

describe('splitSentences', () => {
  it('splits normal multi-sentence text', () => {
    const text = 'The cat sat on the mat. The dog chased the ball. The bird flew away.';
    const result = splitSentences(text);
    expect(result).toHaveLength(3);
    expect(result[0]).toBe('The cat sat on the mat.');
    expect(result[1]).toBe('The dog chased the ball.');
    expect(result[2]).toBe('The bird flew away.');
  });

  it('handles abbreviations without splitting', () => {
    const text = 'Mr. Smith went to Washington. He met Dr. Jones there.';
    const result = splitSentences(text);
    expect(result).toHaveLength(2);
    expect(result[0]).toContain('Mr.');
    expect(result[1]).toContain('Dr.');
  });

  it('handles ellipses followed by a capital letter as a boundary', () => {
    const text = 'She hesitated... Then she spoke clearly.';
    const result = splitSentences(text);
    expect(result).toHaveLength(2);
    expect(result[0]).toContain('...');
    expect(result[1]).toContain('Then');
  });

  it('handles ellipses not followed by a capital letter as non-boundary', () => {
    const text = 'She hesitated... and then continued walking.';
    const result = splitSentences(text);
    expect(result).toHaveLength(1);
  });

  it('handles question marks', () => {
    const text = 'Is this a test? Yes it is.';
    const result = splitSentences(text);
    expect(result).toHaveLength(2);
    expect(result[0]).toBe('Is this a test?');
  });

  it('handles exclamation marks', () => {
    const text = 'What a surprise! I never expected that.';
    const result = splitSentences(text);
    expect(result).toHaveLength(2);
    expect(result[0]).toBe('What a surprise!');
  });

  it('returns single sentence as-is', () => {
    const text = 'Just one sentence here';
    const result = splitSentences(text);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe('Just one sentence here');
  });

  it('returns empty array for empty string', () => {
    expect(splitSentences('')).toEqual([]);
  });

  it('returns empty array for whitespace-only string', () => {
    expect(splitSentences('   ')).toEqual([]);
  });
});

describe('tokenizeWords', () => {
  it('tokenizes contractions as single tokens', () => {
    const result = tokenizeWords("I can't believe it's working");
    expect(result).toContain("can't");
    expect(result).toContain("it's");
  });

  it('splits hyphenated words into separate tokens', () => {
    const result = tokenizeWords('well-known self-driving car');
    expect(result).toContain('well');
    expect(result).toContain('known');
    expect(result).toContain('self');
    expect(result).toContain('driving');
    expect(result).toContain('car');
  });

  it('strips punctuation from words', () => {
    const result = tokenizeWords('Hello, world! How are you?');
    expect(result).toContain('Hello');
    expect(result).toContain('world');
    expect(result).not.toContain('world!');
    expect(result).not.toContain('Hello,');
  });

  it('returns empty array for empty string', () => {
    expect(tokenizeWords('')).toEqual([]);
  });

  it('returns empty array for whitespace-only string', () => {
    expect(tokenizeWords('   ')).toEqual([]);
  });
});

describe('countSyllables', () => {
  it('counts syllables for "hello" as 2', () => {
    expect(countSyllables('hello')).toBe(2);
  });

  it('counts syllables for "world" as 1', () => {
    expect(countSyllables('world')).toBe(1);
  });

  it('counts syllables for "beautiful" as 3', () => {
    expect(countSyllables('beautiful')).toBe(3);
  });

  it('returns 0 for empty string', () => {
    expect(countSyllables('')).toBe(0);
  });

  it('returns at least 1 for any real word', () => {
    expect(countSyllables('a')).toBeGreaterThanOrEqual(1);
    expect(countSyllables('the')).toBeGreaterThanOrEqual(1);
  });
});

describe('getSentenceLengths', () => {
  it('returns correct word counts per sentence', () => {
    const text = 'I am here. The quick brown fox jumps.';
    const lengths = getSentenceLengths(text);
    expect(lengths).toHaveLength(2);
    expect(lengths[0]).toBe(3); // I am here
    expect(lengths[1]).toBe(5); // The quick brown fox jumps
  });

  it('returns empty array for empty string', () => {
    expect(getSentenceLengths('')).toEqual([]);
  });
});
