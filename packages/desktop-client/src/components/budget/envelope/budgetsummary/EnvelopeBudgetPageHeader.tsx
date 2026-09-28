import React from 'react';

import { SvgDotsHorizontalTriple } from '@actual-app/components/icons/v1';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';

import { BudgetMonthToolbar } from '#components/budget/BudgetMonthToolbar';
import { CategoryDetailsToggle } from '#components/budget/CategoryDetailsToggle';
import type { MonthBounds } from '#components/budget/MonthsContext';
import { NotesButton } from '#components/NotesButton';
import { SheetNameProvider } from '#hooks/useSheetName';

import { BudgetMonthMenuButton } from './BudgetMonthMenuButton';
import { MonthSummaryCards } from './MonthSummaryCards';

type EnvelopeBudgetPageHeaderProps = {
  month: string;
  numMonths: number;
  monthBounds: MonthBounds;
  onMonthSelect: (month: string) => void;
  isScrolled: boolean;
};

/**
 * Envelope budget header: month toolbar with the month's notes and menu,
 * then the summary cards for the focused month (design-decisions §3).
 */
export function EnvelopeBudgetPageHeader({
  month,
  numMonths,
  monthBounds,
  onMonthSelect,
  isScrolled,
}: EnvelopeBudgetPageHeaderProps) {
  return (
    <SheetNameProvider name={monthUtils.sheetForMonth(month)}>
      <View
        data-testid="budget-page-header"
        style={{ flexShrink: 0, gap: 14, padding: '6px 5px 14px' }}
      >
        <BudgetMonthToolbar
          month={month}
          numMonths={numMonths}
          monthBounds={monthBounds}
          onMonthSelect={onMonthSelect}
          tools={
            <>
              <NotesButton
                id={`budget-${month}`}
                width={15}
                height={15}
                tooltipPosition="bottom right"
                defaultColor={theme.pageText}
              />
              <BudgetMonthMenuButton month={month}>
                <SvgDotsHorizontalTriple width={15} height={15} />
              </BudgetMonthMenuButton>
              <CategoryDetailsToggle />
            </>
          }
        />
        <MonthSummaryCards month={month} isScrolled={isScrolled} />
      </View>
    </SheetNameProvider>
  );
}
