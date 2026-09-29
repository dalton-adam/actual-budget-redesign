import React from 'react';

import type { CategoryEntity } from '@actual-app/core/types/models';

import { useFeatureFlag } from '#hooks/useFeatureFlag';
import { envelopeBudget } from '#spreadsheet/bindings';

import { CategoryDetailsGoal } from './CategoryDetailsGoal';
import { CategoryDetailsPace } from './CategoryDetailsPace';
import { useEnvelopeValue } from './envelopeTable';

type CategoryDetailsOutlookProps = {
  category: CategoryEntity;
  month: string;
};

/**
 * The goal box and the pace chart (design-decisions §5, items 4 and 5). The
 * goal box shows when goal templates are on and the month has a goal, like
 * the Available pill's target icon; a long-term savings goal replaces the
 * pace chart.
 */
export function CategoryDetailsOutlook({
  category,
  month,
}: CategoryDetailsOutlookProps) {
  const isGoalTemplatesEnabled = useFeatureFlag('goalTemplatesEnabled');
  const available =
    useEnvelopeValue(envelopeBudget.catBalance(category.id)) ?? 0;
  const assigned =
    useEnvelopeValue(envelopeBudget.catBudgeted(category.id)) ?? 0;
  const activity =
    useEnvelopeValue(envelopeBudget.catSumAmount(category.id)) ?? 0;
  const goalValue = useEnvelopeValue(envelopeBudget.catGoal(category.id));
  const longGoal = useEnvelopeValue(envelopeBudget.catLongGoal(category.id));

  const goal = isGoalTemplatesEnabled ? (goalValue ?? null) : null;
  const isLongGoal = goal != null && longGoal === 1;

  return (
    <>
      {goal != null && (
        <CategoryDetailsGoal
          category={category}
          goal={goal}
          isLongGoal={isLongGoal}
          available={available}
          assigned={assigned}
        />
      )}
      {!isLongGoal && (
        <CategoryDetailsPace
          category={category}
          month={month}
          available={available}
          activity={activity}
        />
      )}
    </>
  );
}
