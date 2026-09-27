// Display-only helpers for the redesigned budget (design-decisions §7).
// They read amounts the app already calculates and never feed a saved value
// or a financial total.
import * as monthUtils from '@actual-app/core/shared/months';
import type { IntegerAmount } from '@actual-app/core/shared/util';

export const CATEGORY_ACCENT_COUNT = 10;

/** 32-bit FNV-1a over the string's code points. */
export function stableHash(value: string): number {
  let hash = 2166136261;
  for (const char of value) {
    hash = Math.imul(hash ^ (char.codePointAt(0) ?? 0), 16777619);
  }
  return hash >>> 0;
}

/**
 * The 1-based `categoryAccentN` theme role for a category. Derived from the
 * ID alone, so it is stable across sessions and nothing is stored.
 */
export function getCategoryAccentIndex(categoryId: string): number {
  return (stableHash(categoryId) % CATEGORY_ACCENT_COUNT) + 1;
}

export type CategoryProgress = {
  /** This month's outflow net of refunds; never negative. */
  spent: IntegerAmount;
  /** Bar fill between 0 and 1. */
  fill: number;
  /** Spending pushed Available below zero: full bar in the negative color. */
  isOverspent: boolean;
  /**
   * Whole-number percentage for the label, or null when the label is
   * "Over" (overspent) or blank (nothing spent).
   */
  percent: number | null;
};

/** Activity progress bar (design-decisions §7.1). */
export function getCategoryProgress({
  activity,
  available,
}: {
  activity: IntegerAmount;
  available: IntegerAmount;
}): CategoryProgress {
  const spent = Math.max(0, -activity);

  if (available < 0) {
    // Negative Available with no spending this month leaves the bar empty;
    // the Available pill carries the warning.
    return spent > 0
      ? { spent, fill: 1, isOverspent: true, percent: null }
      : { spent, fill: 0, isOverspent: false, percent: null };
  }

  const start = spent + available;
  const fill = start > 0 && spent > 0 ? spent / start : 0;
  return {
    spent,
    fill,
    isOverspent: false,
    percent: spent > 0 ? Math.round(fill * 100) : null,
  };
}

export type PaceMonthKind = 'past' | 'current' | 'future';

export type PaceSummary =
  | { type: 'to-spend'; amount: IntegerAmount; month: string }
  | { type: 'no-pace-line' }
  | { type: 'no-activity' }
  | { type: 'finished-left'; amount: IntegerAmount }
  | { type: 'finished-overspent'; amount: IntegerAmount }
  | { type: 'under-pace'; amount: IntegerAmount }
  | { type: 'over-pace'; amount: IntegerAmount };

export type CategoryPace = {
  kind: PaceMonthKind;
  days: number;
  /** Last day the spending series covers: today, the month end, or 0. */
  upto: number;
  /** Money at the start of the month (carried in + assigned). */
  start: IntegerAmount;
  /** Cumulative outflow at the end of each day 1..upto (refunds reduce it). */
  series: IntegerAmount[];
  /** Outflow up to and including `upto`. */
  spent: IntegerAmount;
  hasPaceLine: boolean;
  summary: PaceSummary;
};

export type PaceTransaction = {
  /** `yyyy-MM-dd` */
  date: string;
  amount: IntegerAmount;
};

/** Even-pace spending by the end of `day`, or null without a pace line. */
export function getEvenPace(
  start: IntegerAmount,
  day: number,
  days: number,
): number | null {
  return start > 0 ? (start * day) / days : null;
}

/** Pace chart data and summary (design-decisions §7.2). */
export function getCategoryPace({
  month,
  today,
  start,
  available,
  transactions,
}: {
  /** `yyyy-MM` */
  month: string;
  /** `yyyy-MM-dd` */
  today: string;
  start: IntegerAmount;
  /** The category's Available for the month, used for past-month summaries. */
  available: IntegerAmount;
  /** The category's transactions for the month from the existing query. */
  transactions: PaceTransaction[];
}): CategoryPace {
  const days = monthUtils.getDay(monthUtils.getMonthEnd(month));
  const todayMonth = monthUtils.getMonth(today);
  const kind: PaceMonthKind =
    month < todayMonth ? 'past' : month > todayMonth ? 'future' : 'current';
  const upto =
    kind === 'past' ? days : kind === 'current' ? monthUtils.getDay(today) : 0;

  const outflowByDay = new Array<number>(days).fill(0);
  let inRangeCount = 0;
  for (const transaction of transactions) {
    if (monthUtils.getMonth(transaction.date) !== month) {
      continue;
    }
    const day = monthUtils.getDay(transaction.date);
    if (day > upto) {
      continue;
    }
    outflowByDay[day - 1] -= transaction.amount;
    inRangeCount++;
  }

  const series: IntegerAmount[] = [];
  let spent = 0;
  for (let i = 0; i < upto; i++) {
    spent += outflowByDay[i];
    series.push(spent);
  }

  const hasPaceLine = start > 0;
  let summary: PaceSummary;
  if (kind === 'future') {
    summary = { type: 'to-spend', amount: Math.max(0, start), month };
  } else if (!hasPaceLine) {
    summary = { type: 'no-pace-line' };
  } else if (kind === 'current' && inRangeCount === 0) {
    summary = { type: 'no-activity' };
  } else if (kind === 'past') {
    summary =
      available >= 0
        ? { type: 'finished-left', amount: available }
        : { type: 'finished-overspent', amount: -available };
  } else {
    const difference = Math.round((start * upto) / days - spent);
    summary =
      difference >= 0
        ? { type: 'under-pace', amount: difference }
        : { type: 'over-pace', amount: -difference };
  }

  return { kind, days, upto, start, series, spent, hasPaceLine, summary };
}

export type SpendingBarSegment =
  | { type: 'category'; categoryId: string; value: IntegerAmount }
  | { type: 'other'; value: IntegerAmount }
  | { type: 'unspent'; value: IntegerAmount };

export const SPENDING_BAR_CATEGORY_LIMIT = 6;

/**
 * Month summary stacked bar (design-decisions §7.4): the six largest
 * positive-spend categories, remaining spending as one segment, then
 * unspent assigned money. Zero-width segments are omitted.
 */
export function getSpendingBarSegments({
  assigned,
  categories,
}: {
  assigned: IntegerAmount;
  categories: Array<{ id: string; activity: IntegerAmount }>;
}): SpendingBarSegment[] {
  const spending = categories
    .map(({ id, activity }) => ({ categoryId: id, value: -activity }))
    .filter(({ value }) => value > 0)
    .sort((a, b) => b.value - a.value);

  const segments: SpendingBarSegment[] = spending
    .slice(0, SPENDING_BAR_CATEGORY_LIMIT)
    .map(({ categoryId, value }) => ({ type: 'category', categoryId, value }));

  const other = spending
    .slice(SPENDING_BAR_CATEGORY_LIMIT)
    .reduce((total, { value }) => total + value, 0);
  if (other > 0) {
    segments.push({ type: 'other', value: other });
  }

  const spent = spending.reduce((total, { value }) => total + value, 0);
  const unspent = Math.max(0, assigned - spent);
  if (unspent > 0) {
    segments.push({ type: 'unspent', value: unspent });
  }

  return segments;
}
