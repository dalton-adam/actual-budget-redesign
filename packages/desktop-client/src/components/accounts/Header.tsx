import React, { useRef, useState } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { Dialog, DialogTrigger } from 'react-aria-components';
import { useHotkeys } from 'react-hotkeys-hook';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import { AnimatedLoading } from '@actual-app/components/icons/AnimatedLoading';
import {
  SvgAdd,
  SvgDotsHorizontalTriple,
} from '@actual-app/components/icons/v1';
import {
  SvgArrowsExpand3,
  SvgArrowsShrink3,
  SvgDownloadThickBottom,
  SvgLockClosed,
  SvgPencil1,
} from '@actual-app/components/icons/v2';
import { InitialFocus } from '@actual-app/components/initial-focus';
import { Input } from '@actual-app/components/input';
import { Menu } from '@actual-app/components/menu';
import { Popover } from '@actual-app/components/popover';
import { SpaceBetween } from '@actual-app/components/space-between';
import { StatusPill } from '@actual-app/components/status-pill';
import { styles } from '@actual-app/components/styles';
import { SurfaceCard } from '@actual-app/components/surface-card';
import { theme } from '@actual-app/components/theme';
import { Tooltip } from '@actual-app/components/tooltip';
import { View } from '@actual-app/components/view';
import { tsToRelativeTime } from '@actual-app/core/shared/util';
import type {
  AccountEntity,
  RuleConditionEntity,
  TransactionEntity,
  TransactionFilterEntity,
} from '@actual-app/core/types/models';
import { format as formatDate } from 'date-fns';

import { isAccountFailedSync } from '#accounts/syncStatus';
import { AnimatedRefresh } from '#components/AnimatedRefresh';
import { Search } from '#components/common/Search';
import { FilterButton } from '#components/filters/FiltersMenu';
import { FiltersStack } from '#components/filters/FiltersStack';
import type { SavedFilter } from '#components/filters/SavedFilterMenuButton';
import { NotesButton } from '#components/NotesButton';
import { SelectedTransactionsButton } from '#components/transactions/SelectedTransactionsButton';
import { useDateFormat } from '#hooks/useDateFormat';
import { useLocale } from '#hooks/useLocale';
import { useLocalPref } from '#hooks/useLocalPref';
import { useSplitsExpanded } from '#hooks/useSplitsExpanded';
import { useSyncedPref } from '#hooks/useSyncedPref';
import { useSyncServerStatus } from '#hooks/useSyncServerStatus';

import type { TableRef } from './Account';
import { AccountHero, isAccountHeroCompact } from './AccountHero';
import { AccountSyncCheck } from './AccountSyncCheck';
import { BalanceAmount, BalanceChips } from './Balance';
import { BalanceHistoryGraph } from './BalanceHistoryGraph';
import { ReconcileMenu, ReconcilingMessage } from './Reconcile';

