import * as monthUtils from '@actual-app/core/shared/months';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { getTourSteps } from './steps';
import type { TourStepDeps } from './steps';

const deps: TourStepDeps = { navigate: vi.fn(), budgetType: 'envelope' };

describe('getTourSteps', () => {
  it('returns a tour that starts with a centered welcome step', () => {
    const steps = getTourSteps('budget-tour', deps);

    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].id).toBe('welcome');
    expect(steps[0].placement).toBe('center');
  });

  it('gives every step a unique id, a target, and content', () => {
    const steps = getTourSteps('budget-tour', deps);

    const ids = steps.map(step => step.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const step of steps) {
      expect(step.id).toBeTruthy();
      expect(step.target).toBeTruthy();
      expect(step.content).toBeTruthy();
      expect(step.title).toBeTruthy();
    }
  });

  it.each(['envelope', 'tracking'] as const)(
    'returns a complete tour for %s budgets',
    budgetType => {
      const steps = getTourSteps('budget-tour', { ...deps, budgetType });

      const summaryStep = steps.find(step => step.id === 'budget-summary');
      expect(summaryStep?.title).toBeTruthy();
      expect(summaryStep?.content).toBeTruthy();
      expect(summaryStep?.target).toBeTruthy();
    },
  );
});

describe('budget summary step target', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  function findSummaryTarget(budgetType: TourStepDeps['budgetType']) {
    const target = getTourSteps('budget-tour', { ...deps, budgetType }).find(
      step => step.id === 'budget-summary',
    )?.target;
    if (typeof target !== 'function') {
      throw new Error('Expected the summary step to look up its target');
    }
    return target();
  }

  // jsdom has no layout, so every element reports no boxes unless it is
  // marked as shown here.
  function addElement(
    attributes: Record<string, string>,
    { isShown }: { isShown: boolean },
  ) {
    const element = document.createElement('div');
    for (const [name, value] of Object.entries(attributes)) {
      element.setAttribute(name, value);
    }
    if (isShown) {
      Object.defineProperty(element, 'getClientRects', {
        value: () => [element.getBoundingClientRect()],
      });
    }
    document.body.append(element);
    return element;
  }

  it('points envelope budgets at the Ready to Assign card', () => {
    const card = addElement(
      { 'data-testid': 'ready-to-assign' },
      { isShown: true },
    );
    addElement({ 'data-testid': 'ready-to-assign' }, { isShown: false });

    expect(findSummaryTarget('envelope')).toBe(card);
  });

  it('uses the compact strip when the envelope cards are hidden', () => {
    addElement({ 'data-testid': 'ready-to-assign' }, { isShown: false });
    const strip = addElement(
      { 'data-testid': 'ready-to-assign' },
      { isShown: true },
    );

    expect(findSummaryTarget('envelope')).toBe(strip);
  });

  it('finds no envelope target when Ready to Assign is not shown', () => {
    addElement({ 'data-testid': 'ready-to-assign' }, { isShown: false });

    expect(findSummaryTarget('envelope')).toBeNull();
  });

  it("keeps tracking budgets on the current month's summary", () => {
    addElement(
      {
        'data-testid': 'budget-summary',
        'data-month': monthUtils.prevMonth(monthUtils.currentMonth()),
      },
      { isShown: true },
    );
    const currentSummary = addElement(
      {
        'data-testid': 'budget-summary',
        'data-month': monthUtils.currentMonth(),
      },
      { isShown: true },
    );

    expect(findSummaryTarget('tracking')).toBe(currentSummary);
  });
});
