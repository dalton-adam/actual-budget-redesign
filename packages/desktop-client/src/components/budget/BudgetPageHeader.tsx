// @ts-strict-ignore
import React, { memo } from 'react';
import type { ComponentProps } from 'react';

import { View } from '@actual-app/components/view';

import { useGlobalPref } from '#hooks/useGlobalPref';

import { EnvelopeBudgetPageHeader } from './envelope/budgetsummary/EnvelopeBudgetPageHeader';
import { MonthPicker } from './MonthPicker';
import { getScrollbarWidth } from './util';

type BudgetPageHeaderProps = {
  type: string;
  startMonth: string;
  onMonthSelect: (month: string) => void;
  numMonths: number;
  monthBounds: ComponentProps<typeof MonthPicker>['monthBounds'];
  isScrolled: boolean;
};

export const BudgetPageHeader = memo<BudgetPageHeaderProps>(
  ({ type, startMonth, onMonthSelect, numMonths, monthBounds, isScrolled }) => {
    const [categoryExpandedStatePref] = useGlobalPref('categoryExpandedState');
    const categoryExpandedState = categoryExpandedStatePref ?? 0;
    const offsetMultipleMonths = numMonths === 1 ? 4 : 0;

    if (type === 'envelope') {
      return (
        <EnvelopeBudgetPageHeader
          month={startMonth}
          numMonths={numMonths}
          monthBounds={monthBounds}
          onMonthSelect={onMonthSelect}
          isScrolled={isScrolled}
        />
      );
    }

    return (
      <View
        style={{
          marginLeft:
            200 + 100 * categoryExpandedState + 5 - offsetMultipleMonths,
          flexShrink: 0,
        }}
      >
        <View
          style={{
            marginRight: 5 + getScrollbarWidth() - offsetMultipleMonths,
          }}
        >
          <MonthPicker
            startMonth={startMonth}
            numDisplayed={numMonths}
            monthBounds={monthBounds}
            style={{ paddingTop: 5 }}
            onSelect={month => onMonthSelect(month)}
          />
        </View>
      </View>
    );
  },
);

BudgetPageHeader.displayName = 'BudgetPageHeader';