type AccountHeaderProps = {
  tableRef: TableRef;
  isNameEditable: boolean;
  workingHard: boolean;
  accountName: string;
  accountId?: string;
  account?: AccountEntity;
  filterId?: SavedFilter;
  savedFilters: TransactionFilterEntity[];
  accountsSyncing: string[];
  accounts: AccountEntity[];
  transactions: TransactionEntity[];
  showExtraBalances: boolean;
  showReconciled: boolean;
  showEmptyMessage: boolean;
  balanceQuery: ComponentProps<typeof ReconcilingMessage>['balanceQuery'];
  reconcileAmount?: number | null;
  isFiltered: boolean;
  filteredAmount?: number | null;
  isSorted: boolean;
  search: string;
  filterConditions: RuleConditionEntity[];
  filterConditionsOp: 'and' | 'or';
  onSearch: (newSearch: string) => void;
  onAddTransaction: () => void;
  onShowTransactions: ComponentProps<
    typeof SelectedTransactionsButton
  >['onShow'];
  onDoneReconciling: ComponentProps<typeof ReconcilingMessage>['onDone'];
  onCreateReconciliationTransaction: ComponentProps<
    typeof ReconcilingMessage
  >['onCreateTransaction'];
  onToggleExtraBalances: ComponentProps<
    typeof BalanceAmount
  >['onToggleExtraBalances'];
  onSaveName: AccountNameFieldProps['onSaveName'];
  saveNameError: AccountNameFieldProps['saveNameError'];
  onSync: () => void;
  onImport: () => void;
  onMenuSelect: AccountMenuProps['onMenuSelect'];
  onReconcile: ComponentProps<typeof ReconcileMenu>['onReconcile'];
  onBatchEdit: ComponentProps<typeof SelectedTransactionsButton>['onEdit'];
  onRunRules: ComponentProps<typeof SelectedTransactionsButton>['onRunRules'];
  onBatchDelete: ComponentProps<typeof SelectedTransactionsButton>['onDelete'];
  onBatchDuplicate: ComponentProps<
    typeof SelectedTransactionsButton
  >['onDuplicate'];
  onBatchLinkSchedule: ComponentProps<
    typeof SelectedTransactionsButton
  >['onLinkSchedule'];
  onBatchUnlinkSchedule: ComponentProps<
    typeof SelectedTransactionsButton
  >['onUnlinkSchedule'];
  onApplyFilter: (filter: RuleConditionEntity) => void;
} & Pick<
  ComponentProps<typeof SelectedTransactionsButton>,
  | 'onCreateRule'
  | 'onScheduleAction'
  | 'onSetTransfer'
  | 'onMakeAsSplitTransaction'
  | 'onMakeAsNonSplitTransactions'
  | 'onMergeTransactions'
> &
  Pick<
    ComponentProps<typeof FiltersStack>,
    | 'onUpdateFilter'
    | 'onDeleteFilter'
    | 'onConditionsOpChange'
    | 'onClearFilters'
    | 'onReloadSavedFilter'
  >;

