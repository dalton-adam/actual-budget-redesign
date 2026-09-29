import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { getAccentColor } from '@actual-app/components/category-tile';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';
import { q } from '@actual-app/core/shared/query';
import type { CategoryEntity } from '@actual-app/core/types/models';

import { PrivacyFilter } from '#components/PrivacyFilter';
import { useFormat } from '#hooks/useFormat';
import { useLocale } from '#hooks/useLocale';
import { usePrivacyMode } from '#hooks/usePrivacyMode';
import { useQuery } from '#hooks/useQuery';

import { CategoryDetailsLegendKey } from './CategoryDetailsLegendKey';
import {
  CategoryDetailsPaceChart,
  PACE_CHART_HEIGHT,
} from './CategoryDetailsPaceChart';
import { CategoryDetailsSection } from './CategoryDetailsSection';
import {
  getCategoryAccentIndex,
  getCategoryPace,
} from './categoryPresentation';
import type { PaceTransaction } from './categoryPresentation';

const messageStyle = {
  height: PACE_CHART_HEIGHT,
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 12.5,
  color: theme.pageTextSecondary,
} as const;

type CategoryDetailsPaceProps = {
  category: CategoryEntity;
  month: string;
  available: number;
  activity: number;
};

/**
 * The pace chart with its legend and text summary (design-decisions §5
 * item 5, §7.2). Spending by day comes from the same category/month filter
 * as the transaction list and the category balance bindings.
 */
export function CategoryDetailsPace({
  category,
  month,
  available,
  activity,
}: CategoryDetailsPaceProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const locale = useLocale();
  const isPrivacyEnabled = usePrivacyMode();

  const { data, isLoading, error } = useQuery<PaceTransaction>(
    () =>
      q('transactions')
        .filter({
          category: category.id,
          date: { $transform: '$month', $eq: month },
        })
        .options({ splits: 'inline' })
        .groupBy('date')
        .select(['date', { amount: { $sum: '$amount' } }]),
    [category.id, month],
  );

  const pace = getCategoryPace({
    month,
    today: monthUtils.currentDay(),
    // Carried in + Assigned (design-decisions §7.2).
    start: available - activity,
    available,
    transactions: data ? [...data] : [],
  });

  const monthShort = monthUtils.format(month, 'MMM', locale);
  let summary: string;
  switch (pace.summary.type) {
    case 'to-spend':
      summary = t('{{amount}} to spend from {{date}}', {
        amount: format(pace.summary.amount, 'financial'),
        date: `${monthShort} 1`,
      });
      break;
    case 'no-pace-line':
      summary = t('Nothing assigned, so no pace line');
      break;
    case 'no-activity':
      summary = t('No activity yet this month');
      break;
    case 'finished-left':
      summary = t('Finished with {{amount}} left', {
        amount: format(pace.summary.amount, 'financial'),
      });
      break;
    case 'finished-overspent':
      summary = t('Finished {{amount}} overspent', {
        amount: format(pace.summary.amount, 'financial'),
      });
      break;
    case 'under-pace':
      summary = t('{{amount}} under even pace', {
        amount: format(pace.summary.amount, 'financial'),
      });
      break;
    case 'over-pace':
      summary = t('{{amount}} over even pace', {
        amount: format(pace.summary.amount, 'financial'),
      });
      break;
    default:
      summary = '';
  }

  const color =
    available < 0
      ? theme.pillNegativeText
      : getAccentColor(getCategoryAccentIndex(category.id));
  const isReady = !error && !isLoading && !!data;

  let content;
  if (error) {
    content = (
      <View style={messageStyle}>
        <Trans>Spending couldn't be loaded.</Trans>
      </View>
    );
  } else if (!isReady) {
    content = (
      <View style={messageStyle}>
        <Trans>Loading…</Trans>
      </View>
    );
  } else if (isPrivacyEnabled) {
    content = (
      <View style={messageStyle}>
        <Trans>Chart hidden in privacy mode</Trans>
      </View>
    );
  } else {
    content = <CategoryDetailsPaceChart pace={pace} color={color} />;
  }

  // The chart's text equivalent (design-decisions §7.2); no amounts in
  // privacy mode.
  let description: string | undefined;
  if (isReady && isPrivacyEnabled) {
    description = t('Pace chart hidden in privacy mode');
  } else if (isReady && pace.kind === 'future') {
    description = t('{{month}} has not started. {{summary}}.', {
      month: monthUtils.format(month, 'MMMM', locale),
      summary,
    });
  } else if (isReady) {
    description = t('Spent {{spent}} of {{start}} by {{date}}. {{summary}}.', {
      spent: format(pace.spent, 'financial'),
      start: format(Math.max(0, pace.start), 'financial'),
      date: `${monthShort} ${pace.upto}`,
      summary,
    });
  }

  return (
    <CategoryDetailsSection
      title={<Trans>Pace</Trans>}
      aside={`${monthShort} 1 – ${pace.days}`}
    >
      <View
        role="img"
        data-testid="category-details-pace"
        aria-busy={!isReady && !error}
        aria-label={description}
      >
        {content}
      </View>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          columnGap: 12,
          rowGap: 2,
          marginTop: 6,
          fontSize: 12,
          color: theme.pageTextSecondary,
        }}
      >
        {pace.kind !== 'future' && (
          <CategoryDetailsLegendKey color={color}>
            <Trans>Activity</Trans>
          </CategoryDetailsLegendKey>
        )}
        {pace.hasPaceLine && (
          <CategoryDetailsLegendKey color={theme.pageTextFaint}>
            <Trans>Even pace</Trans>
          </CategoryDetailsLegendKey>
        )}
        {pace.kind === 'current' && (
          <CategoryDetailsLegendKey color={theme.pageTextFaint} isTick>
            <Trans>Today</Trans>
          </CategoryDetailsLegendKey>
        )}
        {isReady && (
          <PrivacyFilter style={{ marginLeft: 'auto', flexGrow: 0 }}>
            <span
              data-testid="category-details-pace-summary"
              style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}
            >
              {summary}
            </span>
          </PrivacyFilter>
        )}
      </View>
    </CategoryDetailsSection>
  );
}
