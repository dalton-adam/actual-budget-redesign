import React from 'react';
import { Trans } from 'react-i18next';

import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import { q } from '@actual-app/core/shared/query';
import type { CategoryEntity, NoteEntity } from '@actual-app/core/types/models';

import { Notes } from '#components/Notes';
import { NotesButton } from '#components/NotesButton';
import { useQuery } from '#hooks/useQuery';

import { CategoryDetailsSection } from './CategoryDetailsSection';

type CategoryDetailsNotesProps = {
  categoryId: CategoryEntity['id'];
};

/**
 * The category's notes (design-decisions §5, item 6). Same query as
 * `useNotes`, read directly so the section can tell loading from "no notes".
 * Editing uses the row's own notes button, so it saves the same way: when
 * its popover closes, and only if the text changed.
 */
export function CategoryDetailsNotes({
  categoryId,
}: CategoryDetailsNotesProps) {
  const { data, isLoading, error } = useQuery<NoteEntity>(
    () => q('notes').filter({ id: categoryId }).select('*'),
    [categoryId],
  );
  const note = data?.[0]?.note ?? '';

  return (
    <CategoryDetailsSection
      title={<Trans>Notes</Trans>}
      aside={
        <NotesButton
          id={categoryId}
          defaultColor={theme.pageTextSecondary}
          tooltipPosition="bottom end"
          showPlaceholder
        />
      }
    >
      <View
        data-testid="category-details-notes"
        style={{
          padding: '10px 12px',
          borderRadius: 10,
          backgroundColor: theme.cardInset,
          fontSize: 13,
          color: theme.pageText,
          overflowWrap: 'anywhere',
        }}
      >
        {error ? (
          <View style={{ color: theme.pageTextSecondary }}>
            <Trans>Notes couldn't be loaded.</Trans>
          </View>
        ) : isLoading ? (
          <View style={{ color: theme.pageTextSecondary }}>
            <Trans>Loading notes…</Trans>
          </View>
        ) : note.trim() === '' ? (
          <View style={{ color: theme.pageTextSecondary }}>
            <Trans>No notes.</Trans>
          </View>
        ) : (
          <Notes notes={note} getStyle={() => ({ padding: 0 })} />
        )}
      </View>
    </CategoryDetailsSection>
  );
}
