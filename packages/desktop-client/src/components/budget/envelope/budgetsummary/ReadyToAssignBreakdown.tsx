import React from 'react';
import { Trans } from 'react-i18next';

import { AlignedText } from '@actual-app/components/aligned-text';
import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { Tooltip } from '@actual-app/components/tooltip';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';

import { EnvelopeCellValue } from '#components/budget/envelope/EnvelopeBudgetComponents';
import { FinancialText } from '#components/FinancialText';
import { PrivacyFilter } from '#components/PrivacyFilter';
import { CellValueText } from '#components/spreadsheet/CellValue';
import { useFormat } from '#hooks/useFormat';
import { useLocale } from '#hooks/useLocale';
import { envelopeBudget } from '#spreadsheet/bindings';

import { BreakdownRow } from './BreakdownRow';
import { makeSignedFormatter } from './TotalsList';

type ReadyToAssignBreakdownProps = {
  month: string;
  prevMonthName: string;
  /** From `useReadyToAssign`, so the total matches the card. */
  readyToAssign: number;
  neededForLaterMonths: number;
};

/**
 * The existing month breakdown (the same values and signs as `TotalsList`)
 * laid out as rows, ending in the Ready to Assign total (design-decisions §3).
 * When later months need some of this month's money, a "Needed for later
 * months" row takes it out, so the rows still add up (RTA-01).
 */
export function ReadyToAssignBreakdown({
  month,
  prevMonthName,
  readyToAssign,
  neededForLaterMonths,
}: ReadyToAssignBreakdownProps) {
  const locale = useLocale();
  const format = useFormat();
  const signedFormatter = makeSignedFormatter(format);
  const invertedSignedFormatter = makeSignedFormatter(format, true);

  return (
    <View
      data-testid="ready-to-assign-breakdown"
      style={{ padding: '12px 14px 4px', ...styles.smallText }}
    >
      <View
        style={{
          color: theme.pageTextFaint,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: 0.6,
          textTransform: 'uppercase',
          marginBottom: 6,
        }}
      >
        {monthUtils.format(month, 'MMMM yyyy', locale)}
      </View>

      <BreakdownRow label={<Trans>Available funds</Trans>}>
        <Tooltip
          style={{ ...styles.tooltip, lineHeight: 1.5, padding: '6px 10px' }}
          content={
            <>
              <AlignedText
                left="Income:"
                right={
                  <EnvelopeCellValue
                    binding={envelopeBudget.totalIncome}
                    type="financial"
                  />
                }
              />
              <AlignedText
                left="From Last Month:"
                right={
                  <EnvelopeCellValue
                    binding={envelopeBudget.fromLastMonth}
                    type="financial"
                  />
                }
              />
            </>
          }
          placement="bottom end"
        >
          <EnvelopeCellValue
            binding={envelopeBudget.incomeAvailable}
            type="financial"
          >
            {props => <CellValueText {...props} style={valueStyle} />}
          </EnvelopeCellValue>
        </Tooltip>
      </BreakdownRow>

      <BreakdownRow label={<Trans>Overspent in {{ prevMonthName }}</Trans>}>
        <EnvelopeCellValue
          binding={envelopeBudget.lastMonthOverspent}
          type="financial"
        >
          {props => (
            <CellValueText
              {...props}
              style={valueStyle}
              formatter={signedFormatter}
            />
          )}
        </EnvelopeCellValue>
      </BreakdownRow>

      <BreakdownRow label={<Trans>Assigned</Trans>}>
        <EnvelopeCellValue
          binding={envelopeBudget.totalBudgeted}
          type="financial"
        >
          {props => (
            <CellValueText
              {...props}
              style={valueStyle}
              formatter={signedFormatter}
            />
          )}
        </EnvelopeCellValue>
      </BreakdownRow>

      <BreakdownRow label={<Trans>For next month</Trans>}>
        <EnvelopeCellValue
          binding={envelopeBudget.forNextMonth}
          type="financial"
        >
          {props => (
            <CellValueText
              {...props}
              style={valueStyle}
              formatter={invertedSignedFormatter}
            />
          )}
        </EnvelopeCellValue>
      </BreakdownRow>

      {neededForLaterMonths !== 0 && (
        <BreakdownRow
          label={
            <Tooltip
              style={{ ...styles.tooltip, maxWidth: 260, padding: '6px 10px' }}
              content={
                <Trans
                  i18nKey="Money assigned in later months that their own funds do not cover. Without it, this month has <toBudget /> to assign."
                  components={{
                    toBudget: (
                      <PrivacyFilter>
                        <FinancialText>
                          {format(
                            readyToAssign + neededForLaterMonths,
                            'financial',
                          )}
                        </FinancialText>
                      </PrivacyFilter>
                    ),
                  }}
                />
              }
              placement="bottom start"
            >
              <span
                style={{
                  textDecoration: 'underline dotted',
                  textUnderlineOffset: 3,
                }}
              >
                <Trans>Needed for later months</Trans>
              </span>
            </Tooltip>
          }
        >
          <FinancialText
            data-testid="ready-to-assign-needed-later"
            style={valueStyle}
          >
            <PrivacyFilter>
              {signedFormatter(-neededForLaterMonths, 'financial')}
            </PrivacyFilter>
          </FinancialText>
        </BreakdownRow>
      )}

      <View
        style={{
          borderTop: `1px solid ${theme.cardHairline}`,
          marginTop: 6,
          paddingTop: 8,
          paddingBottom: 8,
        }}
      >
        <BreakdownRow label={<Trans>Ready to Assign</Trans>} isTotal>
          <FinancialText
            data-testid="ready-to-assign-breakdown-total"
            style={{
              ...valueStyle,
              fontWeight: 700,
              color:
                readyToAssign > 0
                  ? theme.toBudgetPositive
                  : readyToAssign < 0
                    ? theme.toBudgetNegative
                    : theme.pageText,
            }}
          >
            <PrivacyFilter>{format(readyToAssign, 'financial')}</PrivacyFilter>
          </FinancialText>
        </BreakdownRow>
      </View>
    </View>
  );
}

const valueStyle = { fontWeight: 600, color: theme.pageText };
