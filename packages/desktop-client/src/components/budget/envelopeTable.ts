// Presentation constants for the redesigned envelope table
// (design-decisions §4.1). Tracking budgets keep the shared table's
// ROW_HEIGHT; the shared constant itself is not changed.
import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import type { CSSProperties } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';

import { useGlobalPref } from '#hooks/useGlobalPref';
import { useSheetValue } from '#hooks/useSheetValue';
import { useSyncedPref } from '#hooks/useSyncedPref';
import type { Binding, SheetFields } from '#spreadsheet';

export const ENVELOPE_CATEGORY_ROW_HEIGHT = 44;
export const ENVELOPE_GROUP_ROW_HEIGHT = 40;

/** The redesigned table applies to envelope budgets only. */
export function useIsEnvelopeTable() {
  const [budgetType = 'envelope'] = useSyncedPref('budgetType');
  return budgetType === 'envelope';
}

export type EnvelopeColumnWidths = {
  /** Minimum width of the flexible Category column. */
  categoryMin: number;
  assigned: number;
  /** 0 when the Activity column is hidden. */
  activity: number;
  available: number;
};

/**
 * Column widths by window width (design-decisions §4.1). The table fills the
 * page: Category takes the remaining space and the month columns are fixed,
 * using the upper end of the Activity range. Assigned is 112px below 1280px
 * rather than §4.1's 100/84px: the month notes button shares that cell, and
 * the narrower widths clipped amounts such as 1,145.62.
 */
export function getEnvelopeColumnWidths(
  windowWidth: number,
): EnvelopeColumnWidths {
  if (windowWidth >= 1280) {
    return { categoryMin: 160, assigned: 120, activity: 230, available: 120 };
  }
  if (windowWidth >= 900) {
    return { categoryMin: 140, assigned: 112, activity: 180, available: 104 };
  }
  return { categoryMin: 120, assigned: 112, activity: 0, available: 96 };
}

export function getEnvelopeMonthWidth({
  assigned,
  activity,
  available,
}: EnvelopeColumnWidths) {
  return assigned + activity + available;
}

export function useEnvelopeColumnWidths() {
  const { width } = useResponsive();
  return getEnvelopeColumnWidths(width);
}

/**
 * Category column: flexible for envelope budgets so long names get the
 * spare width; tracking budgets keep the adjustable fixed width.
 */
export function useCategoryColumnStyle(): CSSProperties {
  const isEnvelopeTable = useIsEnvelopeTable();
  const { categoryMin } = useEnvelopeColumnWidths();
  const [categoryExpandedStatePref] = useGlobalPref('categoryExpandedState');
  const categoryExpandedState = categoryExpandedStatePref ?? 0;

  return isEnvelopeTable
    ? { flex: 1, minWidth: categoryMin }
    : { width: 200 + 100 * categoryExpandedState };
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
