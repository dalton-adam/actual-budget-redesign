import React from 'react';
import type { ReactNode } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import {
  SvgCheveronLeft,
  SvgCheveronRight,
} from '@actual-app/components/icons/v1';
import { SurfaceCard } from '@actual-app/components/surface-card';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';

import { useLocale } from '#hooks/useLocale';

import { BudgetMonthPicker } from './BudgetMonthPicker';
import type { MonthBounds } from './MonthsContext';

type BudgetMonthToolbarProps = {
  month: string;
  numMonths: number;
  monthBounds: MonthBounds;
  onMonthSelect: (month: string) => void;
  /** Month tools shown after the stepper, such as notes and the month menu. */
  tools?: ReactNode;
};

/**
 * The budget page's month header (design-decisions §3): "Budget" eyebrow,
 * the focused month as the title, a month stepper and, away from the
 * current month, a Today button.
 */
export function BudgetMonthToolbar({
  month,
  numMonths,
  monthBounds,
  onMonthSelect,
  tools,
}: BudgetMonthToolbarProps) {
  const { t } = useTranslation();
  const locale = useLocale();
  const currentMonth = monthUtils.currentMonth();
  const lastStartMonth = monthUtils.subMonths(monthBounds.end, numMonths - 1);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}
    >
      <View style={{ minWidth: 0 }}>
        <View style={{ color: theme.pageTextSecondary, fontSize: 13 }}>
          {month < currentMonth ? (
            <Trans>Budget · Past month</Trans>
          ) : month > currentMonth ? (
            <Trans>Budget · Future month</Trans>
          ) : (
            <Trans>Budget</Trans>
          )}
        </View>
        <h1
          style={{
            margin: 0,
            fontSize: 28,
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: -0.4,
            color: theme.pageText,
          }}
        >
          {monthUtils.format(month, 'MMMM yyyy', locale)}
        </h1>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {month !== currentMonth && (
          <Button variant="control" onPress={() => onMonthSelect(currentMonth)}>
            <Trans>Today</Trans>
          </Button>
        )}
        <SurfaceCard
          role="group"
          aria-label={t('Month')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 3,
            borderRadius: 12,
          }}
        >
          <Button
            variant="control"
            aria-label={t('Previous month')}
            isDisabled={month <= monthBounds.start}
            onPress={() => onMonthSelect(monthUtils.prevMonth(month))}
          >
            <SvgCheveronLeft width={14} height={14} />
          </Button>
          <BudgetMonthPicker
            month={month}
            monthBounds={monthBounds}
            onMonthSelect={onMonthSelect}
          />
          <Button
            variant="control"
            aria-label={t('Next month')}
            isDisabled={month >= lastStartMonth}
            onPress={() => onMonthSelect(monthUtils.nextMonth(month))}
          >
            <SvgCheveronRight width={14} height={14} />
          </Button>
        </SurfaceCard>
        {tools && (
          <SurfaceCard
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 2,
              padding: 3,
              borderRadius: 12,
            }}
          >
            {tools}
          </SurfaceCard>
        )}
      </View>
    </View>
  );
}
