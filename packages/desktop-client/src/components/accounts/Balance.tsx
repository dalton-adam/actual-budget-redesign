import React, { useRef } from 'react';
import type { RefObject } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgArrowButtonRight1 } from '@actual-app/components/icons/v2';
import { StatusPill } from '@actual-app/components/status-pill';
import { theme } from '@actual-app/components/theme';
import { q } from '@actual-app/core/shared/query';
import type { Query } from '@actual-app/core/shared/query';
import { getScheduledAmount } from '@actual-app/core/shared/schedules';
import { isPreviewId } from '@actual-app/core/shared/transactions';
import type { AccountEntity } from '@actual-app/core/types/models';
import { useHover } from 'usehooks-ts';

import { FinancialText } from '#components/FinancialText';
import { PrivacyFilter } from '#components/PrivacyFilter';
import { CellValue, CellValueText } from '#components/spreadsheet/CellValue';
import { useCachedSchedules } from '#hooks/useCachedSchedules';
import { useFormat } from '#hooks/useFormat';
import { useSelectedItems } from '#hooks/useSelected';
import { useSheetValue } from '#hooks/useSheetValue';
import type { Binding } from '#spreadsheet';

type DetailedBalanceProps = {
  name: string;
  balance: number;
  isExactBalance?: boolean;
};

function DetailedBalance({
  name,
  balance,
  isExactBalance = true,
}: DetailedBalanceProps) {
  const format = useFormat();
  return (
    <StatusPill tone="neutral">
      <span style={{ fontWeight: 500 }}>{name}</span>
      <PrivacyFilter>
        <FinancialText>
          {!isExactBalance && '~ '}
          {format(balance, 'financial')}
        </FinancialText>
      </PrivacyFilter>
    </StatusPill>
  );
}

type SelectedBalanceProps = {
  selectedItems: Set<string>;
  account?: AccountEntity;
};

export function SelectedBalance({
  selectedItems,
  account,
}: SelectedBalanceProps) {
  const { t } = useTranslation();

  const name = `selected-balance-${[...selectedItems].join('-')}`;

  const rows = useSheetValue<'balance', `selected-transactions-${string}`>({
    name: name as `selected-transactions-${string}`,
    query: q('transactions')
      .filter({
        id: { $oneof: [...selectedItems] },
        parent_id: { $oneof: [...selectedItems] },
      })
      .select('id'),
  });
  const ids = new Set((rows || []).map((r: { id: string }) => r.id));

  const finalIds = [...selectedItems].filter(id => !ids.has(id));
  let balance = useSheetValue<'balance', `selected-balance-${string}`>({
    name: (name + '-sum') as `selected-balance-${string}`,
    query: q('transactions')
      .filter({ id: { $oneof: finalIds } })
      .options({ splits: 'all' })
      .calculate({ $sum: '$amount' }),
  });

  let scheduleBalance = 0;

  const { isLoading, schedules = [] } = useCachedSchedules();

  if (isLoading) {
    return null;
  }

  let isExactBalance = true;

  for (const id of [...selectedItems].filter(isPreviewId)) {
    // Preview IDs are in the format `preview/<schedule_id>/<date>`
    const scheduleId = id.slice(8).split('/')[0];
    const schedule = schedules.find(s => s.id === scheduleId);
    if (schedule) {
      // If a schedule is `between X and Y` then we calculate the average
      if (schedule._amountOp === 'isbetween') {
        isExactBalance = false;
      }

      if (!account || account.id === schedule._account) {
        scheduleBalance += getScheduledAmount(schedule._amount);
      } else {
        scheduleBalance -= getScheduledAmount(schedule._amount);
      }
    }
  }

  if (typeof balance !== 'number' && !scheduleBalance) {
    return null;
  } else {
    balance = (balance ?? 0) + scheduleBalance;
  }

  return (
    <DetailedBalance
      name={t('Selected balance:')}
      balance={balance}
      isExactBalance={isExactBalance}
    />
  );
}

type FilteredBalanceProps = {
  filteredAmount?: number | null;
};

