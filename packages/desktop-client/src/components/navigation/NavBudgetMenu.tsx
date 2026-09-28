import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgExpandArrow } from '@actual-app/components/icons/v0';
import { InitialFocus } from '@actual-app/components/initial-focus';
import { Input } from '@actual-app/components/input';
import { View } from '@actual-app/components/view';
import { isElectron } from '@actual-app/core/shared/environment';

import { closeBudget } from '#budgetfiles/budgetfilesSlice';
import { useContextMenu } from '#hooks/useContextMenu';
import { useMetadataPref } from '#hooks/useMetadataPref';
import { useNavigate } from '#hooks/useNavigate';
import { pushModal } from '#modals/modalsSlice';
import { useDispatch } from '#redux';

import { menuRowStyle } from './navMenuStyles';

type NavBudgetMenuProps = {
  onAction: () => void;
};

// The budget file menu for the compact drawer, where the sidebar's budget
// name is hidden. Same actions as the sidebar's budget name menu.
export function NavBudgetMenu({ onAction }: NavBudgetMenuProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [budgetName, setBudgetNamePref] = useMetadataPref('budgetName');
  const [isEditing, setIsEditing] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const { handleContextMenu } = useContextMenu({
    triggerRef,
    items: [
      {
        name: 'rename',
        text: t('Rename budget'),
        onClick: () => setIsEditing(true),
      },
      {
        name: 'settings',
        text: t('Settings'),
        onClick: () => {
          onAction();
          void navigate('/settings');
        },
      },
      isElectron() && {
        name: 'loadBackup',
        text: t('Load Backup…'),
        onClick: () => {
          onAction();
          dispatch(pushModal({ modal: { name: 'load-backup', options: {} } }));
        },
      },
      {
        name: 'close',
        text: t('Switch file'),
        onClick: () => {
          onAction();
          void dispatch(closeBudget());
        },
      },
    ],
  });

  if (isEditing) {
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
            aria-label={t('Budget name')}
            style={{ width: '100%' }}
            defaultValue={budgetName}
            onEnter={newBudgetName => {
              if (newBudgetName.trim() !== '') {
                setBudgetNamePref(newBudgetName);
                setIsEditing(false);
              }
            }}
            onEscape={() => setIsEditing(false)}
            onBlur={() => setIsEditing(false)}
          />
        </InitialFocus>
      </View>
    );
  }

  return (
    <Button
      ref={triggerRef}
      variant="bare"
      aria-label={t('Budget file menu for {{budgetName}}', {
        budgetName: budgetName || t('Unnamed'),
      })}
      style={{ ...menuRowStyle, justifyContent: 'flex-start', width: '100%' }}
      onPress={handleContextMenu}
    >
      <span
        style={{
          flex: 1,
          textAlign: 'left',
          fontWeight: 600,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {budgetName || t('Unnamed')}
      </span>
      <SvgExpandArrow width={7} height={7} style={{ flexShrink: 0 }} />
    </Button>
  );
}
