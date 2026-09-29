import { describe, expect, it } from 'vitest';

import { firstGrapheme, getRailInitials } from './railInitials';

describe('firstGrapheme', () => {
  it('returns the first letter, upper-cased', () => {
    expect(firstGrapheme('  ally savings')).toBe('A');
  });

  it('keeps a multi-code-point character whole', () => {
    expect(firstGrapheme('👩‍👩‍👧 Family')).toBe('👩‍👩‍👧');
  });

  it('returns a placeholder for an empty name', () => {
    expect(firstGrapheme('   ')).toBe('?');
  });
});

describe('getRailInitials', () => {
  it('keeps one letter when no other name shares it', () => {
    expect(getRailInitials(['Bank of America', 'Ally Savings'])).toEqual([
      'B',
      'A',
    ]);
  });

  it('uses the first letters of two words when first letters collide', () => {
    // The demo budget: HSBC and House Asset both start with H.
    expect(
      getRailInitials(['Bank of America', 'HSBC', 'House Asset', 'Roth IRA']),
    ).toEqual(['B', 'HS', 'HA', 'R']);
  });

  it('uses the first two letters of a one-word name', () => {
    expect(getRailInitials(['Mortgage', 'Money Market'])).toEqual(['MO', 'MM']);
  });

  it('falls back to position when two letters still collide', () => {
    expect(getRailInitials(['Chase Checking', 'Chase Credit', 'Cash'])).toEqual(
      ['C1', 'C2', 'CA'],
    );
  });

  it('falls back to position for a one-letter name', () => {
    expect(getRailInitials(['X', 'Xero'])).toEqual(['X1', 'XE']);
  });

  it('ignores case when comparing', () => {
    expect(getRailInitials(['visa', 'Vanguard'])).toEqual(['VI', 'VA']);
  });
});
