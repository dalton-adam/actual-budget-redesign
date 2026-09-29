// Presentation constants for the redesigned envelope table
// (design-decisions §4.1). Tracking budgets keep the shared table's
// ROW_HEIGHT; the shared constant itself is not changed.
import { createContext, createElement, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';

import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import type { CSSProperties } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';

import { useSidebar } from '#components/sidebar/SidebarProvider';
import { useGlobalPref } from '#hooks/useGlobalPref';
import { useSheetValue } from '#hooks/useSheetValue';
import { useSyncedPref } from '#hooks/useSyncedPref';
import type { Binding, SheetFields } from '#spreadsheet';

import { useCategoryDetails } from './CategoryDetailsContext';

export const ENVELOPE_CATEGORY_ROW_HEIGHT = 44;
export const ENVELOPE_GROUP_ROW_HEIGHT = 40;

export type EnvelopeColumnWidths = {
  /** Minimum width of the flexible Category column. */
  categoryMin: number;
  assigned: number;
  /** 0 when the Activity column is hidden. */
  activity: number;
  available: number;
  /** The percentage label is hidden while Activity is at a narrow width. */
  showActivityPercent: boolean;
};

type EnvelopeLayoutState = {
  /** The details panel sits beside the table (not an overlay). */
  detailsPushed?: boolean;
  accountsPaneExpanded?: boolean;
};

/**
 * Column widths by window width (design-decisions §4.1). The table fills the
 * page: Category takes the remaining space and the month columns are fixed,
 * using the upper end of the Activity range. Assigned is 112px wherever §4.1
 * has less (100, 104 or 84px) because the month notes button shares that
 * cell, and Available is at least 104px (§4.1: 92 or 96px); the narrower
 * widths clipped amounts such as 1,145.62 and 12,366.00.
 */
export function getEnvelopeColumnWidths(
  windowWidth: number,
  {
    detailsPushed = false,
    accountsPaneExpanded = false,
  }: EnvelopeLayoutState = {},
): EnvelopeColumnWidths {
  if (windowWidth >= 1280) {
    if (detailsPushed && accountsPaneExpanded) {
      return {
        categoryMin: 150,
        assigned: 112,
        activity: 170,
        available: 108,
        showActivityPercent: false,
      };
    }
    return {
      categoryMin: 160,
      assigned: 120,
      activity: 230,
      available: 120,
      showActivityPercent: true,
    };
  }
  if (windowWidth >= 900) {
    if (detailsPushed) {
      return {
        categoryMin: 120,
        assigned: 112,
        activity: 120,
        available: 104,
        showActivityPercent: false,
      };
    }
    return {
      categoryMin: 140,
      assigned: 112,
      activity: 180,
      available: 104,
      showActivityPercent: true,
    };
  }
  return {
    categoryMin: 120,
    assigned: 112,
    activity: 0,
    available: 104,
    showActivityPercent: false,
  };
}

export function getEnvelopeMonthWidth({
  assigned,
  activity,
  available,
}: EnvelopeColumnWidths) {
  return assigned + activity + available;
}

type EnvelopeTableLayout = {
  isEnvelopeTable: boolean;
  columnWidths: EnvelopeColumnWidths;
  categoryColumnStyle: CSSProperties;
};

const EnvelopeTableLayoutContext = createContext<EnvelopeTableLayout | null>(
  null,
);

/**
 * Works out the table layout once for the whole Budget page. Every row
 * re-renders on each Assigned edit, and reading the budget type, window
 * size and preferences in each row made edits slower (PERF-01).
 */
export function EnvelopeTableLayoutProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [budgetType = 'envelope'] = useSyncedPref('budgetType');
  const { width } = useResponsive();
  const details = useCategoryDetails();
  const { expanded } = useSidebar();
  const [categoryExpandedStatePref] = useGlobalPref('categoryExpandedState');

  const isEnvelopeTable = budgetType === 'envelope';
  const detailsPushed = !!details && details.mode === 'push' && details.isShown;
  const categoryExpandedState = categoryExpandedStatePref ?? 0;

  // Rows only re-render for the context when the layout itself changes.
  const layout = useMemo(() => {
    const columnWidths = getEnvelopeColumnWidths(width, {
      detailsPushed,
      accountsPaneExpanded: expanded,
    });
    return {
      isEnvelopeTable,
      columnWidths,
      categoryColumnStyle: isEnvelopeTable
        ? { flex: 1, minWidth: columnWidths.categoryMin }
        : { width: 200 + 100 * categoryExpandedState },
    };
  }, [isEnvelopeTable, width, detailsPushed, expanded, categoryExpandedState]);

  return createElement(
    EnvelopeTableLayoutContext.Provider,
    { value: layout },
    children,
  );
}

function useEnvelopeTableLayout() {
  const layout = useContext(EnvelopeTableLayoutContext);
  if (!layout) {
    throw new Error(
      'The budget table must be inside an EnvelopeTableLayoutProvider.',
    );
  }
  return layout;
}

/** The redesigned table applies to envelope budgets only. */
export function useIsEnvelopeTable() {
  return useEnvelopeTableLayout().isEnvelopeTable;
}

export function useEnvelopeColumnWidths() {
  return useEnvelopeTableLayout().columnWidths;
}

/**
 * Category column: flexible for envelope budgets so long names get the
 * spare width; tracking budgets keep the adjustable fixed width.
 */
export function useCategoryColumnStyle(): CSSProperties {
  return useEnvelopeTableLayout().categoryColumnStyle;
}

/** Reads an existing envelope spreadsheet cell for the current month. */
export function useEnvelopeValue<
  FieldName extends SheetFields<'envelope-budget'>,
>(binding: Binding<'envelope-budget', FieldName>) {
  return useSheetValue(binding);
}

/** Tinted group row over the table card. */
export const envelopeGroupRowStyle: CSSProperties = {
  fontWeight: 650,
  backgroundColor: theme.cardBackground,
  // groupRowBackground is translucent in dark themes, so layer it on the card.
  backgroundImage: `linear-gradient(${theme.groupRowBackground}, ${theme.groupRowBackground})`,
};

/** Cell borders inside the table card. */
export const envelopeCellBorderStyle: CSSProperties = {
  borderColor: theme.cardHairline,
};
