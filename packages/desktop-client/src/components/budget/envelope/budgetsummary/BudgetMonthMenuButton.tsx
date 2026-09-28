import React, { useRef, useState } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { Popover } from '@actual-app/components/popover';
import * as monthUtils from '@actual-app/core/shared/months';

import { useEnvelopeBudget } from '#components/budget/envelope/EnvelopeBudgetContext';
import { useLocale } from '#hooks/useLocale';
import { useUndo } from '#hooks/useUndo';

import { BudgetMonthMenu } from './BudgetMonthMenu';

type BudgetMonthMenuButtonProps = {
  month: string;
  variant?: ComponentProps<typeof Button>['variant'];
  children: ReactNode;
};

/**
 * The envelope month menu (⋯) with its existing actions and undo
 * notifications. Shared by the per-month summary and the month toolbar.
 */
export function BudgetMonthMenuButton({
  month,
  variant = 'bare',
  children,
}: BudgetMonthMenuButtonProps) {
  const { t } = useTranslation();
  const locale = useLocale();
  const { onBudgetAction } = useEnvelopeBudget();
  const { showUndoNotification } = useUndo();
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef(null);

  const displayMonth = monthUtils.format(month, "MMMM ''yy", locale);

  function onMenuClose() {
    setMenuOpen(false);
  }

  return (
    <>
      <Button
        ref={triggerRef}
        variant={variant}
        aria-label={t('Menu')}
        onPress={() => setMenuOpen(true)}
      >
        {children}
      </Button>

      <Popover
        triggerRef={triggerRef}
        isOpen={menuOpen}
        onOpenChange={onMenuClose}
      >
        <BudgetMonthMenu
          onCopyLastMonthBudget={() => {
            onBudgetAction(month, 'copy-last');
            onMenuClose();
            showUndoNotification({
              message: t(
                "{{displayMonth}} budgets have all been set to last month's budgeted amounts.",
                { displayMonth },
              ),
            });
          }}
          onSetBudgetsToZero={() => {
            onBudgetAction(month, 'set-zero');
            onMenuClose();
            showUndoNotification({
              message: t(
                '{{displayMonth}} budgets have all been set to zero.',
                { displayMonth },
              ),
            });
          }}
          onSetMonthsAverage={numberOfMonths => {
            onBudgetAction(month, `set-${numberOfMonths}-avg`);
            onMenuClose();
            showUndoNotification({
              message:
                numberOfMonths === 12
                  ? t(
                      `${displayMonth} budgets have all been set to yearly average.`,
                    )
                  : t(
                      `${displayMonth} budgets have all been set to ${numberOfMonths} month average.`,
                    ),
            });
          }}
          onCheckTemplates={() => {
            onBudgetAction(month, 'check-templates');
            onMenuClose();
          }}
          onApplyBudgetTemplates={() => {
            onBudgetAction(month, 'apply-goal-template');
            onMenuClose();
            showUndoNotification({
              message: t(
                '{{displayMonth}} budget templates have been applied.',
                { displayMonth },
              ),
            });
          }}
          onOverwriteWithBudgetTemplates={() => {
            onBudgetAction(month, 'overwrite-goal-template');
            onMenuClose();
            showUndoNotification({
              message: t(
                '{{displayMonth}} budget templates have been overwritten.',
                { displayMonth },
              ),
            });
          }}
          onEndOfMonthCleanup={() => {
            onBudgetAction(month, 'cleanup-goal-template');
            onMenuClose();
            showUndoNotification({
              message: t(
                '{{displayMonth}} end-of-month cleanup templates have been applied.',
                { displayMonth },
              ),
            });
          }}
        />
      </Popover>
    </>
  );
}
