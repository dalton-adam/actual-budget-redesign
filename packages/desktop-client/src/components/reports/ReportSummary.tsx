import React from 'react';
import type { ReactNode } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';
import type {
  balanceTypeOpType,
  DataEntity,
} from '@actual-app/core/types/models';

import { FinancialText } from '#components/FinancialText';
import { PrivacyFilter } from '#components/PrivacyFilter';
import { useDateFormat } from '#hooks/useDateFormat';
import { useFormat } from '#hooks/useFormat';
import { useLocale } from '#hooks/useLocale';

import { getIntervalFormat, ReportOptions } from './ReportOptions';

type ReportSummaryProps = {
  data: DataEntity;
  balanceTypeOp: balanceTypeOpType;
  interval: string;
  intervalsCount: number;
  /** Side by side under the chart rather than stacked beside it. */
  isRow?: boolean;
};

/**
 * The custom report's summary (APP-03c): the period total and the average
 * per interval as stat tiles inside the chart card. The period itself is the
 * card's subline (see `useReportDateRangeText`).
 */
export function ReportSummary({
  data,
  balanceTypeOp,
  interval,
  intervalsCount,
  isRow = false,
}: ReportSummaryProps) {
  const { t } = useTranslation();
  const format = useFormat();

  const net =
    balanceTypeOp === 'netAssets'
      ? t('DEPOSIT')
      : balanceTypeOp === 'netDebts'
        ? t('PAYMENT')
        : Math.abs(data.totalDebts) > Math.abs(data.totalAssets)
          ? t('PAYMENT')
          : t('DEPOSIT');
  const average = Math.round(data[balanceTypeOp] / intervalsCount);
  return (
    <View
      style={{
        flexDirection: isRow ? 'row' : 'column',
        gap: 10,
        flexShrink: 0,
      }}
    >
      <SummaryTile
        label={
          balanceTypeOp === 'totalDebts'
            ? t('TOTAL SPENDING')
            : balanceTypeOp === 'totalAssets'
              ? t('TOTAL DEPOSITS')
              : balanceTypeOp === 'totalBudgeted'
                ? t('TOTAL BUDGETED')
                : t('NET {{net}}', { net })
        }
        value={format(data[balanceTypeOp], 'financial')}
        caption={<Trans>For this time period</Trans>}
      />
      <SummaryTile
        label={
          balanceTypeOp === 'totalDebts'
            ? t('AVERAGE SPENDING')
            : balanceTypeOp === 'totalAssets'
              ? t('AVERAGE DEPOSIT')
              : balanceTypeOp === 'totalBudgeted'
                ? t('AVERAGE BUDGETED')
                : t('AVERAGE NET')
        }
        value={!isNaN(average) ? format(average, 'financial') : ''}
        caption={
          <Trans>
            Per{' '}
            {{
              interval: (
                ReportOptions.intervalMap.get(interval) || ''
              ).toLowerCase(),
            }}
          </Trans>
        }
      />
    </View>
  );
}

/** The report's period, e.g. "Apr 2026 to Sep 2026", in the interval's format. */
export function useReportDateRangeText(
  startDate: string,
  endDate: string,
  interval: string,
) {
  const locale = useLocale();
  const { t } = useTranslation();
  const dateFormat = useDateFormat() || 'MM/dd/yyyy';
  const intervalFormat = getIntervalFormat(interval, dateFormat);
  const start = monthUtils.format(startDate, intervalFormat, locale);
  const end = monthUtils.format(endDate, intervalFormat, locale);
  return start !== end ? `${start} ${t('to')} ${end}` : start;
}

function SummaryTile({
  label,
  value,
  caption,
}: {
  label: string;
  value: string;
  caption: ReactNode;
}) {
  return (
    <View
      style={{
        flex: 1,
        minWidth: 0,
        backgroundColor: theme.cardInset,
        borderRadius: 10,
        padding: '8px 10px',
        gap: 2,
      }}
    >
      <Text
        style={{
          fontSize: 11,
          fontWeight: 650,
          letterSpacing: '0.07em',
          color: theme.pageTextSecondary,
        }}
      >
        {label}
      </Text>
      <FinancialText
        style={{
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: -0.3,
          color: theme.pageText,
        }}
      >
        <PrivacyFilter>{value}</PrivacyFilter>
      </FinancialText>
      <Text style={{ fontSize: 12, color: theme.pageTextSecondary }}>
        {caption}
      </Text>
    </View>
  );
}