export function AccountHeader({
  tableRef,
  isNameEditable,
  workingHard,
  accountName,
  accountId,
  account,
  filterId,
  savedFilters,
  accountsSyncing,
  accounts,
  transactions,
  showExtraBalances,
  showReconciled,
  showEmptyMessage,
  balanceQuery,
  reconcileAmount,
  isFiltered,
  filteredAmount,
  isSorted,
  search,
  filterConditions,
  filterConditionsOp,
  onSearch,
  onAddTransaction,
  onShowTransactions,
  onDoneReconciling,
  onCreateReconciliationTransaction,
  onToggleExtraBalances,
  onSaveName,
  saveNameError,
  onSync,
  onImport,
  onMenuSelect,
  onReconcile,
  onBatchDelete,
  onBatchDuplicate,
  onBatchEdit,
  onBatchLinkSchedule,
  onBatchUnlinkSchedule,
  onCreateRule,
  onApplyFilter,
  onUpdateFilter,
  onClearFilters,
  onReloadSavedFilter,
  onConditionsOpChange,
  onDeleteFilter,
  onScheduleAction,
  onSetTransfer,
  onRunRules,
  onMakeAsSplitTransaction,
  onMakeAsNonSplitTransactions,
  onMergeTransactions,
}: AccountHeaderProps) {
  const { t } = useTranslation();

  const [reconcileOpen, setReconcileOpen] = useState(false);
  const searchInput = useRef<HTMLInputElement>(null);
  const reconcileRef = useRef(null);
  const splitsExpanded = useSplitsExpanded();
  const syncServerStatus = useSyncServerStatus();
  const isUsingServer = syncServerStatus !== 'no-server';
  const isServerOffline = syncServerStatus === 'offline';
  const [_, setExpandSplitsPref] = useLocalPref('expand-splits');
  const [showNetWorthChartPref, _setShowNetWorthChartPref] = useSyncedPref(
    `show-account-${accountId}-net-worth-chart`,
  );
  const showNetWorthChart = showNetWorthChartPref === 'true';

  const dateFormat = useDateFormat() || 'MM/dd/yyyy';
  const locale = useLocale();

  let canSync = !!(account?.account_id && isUsingServer);
  if (!account) {
    // All accounts - check for any syncable account
    canSync = !!accounts.find(account => !!account.account_id) && isUsingServer;
  }

  // Only show the ability to make linked transfers on multi-account views.
  const showMakeTransfer = !account;

  function onToggleSplits() {
    if (tableRef.current) {
      splitsExpanded.dispatch({
        type: 'switch-mode',
        id: tableRef.current.getScrolledItem(),
      });

      setExpandSplitsPref(!(splitsExpanded.state.mode === 'expand'));
    }
  }

  const graphRef = useRef<HTMLDivElement>(null);
  const { width, height } = useResponsive();
  const isCompact = isAccountHeroCompact(width, height);

  useHotkeys(
    'ctrl+f, cmd+f, meta+f',
    e => {
      if (searchInput.current) {
        // Trigger browser-native find if user pressed search twice in a row
        if (document.activeElement === searchInput.current) {
          searchInput.current.blur();
        } else {
          e.preventDefault();
          searchInput.current.focus();
        }
      }
    },
    {
      enableOnFormTags: true,
      preventDefault: false,
      scopes: ['app'],
    },
    [searchInput],
  );
  useHotkeys(
    't',
    () => onAddTransaction(),
    {
      preventDefault: true,
      scopes: ['app'],
    },
    [onAddTransaction],
  );
  useHotkeys(
    'ctrl+i, cmd+i, meta+i',
    () => onImport(),
    {
      scopes: ['app'],
    },
    [onImport],
  );
  useHotkeys(
    'ctrl+b, cmd+b, meta+b',
    () => onSync(),
    {
      enabled: canSync && !isServerOffline,
      preventDefault: true,
      scopes: ['app'],
    },
    [onSync],
  );

  const reconciledText = account?.last_reconciled
    ? t('Reconciled {{ relativeTimeAgo }} ({{ absoluteDate }})', {
        relativeTimeAgo: tsToRelativeTime(account.last_reconciled, locale),
        absoluteDate: formatDate(
          new Date(parseInt(account.last_reconciled ?? '0', 10)),
          dateFormat,
          { locale },
        ),
      })
    : t('Not yet reconciled');

  const bankSyncLabel = isServerOffline
    ? t('Bank Sync Offline')
    : t('Bank Sync');

  const heroActions = (canSync || account) && (
    <View style={{ flexDirection: 'row', flexShrink: 0, gap: 8 }}>
      {canSync && (
        <Button
          variant="control"
          aria-label={isCompact ? bankSyncLabel : undefined}
          onPress={onSync}
          isDisabled={isServerOffline}
          style={{ gap: 6 }}
        >
          <AnimatedRefresh
            width={13}
            height={13}
            animating={
              account
                ? accountsSyncing.includes(account.id)
                : accountsSyncing.length > 0
            }
          />
          {!isCompact && bankSyncLabel}
        </Button>
      )}
      {account && (
        <Tooltip
          style={{
            ...styles.tooltip,
            marginBottom: 10,
          }}
          content={reconciledText}
          placement="top"
          triggerProps={{
            isDisabled: reconcileOpen,
          }}
        >
          <Button
            ref={reconcileRef}
            variant="control"
            aria-label={t('Reconcile')}
            style={{ gap: 6 }}
            onPress={() => {
              setReconcileOpen(true);
            }}
          >
            <SvgLockClosed width={13} height={13} />
            {!isCompact && <Trans>Reconcile</Trans>}
          </Button>
          <Popover
            placement="bottom"
            triggerRef={reconcileRef}
            style={{ width: 275 }}
            isOpen={reconcileOpen}
            onOpenChange={() => setReconcileOpen(false)}
          >
            <ReconcileMenu
              account={account}
              onClose={() => setReconcileOpen(false)}
              onReconcile={onReconcile}
            />
          </Popover>
        </Tooltip>
      )}
    </View>
  );

  const hero = (
    <AccountHero
      isCompact={isCompact}
      isReconciling={reconcileAmount != null}
      eyebrow={
        account &&
        (account.offbudget ? (
          <Trans>Off budget</Trans>
        ) : (
          <Trans>On budget</Trans>
        ))
      }
      title={
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 3,
            minWidth: 0,
          }}
        >
          {!!account?.bank && (
            <AccountSyncSidebar
              account={account}
              accountsSyncing={accountsSyncing}
            />
          )}
          <AccountNameField
            account={account}
            accountName={accountName}
            isNameEditable={isNameEditable}
            isCompact={isCompact}
            saveNameError={saveNameError}
            onSaveName={onSaveName}
          />
        </View>
      }
      actions={heroActions}
      balance={
        <BalanceAmount
          balanceQuery={balanceQuery}
          showExtraBalances={showExtraBalances}
          onToggleExtraBalances={onToggleExtraBalances}
          isCompact={isCompact}
        />
      }
      chips={
        <>
          <BalanceChips
            balanceQuery={balanceQuery}
            showExtraBalances={showExtraBalances}
            account={account}
            isFiltered={isFiltered}
            filteredAmount={filteredAmount}
          />
          {account && (
            <StatusPill tone={account.last_reconciled ? 'positive' : 'neutral'}>
              <SvgLockClosed width={11} height={11} />
              {reconciledText}
            </StatusPill>
          )}
          {account?.bank && <AccountSyncCheck />}
        </>
      }
      reconcileBand={
        reconcileAmount != null && (
          <ReconcilingMessage
            targetBalance={reconcileAmount}
            balanceQuery={balanceQuery}
            onDone={onDoneReconciling}
            onCreateTransaction={onCreateReconciliationTransaction}
          />
        )
      }
    />
  );

  const chart = showNetWorthChart && (
    <SurfaceCard
      style={{
        padding: '14px 16px',
        ...(isCompact
          ? { height: 'calc(5vh + 5vw)' }
          : { flex: '0 1 420px', minWidth: 300 }),
      }}
    >
      <BalanceHistoryGraph
        ref={graphRef}
        accountId={accountId}
        style={{ flex: 1, margin: 0 }}
      />
    </SurfaceCard>
  );

  return (
    <View style={{ ...styles.pageContent, paddingBottom: 10, flexShrink: 0 }}>
      <View
        style={{
          flexDirection: isCompact ? 'column' : 'row',
          alignItems: 'stretch',
          marginTop: 2,
          gap: 14,
        }}
      >
        {hero}
        {chart}
      </View>
      <SpaceBetween gap={8} style={{ marginTop: 14 }}>
        {account && !account.closed && (
          <Button variant="control" onPress={onImport} style={{ gap: 6 }}>
            <SvgDownloadThickBottom width={13} height={13} />
            <Trans>Import</Trans>
          </Button>
        )}

        {!showEmptyMessage && (
          <Button
            variant="primary"
            onPress={onAddTransaction}
            style={{ gap: 6, borderRadius: 9, minHeight: 30 }}
          >
            <SvgAdd width={10} height={10} />
            <Trans>Add New</Trans>
          </Button>
        )}
        <View style={{ flexShrink: 0 }}>
          {/* @ts-expect-error fix me */}
          <FilterButton onApply={onApplyFilter} />
        </View>
        <View style={{ flex: 1 }} />

        <Search
          placeholder={t('Search')}
          value={search}
          onChange={onSearch}
          ref={searchInput}
        />
        {workingHard ? (
          <View>
            <AnimatedLoading style={{ width: 16, height: 16 }} />
          </View>
        ) : (
          <SelectedTransactionsButton
            getTransaction={id => transactions.find(t => t.id === id)}
            onShow={onShowTransactions}
            onDuplicate={onBatchDuplicate}
            onDelete={onBatchDelete}
            onEdit={onBatchEdit}
            onRunRules={onRunRules}
            onLinkSchedule={onBatchLinkSchedule}
            onUnlinkSchedule={onBatchUnlinkSchedule}
            onCreateRule={onCreateRule}
            onSetTransfer={onSetTransfer}
            onScheduleAction={onScheduleAction}
            showMakeTransfer={showMakeTransfer}
            onMakeAsSplitTransaction={onMakeAsSplitTransaction}
            onMakeAsNonSplitTransactions={onMakeAsNonSplitTransactions}
            onMergeTransactions={onMergeTransactions}
          />
        )}
        <Button
          variant="control"
          aria-label={
            splitsExpanded.state.mode === 'collapse'
              ? t('Collapse split transactions')
              : t('Expand split transactions')
          }
          onPress={onToggleSplits}
        >
          <View
            title={
              splitsExpanded.state.mode === 'collapse'
                ? t('Collapse split transactions')
                : t('Expand split transactions')
            }
          >
            {splitsExpanded.state.mode === 'collapse' ? (
              <SvgArrowsShrink3 style={{ width: 14, height: 14 }} />
            ) : (
              <SvgArrowsExpand3 style={{ width: 14, height: 14 }} />
            )}
          </View>
        </Button>
        {account ? (
          <View style={{ flex: '0 0 auto' }}>
            <DialogTrigger>
              <Button variant="control" aria-label={t('Account menu')}>
                <SvgDotsHorizontalTriple
                  width={15}
                  height={15}
                  style={{ transform: 'rotateZ(90deg)' }}
                />
              </Button>

              <Popover style={{ minWidth: 275 }}>
                <Dialog>
                  <AccountMenu
                    account={account}
                    canSync={canSync}
                    showNetWorthChart={showNetWorthChart}
                    isSorted={isSorted}
                    showReconciled={showReconciled}
                    onMenuSelect={onMenuSelect}
                  />
                </Dialog>
              </Popover>
            </DialogTrigger>
          </View>
        ) : (
          <View style={{ flex: '0 0 auto' }}>
            <DialogTrigger>
              <Button variant="control" aria-label={t('Account menu')}>
                <SvgDotsHorizontalTriple
                  width={15}
                  height={15}
                  style={{ transform: 'rotateZ(90deg)' }}
                />
              </Button>

              <Popover>
                <Dialog>
                  <Menu
                    slot="close"
                    onMenuSelect={onMenuSelect}
                    items={[
                      ...(isSorted
                        ? [
                            {
                              name: 'remove-sorting',
                              text: t('Remove all sorting'),
                            } as const,
                          ]
                        : []),
                      { name: 'export', text: t('Export') },
                      {
                        name: 'toggle-net-worth-chart',
                        text: showNetWorthChart
                          ? t('Hide balance chart')
                          : t('Show balance chart'),
                      },
                      {
                        name: 'manage-columns',
                        text: t('Manage table columns'),
                      },
                    ]}
                  />
                </Dialog>
              </Popover>
            </DialogTrigger>
          </View>
        )}
      </SpaceBetween>
      {filterConditions?.length > 0 && (
        <FiltersStack
          conditions={filterConditions}
          conditionsOp={filterConditionsOp}
          onUpdateFilter={onUpdateFilter}
          onDeleteFilter={onDeleteFilter}
          onClearFilters={onClearFilters}
          onReloadSavedFilter={onReloadSavedFilter}
          filterId={filterId}
          savedFilters={savedFilters}
          onConditionsOpChange={onConditionsOpChange}
        />
      )}
    </View>
  );
}

