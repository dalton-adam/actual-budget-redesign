import { createElement } from 'react';
import type { ReactNode } from 'react';

import type {
  CategoryEntity,
  CategoryGroupEntity,
} from '@actual-app/core/types/models';
import { act, renderHook } from '@testing-library/react';

import {
  CategoryDetailsProvider,
  DETAILS_PANEL_STORAGE_KEY,
  getDetailsPanelMode,
  getDetailsPanelWidth,
  resolveDetailsCategory,
  resolveDetailsMonth,
  resolveDetailsPanelOpen,
  stepDetailsMonth,
  useCategoryDetails,
} from './CategoryDetailsContext';
import type { DetailsPanelMode } from './CategoryDetailsContext';

function category(
  id: string,
  group: string,
  extra: Partial<CategoryEntity> = {},
): CategoryEntity {
  return { id, name: id, group, ...extra } as CategoryEntity;
}

const groups: CategoryGroupEntity[] = [
  {
    id: 'bills',
    name: 'Bills',
    categories: [
      category('rent', 'bills', { hidden: true }),
      category('power', 'bills'),
    ],
  },
  {
    id: 'food',
    name: 'Food',
    categories: [category('groceries', 'food')],
  },
  {
    id: 'income',
    name: 'Income',
    is_income: true,
    categories: [category('salary', 'income', { is_income: true })],
  },
];

describe('details panel layout', () => {
  it('is 360px from 1280px and 320px below', () => {
    expect(getDetailsPanelWidth(1280)).toBe(360);
    expect(getDetailsPanelWidth(1279)).toBe(320);
  });

  it('overlays below 900px and when the table would not fit beside it', () => {
    expect(
      getDetailsPanelMode({
        windowWidth: 899,
        availableWidth: 899,
        minTableWidth: 100,
      }),
    ).toBe('overlay');
    // 1000 - 320 panel - 12 gap = 668 left for the table.
    expect(
      getDetailsPanelMode({
        windowWidth: 1000,
        availableWidth: 1000,
        minTableWidth: 668,
      }),
    ).toBe('push');
    expect(
      getDetailsPanelMode({
        windowWidth: 1000,
        availableWidth: 1000,
        minTableWidth: 669,
      }),
    ).toBe('overlay');
  });

  it('is open by default until the device records a choice', () => {
    expect(resolveDetailsPanelOpen(null)).toBe(true);
    expect(resolveDetailsPanelOpen(false)).toBe(false);
    expect(resolveDetailsPanelOpen(true)).toBe(true);
  });
});

describe('resolveDetailsCategory', () => {
  it('defaults to the first visible expense category', () => {
    expect(resolveDetailsCategory(groups, null)?.category.id).toBe('power');
  });

  it('keeps the chosen category, even when hidden', () => {
    const resolved = resolveDetailsCategory(groups, 'rent');
    expect(resolved?.category.id).toBe('rent');
    expect(resolved?.group.id).toBe('bills');
  });

  it('falls back when the chosen category is gone or is income', () => {
    expect(resolveDetailsCategory(groups, 'deleted')?.category.id).toBe(
      'power',
    );
    expect(resolveDetailsCategory(groups, 'salary')?.category.id).toBe('power');
  });

  it('is empty without expense categories', () => {
    expect(resolveDetailsCategory([groups[2]], null)).toBeNull();
  });
});

describe('details month', () => {
  const bounds = { start: '2026-01', end: '2026-12' };

  it('follows the budget month until the stepper picks one', () => {
    expect(resolveDetailsMonth('2026-09', null)).toBe('2026-09');
    expect(
      resolveDetailsMonth('2026-09', {
        budgetMonth: '2026-09',
        month: '2026-07',
      }),
    ).toBe('2026-07');
  });

  it('follows the budget month again once it changes', () => {
    expect(
      resolveDetailsMonth('2026-10', {
        budgetMonth: '2026-09',
        month: '2026-07',
      }),
    ).toBe('2026-10');
  });

  it('steps within the budget months only', () => {
    expect(stepDetailsMonth('2026-09', -1, bounds)).toBe('2026-08');
    expect(stepDetailsMonth('2026-09', 1, bounds)).toBe('2026-10');
    expect(stepDetailsMonth('2026-01', -1, bounds)).toBeNull();
    expect(stepDetailsMonth('2026-12', 1, bounds)).toBeNull();
    expect(stepDetailsMonth('2026-12', -1, bounds)).toBe('2026-11');
  });
});

type SetupOptions = {
  budgetMonth?: string;
  onShowActivity?: (id: string, month: string) => void;
};

