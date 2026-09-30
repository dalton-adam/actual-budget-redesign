import React from 'react';

import { StatusPill } from '@actual-app/components/status-pill';
import type { StatusPillTone } from '@actual-app/components/status-pill';

import { useFormat } from '#hooks/useFormat';

type ChangePillProps = {
  amount: number;
  /** For spending, an increase is the bad direction. */
  isIncreaseNegative?: boolean;
};

/**
 * A dashboard widget's change amount as a status pill (APP-03,
 * docs/redesign/prototype/README.md). The sign stays in the text, so the
 * tone is never the only signal; the tone follows the colour the amount had
 * before.
 */
export function ChangePill({
  amount,
  isIncreaseNegative = false,
}: ChangePillProps) {
  const format = useFormat();

  let tone: StatusPillTone = 'neutral';
  if (amount !== 0) {
    tone = amount > 0 !== isIncreaseNegative ? 'positive' : 'negative';
  }

  return (
    <StatusPill tone={tone} size="small">
      {amount > 0 || (amount === 0 && !isIncreaseNegative) ? '+' : ''}
      {format(amount, 'financial')}
    </StatusPill>
  );
}
