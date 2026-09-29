import React, {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type { ReactNode, RefObject } from 'react';

import * as monthUtils from '@actual-app/core/shared/months';
import type {
  CategoryEntity,
  CategoryGroupEntity,
} from '@actual-app/core/types/models';
import { useLocalStorage, useSessionStorage } from 'usehooks-ts';

/**
 * Device-local open state of the details panel (design-decisions §5). Kept
 * in browser storage like the accounts pane; no synced or core preference.
 */
export const CATEGORY_DETAILS_PANEL_ID = 'category-details-panel';

export const DETAILS_PANEL_STORAGE_KEY = 'actual-budget-details-panel-open';

/**
 * The chosen category and panel month last only for the browser session, so
 * "View in Accounts" and back returns to the same details.
 */
export const DETAILS_CATEGORY_SESSION_KEY = 'actual-budget-details-category';
export const DETAILS_MONTH_SESSION_KEY = 'actual-budget-details-month';

// Kept in step with BudgetTable, which restores it when the page mounts.
const BUDGET_SCROLL_POSITION_KEY = 'budget-scroll-position';

/** Below this window width the panel is an overlay with a scrim. */
export const DETAILS_PANEL_OVERLAY_BELOW = 900;
export const DETAILS_PANEL_GAP = 12;

export type DetailsPanelMode = 'push' | 'overlay';

/** 360px from 1280px, 320px below (design-decisions §5). */
export function getDetailsPanelWidth(windowWidth: number) {
  return windowWidth >= 1280 ? 360 : 320;
}

/**
 * The panel pushes the table when the window is at least 900px wide and the
 * table keeps at least `minTableWidth` beside it; otherwise it overlays.
 */
export function getDetailsPanelMode({
  windowWidth,
  availableWidth,
  minTableWidth,
}: {
  windowWidth: number;
  availableWidth: number;
  minTableWidth: number;
}): DetailsPanelMode {
  if (windowWidth < DETAILS_PANEL_OVERLAY_BELOW) {
    return 'overlay';
  }
  const tableWidth =
    availableWidth - getDetailsPanelWidth(windowWidth) - DETAILS_PANEL_GAP;
  return tableWidth >= minTableWidth ? 'push' : 'overlay';
}

/** Open by default until this device records a choice. */
export function resolveDetailsPanelOpen(stored: boolean | null) {
  return stored ?? true;
}

/**
 * The category the panel describes: the chosen one while it still exists,
 * otherwise the first visible expense category.
 */
export function resolveDetailsCategory(
  groups: CategoryGroupEntity[],
  chosenId: CategoryEntity['id'] | null,
): { category: CategoryEntity; group: CategoryGroupEntity } | null {
  let fallback: {
    category: CategoryEntity;
    group: CategoryGroupEntity;
  } | null = null;

  for (const group of groups) {
    if (group.is_income) {
      continue;
    }
    for (const category of group.categories ?? []) {
      if (category.id === chosenId) {
        return { category, group };
      }
      if (!fallback && !category.hidden && !group.hidden) {
        fallback = { category, group };
      }
    }
  }
  return fallback;
}

/**
 * A month picked with the panel's own stepper, and the budget month it was
 * picked from.
 */
export type DetailsMonthChoice = { budgetMonth: string; month: string };

/**
 * The panel follows the budget month until its own stepper is used, and
 * again whenever the budget month changes (design-decisions §5, item 1).
 */
export function resolveDetailsMonth(
  budgetMonth: string,
  choice: DetailsMonthChoice | null,
) {
  return choice && choice.budgetMonth === budgetMonth
    ? choice.month
    : budgetMonth;
}

/** The month one step away, or null outside the budget's months. */
export function stepDetailsMonth(
  month: string,
  delta: -1 | 1,
  bounds: { start: string; end: string },
) {
  const next = monthUtils.addMonths(month, delta);
  return next < bounds.start || next > bounds.end ? null : next;
}

type CategoryDetailsContextValue = {
  mode: DetailsPanelMode;
  /** Whether the panel is on screen. */
  isShown: boolean;
  selectedCategoryId: CategoryEntity['id'] | null;
  selected: { category: CategoryEntity; group: CategoryGroupEntity } | null;
  /** The month the panel describes. */
  month: string;
  /** Whether the stepper can move one month back or forward. */
  canStepMonth: (delta: -1 | 1) => boolean;
  stepMonth: (delta: -1 | 1) => void;
  openCategory: (id: CategoryEntity['id']) => void;
  /** Opens the existing Accounts view filtered to the category and month. */
  showActivity: (id: CategoryEntity['id'], month: string) => void;
  toggle: () => void;
  /** Closes the panel and returns focus to the selected category's opener. */
  close: () => void;
};

const CategoryDetailsContext =
  createContext<CategoryDetailsContextValue | null>(null);

type CategoryDetailsProviderProps = {
  mode: DetailsPanelMode;
  categoryGroups: CategoryGroupEntity[];
  /** The month the Budget page shows. */
  budgetMonth: string;
  monthBounds: { start: string; end: string };
  /** The Budget page's handler behind the row's Activity amount. */
  onShowActivity: (id: CategoryEntity['id'], month: string) => void;
  /** Holds the openers and the table's scroll container. */
  containerRef: RefObject<HTMLElement | null>;
  children: ReactNode;
};

export function CategoryDetailsProvider({
  mode,
  categoryGroups,
  budgetMonth,
  monthBounds,
  onShowActivity,
  containerRef,
  children,
}: CategoryDetailsProviderProps) {
  const [storedOpen, setStoredOpen] = useLocalStorage<boolean | null>(
    DETAILS_PANEL_STORAGE_KEY,
    null,
  );
  // The overlay covers the budget, so below the push layout it only opens
  // when asked to in this session and never changes the stored choice.
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [chosenId, setChosenId] = useSessionStorage<
    CategoryEntity['id'] | null
  >(DETAILS_CATEGORY_SESSION_KEY, null);
  const [monthChoice, setMonthChoice] =
    useSessionStorage<DetailsMonthChoice | null>(
      DETAILS_MONTH_SESSION_KEY,
      null,
    );
  const pendingFocus = useRef<{ scrollTop: number } | null>(null);

  const isShown =
    mode === 'push' ? resolveDetailsPanelOpen(storedOpen) : overlayOpen;
  const selected = resolveDetailsCategory(categoryGroups, chosenId);
  const month = resolveDetailsMonth(budgetMonth, monthChoice);

  const canStepMonth = (delta: -1 | 1) =>
    stepDetailsMonth(month, delta, monthBounds) != null;

  const stepMonth = (delta: -1 | 1) => {
    const next = stepDetailsMonth(month, delta, monthBounds);
    if (next) {
      setMonthChoice({ budgetMonth, month: next });
    }
  };

  // Same as the row's Activity amount: remember the table's scroll position
  // for the way back, then use the page's handler.
  const showActivity = (id: CategoryEntity['id'], activityMonth: string) => {
    const scroller = getScrollContainer(containerRef.current);
    if (scroller) {
      sessionStorage.setItem(
        BUDGET_SCROLL_POSITION_KEY,
        String(scroller.scrollTop),
      );
    }
    onShowActivity(id, activityMonth);
  };

  const setShown = (shown: boolean) => {
    if (mode === 'push') {
      setStoredOpen(shown);
    } else {
      setOverlayOpen(shown);
    }
  };

  const openCategory = (id: CategoryEntity['id']) => {
    setChosenId(id);
    setShown(true);
  };

  const toggle = () => setShown(!isShown);

  const close = () => {
    const scroller = getScrollContainer(containerRef.current);
    pendingFocus.current = { scrollTop: scroller?.scrollTop ?? 0 };
    setShown(false);
  };

  // After closing, return focus to the category's opener without moving the
  // table: the scroll position is put back and focus never scrolls.
  useLayoutEffect(() => {
    if (isShown || !pendingFocus.current) {
      return;
    }
    const { scrollTop } = pendingFocus.current;
    pendingFocus.current = null;

    const container = containerRef.current;
    const scroller = getScrollContainer(container);
    if (scroller) {
      scroller.scrollTop = scrollTop;
    }
    const opener =
      Array.from(
        container?.querySelectorAll<HTMLElement>('[data-details-opener]') ?? [],
      ).find(el => el.dataset.detailsOpener === selected?.category.id) ??
      container?.querySelector<HTMLElement>('[data-details-toggle]');
    opener?.focus({ preventScroll: true });
  }, [isShown, selected, containerRef]);

  return (
    <CategoryDetailsContext.Provider
      value={{
        mode,
        isShown,
        selectedCategoryId: selected?.category.id ?? null,
        selected,
        month,
        canStepMonth,
        stepMonth,
        openCategory,
        showActivity,
        toggle,
        close,
      }}
    >
      {children}
    </CategoryDetailsContext.Provider>
  );
}

function getScrollContainer(container: HTMLElement | null) {
  return container?.querySelector<HTMLElement>(
    '[data-testid="budget-table-scroll-container"]',
  );
}

/**
 * The details panel state, or null outside the envelope budget page (tracking
 * budgets and other screens have no panel).
 */
export function useCategoryDetails() {
  return useContext(CategoryDetailsContext);
}
