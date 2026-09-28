import { describe, expect, it } from 'vitest';

import {
  getCategoryAccentIndex,
  getCategoryPace,
  getCategoryProgress,
  getEvenPace,
  getSpendingBarSegments,
  stableHash,
} from './categoryPresentation';

describe('stableHash', () => {
  it('matches the published 32-bit FNV-1a vectors', () => {
    expect(stableHash('')).toBe(0x811c9dc5);
    expect(stableHash('a')).toBe(0xe40c292c);
    expect(stableHash('foobar')).toBe(0xbf9cf968);
  });

  it('hashes code points rather than UTF-16 units', () => {
    expect(stableHash('😀')).toBe(105948959);
  });
});

describe('getCategoryAccentIndex', () => {
  it('maps an ID to a stable accent between 1 and 10', () => {
    expect(getCategoryAccentIndex('a')).toBe(1);
    expect(getCategoryAccentIndex('')).toBe(2);
    expect(getCategoryAccentIndex('😀')).toBe(10);
    expect(getCategoryAccentIndex('c-groc')).toBe(5);
  });

  it('stays within range for real-looking IDs', () => {
    const ids = Array.from(
      { length: 200 },
      (_, i) => `4f1c0d2e-${i.toString(16).padStart(4, '0')}-4a6b-9c1d`,
    );
    const indexes = ids.map(getCategoryAccentIndex);
    for (const index of indexes) {
      expect(index).toBeGreaterThanOrEqual(1);
      expect(index).toBeLessThanOrEqual(10);
    }
    expect(new Set(indexes).size).toBe(10);
    expect(ids.map(getCategoryAccentIndex)).toEqual(indexes);
  });
});

describe('getCategoryProgress', () => {
  it('shows the share of the starting money spent', () => {
    // Groceries: assigned 600, spent 240, 360 left.
    expect(getCategoryProgress({ activity: -24000, available: 36000 })).toEqual(
      { spent: 24000, fill: 0.4, isOverspent: false, percent: 40 },
    );
  });

  it('includes carried-in money in the starting amount', () => {
    // 100 carried in + 200 assigned, 150 spent, 150 left.
    expect(getCategoryProgress({ activity: -15000, available: 15000 })).toEqual(
      { spent: 15000, fill: 0.5, isOverspent: false, percent: 50 },
    );
  });

  it('rounds the percentage label', () => {
    expect(getCategoryProgress({ activity: -1000, available: 2000 })).toEqual({
      spent: 1000,
      fill: 1 / 3,
      isOverspent: false,
      percent: 33,
    });
  });

  it('is full but not overspent when exactly used up', () => {
    expect(getCategoryProgress({ activity: -180000, available: 0 })).toEqual({
      spent: 180000,
      fill: 1,
      isOverspent: false,
      percent: 100,
    });
  });

  it('is full and overspent when spending pushed Available negative', () => {
    expect(getCategoryProgress({ activity: -30000, available: -5000 })).toEqual(
      { spent: 30000, fill: 1, isOverspent: true, percent: null },
    );
  });

  it('is empty when a negative balance carried in without spending', () => {
    expect(getCategoryProgress({ activity: 0, available: -5000 })).toEqual({
      spent: 0,
      fill: 0,
      isOverspent: false,
      percent: null,
    });
  });

  it('treats a net refund as no spending', () => {
    expect(getCategoryProgress({ activity: 2500, available: 12500 })).toEqual({
      spent: 0,
      fill: 0,
      isOverspent: false,
      percent: null,
    });
    expect(getCategoryProgress({ activity: 2500, available: -100 })).toEqual({
      spent: 0,
      fill: 0,
      isOverspent: false,
      percent: null,
    });
  });

  it('nets partial refunds against spending', () => {
    // Spent 100, refunded 20: net activity −80, 20 left.
    expect(getCategoryProgress({ activity: -8000, available: 2000 })).toEqual({
      spent: 8000,
      fill: 0.8,
      isOverspent: false,
      percent: 80,
    });
  });

  it('is empty for a zero allocation or an empty month', () => {
    expect(getCategoryProgress({ activity: 0, available: 0 })).toEqual({
      spent: 0,
      fill: 0,
      isOverspent: false,
      percent: null,
    });
    expect(getCategoryProgress({ activity: 0, available: 70000 })).toEqual({
      spent: 0,
      fill: 0,
      isOverspent: false,
      percent: null,
    });
  });
});

