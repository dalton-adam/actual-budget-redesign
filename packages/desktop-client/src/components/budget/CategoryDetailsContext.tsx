import React, {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type { ReactNode, RefObject } from 'react';

import type {
  CategoryEntity,
  CategoryGroupEntity,
} from '@actual-app/core/types/models';
import { useLocalStorage } from 'usehooks-ts';

/**
 * Device-local open state of the details panel (design-decisions §5). Kept
 * in browser storage like the accounts pane; no synced or core preference.
 */
export const CATEGORY_DETAILS_PANEL_ID = 'category-details-panel';

export const DETAILS_PANEL_STORAGE_KEY = 'actual-budget-details-panel-open';

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

type CategoryDetailsContextValue = {
  mode: DetailsPanelMode;
  /** Whether the panel is on screen. */
  isShown: boolean;
  selectedCategoryId: CategoryEntity['id'] | null;
  selected: { category: CategoryEntity; group: CategoryGroupEntity } | null;
  openCategory: (id: CategoryEntity['id']) => void;
  toggle: () => void;
  /** Closes the panel and returns focus to the selected category's opener. */
  close: () => void;
};

const CategoryDetailsContext =
  createContext<CategoryDetailsContextValue | null>(null);

type CategoryDetailsProviderProps = {
  mode: DetailsPanelMode;
  categoryGroups: CategoryGroupEntity[];
  /** Holds the openers and the table's scroll container. */
  containerRef: RefObject<HTMLElement | null>;
  children: ReactNode;
};

export function CategoryDetailsProvider({
  mode,
  categoryGroups,
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
  const [chosenId, setChosenId] = useState<CategoryEntity['id'] | null>(null);
  const pendingFocus = useRef<{ scrollTop: number } | null>(null);

  const isShown =
    mode === 'push' ? resolveDetailsPanelOpen(storedOpen) : overlayOpen;
  const selected = resolveDetailsCategory(categoryGroups, chosenId);

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
        openCategory,
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
