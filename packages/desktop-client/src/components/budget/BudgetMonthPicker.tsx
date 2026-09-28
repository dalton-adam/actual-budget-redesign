import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import {
  SvgCheveronLeft,
  SvgCheveronRight,
} from '@actual-app/components/icons/v1';
import { Popover } from '@actual-app/components/popover';
import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';
import { css } from '@emotion/css';

import { useLocale } from '#hooks/useLocale';

import type { MonthBounds } from './MonthsContext';

type BudgetMonthPickerProps = {
  month: string;
  monthBounds: MonthBounds;
  onMonthSelect: (month: string) => void;
};

/**
 * The stepper's month label. Pressing it opens a year of months for
 * jumping straight to a distant month; months outside the budget are
 * disabled.
 */
export function BudgetMonthPicker({
  month,
  monthBounds,
  onMonthSelect,
}: BudgetMonthPickerProps) {
  const { t } = useTranslation();
  const locale = useLocale();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [year, setYear] = useState(() => Number(month.slice(0, 4)));
  const currentMonth = monthUtils.currentMonth();
  const startYear = Number(monthBounds.start.slice(0, 4));
  const endYear = Number(monthBounds.end.slice(0, 4));
  const months = Array.from(
    { length: 12 },
    (_, i) => `${year}-${String(i + 1).padStart(2, '0')}`,
  );

  return (
    <>
      <Button
        ref={triggerRef}
        variant="bare"
        data-testid="selected-budget-month"
        data-month={month}
        aria-label={t('Choose month, {{month}}', {
          month: monthUtils.format(month, 'MMMM yyyy', locale),
        })}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onPress={() => {
          setYear(Number(month.slice(0, 4)));
          setIsOpen(true);
        }}
        className={css({
          minWidth: 92,
          fontWeight: 600,
          fontSize: 13.5,
          borderRadius: 9,
          color: theme.pageText,
          '&[data-focus-visible]': styles.focusRing,
        })}
      >
        {monthUtils.format(month, 'MMM yyyy', locale)}
      </Button>

      <Popover
        triggerRef={triggerRef}
        placement="bottom"
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        style={{ padding: 10, width: 236 }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 8,
          }}
        >
          <Button
            variant="control"
            aria-label={t('Previous year')}
            isDisabled={year <= startYear}
            onPress={() => setYear(year - 1)}
          >
            <SvgCheveronLeft width={12} height={12} />
          </Button>
          <View style={{ fontWeight: 600, ...styles.tnum }}>{year}</View>
          <Button
            variant="control"
            aria-label={t('Next year')}
            isDisabled={year >= endYear}
            onPress={() => setYear(year + 1)}
          >
            <SvgCheveronRight width={12} height={12} />
          </Button>
        </View>
        <View
          role="group"
          aria-label={String(year)}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 4,
          }}
        >
          {months.map(option => {
            const isSelected = option === month;
            return (
              <Button
                key={option}
                variant={isSelected ? 'tabSelected' : 'tab'}
                aria-label={monthUtils.format(option, 'MMMM yyyy', locale)}
                aria-current={isSelected ? 'date' : undefined}
                isDisabled={
                  option < monthBounds.start || option > monthBounds.end
                }
                onPress={() => {
                  onMonthSelect(option);
                  setIsOpen(false);
                }}
                style={{
                  padding: '6px 0',
                  fontWeight: option === currentMonth ? 700 : undefined,
                  ...(option === currentMonth &&
                    !isSelected && {
                      boxShadow: `inset 0 0 0 1px ${theme.selectionBorder}`,
                    }),
                }}
              >
                {monthUtils.format(option, 'MMM', locale)}
              </Button>
            );
          })}
        </View>
      </Popover>
    </>
  );
}
