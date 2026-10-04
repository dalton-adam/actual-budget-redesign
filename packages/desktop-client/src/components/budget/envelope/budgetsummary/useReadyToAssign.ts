import { useEffect, useState } from 'react';

import { send } from '@actual-app/core/platform/client/connection';
import * as monthUtils from '@actual-app/core/shared/months';

import { useEnvelopeSheetValue } from '#components/budget/envelope/EnvelopeBudgetComponents';
import { useSpreadsheet } from '#hooks/useSpreadsheet';
import { envelopeBudget } from '#spreadsheet/bindings';

type ReadyToAssign = {
  /** The month's own To Budget cell, unchanged. */
  toBudget: number;
  /** What is shown as Ready to Assign (design-decisions §3, RTA-01). */
  readyToAssign: number;
  /** The part of `toBudget` later months need; zero or positive. */
  neededForLaterMonths: number;
};

type LaterMonth = {
  /** The month's To Budget cell. */
  toBudget: number;
  /** Its "Overspent in previous month" cell; zero or negative. */
  lastMonthOverspent: number;
};

/**
 * Ready to Assign with money assigned in later months taken out, as YNAB
 * shows it (design-decisions §3, RTA-01). Each month's To Budget carries
 * forward, so money assigned in a later month lowers that month's and every
 * following month's To Budget but never an earlier one's. The lowest To
 * Budget from this month on is what can still be assigned here without
 * leaving a later month overassigned.
 *
 * Overspending is left where Actual puts it: in the following month. Each
 * later month's "Overspent in previous month" is added back before taking
 * the lowest, so this month's overspending is not counted twice and only
 * later assignments are taken out.
 *
 * Past months keep their own To Budget: they are history, and one old
 * overassigned month would otherwise lower every month before it.
 *
 * `laterMonths` runs in month order from the month after `month`.
 */
export function getReadyToAssign({
  month,
  currentMonth,
  toBudget,
  laterMonths,
}: {
  month: string;
  currentMonth: string;
  toBudget: number;
  laterMonths: LaterMonth[];
}): ReadyToAssign {
  let readyToAssign = toBudget;
  if (month >= currentMonth) {
    let overspentSince = 0;
    for (const later of laterMonths) {
      overspentSince += later.lastMonthOverspent;
      readyToAssign = Math.min(readyToAssign, later.toBudget - overspentSince);
    }
  }
  return {
    toBudget,
    readyToAssign,
    neededForLaterMonths: toBudget - readyToAssign,
  };
}

const laterMonthFields = {
  toBudget: envelopeBudget.toBudget,
  lastMonthOverspent: envelopeBudget.lastMonthOverspent,
} as const;

/**
 * The focused month's Ready to Assign. Render inside the month's
 * `SheetNameProvider`. Reads existing cells of later months; no spreadsheet
 * cell or budget value changes.
 */
export function useReadyToAssign(month: string): ReadyToAssign {
  const spreadsheet = useSpreadsheet();
  const toBudget = useEnvelopeSheetValue(envelopeBudget.toBudget) ?? 0;
  const currentMonth = monthUtils.currentMonth();
  const [lastMonth, setLastMonth] = useState<string | null>(null);
  const [later, setLater] = useState<{
    month: string;
    values: Record<string, Partial<LaterMonth>>;
  }>({ month, values: {} });

  useEffect(() => {
    let isMounted = true;
    void send('get-budget-bounds').then(({ end }) => {
      if (isMounted) {
        setLastMonth(end);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (month < currentMonth || lastMonth == null || month >= lastMonth) {
      return;
    }
    // Only months inside the budget bounds have sheets; reading a cell
    // outside them would create an empty one.
    const laterMonths = monthUtils.rangeInclusive(
      monthUtils.nextMonth(month),
      lastMonth,
    );
    const unbinds = laterMonths.flatMap(laterMonth =>
      (
        Object.entries(laterMonthFields) as Array<
          [keyof LaterMonth, (typeof laterMonthFields)[keyof LaterMonth]]
        >
      ).map(([field, binding]) =>
        spreadsheet.bind(
          monthUtils.sheetForMonth(laterMonth),
          binding,
          ({ value }) => {
            const next = typeof value === 'number' ? value : 0;
            setLater(prev => {
              const values = prev.month === month ? prev.values : {};
              const current = values[laterMonth] ?? {};
              if (current[field] === next) {
                return prev;
              }
              return {
                month,
                values: {
                  ...values,
                  [laterMonth]: { ...current, [field]: next },
                },
              };
            });
          },
        ),
      ),
    );
    return () => unbinds.forEach(unbind => unbind());
  }, [spreadsheet, month, currentMonth, lastMonth]);

  // Take nothing out until every later month has loaded, so a half-loaded
  // month never shows a wrong amount.
  const expectedMonths =
    lastMonth != null && month < lastMonth
      ? monthUtils.rangeInclusive(monthUtils.nextMonth(month), lastMonth)
      : [];
  const laterMonths = expectedMonths
    .map(laterMonth =>
      later.month === month ? later.values[laterMonth] : undefined,
    )
    .filter(
      (values): values is LaterMonth =>
        values?.toBudget !== undefined &&
        values.lastMonthOverspent !== undefined,
    );

  return getReadyToAssign({
    month,
    currentMonth,
    toBudget,
    laterMonths:
      laterMonths.length === expectedMonths.length ? laterMonths : [],
  });
}