describe('getEvenPace', () => {
  it('spreads the starting money evenly over the month', () => {
    expect(getEvenPace(30000, 10, 30)).toBe(10000);
    expect(getEvenPace(30000, 30, 30)).toBe(30000);
  });

  it('has no pace line without starting money', () => {
    expect(getEvenPace(0, 10, 30)).toBeNull();
    expect(getEvenPace(-5000, 10, 30)).toBeNull();
  });
});

describe('getCategoryPace', () => {
  const month = '2026-09';

  it('builds the current month series up to today', () => {
    const pace = getCategoryPace({
      month,
      today: '2026-09-05',
      start: 30000,
      available: 22000,
      transactions: [
        { date: '2026-09-02', amount: -5000 },
        { date: '2026-09-02', amount: -1000 },
        { date: '2026-09-04', amount: -2000 },
        // After today and outside the month: ignored.
        { date: '2026-09-20', amount: -9000 },
        { date: '2026-08-31', amount: -9000 },
      ],
    });
    expect(pace).toMatchObject({
      kind: 'current',
      days: 30,
      upto: 5,
      start: 30000,
      series: [0, 6000, 6000, 8000, 8000],
      spent: 8000,
      hasPaceLine: true,
    });
    // Even pace by day 5 is 5000, so 3000 over.
    expect(pace.summary).toEqual({ type: 'over-pace', amount: 3000 });
  });

  it('reports under even pace and rounds to whole cents', () => {
    const pace = getCategoryPace({
      month,
      today: '2026-09-10',
      start: 10000,
      available: 9000,
      transactions: [{ date: '2026-09-01', amount: -1000 }],
    });
    // 10000 × 10 / 30 = 3333.33…, minus 1000 spent.
    expect(pace.summary).toEqual({ type: 'under-pace', amount: 2333 });
  });

  it('lets refunds reduce the cumulative outflow', () => {
    const pace = getCategoryPace({
      month,
      today: '2026-09-03',
      start: 30000,
      available: 27000,
      transactions: [
        { date: '2026-09-01', amount: -5000 },
        { date: '2026-09-03', amount: 2000 },
      ],
    });
    expect(pace.series).toEqual([5000, 5000, 3000]);
    expect(pace.spent).toBe(3000);
    expect(pace.summary).toEqual({ type: 'under-pace', amount: 0 });
  });

  it('reports no activity in the current month without transactions', () => {
    const pace = getCategoryPace({
      month,
      today: '2026-09-12',
      start: 30000,
      available: 30000,
      transactions: [],
    });
    expect(pace.series).toHaveLength(12);
    expect(pace.series.every(value => value === 0)).toBe(true);
    expect(pace.summary).toEqual({ type: 'no-activity' });
  });

  it('summarises a finished month with money left', () => {
    const pace = getCategoryPace({
      month: '2026-02',
      today: '2026-09-12',
      start: 28000,
      available: 4000,
      transactions: [
        { date: '2026-02-01', amount: -10000 },
        { date: '2026-02-28', amount: -14000 },
      ],
    });
    expect(pace).toMatchObject({
      kind: 'past',
      days: 28,
      upto: 28,
      spent: 24000,
      hasPaceLine: true,
    });
    expect(pace.series[0]).toBe(10000);
    expect(pace.series[27]).toBe(24000);
    expect(pace.summary).toEqual({ type: 'finished-left', amount: 4000 });
  });

  it('summarises an overspent finished month from Available', () => {
    const pace = getCategoryPace({
      month: '2026-08',
      today: '2026-09-12',
      start: 10000,
      available: -2500,
      transactions: [{ date: '2026-08-15', amount: -12500 }],
    });
    expect(pace.days).toBe(31);
    expect(pace.summary).toEqual({ type: 'finished-overspent', amount: 2500 });
  });

  it('shows only the money to spend for a future month', () => {
    const pace = getCategoryPace({
      month: '2026-10',
      today: '2026-09-12',
      start: 45000,
      available: 45000,
      transactions: [{ date: '2026-10-01', amount: -1000 }],
    });
    expect(pace).toMatchObject({
      kind: 'future',
      upto: 0,
      series: [],
      spent: 0,
      hasPaceLine: true,
    });
    expect(pace.summary).toEqual({
      type: 'to-spend',
      amount: 45000,
      month: '2026-10',
    });
  });

  it('never offers a negative amount to spend in a future month', () => {
    const pace = getCategoryPace({
      month: '2026-10',
      today: '2026-09-12',
      start: -3000,
      available: -3000,
      transactions: [],
    });
    expect(pace.hasPaceLine).toBe(false);
    expect(pace.summary).toEqual({
      type: 'to-spend',
      amount: 0,
      month: '2026-10',
    });
  });

  it('has no pace line when nothing was assigned or carried in', () => {
    for (const start of [0, -5000]) {
      const pace = getCategoryPace({
        month,
        today: '2026-09-12',
        start,
        available: start - 2000,
        transactions: [{ date: '2026-09-03', amount: -2000 }],
      });
      expect(pace.hasPaceLine).toBe(false);
      expect(pace.summary).toEqual({ type: 'no-pace-line' });
    }
  });

  it('still reports the result of a finished month with nothing assigned', () => {
    const pace = getCategoryPace({
      month: '2026-08',
      today: '2026-09-12',
      start: 0,
      available: -4000,
      transactions: [{ date: '2026-08-09', amount: -4000 }],
    });
    expect(pace.hasPaceLine).toBe(false);
    expect(pace.series[30]).toBe(4000);
    expect(pace.summary).toEqual({ type: 'finished-overspent', amount: 4000 });
  });
});

