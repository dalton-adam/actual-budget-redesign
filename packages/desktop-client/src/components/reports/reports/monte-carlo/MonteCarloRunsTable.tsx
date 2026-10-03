import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { Select } from '@actual-app/components/select';
import { StatusPill } from '@actual-app/components/status-pill';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';

import { FinancialText } from '#components/FinancialText';
import { PrivacyFilter } from '#components/PrivacyFilter';
import { useMonteCarloStyles } from '#components/reports/reports/monte-carlo/monteCarloStyles';
import { useReportControlVariant } from '#components/reports/useReportControlVariant';
import { useFormat } from '#hooks/useFormat';

const PAGE_SIZE = 20;

type SortOrder = 'worst-first' | 'best-first';

/**
 * The percentiles of the worst-first ranking a user can jump to (0 =
 * worst run, 1 = best run), as Select options. Shared with the cashflow
 * chart's scenario picker so both land on the same runs.
 */
export function getRunPercentileOptions(
  translate: (key: string) => string,
): Array<[string, string]> {
  return [
    ['0', translate('Worst run')],
    ['0.25', translate('25th percentile')],
    ['0.5', translate('Median run')],
    ['0.75', translate('75th percentile')],
    ['1', translate('Best run')],
  ];
}

type MonteCarloRunsTableProps = {
  /** Every run's index, worst outcome first (ranked once by the parent) */
  rankedIndices: number[];
  endingBalances: Float64Array;
  depletionYearBySimulation: Int32Array;
  totalWithdrawnBySimulation: Float64Array;
  startAge: number;
  onSelectRun: (simulationIndex: number) => void;
};

