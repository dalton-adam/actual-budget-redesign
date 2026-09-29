import React, { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgCheveronRight } from '@actual-app/components/icons/v1';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import { q } from '@actual-app/core/shared/query';
import type { CategoryEntity } from '@actual-app/core/types/models';

import { DisplayPayeeProvider } from '#hooks/useDisplayPayee';
import { useSheetValue } from '#hooks/useSheetValue';
import { useTransactions } from '#hooks/useTransactions';

import { useCategoryDetails } from './CategoryDetailsContext';
import { CategoryDetailsSection } from './CategoryDetailsSection';
import { CategoryDetailsTransactionRow } from './CategoryDetailsTransactionRow';

const messageStyle = { fontSize: 13, color: theme.pageTextSecondary };

/** The panel lists the newest few; the full list is the Accounts view. */
export const CATEGORY_DETAILS_TRANSACTION_LIMIT = 5;

type CategoryDetailsTransactionsProps = {
  category: CategoryEntity;
  month: string;
};

/**
 * The month's posted transactions for the category, newest first
 * (design-decisions §5, item 7). Same filter and split handling as the
 * category balance bindings: split children appear on their own under their
 * category, transfers and refunds keep their sign. Scheduled previews are
 * left out, so the list matches Activity.
 */
export function CategoryDetailsTransactions({
  category,
  month,
}: CategoryDetailsTransactionsProps) {
  const { t } = useTranslation();
  const details = useCategoryDetails();
  const monthQuery = useMemo(
    () =>
      q('transactions')
        .filter({
          category: category.id,
          date: { $transform: '$month', $eq: month },
        })
        .options({ splits: 'inline' }),
    [category.id, month],
  );
  const query = useMemo(
    () =>
      monthQuery
        .orderBy([{ date: 'desc' }, { sort_order: 'desc' }])
        .select('*'),
    [monthQuery],
  );
  // How many there are in all; the list shows only the newest few. A live
  // query cell in the month's sheet, like the account balance bindings.
  const total = useSheetValue<'balance', `balance-query-${string}`>({
    name: `balance-query-category-details-count-${category.id}`,
    query: monthQuery.calculate({ $count: '*' }),
  });
  const { transactions, isPending, isPlaceholderData, isError } =
    useTransactions({
      query,
      options: { pageSize: CATEGORY_DETAILS_TRANSACTION_LIMIT },
    });

  // `useTransactions` keeps the previous query's rows while a new one loads;
  // never show them under another category or month.
  const isLoading = isPending || isPlaceholderData;
  const shown = transactions.slice(0, CATEGORY_DETAILS_TRANSACTION_LIMIT);

  let content;
  if (isError) {
    content = (
      <View style={messageStyle}>
        <Trans>Transactions couldn't be loaded.</Trans>
      </View>
    );
  } else if (isLoading) {
    content = (
      <View style={messageStyle}>
        <Trans>Loading transactions…</Trans>
      </View>
    );
  } else if (shown.length === 0) {
    content = (
      <View style={messageStyle}>
        <Trans>No transactions this month.</Trans>
      </View>
    );
  } else {
    content = (
      <DisplayPayeeProvider transactions={shown}>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {shown.map(transaction => (
            <CategoryDetailsTransactionRow
              key={transaction.id}
              transaction={transaction}
              accentCategoryId={category.id}
            />
          ))}
        </ul>
        {details && (
          <Button
            variant="bare"
            onPress={() => details.showActivity(category.id, month)}
            style={{
              alignSelf: 'flex-start',
              marginTop: 8,
              padding: '4px 6px',
              marginLeft: -6,
              gap: 4,
              fontSize: 13,
              fontWeight: 600,
              color: theme.pageTextLink,
            }}
          >
            <Trans>View in Accounts</Trans>
            <SvgCheveronRight width={10} height={10} />
          </Button>
        )}
      </DisplayPayeeProvider>
    );
  }

  return (
    <CategoryDetailsSection
      title={<Trans>Transactions</Trans>}
      aside={
        !isLoading && !isError && total != null && total > 0 ? (
          <span
            data-testid="category-details-transaction-count"
            aria-label={t('{{count}} transactions this month', {
              count: total,
            })}
          >
            {total}
          </span>
        ) : null
      }
    >
      <View data-testid="category-details-transactions" aria-busy={isLoading}>
        {content}
      </View>
    </CategoryDetailsSection>
  );
}
