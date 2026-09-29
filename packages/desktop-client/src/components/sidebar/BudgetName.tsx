import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgExpandArrow } from '@actual-app/components/icons/v0';
import { InitialFocus } from '@actual-app/components/initial-focus';
import { Input } from '@actual-app/components/input';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { isElectron } from '@actual-app/core/shared/environment';

import { closeBudget } from '#budgetfiles/budgetfilesSlice';
import { useContextMenu } from '#hooks/useContextMenu';
import { useMetadataPref } from '#hooks/useMetadataPref';
import { useNavigate } from '#hooks/useNavigate';
import { pushModal } from '#modals/modalsSlice';
import { useDispatch } from '#redux';

export function BudgetName() {
  return <EditableBudgetName />;
}

function EditableBudgetName() {
  const { t } = useTranslation();
  const [budgetName, setBudgetNamePref] = useMetadataPref('budgetName');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { handleContextMenu } = useContextMenu({
    triggerRef,
    items: [
      {
        name: 'rename',
        text: t('Rename budget'),
        onClick: () => setEditing(true),
      },
      {
        name: 'settings',
        text: t('Settings'),
        onClick: () => void navigate('/settings'),
      },
      isElectron() && {
        name: 'loadBackup',
        text: t('Load Backup…'),
        onClick: () =>
          dispatch(pushModal({ modal: { name: 'load-backup', options: {} } })),
      },
      {
        name: 'close',
        text: t('Switch file'),
        onClick: () => void dispatch(closeBudget()),
      },
    ],
  });

  if (editing) {
    return (
      <InitialFocus>
        <Input
          aria-label={t('Budget name')}
          style={{
            width: 140,
            height: 30,
            fontSize: 13,
            fontWeight: 500,
          }}
          defaultValue={budgetName}
          onEnter={newBudgetName => {
            if (newBudgetName.trim() !== '') {
              setBudgetNamePref(newBudgetName);
              setEditing(false);
            }
          }}
          onEscape={() => setEditing(false)}
          onBlur={() => setEditing(false)}
        />
      </InitialFocus>
    );
  }

  return (
    <Button
      ref={triggerRef}
      data-testid="budget-name"
      variant="control"
      aria-label={t('Budget file menu for {{budgetName}}', {
        budgetName: budgetName || t('Unnamed'),
      })}
      style={{
        color: theme.pageText,
        height: 30,
        maxWidth: 180,
        // Gives up width before the title bar would wrap; the name ellipsizes.
        minWidth: 0,
        flexShrink: 1,
        padding: '0 8px 0 5px',
        gap: 7,
        ...styles.smallText,
      }}
      onClick={handleContextMenu}
    >
      <span
        aria-hidden
        style={{
          display: 'grid',
          placeItems: 'center',
          width: 22,
          height: 22,
          flexShrink: 0,
          borderRadius: 7,
          color: theme.pageText,
          backgroundColor: theme.cardInset,
          fontWeight: 700,
        }}
      >
        {(budgetName || t('Unnamed')).trim().charAt(0).toLocaleUpperCase()}
      </span>
      <Text
        style={{
          minWidth: 0,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontWeight: 600,
        }}
      >
        {budgetName || t('Unnamed')}
      </Text>
      <SvgExpandArrow width={7} height={7} style={{ flexShrink: 0 }} />
    </Button>
  );
}
