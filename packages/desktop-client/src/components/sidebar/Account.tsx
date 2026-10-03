// @ts-strict-ignore
import React, { useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

import { AlignedText } from '@actual-app/components/aligned-text';
import { Button } from '@actual-app/components/button';
import {
  SvgArrowButtonDown1,
  SvgArrowButtonUp1,
} from '@actual-app/components/icons/v2';
import { InitialFocus } from '@actual-app/components/initial-focus';
import { Input } from '@actual-app/components/input';
import { SpaceBetween } from '@actual-app/components/space-between';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { Tooltip } from '@actual-app/components/tooltip';
import { View } from '@actual-app/components/view';
import type { AccountEntity } from '@actual-app/core/types/models';
import { css, cx } from '@emotion/css';

import { useReopenAccountMutation, useUpdateAccountMutation } from '#accounts';
import { BalanceHistoryGraph } from '#components/accounts/BalanceHistoryGraph';
import { Link } from '#components/common/Link';
import { Notes } from '#components/Notes';
import { DropHighlight, useDraggable, useDroppable } from '#components/sort';
import type { OnDragChangeCallback, OnDropCallback } from '#components/sort';
import { CellValue } from '#components/spreadsheet/CellValue';
import { useContextMenu } from '#hooks/useContextMenu';
import { useDragRef } from '#hooks/useDragRef';
import { useIsTestEnv } from '#hooks/useIsTestEnv';
import { useNotes } from '#hooks/useNotes';
import { useSyncedPref } from '#hooks/useSyncedPref';
import { openAccountCloseModal } from '#modals/modalsSlice';
import { useDispatch, useSelector } from '#redux';
import type { Binding, SheetFields } from '#spreadsheet';
import { isTouchDevice } from '#util/isTouchDevice';

import { firstGrapheme } from './railInitials';

export const accountNameStyle: CSSProperties = {
  minHeight: 32,
  margin: '1px 6px',
  padding: '0 8px',
  borderRadius: 8,
  textDecoration: 'none',
  color: theme.pageText,
  ':hover': { backgroundColor: theme.tableRowBackgroundHover },
  ...styles.smallText,
};

type AccountProps<FieldName extends SheetFields<'account'>> = {
  name: string;
  to: string;
  query: Binding<'account', FieldName>;
  account?: AccountEntity;
  connected?: boolean;
  pending?: boolean;
  failed?: boolean;
  updated?: boolean;
  style?: CSSProperties;
  outerStyle?: CSSProperties;
  onDragChange?: OnDragChangeCallback<{ id: string }>;
  onDrop?: OnDropCallback;
  titleAccount?: boolean;
  isExactPathMatch?: boolean;
  balanceTestId?: string;
  compact?: boolean;
  /** Rail initials; defaults to the name's first letter. */
  initials?: string;
  startEditing?: boolean;
  onEditComplete?: () => void;
  onRequestEdit?: () => void;
};

export function Account<FieldName extends SheetFields<'account'>>({
  name,
  account,
  connected,
  pending = false,
  failed,
  updated,
  to,
  query,
  style,
  outerStyle,
  onDragChange,
  onDrop,
  titleAccount,
  isExactPathMatch,
  balanceTestId,
  compact = false,
  initials,
  startEditing = false,
  onEditComplete,
  onRequestEdit,
}: AccountProps<FieldName>) {
  const isTestEnv = useIsTestEnv();
  const { t } = useTranslation();
  const type = account
    ? account.closed
      ? 'account-closed'
      : account.offbudget
        ? 'account-offbudget'
        : 'account-onbudget'
    : 'title';

  const triggerRef = useRef(null);

  const { dragRef } = useDraggable({
    type,
    onDragChange,
    item: { id: account && account.id },
    canDrag: account != null,
  });
  const handleDragRef = useDragRef(dragRef);

  const { dropRef, dropPos } = useDroppable({
    types: account ? [type] : [],
    id: account && account.id,
    onDrop,
  });

  const [showBalanceHistory, setShowBalanceHistory] = useSyncedPref(
    `side-nav.show-balance-history-${account?.id}`,
  );

  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(startEditing);
  const finishEditing = () => {
    setIsEditing(false);
    onEditComplete?.();
  };

  const accountNote = useNotes(`account-${account?.id}`);
  const needsTooltip = !!account?.id && !isTouchDevice();
  const reopenAccount = useReopenAccountMutation();
  const updateAccount = useUpdateAccountMutation();

  const balanceCell = <CellValue binding={query} type="financial" />;

  const isContextMenuOpen = useSelector(state =>
    state.contextMenu.items.some(
      i =>
        typeof i === 'object' && 'name' in i && i.name.startsWith('account-'),
    ),
  );
  useContextMenu({
    triggerRef,
    enabled: account != null && needsTooltip,
    items: [
      {
        name: 'account-rename',
        text: t('Rename'),
        onClick: () => {
          if (onRequestEdit) {
            onRequestEdit();
          } else {
            setIsEditing(true);
          }
        },
      },
      account?.closed
        ? {
            name: 'account-reopen',
            text: t('Reopen'),
            onClick: () => reopenAccount.mutate({ id: account.id }),
          }
        : {
            name: 'account-close',
            text: t('Close'),
            onClick: () =>
              dispatch(openAccountCloseModal({ accountId: account.id })),
          },
    ],
  });

  const accountRow = compact ? (
    <View innerRef={dropRef} style={{ flexShrink: 0, ...outerStyle }}>
      <View innerRef={triggerRef}>
        <DropHighlight pos={dropPos} />
        <View innerRef={handleDragRef}>
          <Link
            variant="internal"
            to={to}
            isDisabled={isEditing}
            style={{
              width: 32,
              height: 32,
              padding: 0,
              borderRadius: 10,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              color: updated ? theme.pageText : theme.pageTextSecondary,
              backgroundColor: theme.cardInset,
              fontWeight: 700,
              ...styles.smallText,
              ':hover': { backgroundColor: theme.tableRowBackgroundHover },
              ':focus-visible': styles.focusRing,
            }}
            activeStyle={{
              color: theme.pageText,
              backgroundColor: theme.navListActive,
            }}
          >
            <span
              className={css({
                position: 'absolute',
                width: 1,
                height: 1,
                padding: 0,
                margin: -1,
                overflow: 'hidden',
                clip: 'rect(0, 0, 0, 0)',
                whiteSpace: 'nowrap',
                border: 0,
              })}
            >
              {name}
            </span>
            <span aria-hidden>{initials ?? firstGrapheme(name)}</span>
            {connected && (
              <span
                aria-hidden
                className={css({
                  position: 'absolute',
                  top: -1,
                  right: -1,
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: pending
                    ? theme.sidebarItemBackgroundPending
                    : failed
                      ? theme.sidebarItemBackgroundFailed
                      : theme.sidebarItemBackgroundPositive,
                  boxShadow: `0 0 0 2px ${theme.cardBackground}`,
                })}
              />
            )}
          </Link>
        </View>
      </View>
    </View>
  ) : (
    <View innerRef={dropRef} style={{ flexShrink: 0, ...outerStyle }}>
      <View innerRef={triggerRef}>
        <DropHighlight pos={dropPos} />
        <View innerRef={handleDragRef}>
          <Link
            variant="internal"
            to={to}
            isDisabled={isEditing}
            isExactPathMatch={isExactPathMatch}
            style={{
              ...accountNameStyle,
              ...style,
              position: 'relative',
              // Centre the name in the row's 32px fill.
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              ...(updated && {
                fontWeight: 700,
                color: theme.pageText,
              }),
            }}
            activeStyle={{
              backgroundColor: theme.navListActive,
              color: theme.pageText,
              // This is kind of a hack, but we don't ever want the account
              // that the user is looking at to be "bolded" which means it
              // has unread transactions. The system does mark is read and
              // unbolds it, but it still "flashes" bold so this just
              // ignores it if it's active
              fontWeight: (style && style.fontWeight) || 'normal',
              '& .dot': {
                transform: 'scale(1.25)',
              },
            }}
          >
            <View
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <div
                className={cx(
                  'dot',
                  css({
                    marginRight: 3,
                    width: 6,
                    height: 6,
                    borderRadius: 6,
                    backgroundColor: pending
                      ? theme.sidebarItemBackgroundPending
                      : failed
                        ? theme.sidebarItemBackgroundFailed
                        : theme.sidebarItemBackgroundPositive,
                    marginLeft: 4,
                    transition: 'transform .15s',
                    opacity: connected ? 1 : 0,
                  }),
                )}
              />
            </View>

            <AlignedText
              style={
                titleAccount && {
                  color: theme.pageTextSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  ...styles.verySmallText,
                }
              }
              left={
                isEditing ? (
                  <InitialFocus>
                    <Input
                      aria-label={t('Account name')}
                      style={{
                        padding: 0,
                        width: '100%',
                      }}
                      onBlur={finishEditing}
                      onEnter={newAccountName => {
                        if (newAccountName.trim() !== '') {
                          updateAccount.mutate({
                            account: {
                              ...account,
                              name: newAccountName,
                            },
                          });
                        }
                        finishEditing();
                      }}
                      onEscape={finishEditing}
                      defaultValue={name}
                    />
                  </InitialFocus>
                ) : (
                  name
                )
              }
              right={
                balanceTestId ? (
                  <View data-testid={balanceTestId}>{balanceCell}</View>
                ) : (
                  balanceCell
                )
              }
            />
          </Link>
        </View>
      </View>
    </View>
  );

  if (!needsTooltip || isTestEnv) {
    return accountRow;
  }

  return (
    <Tooltip
      content={
        <View
          style={{
            padding: 10,
          }}
        >
          <SpaceBetween
            gap={5}
            style={{
              justifyContent: 'space-between',
              '& .hover-visible': {
                opacity: 0,
                transition: 'opacity .25s',
              },
              '&:hover .hover-visible': {
                opacity: 1,
              },
            }}
          >
            <Text
              style={{
                fontWeight: 'bold',
              }}
            >
              {name}
            </Text>
            <Button
              aria-label={t('Toggle balance history')}
              variant="bare"
              onClick={() =>
                setShowBalanceHistory(
                  showBalanceHistory === 'true' ? 'false' : 'true',
                )
              }
              className="hover-visible"
            >
              <SpaceBetween gap={3}>
                {showBalanceHistory === 'true' ? (
                  <SvgArrowButtonUp1 width={10} height={10} />
                ) : (
                  <SvgArrowButtonDown1 width={10} height={10} />
                )}
              </SpaceBetween>
            </Button>
          </SpaceBetween>
          {showBalanceHistory === 'true' && account && (
            <BalanceHistoryGraph
              accountId={account.id}
              style={{ minWidth: 350, minHeight: 70 }}
            />
          )}
          {accountNote && (
            <Notes
              getStyle={() => ({
                borderTop: `1px solid ${theme.tableBorder}`,
                padding: 0,
                paddingTop: '0.5rem',
                marginTop: '0.5rem',
              })}
              notes={accountNote}
            />
          )}
        </View>
      }
      style={{ ...styles.tooltip, borderRadius: '0px 5px 5px 0px' }}
      placement="right top"
      triggerProps={{
        delay: 1000,
        closeDelay: 250,
        isDisabled: isContextMenuOpen,
      }}
    >
      {accountRow}
    </Tooltip>
  );
}