describe('getSpendingBarSegments', () => {
  it('shows the six largest spenders, other spending, then unspent money', () => {
    const segments = getSpendingBarSegments({
      assigned: 500000,
      categories: [
        { id: 'a', activity: -1000 },
        { id: 'b', activity: -7000 },
        { id: 'c', activity: -3000 },
        { id: 'd', activity: -6000 },
        { id: 'e', activity: -5000 },
        { id: 'f', activity: -4000 },
        { id: 'g', activity: -2000 },
        { id: 'h', activity: -8000 },
        { id: 'refund', activity: 4000 },
        { id: 'empty', activity: 0 },
      ],
    });
    expect(segments).toEqual([
      { type: 'category', categoryId: 'h', value: 8000 },
      { type: 'category', categoryId: 'b', value: 7000 },
      { type: 'category', categoryId: 'd', value: 6000 },
      { type: 'category', categoryId: 'e', value: 5000 },
      { type: 'category', categoryId: 'f', value: 4000 },
      { type: 'category', categoryId: 'c', value: 3000 },
      { type: 'other', value: 3000 },
      { type: 'unspent', value: 464000 },
    ]);
  });

  it('omits unspent money when spending exceeds the assigned total', () => {
    expect(
      getSpendingBarSegments({
        assigned: 1000,
        categories: [{ id: 'a', activity: -3000 }],
      }),
    ).toEqual([{ type: 'category', categoryId: 'a', value: 3000 }]);
  });

  it('is only unspent money in an empty month', () => {
    expect(
      getSpendingBarSegments({ assigned: 420000, categories: [] }),
    ).toEqual([{ type: 'unspent', value: 420000 }]);
    expect(getSpendingBarSegments({ assigned: 0, categories: [] })).toEqual([]);
  });
});
