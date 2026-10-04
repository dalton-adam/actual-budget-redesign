import { describe, expect, it } from 'vitest';

import { getReadyToAssign } from './useReadyToAssign';

describe('getReadyToAssign', () => {
  const currentMonth = '2026-10';

  it('takes money assigned in a later month out of this month', () => {
    // $1,000 left in October; $300 assigned in November.
    expect(
      getReadyToAssign({
        month: '2026-10',
        currentMonth,
        toBudget: 100000,
        laterMonths: [
          { toBudget: 70000, lastMonthOverspent: 0 },
          { toBudget: 70000, lastMonthOverspent: 0 },
          { toBudget: 70000, lastMonthOverspent: 0 },
        ],
      }),
    ).toEqual({
      toBudget: 100000,
      readyToAssign: 70000,
      neededForLaterMonths: 30000,
    });
  });

  it('leaves this month alone when later months cover their own assignments', () => {
    // November has its own income that covers what is assigned there.
    expect(
      getReadyToAssign({
        month: '2026-10',
        currentMonth,
        toBudget: 100000,
        laterMonths: [
          { toBudget: 120000, lastMonthOverspent: 0 },
          { toBudget: 120000, lastMonthOverspent: 0 },
        ],
      }),
    ).toEqual({
      toBudget: 100000,
      readyToAssign: 100000,
      neededForLaterMonths: 0,
    });
  });

  it('uses the lowest later month', () => {
    // $300 assigned in November, another $200 in January.
    expect(
      getReadyToAssign({
        month: '2026-10',
        currentMonth,
        toBudget: 100000,
        laterMonths: [
          { toBudget: 70000, lastMonthOverspent: 0 },
          { toBudget: 70000, lastMonthOverspent: 0 },
          { toBudget: 50000, lastMonthOverspent: 0 },
          { toBudget: 50000, lastMonthOverspent: 0 },
        ],
      }).readyToAssign,
    ).toBe(50000);
  });

  it('goes negative when later months are assigned more than there is', () => {
    expect(
      getReadyToAssign({
        month: '2026-10',
        currentMonth,
        toBudget: 20000,
        laterMonths: [{ toBudget: -10000, lastMonthOverspent: 0 }],
      }),
    ).toEqual({
      toBudget: 20000,
      readyToAssign: -10000,
      neededForLaterMonths: 30000,
    });
  });

  it('keeps an overassigned month as it is', () => {
    expect(
      getReadyToAssign({
        month: '2026-10',
        currentMonth,
        toBudget: -5000,
        laterMonths: [
          { toBudget: -5000, lastMonthOverspent: 0 },
          { toBudget: 0, lastMonthOverspent: 0 },
        ],
      }).readyToAssign,
    ).toBe(-5000);
  });

  it('applies to future months too', () => {
    expect(
      getReadyToAssign({
        month: '2026-11',
        currentMonth,
        toBudget: 70000,
        laterMonths: [{ toBudget: 40000, lastMonthOverspent: 0 }],
      }).readyToAssign,
    ).toBe(40000);
  });

  it('keeps past months as recorded', () => {
    expect(
      getReadyToAssign({
        month: '2026-09',
        currentMonth,
        toBudget: 100000,
        laterMonths: [{ toBudget: -20000, lastMonthOverspent: 0 }],
      }),
    ).toEqual({
      toBudget: 100000,
      readyToAssign: 100000,
      neededForLaterMonths: 0,
    });
  });

  it('uses the month on its own when there are no later months', () => {
    expect(
      getReadyToAssign({
        month: '2027-10',
        currentMonth,
        toBudget: 100000,
        laterMonths: [],
      }).readyToAssign,
    ).toBe(100000);
  });

  it("leaves this month's overspending to the next month", () => {
    // October is fully assigned but $104.49 overspent; Actual takes that
    // from November's To Budget. Nothing is assigned in November.
    expect(
      getReadyToAssign({
        month: '2026-10',
        currentMonth,
        toBudget: 0,
        laterMonths: [
          { toBudget: -10449, lastMonthOverspent: -10449 },
          { toBudget: -10449, lastMonthOverspent: 0 },
        ],
      }),
    ).toEqual({ toBudget: 0, readyToAssign: 0, neededForLaterMonths: 0 });
  });

  it('still takes out later assignments alongside overspending', () => {
    // As above, plus $300 assigned in December.
    expect(
      getReadyToAssign({
        month: '2026-10',
        currentMonth,
        toBudget: 50000,
        laterMonths: [
          { toBudget: 39551, lastMonthOverspent: -10449 },
          { toBudget: 9551, lastMonthOverspent: 0 },
        ],
      }).readyToAssign,
    ).toBe(20000);
  });
});
