import React from 'react';

import { theme } from '@actual-app/components/theme';
import type { TagEntity } from '@actual-app/core/types/models';

import { Table } from '#components/table';
import type { TableNavigator } from '#components/table';

import { TAG_ROW_HEIGHT, TagRow } from './TagRow';

type TagsListProps = {
  navigator: TableNavigator<TagEntity>;
  tags: TagEntity[];
  hoveredTag?: string;
  onHover: (id?: string) => void;
};

export function TagsList({
  navigator,
  tags,
  hoveredTag,
  onHover,
}: TagsListProps) {
  return (
    <Table
      navigator={navigator}
      items={tags}
      // 44px rows on the card (design-decisions §10e); the shared
      // ROW_HEIGHT stays as it is.
      rowHeight={TAG_ROW_HEIGHT}
      backgroundColor={theme.cardBackground}
      renderItem={({ item: tag, focusedField, onEdit }) => {
        const hovered = hoveredTag === tag.id;

        return (
          <TagRow
            key={tag.id}
            tag={tag}
            hovered={hovered}
            onHover={onHover}
            focusedField={focusedField}
            onEdit={onEdit}
          />
        );
      }}
    />
  );
}
