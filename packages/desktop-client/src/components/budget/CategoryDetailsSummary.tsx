import React from 'react';
import { useTranslation } from 'react-i18next';

import { getAccentColor } from '@actual-app/components/category-tile';
import { ProgressBar } from '@actual-app/components/progress-bar';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';
import type { CategoryEntity } from '@actual-app/core/types/models';

import { FinancialText } from '#components/FinancialText';
import { PrivacyFilter } from '#components/PrivacyFilter';
import { useFormat } from '#hooks/useFormat';
import { useLocale } from '#hooks/useLocale';
import { envelopeBudget } from '#spreadsheet/bindings';

import { CategoryDetailsStatTile } from './CategoryDetailsStatTile';
import {
  getCarriedIn,
  getCategoryAccentIndex,
  getCategoryProgress,
} from './categoryPresentation';
import { useEnvelopeValue } from './envelopeTable';

type CategoryDetailsSummaryProps = {
  category: CategoryEntity;
  month: string;
};

/**
 * The panel's hero and stat tiles (design-decisions §5, items 2 and 3).
 * Every amount is an existing envelope value for the month; the carried-in
 * tile is read back from them (`getCarriedIn`).
 */
export function CategoryDetailsSummary({
  category,
  month,
}: CategoryDetailsSummaryProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const locale = useLocale();

  const available =
    useEnvelopeValue(envelopeBudget.catBalance(category.id)) ?? 0;
  const assigned =
    useEnvelopeValue(envelopeBudget.catBudgeted(category.id)) ?? 0;
  const activity =
    useEnvelopeValue(envelopeBudget.catSumAmount(category.id)) ?? 0;
  const carryover = useEnvelopeValue(envelopeBudget.catCarryover(category.id));

  const progress = getCategoryProgress({ activity, available });
  const carriedIn = getCarriedIn({ available, assigned, activity });
  const isNegative = available < 0;
  const nextMonth = monthUtils.format(
    monthUtils.nextMonth(month),
    'MMMM',
    locale,
  );
  const previousMonth = monthUtils.format(
    monthUtils.prevMonth(month),
    'MMM',
    locale,
  );

  return (
    <View style={{ gap: 16 }}>
      <View style={{ gap: 10 }}>
        <View
          data-testid="category-details-hero"
          style={{
            flexDirection: 'row',
            alignItems: 'baseline',
            flexWrap: 'wrap',
            columnGap: 8,
          }}
        >
          <PrivacyFilter style={{ flexGrow: 0 }}>
            <FinancialText
              data-testid="category-details-available"
              style={{
                fontSize: 34,
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: -0.8,
                color: isNegative ? theme.pillNegativeText : theme.pageText,
              }}
            >
              {format(available, 'financial')}
            </FinancialText>
          </PrivacyFilter>
          <View style={{ fontSize: 14, color: theme.pageTextSecondary }}>
            {isNegative ? t('Overspent') : t('Available')}
          </View>
        </View>
        {isNegative && (
          <View
            style={{
              fontSize: 12.5,
              lineHeight: 1.4,
              color: theme.pageTextSecondary,
            }}
          >
            {carryover
              ? t(
                  'Overspending rolls over to {{month}} instead of reducing Ready to Assign.',
                  { month: nextMonth },
                )
              : t(
                  "If it isn't covered, this comes out of {{month}}'s Ready to Assign.",
                  { month: nextMonth },
                )}
          </View>
        )}
        <ProgressBar
          value={progress.fill}
          height={6}
          color={
            progress.isOverspent
              ? theme.pillNegativeText
              : getAccentColor(getCategoryAccentIndex(category.id))
          }
        />
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <CategoryDetailsStatTile
          testId="category-details-carried-in"
          label={t('From {{month}}', { month: previousMonth })}
          value={format(carriedIn, 'financial')}
        />
        <CategoryDetailsStatTile
          testId="category-details-assigned"
          label={t('Assigned')}
          value={format(assigned, 'financial')}
        />
        <CategoryDetailsStatTile
          testId="category-details-activity"
          label={t('Activity')}
          value={format(activity, 'financial')}
        />
      </View>
    </View>
  );
}
