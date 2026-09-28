import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router';

import { InitialFocus } from '@actual-app/components/initial-focus';
import { Input } from '@actual-app/components/input';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import type { AccountEntity } from '@actual-app/core/types/models';
import { css } from '@emotion/css';

import { useReopenAccountMutation, useUpdateAccountMutation } from '#accounts';
import { CellValue } from '#components/spreadsheet/CellValue';
import { useContextMenu } from '#hooks/useContextMenu';
import { openAccountCloseModal } from '#modals/modalsSlice';
import { useDispatch } from '#redux';
import type { Binding, SheetFields } from '#spreadsheet';

import {
  menuRowActiveStyle,
  menuRowStyle,
  menuSectionLabelStyle,
} from './navMenuStyles';

type NavAccountRowProps<FieldName extends SheetFields<'account'>> = {
  name: string;
  to: string;
  query: Binding<'account', FieldName>;
  account?: AccountEntity;
  connected?: boolean;
  pending?: boolean;
  failed?: boolean;
  updated?: boolean;
  variant?: 'account' | 'total' | 'section';
  end?: boolean;
  onNavigate?: () => void;
};

export function NavAccountRow<FieldName extends SheetFields<'account'>>({
  name,
  to,
  query,
  account,
  connected = false,
  pending = false,
  failed = false,
  updated = false,
  variant = 'account',
  end = false,
  onNavigate,
}: NavAccountRowProps<FieldName>) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const triggerRef = useRef<HTMLAnchorElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const reopenAccount = useReopenAccountMutation();
  const updateAccount = useUpdateAccountMutation();

  // Same actions as the sidebar account's right-click menu.
  useContextMenu({
    triggerRef,
    enabled: account != null,
    items: account
      ? [
          {
            name: 'account-rename',
            text: t('Rename'),
            onClick: () => setIsEditing(true),
          },
          account.closed
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
        ]
      : [],
  });

  if (isEditing && account) {
    return (
      <View
        style={{ ...menuRowStyle, cursor: 'default' }}
        // Escape cancels the rename only; don't let it close the menu too.
        onKeyDown={e => {
          if (e.key === 'Escape') {
            e.stopPropagation();
          }
        }}
      >
        <InitialFocus>
          <Input
            aria-label={t('Account name')}
            style={{ width: '100%' }}
            defaultValue={name}
            onBlur={() => setIsEditing(false)}
            onEscape={() => setIsEditing(false)}
            onEnter={newName => {
              if (newName.trim() !== '') {
                updateAccount.mutate({
                  account: { ...account, name: newName },
                });
              }
              setIsEditing(false);
            }}
          />
        </InitialFocus>
      </View>
    );
  }

  const statusColor = pending
    ? theme.sidebarItemBackgroundPending
    : failed
      ? theme.sidebarItemBackgroundFailed
      : theme.sidebarItemBackgroundPositive;

  return (
    <NavLink
      ref={triggerRef}
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        css([
          menuRowStyle,
          variant === 'section' && {
            ...menuSectionLabelStyle,
            minHeight: 28,
            padding: '8px 10px 2px',
          },
          variant === 'total' && { fontWeight: 600 },
          updated && { fontWeight: 700 },
          isActive && menuRowActiveStyle,
        ])
      }
    >
      {variant === 'account' && (
        <span
          aria-hidden
          className={css({
            width: 6,
            height: 6,
            borderRadius: 3,
            flexShrink: 0,
            backgroundColor: connected ? statusColor : 'transparent',
          })}
        />
      )}
      <span
        className={css({
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        })}
      >
        {name}
      </span>
      <CellValue binding={query} type="financial" />
    </NavLink>
  );
}
