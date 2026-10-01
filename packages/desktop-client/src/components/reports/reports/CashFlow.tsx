import React, { useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { AlignedText } from '@actual-app/components/aligned-text';
import { Block } from '@actual-app/components/block';
import { Button } from '@actual-app/components/button';
import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import { Paragraph } from '@actual-app/components/paragraph';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import { send } from '@actual-app/core/platform/client/connection';
import * as monthUtils from '@actual-app/core/shared/months';
import type {
  CashFlowWidget,
  RuleConditionEntity,
  TimeFrame,
} from '@actual-app/core/types/models';
import * as d from 'date-fns';

import { FinancialText } from '#components/FinancialText';
import { MobileBackButton } from '#components/mobile/MobileBackButton';
import { MobilePageHeader, Page, PageHeader } from '#components/Page';
import { PrivacyFilter } from '#components/PrivacyFilter';
import { DateRange } from '#components/reports/DateRange';
import { CashFlowGraph } from '#components/reports/graphs/CashFlowGraph';
import { Header } from '#components/reports/Header';
import { LoadingIndicator } from '#components/reports/LoadingIndicator';
import { ReportPageBody } from '#components/reports/ReportPageBody';
import { ReportPageCard } from '#components/reports/ReportPageCard';
import { ReportPageCardHeader } from '#components/reports/ReportPageCardHeader';
import { ReportPageTitle } from '#components/reports/ReportPageTitle';
import { calculateTimeRange } from '#components/reports/reportRanges';
import { cashFlowByDate } from '#components/reports/spreadsheets/cash-flow-spreadsheet';
import { useReport } from '#components/reports/useReport';
import { useReportControlVariant } from '#components/reports/useReportControlVariant';
import { useDashboardWidget } from '#hooks/useDashboardWidget';
import { useFormat } from '#hooks/useFormat';
import { useLocale } from '#hooks/useLocale';
import { useNavigate } from '#hooks/useNavigate';
import { useRuleConditionFilters } from '#hooks/useRuleConditionFilters';
import { useSyncedPref } from '#hooks/useSyncedPref';
import { addNotification } from '#notifications/notificationsSlice';
import { useDispatch } from '#redux';
import { useUpdateDashboardWidgetMutation } from '#reports/mutations';

// Month-shaped so the range means the whole current month (the query clamps
// to today); day-shaped values here would slide by days instead.
export const defaultTimeFrame = {
  start: monthUtils.currentMonth(),
  end: monthUtils.currentMonth(),
  mode: 'sliding-window',
} satisfies TimeFrame;

export function CashFlow() {
  const params = useParams();
  const { data: widget, isPending } = useDashboardWidget<CashFlowWidget>({
    id: params.id,
    type: 'cash-flow-card',
  });

  if (isPending) {
    return <LoadingIndicator />;
  }

  return <CashFlowInner widget={widget} />;
}

type CashFlowInnerProps = {
  widget?: CashFlowWidget;
};

function CashFlowInner({ widget }: CashFlowInnerProps) {
  const normalControlVariant = useReportControlVariant('normal');
  const locale = useLocale();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const format = useFormat();

  const {
    conditions,
    conditionsOp,
    onApply: onApplyFilter,
    onDelete: onDeleteFilter,
    onUpdate: onUpdateFilter,
    onConditionsOpChange,
  } = useRuleConditionFilters<RuleConditionEntity>(
    widget?.meta?.conditions,
    widget?.meta?.conditionsOp,
  );

  const [allMonths, setAllMonths] = useState<null | Array<{
    name: string;
    pretty: string;
  }>>(null);

  const [start, setStart] = useState(monthUtils.currentMonth());
  const [end, setEnd] = useState(monthUtils.currentMonth());
  const [mode, setMode] = useState<TimeFrame['mode']>('sliding-window');
  const [showBalance, setShowBalance] = useState(
    widget?.meta?.showBalance ?? true,
  );
  const [latestTransaction, setLatestTransaction] = useState('');

  const [isConcise, setIsConcise] = useState(false);

  useEffect(() => {
    const numDays = d.differenceInCalendarDays(
      d.parseISO(end),
      d.parseISO(start),
    );
    setIsConcise(numDays > 31 * 3);
  }, [start, end]);

  const params = useMemo(
    () =>
      cashFlowByDate(
        start,
        end,
        isConcise,
        conditions,
        conditionsOp,
        locale,
        format,
      ),
    [start, end, isConcise, conditions, conditionsOp, locale, format],
  );
  const data = useReport('cash_flow', params);

  useEffect(() => {
    async function run() {
      const earliestTransaction = await send('get-earliest-transaction');
      setEarliestTransaction(
        earliestTransaction
          ? earliestTransaction.date
          : monthUtils.currentDay(),
      );

      const latestTransaction = await send('get-latest-transaction');
      setLatestTransaction(
        latestTransaction ? latestTransaction.date : monthUtils.currentDay(),
      );

      const currentMonth = monthUtils.currentMonth();
      const earliestMonth = earliestTransaction
        ? monthUtils.monthFromDate(d.parseISO(earliestTransaction.date))
        : currentMonth;
      const latestTransactionMonth = latestTransaction
        ? monthUtils.monthFromDate(d.parseISO(latestTransaction.date))
        : currentMonth;

      const latestMonth =
        latestTransactionMonth > currentMonth
          ? latestTransactionMonth
          : currentMonth;

      const allMonths = monthUtils
        .rangeInclusive(earliestMonth, latestMonth)
        .map(month => ({
          name: month,
          pretty: monthUtils.format(month, 'MMMM yyyy', locale),
        }))
        .reverse();

      setAllMonths(allMonths);
    }
    void run();
  }, [locale]);

  useEffect(() => {
    if (latestTransaction) {
      const [initialStart, initialEnd, initialMode] = calculateTimeRange(
        widget?.meta?.timeFrame,
        defaultTimeFrame,
        latestTransaction,
      );
      setStart(initialStart);
      setEnd(initialEnd);
      setMode(initialMode);
    }
  }, [latestTransaction, widget?.meta?.timeFrame]);

  function onChangeDates(start: string, end: string, mode: TimeFrame['mode']) {
    setStart(start);
    setEnd(end);
    setMode(mode);
  }

  const navigate = useNavigate();
  const { isNarrowWidth } = useResponsive();
  const updateDashboardWidgetMutation = useUpdateDashboardWidgetMutation();

  async function onSaveWidget() {
    if (!widget) {
      throw new Error('No widget that could be saved.');
    }

    updateDashboardWidgetMutation.mutate(
      {
        widget: {
          id: widget.id,
          meta: {
            ...(widget.meta ?? {}),
            conditions,
            conditionsOp,
            timeFrame: {
              start,
              end,
              mode,
            },
            showBalance,
          },
        },
      },
      {
        onSuccess: () => {
          dispatch(
            addNotification({
              notification: {
                type: 'message',
                message: t('Dashboard widget successfully saved.'),
              },
            }),
          );
        },
      },
    );
  }

  const title = widget?.meta?.name || t('Cash Flow');
  const onSaveWidgetName = async (newName: string) => {
    if (!widget) {
      throw new Error('No widget that could be saved.');
    }

    const name = newName || t('Cash Flow');
    updateDashboardWidgetMutation.mutate({
      widget: {
        id: widget.id,
        meta: {
          ...(widget.meta ?? {}),
          name,
        },
      },
    });
  };

  const [earliestTransaction, setEarliestTransaction] = useState('');
  const [_firstDayOfWeekIdx] = useSyncedPref('firstDayOfWeekIdx');
  const firstDayOfWeekIdx = _firstDayOfWeekIdx || '0';

  if (!allMonths || !data) {
    return null;
  }

  const { graphData, totalExpenses, totalIncome, totalTransfers } = data;

  return (
    <Page
      header={
        isNarrowWidth ? (
          <MobilePageHeader
            title={title}
            leftContent={
              <MobileBackButton onPress={() => navigate('/reports')} />
            }
          />
        ) : (
          <PageHeader
            title={
              <ReportPageTitle
                title={title}
                widget={widget}
                onSave={onSaveWidgetName}
              />
            }
          />
        )
      }
      padding={0}
    >
      <Header
        allMonths={allMonths}
        start={start}
        end={end}
        earliestTransaction={earliestTransaction}
        latestTransaction={latestTransaction}
        firstDayOfWeekIdx={firstDayOfWeekIdx}
        granularities={['month', 'day']}
        mode={mode}
        show1Month
        onChangeDates={onChangeDates}
        onApply={onApplyFilter}
        filters={conditions}
        onUpdateFilter={onUpdateFilter}
        onDeleteFilter={onDeleteFilter}
        conditionsOp={conditionsOp}
        onConditionsOpChange={onConditionsOpChange}
      >
        <Button
          variant={normalControlVariant}
          onPress={() => setShowBalance(state => !state)}
        >
          {showBalance ? t('Hide balance') : t('Show balance')}
        </Button>

        {widget && (
          <Button variant="primary" onPress={onSaveWidget}>
            <Trans>Save widget</Trans>
          </Button>
        )}
      </Header>
      <ReportPageBody>
        <ReportPageCard>
          <ReportPageCardHeader
            title={title}
            subtitle={<DateRange start={start} end={end} isWidget />}
            summary={
              <View style={{ alignItems: 'flex-end', color: theme.pageText }}>
                <AlignedText
                  style={{ marginBottom: 5, minWidth: 160 }}
                  left={
                    <Block>
                      <Trans>Income:</Trans>
                    </Block>
                  }
                  right={
                    <FinancialText style={{ fontWeight: 600 }}>
                      <PrivacyFilter>
                        {format(totalIncome, 'financial')}
                      </PrivacyFilter>
                    </FinancialText>
                  }
                />

                <AlignedText
                  style={{ marginBottom: 5, minWidth: 160 }}
                  left={
                    <Block>
                      <Trans>Expenses:</Trans>
                    </Block>
                  }
                  right={
                    <FinancialText style={{ fontWeight: 600 }}>
                      <PrivacyFilter>
                        {format(totalExpenses, 'financial')}
                      </PrivacyFilter>
                    </FinancialText>
                  }
                />

                <AlignedText
                  style={{ marginBottom: 5, minWidth: 160 }}
                  left={
                    <Block>
                      <Trans>Transfers:</Trans>
                    </Block>
                  }
                  right={
                    <FinancialText style={{ fontWeight: 600 }}>
                      <PrivacyFilter>
                        {format(totalTransfers, 'financial')}
                      </PrivacyFilter>
                    </FinancialText>
                  }
                />
              </View>
            }
            changeAmount={totalIncome + totalExpenses + totalTransfers}
          />

          <CashFlowGraph
            graphData={graphData}
            isConcise={isConcise}
            showBalance={showBalance}
          />
        </ReportPageCard>

        <ReportPageCard style={{ userSelect: 'none' }}>
          <Trans>
            <Paragraph>
              <strong>How is cash flow calculated?</strong>
            </Paragraph>
            <Paragraph isLast>
              Cash flow shows the balance of your budgeted accounts over time,
              and the amount of expenses/income each day or month. Your budgeted
              accounts are considered to be "cash on hand," so this gives you a
              picture of how available money fluctuates.
            </Paragraph>
          </Trans>
        </ReportPageCard>
      </ReportPageBody>
    </Page>
  );
}
