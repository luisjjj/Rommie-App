import { describe, it, expect } from 'vitest';
import { orderedPair } from '../src/utils/pair';
import { compareLifestyle } from '../src/utils/lifestyle';

describe('matching', () => {
  it('orders pairs deterministically to prevent duplicate matches', () => {
    expect(orderedPair('b', 'a')).toEqual(['a', 'b']);
    expect(orderedPair('a', 'b')).toEqual(['a', 'b']);
  });
});

describe('lifestyle comparison', () => {
  it('explains shared vs discuss topics without fake scores', () => {
    const { agree, discuss } = compareLifestyle(
      { cleanliness: 'Very tidy' },
      { cleanliness: 'Very tidy', noise_preference: 'Prefer quiet' },
    );
    expect(agree).toContain('Tidiness: Very tidy');
    expect(discuss).toEqual([]);
  });

  it('flags differing preferences as worth discussing', () => {
    const { agree, discuss } = compareLifestyle(
      { cleanliness: 'Very tidy' },
      { cleanliness: 'Relaxed' },
    );
    expect(agree).toEqual([]);
    expect(discuss.length).toBeGreaterThan(0);
  });
});
