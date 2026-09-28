import React from 'react';
import type { ComponentProps, ComponentType } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgArrowThinRight, SvgTarget } from '@actual-app/components/icons/v1';
import { StatusPill } from '@actual-app/components/status-pill';
import { styles } from '@actual-app/components/styles';
import { Tooltip } from '@actual-app/components/tooltip';
import * as monthUtils from '@actual-app/core/shared/months';
import type { CategoryEntity } from '@actual-app/core/types/models';
import { css } from '@emotion/css';

import { BalanceWithCarryover } from '#components/budget/BalanceWithCarryover';
import { useEnvelopeValue } from '#components/budget/envelopeTable';
import { CellValueText } from '#components/spreadsheet/CellValue';
import { useFeatureFlag } from '#hooks/useFeatureFlag';
import { useFormat } from '#hooks/useFormat';
import { useLocale } from '#hooks/useLocale';
import { envelopeBudget } from '#spreadsheet/bindings';

import { getAvailableStatus } from './availableStatus';

// The carryover arrow is drawn inside the pill instead.
const hiddenCarryoverIndicator: ComponentType = () => null;

type EnvelopeAvailableButtonProps = Omit<
  ComponentProps<typeof Button>,
  'children' | 'aria-label' | 'variant'
> & {
  category: CategoryEntity;
  month: string;
  tooltipDisabled?: boolean;
};

/**
 * The Available status pill (design-decisions §4.3). It stays the trigger
 * for the existing balance menu; its accessible name is a full sentence.
 */
export function EnvelopeAvailableButton({
  category,
  month,
  tooltipDisabled,
  style,
  ...buttonProps
}: EnvelopeAvailableButtonProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const locale = useLocale();
  const isGoalTemplatesEnabled = useFeatureFlag('goalTemplatesEnabled');

  const balance = useEnvelopeValue(envelopeBudget.catBalance(category.id)) ?? 0;
  const carryover = useEnvelopeValue(envelopeBudget.catCarryover(category.id));
  const goalValue = useEnvelopeValue(envelopeBudget.catGoal(category.id));
  const budgeted =
    useEnvelopeValue(envelopeBudget.catBudgeted(category.id)) ?? 0;
  const longGoal = useEnvelopeValue(envelopeBudget.catLongGoal(category.id));

  const goal = isGoalTemplatesEnabled ? (goalValue ?? null) : null;
  const isLongGoal = longGoal === 1;
  const { tone, hasTarget } = getAvailableStatus({
    balance,
    goal,
    budgeted,
    isLongGoal,
  });
  const rolloverMonth = monthUtils.format(
    monthUtils.nextMonth(month),
    'MMMM',
    locale,
  );

  const sentences = [
    t('Available {{amount}}.', { amount: format(balance, 'financial') }),
  ];
  if (balance < 0) {
    sentences.push(
      t('Overspent by {{amount}}.', { amount: format(-balance, 'financial') }),
    );
  }
  if (goal != null) {
    const difference = isLongGoal ? balance - goal : budgeted - goal;
    const goalAmount = format(goal, 'financial');
    if (isLongGoal) {
      sentences.push(
        difference < 0
          ? t('Goal {{goal}}. {{amount}} to go.', {
              goal: goalAmount,
              amount: format(-difference, 'financial'),
            })
          : t('Goal of {{goal}} reached.', { goal: goalAmount }),
      );
    } else {
      sentences.push(
        difference < 0
          ? t('Template asks for {{goal}}. Underfunded by {{amount}}.', {
              goal: goalAmount,
              amount: format(-difference, 'financial'),
            })
          : t('Template of {{goal}} funded.', { goal: goalAmount }),
      );
    }
  }
  const rolloverSentence = t('Overspending rolls over to {{month}}.', {
    month: rolloverMonth,
  });
  if (carryover) {
    sentences.push(rolloverSentence);
  }

  return (
    <Button
      variant="bare"
      aria-label={sentences.join(' ')}
      {...buttonProps}
      style={{
        justifyContent: 'flex-end',
        background: 'transparent',
        width: '100%',
        padding: 0,
        ...style,
      }}
    >
      <StatusPill tone={tone} className={css({ maxWidth: '100%' })}>
        {hasTarget && (
          <SvgTarget
            aria-hidden
            width={10}
            height={10}
            style={{ flexShrink: 0 }}
          />
        )}
        <BalanceWithCarryover
          carryover={envelopeBudget.catCarryover(category.id)}
          balance={envelopeBudget.catBalance(category.id)}
          goal={envelopeBudget.catGoal(category.id)}
          budgeted={envelopeBudget.catBudgeted(category.id)}
          longGoal={envelopeBudget.catLongGoal(category.id)}
          tooltipDisabled={tooltipDisabled}
          CarryoverIndicator={hiddenCarryoverIndicator}
        >
          {({ type, name, value }) => (
            <CellValueText
              type={type}
              name={name}
              value={value}
              className={css({
                color: 'inherit',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                cursor: 'pointer',
              })}
            />
          )}
        </BalanceWithCarryover>
        {carryover && (
          <Tooltip
            content={rolloverSentence}
            placement="bottom"
            triggerProps={{ isDisabled: tooltipDisabled }}
            style={styles.tooltip}
          >
            <SvgArrowThinRight
              aria-hidden
              width={8}
              height={8}
              style={{ flexShrink: 0 }}
            />
          </Tooltip>
        )}
      </StatusPill>
    </Button>
  );
}
