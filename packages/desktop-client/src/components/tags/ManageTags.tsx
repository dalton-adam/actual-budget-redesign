import React, { useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgAdd } from '@actual-app/components/icons/v1';
import { SpaceBetween } from '@actual-app/components/space-between';
import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import { listen } from '@actual-app/core/platform/client/connection';
import { getNormalisedString } from '@actual-app/core/shared/normalisation';

import { Search } from '#components/common/Search';
import { useTableNavigator } from '#components/table';
import { SelectedProvider, useSelected } from '#hooks/useSelected';
import { useTags } from '#hooks/useTags';

import { SelectedTagsButton } from './SelectedTagsButton';
import { TagCreationRow } from './TagCreationRow';
import { TagsHeader } from './TagsHeader';
import { TagsList } from './TagsList';
import { TagsMenuButton } from './TagsMenuButton';

export function ManageTags() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('');
  const [hoveredTag, setHoveredTag] = useState<string>();
  const [create, setCreate] = useState(false);
  const { data: tags = [], refetch } = useTags();

  useEffect(() => listen('undo-event', () => refetch({ cancelRefetch: true })));

  const filteredTags = useMemo(() => {
    return filter === ''
      ? tags
      : tags.filter(tag =>
          getNormalisedString(tag.tag).includes(getNormalisedString(filter)),
        );
  }, [filter, tags]);

  const selectedInst = useSelected('manage-tags', filteredTags, []);
  const tableNavigator = useTableNavigator(filteredTags, [
    'select',
    'tag',
    'color',
    'description',
  ]);

  return (
    <SelectedProvider instance={selectedInst}>
      <View>
        {/* Intro under the title, one toolbar above the table
            (design-decisions §10e). */}
        <View
          style={{
            color: theme.pageTextSecondary,
            fontSize: 13,
            marginTop: 4,
            flexShrink: 0,
          }}
        >
          <Trans>User defined tags with color and description.</Trans>
        </View>
        <SpaceBetween
          gap={8}
          wrap={false}
          style={{ margin: '14px 0', flexShrink: 0 }}
        >
          <Button
            variant="primary"
            onPress={() => setCreate(true)}
            style={{ gap: 6, borderRadius: 9, minHeight: 30, flexShrink: 0 }}
          >
            <SvgAdd width={10} height={10} />
            <Trans>Add New</Trans>
          </Button>
          <SelectedTagsButton
            onRename={id => tableNavigator.onEdit(id, 'tag')}
          />
          <View style={{ flex: 1 }} />
          <Search
            placeholder={t('Filter tags...')}
            value={filter}
            onChange={setFilter}
          />
          <TagsMenuButton />
        </SpaceBetween>
        <View
          style={{
            ...styles.tableContainer,
            // One Surface card with hairlines (design-decisions §10e).
            ...styles.surfaceCard,
            overflow: 'hidden',
            marginBottom: 20,
          }}
        >
          <TagsHeader />
          {create && (
            <TagCreationRow onClose={() => setCreate(false)} tags={tags} />
          )}
          {tags.length ? (
            <TagsList
              navigator={tableNavigator}
              tags={filteredTags}
              hoveredTag={hoveredTag}
              onHover={id => setHoveredTag(id ?? undefined)}
            />
          ) : (
            <View
              style={{
                textAlign: 'center',
                color: theme.pageTextSecondary,
                fontSize: 13,
                padding: '40px 0',
              }}
            >
              <Trans>No Tags</Trans>
            </View>
          )}
        </View>
      </View>
    </SelectedProvider>
  );
}
