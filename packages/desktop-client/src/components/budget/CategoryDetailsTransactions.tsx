import React, { useMemo } from 'react';
import { Trans } from 'react-i18next';

import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import { q } from '@actual-app/core/shared/query';
import type { CategoryEntity } from '@actual-app/core/types/models';

import { DisplayPayeeProvider } from '#hooks/useDisplayPayee';
import { useTransactions } from '#hooks/useTransactions';

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
  const query = useMemo(
    () =>
      q('transactions')
        .filter({
          category: category.id,
          date: { $transform: '$month', $eq: month },
        })
        .options({ splits: 'inline' })
        .orderBy([{ date: 'desc' }, { sort_order: 'desc' }])
        .select('*'),
    [category.id, month],
  );
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
      </DisplayPayeeProvider>
    );
  }

  return (
    <CategoryDetailsSection title={<Trans>Transactions</Trans>}>
      <View data-testid="category-details-transactions" aria-busy={isLoading}>
        {content}
      </View>
    </CategoryDetailsSection>
  );
}
