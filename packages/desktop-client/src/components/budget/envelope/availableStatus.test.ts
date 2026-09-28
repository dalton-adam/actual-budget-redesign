import { describe, expect, it } from 'vitest';

import { getAvailableStatus } from './availableStatus';

describe('getAvailableStatus', () => {
  const base = { goal: null, budgeted: 0, isLongGoal: false };

  it('is positive for a positive balance without a goal', () => {
    expect(getAvailableStatus({ ...base, balance: 11000 })).toEqual({
      tone: 'positive',
      hasTarget: false,
    });
  });

  it('is neutral for zero without a goal', () => {
    expect(getAvailableStatus({ ...base, balance: 0 }).tone).toBe('neutral');
  });

  it('puts negative first, even with an underfunded template', () => {
    expect(
      getAvailableStatus({
        balance: -2000,
        goal: 28000,
        budgeted: 10000,
        isLongGoal: false,
      }),
    ).toEqual({ tone: 'negative', hasTarget: true });
  });

  it('warns when a template is underfunded (compares the budgeted amount)', () => {
    expect(
      getAvailableStatus({
        balance: 50000,
        goal: 28000,
        budgeted: 25000,
        isLongGoal: false,
      }).tone,
    ).toBe('warning');
  });

  it('shows a funded template by value', () => {
    const funded = { goal: 28000, budgeted: 28000, isLongGoal: false };
    expect(getAvailableStatus({ ...funded, balance: 11000 }).tone).toBe(
      'positive',
    );
    expect(getAvailableStatus({ ...funded, balance: 0 })).toEqual({
      tone: 'neutral',
      hasTarget: true,
    });
  });

  it('compares the balance for a long-term goal', () => {
    const goal = { goal: 1000000, budgeted: 2000000, isLongGoal: true };
    expect(getAvailableStatus({ ...goal, balance: 490000 }).tone).toBe(
      'warning',
    );
    expect(getAvailableStatus({ ...goal, balance: 1000000 }).tone).toBe(
      'positive',
    );
  });
});
