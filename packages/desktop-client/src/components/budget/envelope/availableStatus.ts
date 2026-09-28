import type { StatusPillTone } from '@actual-app/components/status-pill';
import { theme } from '@actual-app/components/theme';

import {
  makeAmountGrey,
  makeBalanceAmountStyle,
} from '#components/budget/util';

export type AvailableStatus = {
  tone: StatusPillTone;
  /** A template or long-term goal applies (target icon). */
  hasTarget: boolean;
};

/**
 * Maps `makeBalanceAmountStyle`'s colour to a pill tone, so the Available
 * pill follows the same order as today's amount colour: negative first,
 * then template / goal status, then positive or zero (design-decisions
 * §4.3). Display only.
 */
export function getAvailableStatus({
  balance,
  goal,
  budgeted,
  isLongGoal,
}: {
  balance: number;
  /** Null when there is no goal or goal templates are disabled. */
  goal: number | null;
  budgeted: number;
  isLongGoal: boolean;
}): AvailableStatus {
  const { color } = makeBalanceAmountStyle(
    balance,
    goal,
    // A long-term goal compares the balance; a template the budgeted amount.
    isLongGoal ? balance : budgeted,
  );
  const hasTarget = goal != null;

  switch (color) {
    case theme.budgetNumberNegative:
      return { tone: 'negative', hasTarget };
    case theme.templateNumberUnderFunded:
      return { tone: 'warning', hasTarget };
    case theme.templateNumberFunded:
      // A funded template is shown "by value".
      return {
        tone: makeAmountGrey(balance) ? 'neutral' : 'positive',
        hasTarget,
      };
    case theme.budgetNumberZero:
      return { tone: 'neutral', hasTarget };
    default:
      return { tone: 'positive', hasTarget };
  }
}