function setup(
  mode: DetailsPanelMode,
  { budgetMonth = '2026-09', onShowActivity = vi.fn() }: SetupOptions = {},
) {
  const container = document.createElement('div');
  const opener = document.createElement('button');
  opener.dataset.detailsOpener = 'groceries';
  const scroller = document.createElement('div');
  scroller.dataset.testid = 'budget-table-scroll-container';
  container.append(opener, scroller);
  document.body.append(container);

  let month = budgetMonth;
  const hook = renderHook(() => useCategoryDetails(), {
    wrapper: ({ children }: { children: ReactNode }) =>
      createElement(CategoryDetailsProvider, {
        mode,
        categoryGroups: groups,
        budgetMonth: month,
        monthBounds: { start: '2026-01', end: '2026-12' },
        onShowActivity,
        containerRef: { current: container },
        children,
      }),
  });
  const setBudgetMonth = (next: string) => {
    month = next;
    hook.rerender();
  };
  const details = () => {
    const value = hook.result.current;
    if (!value) {
      throw new Error('Details context missing');
    }
    return value;
  };
  return { ...hook, details, opener, scroller, setBudgetMonth };
}

describe('CategoryDetailsProvider', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    document.body.innerHTML = '';
  });

  it('is not available outside the envelope budget page', () => {
    const { result } = renderHook(() => useCategoryDetails());
    expect(result.current).toBeNull();
  });

  it('opens by default beside the table and remembers closing', () => {
    const first = setup('push');
    expect(first.details().isShown).toBe(true);
    expect(first.details().selectedCategoryId).toBe('power');

    act(() => first.details().close());
    expect(first.details().isShown).toBe(false);
    expect(window.localStorage.getItem(DETAILS_PANEL_STORAGE_KEY)).toBe(
      'false',
    );

    first.unmount();
    const second = setup('push');
    expect(second.details().isShown).toBe(false);
  });

  it('opening a category shows it and stores the open state', () => {
    window.localStorage.setItem(DETAILS_PANEL_STORAGE_KEY, 'false');
    const { details } = setup('push');

    act(() => details().openCategory('groceries'));
    expect(details().isShown).toBe(true);
    expect(details().selectedCategoryId).toBe('groceries');
    expect(window.localStorage.getItem(DETAILS_PANEL_STORAGE_KEY)).toBe('true');

    act(() => details().toggle());
    expect(details().isShown).toBe(false);
    expect(details().selectedCategoryId).toBe('groceries');
  });

  it('returns focus to the selected category opener on close', () => {
    const { details, opener } = setup('push');
    act(() => details().openCategory('groceries'));
    act(() => details().close());
    expect(document.activeElement).toBe(opener);
  });

  it('keeps the overlay closed by default and never stores its state', () => {
    const { details } = setup('overlay');
    expect(details().isShown).toBe(false);

    act(() => details().openCategory('groceries'));
    expect(details().isShown).toBe(true);
    act(() => details().close());
    expect(details().isShown).toBe(false);
    expect(window.localStorage.getItem(DETAILS_PANEL_STORAGE_KEY)).toBeNull();
  });

  it('steps its own month and follows a new budget month', () => {
    const { details, setBudgetMonth } = setup('push');
    expect(details().month).toBe('2026-09');

    act(() => details().stepMonth(-1));
    act(() => details().stepMonth(-1));
    expect(details().month).toBe('2026-07');

    setBudgetMonth('2026-10');
    expect(details().month).toBe('2026-10');
  });

  it('does not step past the budget months', () => {
    const { details } = setup('push', { budgetMonth: '2026-12' });
    expect(details().canStepMonth(1)).toBe(false);
    expect(details().canStepMonth(-1)).toBe(true);

    act(() => details().stepMonth(1));
    expect(details().month).toBe('2026-12');
  });

  it('keeps the category and month for the way back from Accounts', () => {
    const first = setup('push');
    act(() => first.details().openCategory('groceries'));
    act(() => first.details().stepMonth(-1));
    first.unmount();

    const second = setup('push');
    expect(second.details().selectedCategoryId).toBe('groceries');
    expect(second.details().month).toBe('2026-08');
  });

  it('opens the Accounts view and remembers the table scroll position', () => {
    const onShowActivity = vi.fn();
    const { details, scroller } = setup('push', { onShowActivity });
    scroller.scrollTop = 240;

    act(() => details().showActivity('groceries', '2026-08'));
    expect(onShowActivity).toHaveBeenCalledWith('groceries', '2026-08');
    expect(window.sessionStorage.getItem('budget-scroll-position')).toBe('240');
  });
});
