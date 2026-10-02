import React from 'react';
import { useTranslation } from 'react-i18next';

import { theme } from '@actual-app/components/theme';

import { Cell, SelectCell, TableHeader } from '#components/table';
import { useSelectedDispatch, useSelectedItems } from '#hooks/useSelected';

export function TagsHeader() {
  const { t } = useTranslation();
  const selectedItems = useSelectedItems();
  const dispatchSelected = useSelectedDispatch();

  return (
    <TableHeader
      height={38}
      style={{
        // Eyebrow header on the card (design-decisions §10e).
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
        aria-label={t('Select all')}
        exposed
        focused={false}
        selected={selectedItems.size > 0}
        onSelect={e =>
          dispatchSelected({ type: 'select-all', isRangeSelect: e.shiftKey })
        }
      />
      <Cell value={t('Tag')} width={250} />
      <Cell value={t('Description')} width="flex" />
    </TableHeader>
  );
}
