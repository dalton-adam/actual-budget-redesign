import React from 'react';
import { useTranslation } from 'react-i18next';

import { theme } from '@actual-app/components/theme';

import { Cell, SelectCell, TableHeader } from '#components/table';
import { useSelectedDispatch, useSelectedItems } from '#hooks/useSelected';

import { RULE_STAGE_WIDTH } from './RuleRow';

export function RulesHeader() {
  const { t } = useTranslation();
  const selectedItems = useSelectedItems();
  const dispatchSelected = useSelectedDispatch();

  return (
    <TableHeader
      height={38}
      style={{
        // Eyebrow header on the card (design-decisions §10d).
        color: theme.pageTextFaint,
        fontSize: 11,
        fontWeight: 650,
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        backgroundColor: theme.cardBackground,
        '& > div': { borderColor: theme.cardHairline },
      }}
    >
      <SelectCell
        exposed
        focused={false}
        selected={selectedItems.size > 0}
        onSelect={e =>
          dispatchSelected({ type: 'select-all', isRangeSelect: e.shiftKey })
        }
      />
      <Cell value={t('Stage')} width={RULE_STAGE_WIDTH} />
      <Cell value={t('Rule')} width="flex" />
    </TableHeader>
  );
}
