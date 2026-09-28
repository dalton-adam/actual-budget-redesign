import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { SurfaceCard } from '@actual-app/components/surface-card';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';

import { getSpendingBarSegments } from '#components/budget/categoryPresentation';
import { useEnvelopeSheetValue } from '#components/budget/envelope/EnvelopeBudgetComponents';
import { FinancialText } from '#components/FinancialText';
import { PrivacyFilter } from '#components/PrivacyFilter';
import { useCategories } from '#hooks/useCategories';
import { useFormat } from '#hooks/useFormat';
import { envelopeBudget } from '#spreadsheet/bindings';

import { ActivityStackedBar } from './ActivityStackedBar';
import { ReadyToAssignCard } from './ReadyToAssignCard';
import { SummaryStatCard } from './SummaryStatCard';
import { useCategoryActivity } from './useCategoryActivity';

type MonthSummaryCardsProps = {
  month: string;
  /**
   * The table has scrolled. On windows shorter than 900px the cards then
   * give way to the one-line strip (design-decisions §3).
   */
  isScrolled: boolean;
};

/**
 * The envelope month summary as cards: Ready to Assign, Assigned and
 * Activity for the focused month. Every value is an existing spreadsheet
 * cell; nothing here adds a total. Render inside the month's
 * `SheetNameProvider`.
 */
export function MonthSummaryCards({
  month,
  isScrolled,
}: MonthSummaryCardsProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const { data: { list: categories } = { list: [] } } = useCategories();
  const expenseCategories = categories.filter(category => !category.is_income);
  // Every expense category, hidden ones included, because the Assigned
  // total above it includes money assigned to hidden categories.
  const categoryCount = expenseCategories.length;

  const totalBudgeted =
    useEnvelopeSheetValue(envelopeBudget.totalBudgeted) ?? 0;
  const totalSpent = useEnvelopeSheetValue(envelopeBudget.totalSpent) ?? 0;
  const assigned = -totalBudgeted;
  const categoryActivity = useCategoryActivity(
    month,
    expenseCategories.map(category => category.id),
  );
  const segments = getSpendingBarSegments({
    assigned,
    categories: categoryActivity,
  });

  const assignedAmount = (
    <PrivacyFilter>
      <FinancialText>{format(assigned, 'financial')}</FinancialText>
    </PrivacyFilter>
  );
  const activityAmount = (
    <PrivacyFilter>
      <FinancialText>{format(totalSpent, 'financial')}</FinancialText>
    </PrivacyFilter>
  );

  const compactWhenShort = isScrolled && {
    '@media (max-height: 899px)': { display: 'none' },
  };
  const stripWhenShort = {
    display: 'none',
    ...(isScrolled && { '@media (max-height: 899px)': { display: 'flex' } }),
  };

  return (
    <>
      <View
        role="region"
        aria-label={t('Month summary')}
        data-testid="month-summary-cards"
        style={{
          flexDirection: 'row',
          gap: 14,
          ...compactWhenShort,
        }}
      >
        <ReadyToAssignCard month={month} />
        <SummaryStatCard
          label={<Trans>Assigned</Trans>}
          value={assignedAmount}
          footer={
            <View style={{ fontSize: 12.5, color: theme.pageTextSecondary }}>
              <Trans count={categoryCount}>
                across {{ count: categoryCount }} categories
              </Trans>
            </View>
          }
        />
        <SummaryStatCard
          label={<Trans>Activity</Trans>}
          value={activityAmount}
          footer={<ActivityStackedBar segments={segments} />}
        />
      </View>

      <SurfaceCard
        aria-label={t('Month summary')}
        data-testid="month-summary-strip"
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 18,
          height: 46,
          padding: '0 8px',
          borderRadius: 14,
          fontSize: 13,
          ...stripWhenShort,
        }}
      >
        <ReadyToAssignCard month={month} isCompact />
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <span style={{ color: theme.pageTextSecondary }}>
            <Trans>Assigned</Trans>
          </span>
          <b>{assignedAmount}</b>
        </View>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <span style={{ color: theme.pageTextSecondary }}>
            <Trans>Activity</Trans>
          </span>
          <b>{activityAmount}</b>
        </View>
      </SurfaceCard>
    </>
  );
}
