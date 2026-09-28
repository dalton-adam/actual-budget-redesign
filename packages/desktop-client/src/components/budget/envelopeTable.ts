// Presentation constants for the redesigned envelope table
// (design-decisions §4.1). Tracking budgets keep the shared table's
// ROW_HEIGHT; the shared constant itself is not changed.
import type { CSSProperties } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';

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
