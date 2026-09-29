import React from 'react';

import * as monthUtils from '@actual-app/core/shared/months';

import { SheetNameProvider } from '#hooks/useSheetName';

import { useCategoryDetails } from './CategoryDetailsContext';
import { CategoryDetailsNotes } from './CategoryDetailsNotes';
import { CategoryDetailsSummary } from './CategoryDetailsSummary';
import { CategoryDetailsTransactions } from './CategoryDetailsTransactions';

type CategoryDetailsBodyProps = {
  month: string;
};

/**
 * The panel's read-only details below the header (DETAIL-02). Keyed by
 * category and month so a new selection starts from its own loading state
 * and never shows the previous one's notes or transactions.
 */
export function CategoryDetailsBody({ month }: CategoryDetailsBodyProps) {
  const details = useCategoryDetails();
  const category = details?.selected?.category;

  if (!category) {
    return null;
  }

  return (
    <SheetNameProvider
      key={`${category.id}:${month}`}
      name={monthUtils.sheetForMonth(month)}
    >
      <CategoryDetailsSummary category={category} month={month} />
      <CategoryDetailsNotes categoryId={category.id} />
      <CategoryDetailsTransactions category={category} month={month} />
    </SheetNameProvider>
  );
}