export function MonteCarloRunsTable({
  rankedIndices,
  endingBalances,
  depletionYearBySimulation,
  totalWithdrawnBySimulation,
  startAge,
  onSelectRun,
}: MonteCarloRunsTableProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const { isCard, groupHeading } = useMonteCarloStyles();
  const controlVariant = useReportControlVariant('normal');
  const rowBorder = `1px solid ${isCard ? theme.cardHairline : theme.tableBorder}`;

  const [sortOrder, setSortOrder] = useState<SortOrder>('worst-first');
  const [page, setPage] = useState(0);
  const [highlightedRank, setHighlightedRank] = useState<number | null>(null);

  const simulationCount = rankedIndices.length;

  // Jump straight to a given percentile of the ranked outcomes (0 = worst,
  // 1 = best), landing on its page and highlighting the exact run
  function jumpToPercentile(percentile: number) {
    const worstFirstRank = Math.round(percentile * (simulationCount - 1));
    const rank =
      sortOrder === 'worst-first'
        ? worstFirstRank
        : simulationCount - 1 - worstFirstRank;
    setPage(Math.floor(rank / PAGE_SIZE));
    setHighlightedRank(rank);
  }

  const pageCount = Math.max(1, Math.ceil(simulationCount / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const pageStart = currentPage * PAGE_SIZE;
  // Best-first reads the same ranking from the other end, so no copy of
  // the full list is made for either order
  const pageIndices = Array.from(
    { length: Math.max(0, Math.min(PAGE_SIZE, simulationCount - pageStart)) },
    (_, offset) => {
      const rank = pageStart + offset;
      return rankedIndices[
        sortOrder === 'best-first' ? simulationCount - 1 - rank : rank
      ];
    },
  );

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
          marginBottom: 10,
        }}
      >
        <Text style={isCard ? { color: theme.pageTextSecondary } : undefined}>
          {t('Showing {{from}}-{{to}} of {{total}} runs', {
            from: pageStart + 1,
            to: pageStart + pageIndices.length,
            total: simulationCount,
          })}
        </Text>
        <Select
          value={sortOrder}
          onChange={value => {
            setSortOrder(value as SortOrder);
            setPage(0);
            setHighlightedRank(null);
          }}
          options={[
            ['worst-first', t('Worst outcomes first')],
            ['best-first', t('Best outcomes first')],
          ]}
          triggerVariant={controlVariant}
          style={{ width: 200 }}
        />
      </View>

      {/* Header row */}
      <View
        style={{
          flexDirection: 'row',
          paddingBottom: 8,
          paddingLeft: 8,
          paddingRight: 8,
          borderBottom: rowBorder,
          gap: 10,
        }}
      >
        <Text style={{ ...groupHeading, width: 80 }}>
          <Trans>Rank</Trans>
        </Text>
        <Text style={{ ...groupHeading, flex: 1 }}>
          <Trans>Outcome</Trans>
        </Text>
        <Text style={{ ...groupHeading, width: 160, textAlign: 'right' }}>
          <Trans>Ending balance</Trans>
        </Text>
        <Text style={{ ...groupHeading, width: 160, textAlign: 'right' }}>
          <Trans>Total withdrawn</Trans>
        </Text>
      </View>

      {pageIndices.map((simulationIndex, rowNumber) => {
        const depletionYear = depletionYearBySimulation[simulationIndex];
        const hasSurvived = depletionYear === -1;
        const isHighlighted = highlightedRank === pageStart + rowNumber;
        const outcome = hasSurvived
          ? t('Survived')
          : t('Ran out at age {{age}}', {
              // The age of the year that couldn't be funded, matching the
              // drill-in's failure row
              age: startAge + depletionYear - 1,
            });
        return (
          <Button
            key={simulationIndex}
            variant="bare"
            onPress={() => onSelectRun(simulationIndex)}
            style={{
              padding: '8px 0',
              borderBottom: rowBorder,
              borderRadius: 0,
              ...(isHighlighted && {
                backgroundColor: theme.tableRowBackgroundHighlight,
              }),
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                flex: 1,
                gap: 10,
                paddingLeft: 8,
                paddingRight: 8,
              }}
            >
              <Text style={{ width: 80, textAlign: 'left' }}>
                <FinancialText as="span">
                  {String(pageStart + rowNumber + 1)}
                </FinancialText>
              </Text>
              <Text
                style={{
                  flex: 1,
                  textAlign: 'left',
                  ...(!isCard && {
                    color: hasSurvived
                      ? theme.reportsNumberPositive
                      : theme.reportsNumberNegative,
                  }),
                }}
              >
                {isCard ? (
                  // A status pill on the card, so colour is never the only
                  // signal (APP-03d)
                  <StatusPill
                    tone={hasSurvived ? 'positive' : 'negative'}
                    size="small"
                  >
                    {outcome}
                  </StatusPill>
                ) : (
                  outcome
                )}
              </Text>
              <Text style={{ width: 160, textAlign: 'right' }}>
                {hasSurvived ? (
                  <PrivacyFilter>
                    <FinancialText as="span">
                      {format(
                        Math.round(endingBalances[simulationIndex]),
                        'financial',
                      )}
                    </FinancialText>
                  </PrivacyFilter>
                ) : (
                  <FinancialText as="span">-</FinancialText>
                )}
              </Text>
              <Text style={{ width: 160, textAlign: 'right' }}>
                <PrivacyFilter>
                  <FinancialText as="span">
                    {format(
                      Math.round(totalWithdrawnBySimulation[simulationIndex]),
                      'financial',
                    )}
                  </FinancialText>
                </PrivacyFilter>
              </Text>
            </View>
          </Button>
        );
      })}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          // Stays pinned right, and drops to its own line when the jump
          // links need the full width
          marginLeft: 'auto',
          marginTop: 10,
        }}
      >
        <Select
          // An action picker, not a setting: the value stays on the
          // placeholder so it always reads "Jump to..." at rest
          value=""
          onChange={value => {
            if (value !== '') {
              jumpToPercentile(Number(value));
            }
          }}
          options={[['', t('Jump to…')], ...getRunPercentileOptions(t)]}
          triggerVariant={controlVariant}
          style={{ width: 170 }}
        />
        <Button
          variant={controlVariant}
          isDisabled={currentPage === 0}
          onPress={() => {
            setPage(currentPage - 1);
            setHighlightedRank(null);
          }}
        >
          <Trans>Previous</Trans>
        </Button>
        <Button
          variant={controlVariant}
          isDisabled={currentPage >= pageCount - 1}
          onPress={() => {
            setPage(currentPage + 1);
            setHighlightedRank(null);
          }}
        >
          <Trans>Next</Trans>
        </Button>
      </View>
    </View>
  );
}
