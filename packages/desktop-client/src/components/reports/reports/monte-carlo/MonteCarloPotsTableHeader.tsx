import { Trans } from 'react-i18next';

import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';

import { MonteCarloHelpTooltip } from '#components/reports/reports/monte-carlo/MonteCarloHelpTooltip';
import { useMonteCarloStyles } from '#components/reports/reports/monte-carlo/monteCarloStyles';
import { Field, TableHeader } from '#components/table';

// Shared by the header and the pot rows so the columns line up. The
// drag/expand/remove columns are fixed; the rest flex evenly, with these
// minimum widths so labels and controls don't get crushed on narrow
// windows. Access, tax and fee settings live in the expandable panel
// under each row, not in columns.
export const POT_COLUMNS = {
  expand: 36,
  name: 150,
  startingBalance: 120,
  linkedAccount: 160,
  allocation: 190,
  expectedReturn: 150,
  volatility: 170,
  remove: 36,
} as const;

// The card's Eyebrow headers are uppercase and tracked, so the two longest
// labels need more room there (APP-03d)
const CARD_POT_COLUMNS = {
  ...POT_COLUMNS,
  name: 114,
  startingBalance: 156,
  linkedAccount: 156,
  allocation: 204,
  expectedReturn: 192,
  volatility: 206,
} as const;

/** The sum of the columns' minimum widths: below it the table scrolls */
export function getPotColumnsMinWidth(columns: Record<string, number>) {
  return Object.values(columns).reduce((sum, width) => sum + width, 0);
}

/** The pot table's column widths for the current width. */
export function usePotColumns() {
  const { isCard } = useMonteCarloStyles();
  return isCard ? CARD_POT_COLUMNS : POT_COLUMNS;
}

const HEADER_LABEL_STYLE = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 5,
  whiteSpace: 'nowrap',
} as const;

export function MonteCarloPotsTableHeader() {
  const { isCard, groupHeading } = useMonteCarloStyles();
  const columns = usePotColumns();

  return (
    <TableHeader
      // Eyebrow headers on the card, as the register's (APP-03d)
      style={
        isCard
          ? {
              ...groupHeading,
              backgroundColor: theme.cardBackground,
              borderColor: theme.cardHairline,
            }
          : undefined
      }
    >
      <Field width={columns.expand} />
      <Field width="flex" style={{ minWidth: columns.name }}>
        <Trans>Pot name</Trans>
      </Field>
      <Field
        width="flex"
        style={{ minWidth: columns.startingBalance }}
        truncate={false}
      >
        <Trans>Starting balance</Trans>
      </Field>
      <Field
        width="flex"
        style={{ minWidth: columns.linkedAccount }}
        truncate={false}
      >
        <View style={HEADER_LABEL_STYLE}>
          <Text>
            <Trans>Linked account</Trans>
          </Text>
          <MonteCarloHelpTooltip>
            <Trans>
              Use an account&apos;s live balance as this pot&apos;s starting
              balance, so the plan stays up to date on its own.
              <br />
              <br />
              Typing a starting balance manually unlinks the pot - handy for
              what-if experiments.
            </Trans>
          </MonteCarloHelpTooltip>
        </View>
      </Field>
      <Field
        width="flex"
        style={{ minWidth: columns.allocation }}
        truncate={false}
      >
        <View style={HEADER_LABEL_STYLE}>
          <Text>
            <Trans>Portfolio allocation</Trans>
          </Text>
          <MonteCarloHelpTooltip>
            <Trans>
              A one-click starting point that fills in a typical expected return
              and volatility for the selected mix of stocks and bonds. You can
              still override both values, or pick Custom mix to enter your own
              stock, bond and cash percentages in the pot&apos;s expanded
              settings.
              <br />
              <br />
              With a historical return model, the mix is also the pot&apos;s
              real asset mix: its stock, bond and cash shares take each sampled
              year&apos;s actual S&amp;P 500, 10-year Treasury and T-bill
              returns. Custom pots have no mix and always draw random returns
              from their typed values, so historical models only affect pots
              with one.
            </Trans>
          </MonteCarloHelpTooltip>
        </View>
      </Field>
      <Field
        width="flex"
        style={{ minWidth: columns.expectedReturn }}
        truncate={false}
      >
        <View style={HEADER_LABEL_STYLE}>
          <Text>
            <Trans>Expected return (%)</Trans>
          </Text>
          <MonteCarloHelpTooltip>
            <Trans>
              The average yearly investment return before inflation. Each
              simulated year draws a random return around this average.
              <br />
              <br />
              Only used by the random model and by Custom pots - under a
              historical model, pots with an asset mix (a preset or a custom
              mix) take real returns for it instead, and this cell shows the
              mix&apos;s measured historical average.
            </Trans>
          </MonteCarloHelpTooltip>
        </View>
      </Field>
      <Field
        width="flex"
        style={{ minWidth: columns.volatility }}
        truncate={false}
      >
        <View style={HEADER_LABEL_STYLE}>
          <Text>
            <Trans>Volatility (std dev %)</Trans>
          </Text>
          <MonteCarloHelpTooltip>
            <Trans>
              How much returns swing from year to year. Higher volatility means
              bigger ups and downs, which makes running out of money more likely
              even with the same average return.
              <br />
              <br />
              Only used by the random model and by Custom pots - under a
              historical model, pots with an asset mix show how much that mix
              really swung across the whole dataset.
            </Trans>
          </MonteCarloHelpTooltip>
        </View>
      </Field>
      <Field width={columns.remove} />
    </TableHeader>
  );
}
