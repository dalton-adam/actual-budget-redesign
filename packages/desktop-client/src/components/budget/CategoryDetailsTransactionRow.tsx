import React from 'react';
import { useTranslation } from 'react-i18next';

import { CategoryTile } from '@actual-app/components/category-tile';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';
import type {
  CategoryEntity,
  TransactionEntity,
} from '@actual-app/core/types/models';

import { FinancialText } from '#components/FinancialText';
import { PrivacyFilter } from '#components/PrivacyFilter';
import { useAccount } from '#hooks/useAccount';
import { useDisplayPayee } from '#hooks/useDisplayPayee';
import { useFormat } from '#hooks/useFormat';
import { useLocale } from '#hooks/useLocale';

import { getCategoryAccentIndex } from './categoryPresentation';

type CategoryDetailsTransactionRowProps = {
  transaction: TransactionEntity;
  /** Tiles use the category's accent, as in the mockups. */
  accentCategoryId: CategoryEntity['id'];
};

/**
 * One read-only transaction in the details panel: payee (the same display
 * name the registers use, including transfers and splits), date, account
 * and amount. Opening it arrives with DETAIL-03.
 */
export function CategoryDetailsTransactionRow({
  transaction,
  accentCategoryId,
}: CategoryDetailsTransactionRowProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const locale = useLocale();
  const payee = useDisplayPayee({ transaction }) || t('(No payee)');
  const account = useAccount(transaction.account);

  const date = monthUtils.format(transaction.date, 'MMM d', locale);
  const subtitle = account
    ? t('{{date}} · {{account}}', { date, account: account.name })
    : date;

  return (
    <li
      data-testid="category-details-transaction"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 0',
        borderBottom: `1px solid ${theme.cardHairline}`,
      }}
    >
      <CategoryTile
        name={payee}
        accentIndex={getCategoryAccentIndex(accentCategoryId)}
        size={32}
      />
      <View style={{ flex: 1, minWidth: 0 }}>
        <View
          style={{
            fontSize: 13.5,
            fontWeight: 600,
            color: theme.pageText,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          title={payee}
        >
          {payee}
        </View>
        <View
          style={{
            fontSize: 12,
            color: theme.pageTextSecondary,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {subtitle}
        </View>
      </View>
      <PrivacyFilter style={{ flexGrow: 0, flexShrink: 0 }}>
        <FinancialText
          style={{
            flexShrink: 0,
            fontSize: 13.5,
            fontWeight: 600,
            color: theme.pageText,
          }}
        >
          {format(transaction.amount, 'financial')}
        </FinancialText>
      </PrivacyFilter>
    </li>
  );
}
