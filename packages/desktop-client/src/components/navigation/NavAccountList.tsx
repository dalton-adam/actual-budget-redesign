import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { SvgAdd } from '@actual-app/components/icons/v1';
import { View } from '@actual-app/components/view';
import type { AccountEntity } from '@actual-app/core/types/models';
import { css } from '@emotion/css';

import { isAccountFailedSync } from '#accounts/syncStatus';
import { useAccounts } from '#hooks/useAccounts';
import { useClosedAccounts } from '#hooks/useClosedAccounts';
import { useLocalPref } from '#hooks/useLocalPref';
import { useOffBudgetAccounts } from '#hooks/useOffBudgetAccounts';
import { useOnBudgetAccounts } from '#hooks/useOnBudgetAccounts';
import { useUpdatedAccounts } from '#hooks/useUpdatedAccounts';
import { replaceModal } from '#modals/modalsSlice';
import { useDispatch, useSelector } from '#redux';
import * as bindings from '#spreadsheet/bindings';

import { NavAccountRow } from './NavAccountRow';
import { menuDividerStyle, menuRowStyle } from './navMenuStyles';

type NavAccountListProps = {
  onNavigate?: () => void;
};

// The account list shown in the Accounts menu and the compact drawer. It
// reads the same hooks and bindings as the sidebar; "All accounts" is
// navigation only and never filters budget totals.
export function NavAccountList({ onNavigate }: NavAccountListProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { data: accounts = [] } = useAccounts();
  const { data: onBudgetAccounts = [] } = useOnBudgetAccounts();
  const { data: offBudgetAccounts = [] } = useOffBudgetAccounts();
  const { data: closedAccounts = [] } = useClosedAccounts();
  const updatedAccounts = useUpdatedAccounts();
  const syncingAccountIds = useSelector(state => state.account.accountsSyncing);
  const [showClosedAccounts, setShowClosedAccountsPref] = useLocalPref(
    'ui.showClosedAccounts',
  );

  const renderAccount = (account: AccountEntity) => (
    <NavAccountRow
      key={account.id}
      name={account.name}
      account={account}
      to={`/accounts/${account.id}`}
      query={bindings.accountBalance(account.id)}
      connected={!!account.bank && !account.closed}
      pending={syncingAccountIds.includes(account.id)}
      failed={isAccountFailedSync(account)}
      updated={updatedAccounts.includes(account.id)}
      onNavigate={onNavigate}
    />
  );

  const onAddAccount = () => {
    onNavigate?.();
    dispatch(replaceModal({ modal: { name: 'add-account', options: {} } }));
  };

  return (
    <View>
      <NavAccountRow
        name={t('All accounts')}
        to="/accounts"
        query={bindings.allAccountBalance()}
        variant="total"
        end
        onNavigate={onNavigate}
      />

      {onBudgetAccounts.length > 0 && (
        <NavAccountRow
          name={t('On budget')}
          to="/accounts/onbudget"
          query={bindings.onBudgetAccountBalance()}
          variant="section"
          onNavigate={onNavigate}
        />
      )}
      {onBudgetAccounts.map(renderAccount)}

      {offBudgetAccounts.length > 0 && (
        <NavAccountRow
          name={t('Off budget')}
          to="/accounts/offbudget"
          query={bindings.offBudgetAccountBalance()}
          variant="section"
          onNavigate={onNavigate}
        />
      )}
      {offBudgetAccounts.map(renderAccount)}

      {(accounts.length > 0 || closedAccounts.length > 0) && (
        <View style={menuDividerStyle} />
      )}

      {closedAccounts.length > 0 && (
        <button
          type="button"
          aria-expanded={!!showClosedAccounts}
          className={css([
            menuRowStyle,
            { border: 0, background: 'none', font: 'inherit', width: '100%' },
          ])}
          onClick={() => setShowClosedAccountsPref(!showClosedAccounts)}
        >
          <span style={{ flex: 1, textAlign: 'left' }}>
            <Trans>Closed accounts</Trans>
          </span>
          <span aria-hidden>({closedAccounts.length})</span>
        </button>
      )}
      {showClosedAccounts && closedAccounts.map(renderAccount)}

      <button
        type="button"
        className={css([
          menuRowStyle,
          { border: 0, background: 'none', font: 'inherit', width: '100%' },
        ])}
        onClick={onAddAccount}
      >
        <SvgAdd width={12} height={12} style={{ flexShrink: 0 }} />
        <span style={{ flex: 1, textAlign: 'left' }}>
          <Trans>Add account</Trans>
        </span>
      </button>
    </View>
  );
}