type AccountSyncSidebarProps = {
  account: AccountEntity;
  accountsSyncing: string[];
};

function AccountSyncSidebar({
  account,
  accountsSyncing,
}: AccountSyncSidebarProps) {
  return (
    <View
      style={{
        backgroundColor: accountsSyncing.includes(account.id)
          ? theme.sidebarItemBackgroundPending
          : isAccountFailedSync(account)
            ? theme.sidebarItemBackgroundFailed
            : theme.sidebarItemBackgroundPositive,
        marginRight: '4px',
        width: 8,
        height: 8,
        borderRadius: 8,
      }}
    />
  );
}

type AccountNameFieldProps = {
  account?: AccountEntity;
  accountName: string;
  isNameEditable: boolean;
  isCompact: boolean;
  saveNameError?: ReactNode;
  onSaveName: (newName: string) => void;
};

function AccountNameField({
  account,
  accountName,
  isNameEditable,
  isCompact,
  saveNameError,
  onSaveName,
}: AccountNameFieldProps) {
  const nameFontSize = isCompact ? 22 : 28;
  const { t } = useTranslation();
  const [editingName, setEditingName] = useState(false);

  const handleSave = (newName: string) => {
    onSaveName(newName);
    setEditingName(false);
  };

  return (
    <View style={{ flexShrink: 1, minWidth: 0, alignItems: 'flex-start' }}>
      {editingName ? (
        <>
          <InitialFocus>
            <Input
              defaultValue={accountName}
              onEnter={handleSave}
              onUpdate={handleSave}
              onEscape={() => setEditingName(false)}
              style={{
                fontSize: nameFontSize,
                fontWeight: 700,
                marginTop: -3,
                marginBottom: -4,
                marginLeft: -6,
                paddingTop: 2,
                paddingBottom: 2,
                width: Math.max(20, accountName.length) + 'ch',
              }}
            />
          </InitialFocus>
          {saveNameError && (
            <View style={{ color: theme.warningText }}>{saveNameError}</View>
          )}
        </>
      ) : (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            whiteSpace: 'nowrap',
            minWidth: 0,
            maxWidth: '100%',
            gap: 3,
            '& .hover-visible': {
              opacity: 0,
              transition: 'opacity .25s',
            },
            '&:hover .hover-visible, &:focus-within .hover-visible': {
              opacity: 1,
            },
          }}
        >
          <View
            style={{
              fontSize: nameFontSize,
              fontWeight: 700,
              lineHeight: 1.2,
              letterSpacing: -0.4,
              marginRight: 5,
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            data-testid="account-name"
          >
            {account && account.closed
              ? t('Closed: {{ accountName }}', { accountName })
              : accountName}
          </View>

          <View style={{ flexDirection: 'row', width: 50, flexShrink: 0 }}>
            {isNameEditable && account && (
              <NotesButton
                id={`account-${account.id}`}
                defaultColor={theme.pageTextSubdued}
              />
            )}
            {isNameEditable && (
              <Button
                variant="bare"
                aria-label={t('Edit account name')}
                className="hover-visible"
                onPress={() => setEditingName(true)}
              >
                <SvgPencil1
                  style={{
                    width: 11,
                    height: 11,
                    color: theme.pageTextSubdued,
                  }}
                />
              </Button>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

type AccountMenuProps = {
  account: AccountEntity;
  canSync: boolean;
  showNetWorthChart: boolean;
  showReconciled: boolean;
  isSorted: boolean;
  onMenuSelect: (
    item:
      | 'link'
      | 'unlink'
      | 'close'
      | 'reopen'
      | 'export'
      | 'remove-sorting'
      | 'toggle-reconciled'
      | 'toggle-net-worth-chart'
      | 'manage-columns',
  ) => void;
};

function AccountMenu({
  account,
  canSync,
  showNetWorthChart,
  showReconciled,
  isSorted,
  onMenuSelect,
}: AccountMenuProps) {
  const { t } = useTranslation();
  const syncServerStatus = useSyncServerStatus();

  return (
    <Menu
      slot="close"
      onMenuSelect={item => {
        onMenuSelect(item);
      }}
      items={[
        ...(isSorted
          ? [
              {
                name: 'remove-sorting',
                text: t('Remove all sorting'),
              } as const,
            ]
          : []),
        {
          name: 'toggle-net-worth-chart',
          text: showNetWorthChart
            ? t('Hide balance chart')
            : t('Show balance chart'),
        },
        {
          name: 'manage-columns',
          text: t('Manage table columns'),
        },
        {
          name: 'toggle-reconciled',
          text: showReconciled
            ? t('Hide reconciled transactions')
            : t('Show reconciled transactions'),
        },
        { name: 'export', text: t('Export') },
        ...(account && !account.closed
          ? canSync
            ? [
                {
                  name: 'unlink',
                  text: t('Unlink account'),
                } as const,
              ]
            : syncServerStatus === 'online'
              ? [
                  {
                    name: 'link',
                    text: t('Link account'),
                  } as const,
                ]
              : []
          : []),

        ...(account.closed
          ? [{ name: 'reopen', text: t('Reopen account') } as const]
          : [{ name: 'close', text: t('Close account') } as const]),
      ]}
    />
  );
}
