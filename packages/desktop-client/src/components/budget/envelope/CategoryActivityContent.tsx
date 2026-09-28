import React from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { getAccentColor } from '@actual-app/components/category-tile';
import { ProgressBar } from '@actual-app/components/progress-bar';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import type { CategoryEntity } from '@actual-app/core/types/models';

import {
  getCategoryAccentIndex,
  getCategoryProgress,
} from '#components/budget/categoryPresentation';
import { useEnvelopeValue } from '#components/budget/envelopeTable';
import { PrivacyFilter } from '#components/PrivacyFilter';
import { envelopeBudget } from '#spreadsheet/bindings';

type CategoryActivityContentProps = {
  categoryId: CategoryEntity['id'];
  /** The percentage label is hidden when the Activity column is narrow. */
  showPercent: boolean;
  /** The existing Activity amount (and schedule indicator). */
  children: ReactNode;
};

/**
 * Activity cell body (design-decisions §4.2): the amount, the share of the
 * envelope used, and the §7.1 progress bar. Display only; the amount beside
 * the bar is the existing value.
 */
export function CategoryActivityContent({
  categoryId,
  showPercent,
  children,
}: CategoryActivityContentProps) {
  const { t } = useTranslation();
  const activity =
    useEnvelopeValue(envelopeBudget.catSumAmount(categoryId)) ?? 0;
  const available =
    useEnvelopeValue(envelopeBudget.catBalance(categoryId)) ?? 0;
  const progress = getCategoryProgress({ activity, available });

  const percentLabel = progress.isOverspent
    ? t('Over')
    : progress.percent !== null
      ? t('{{percent}}%', { percent: progress.percent })
      : '';

  return (
    <View style={{ gap: 5 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {showPercent && percentLabel !== '' && (
          <Text
            style={{
              flexShrink: 0,
              fontSize: 12,
              color: progress.isOverspent
                ? theme.pillNegativeText
                : theme.pageTextFaint,
              ...styles.tnum,
            }}
          >
            <PrivacyFilter>{percentLabel}</PrivacyFilter>
          </Text>
        )}
        <View style={{ flex: 1, minWidth: 0 }}>{children}</View>
      </View>
      <ProgressBar
        value={progress.fill}
        color={
          progress.isOverspent
            ? theme.pillNegativeText
            : getAccentColor(getCategoryAccentIndex(categoryId))
        }
      />
    </View>
  );
}