function FilteredBalance({ filteredAmount }: FilteredBalanceProps) {
  const { t } = useTranslation();

  return (
    <DetailedBalance
      name={t('Filtered balance:')}
      balance={filteredAmount ?? 0}
      isExactBalance
    />
  );
}

type MoreBalancesProps = {
  balanceQuery: { name: `balance-query-${string}`; query: Query };
};

function MoreBalances({ balanceQuery }: MoreBalancesProps) {
  const { t } = useTranslation();

  const cleared = useSheetValue<'balance', `balance-query-${string}-cleared`>({
    name: (balanceQuery.name + '-cleared') as `balance-query-${string}-cleared`,
    query: balanceQuery.query.filter({ cleared: true }),
  });
  const uncleared = useSheetValue<
    'balance',
    `balance-query-${string}-uncleared`
  >({
    name: (balanceQuery.name +
      '-uncleared') as `balance-query-${string}-uncleared`,
    query: balanceQuery.query.filter({ cleared: false }),
  });

  return (
    <>
      <DetailedBalance name={t('Cleared total:')} balance={cleared ?? 0} />
      <DetailedBalance name={t('Uncleared total:')} balance={uncleared ?? 0} />
    </>
  );
}

type BalanceAmountProps = {
  balanceQuery: { name: `balance-query-${string}`; query: Query };
  showExtraBalances: boolean;
  onToggleExtraBalances: () => void;
  isCompact: boolean;
};

/** The account's hero amount; pressing it shows the cleared breakdown. */
export function BalanceAmount({
  balanceQuery,
  showExtraBalances,
  onToggleExtraBalances,
  isCompact,
}: BalanceAmountProps) {
  const selectedItems = useSelectedItems();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isButtonHovered = useHover(buttonRef as RefObject<HTMLButtonElement>);

  return (
    <Button
      ref={buttonRef}
      data-testid="account-balance"
      variant="bare"
      onPress={onToggleExtraBalances}
      style={{
        alignSelf: isCompact ? 'center' : 'flex-start',
        flexShrink: 0,
        marginLeft: isCompact ? 0 : -5,
        paddingTop: 1,
        paddingBottom: 1,
      }}
    >
      <CellValue
        binding={
          { ...balanceQuery, value: 0 } as Binding<
            'balance',
            `balance-query-${string}`
          >
        }
        type="financial"
      >
        {props => (
          <CellValueText
            {...props}
            style={{
              fontSize: isCompact ? 28 : 34,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: isCompact ? -0.4 : -0.8,
              color:
                props.value < 0
                  ? theme.numberNegative
                  : props.value > 0
                    ? theme.numberPositive
                    : theme.pageTextSubdued,
            }}
          />
        )}
      </CellValue>

      <SvgArrowButtonRight1
        style={{
          width: 10,
          height: 10,
          marginLeft: 10,
          color: theme.pageTextSecondary,
          transform: showExtraBalances ? 'rotateZ(180deg)' : 'rotateZ(0)',
          opacity:
            isButtonHovered || selectedItems.size > 0 || showExtraBalances
              ? 1
              : 0,
        }}
      />
    </Button>
  );
}

type BalanceChipsProps = {
  balanceQuery: { name: `balance-query-${string}`; query: Query };
  showExtraBalances: boolean;
  account?: AccountEntity;
  isFiltered: boolean;
  filteredAmount?: number | null;
};

/** Cleared, uncleared, selected and filtered balances, as hero chips. */
export function BalanceChips({
  balanceQuery,
  showExtraBalances,
  account,
  isFiltered,
  filteredAmount,
}: BalanceChipsProps) {
  const selectedItems = useSelectedItems();

  return (
    <>
      {showExtraBalances && <MoreBalances balanceQuery={balanceQuery} />}

      {selectedItems.size > 0 && (
        <SelectedBalance selectedItems={selectedItems} account={account} />
      )}
      {isFiltered && <FilteredBalance filteredAmount={filteredAmount} />}
    </>
  );
}
