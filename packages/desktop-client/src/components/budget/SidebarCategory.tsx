// @ts-strict-ignore
import React, { useRef } from 'react';
import type { CSSProperties, Ref } from 'react';
import { Button as ReactAriaButton } from 'react-aria-components';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { CategoryTile } from '@actual-app/components/category-tile';
import { SvgCheveronDown } from '@actual-app/components/icons/v1';
import { StatusPill } from '@actual-app/components/status-pill';
import { TextOneLine } from '@actual-app/components/text-one-line';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import type {
  CategoryEntity,
  CategoryGroupEntity,
} from '@actual-app/core/types/models';
import { css } from '@emotion/css';

import { InputCell } from '#components/table';
import { useContextMenu } from '#hooks/useContextMenu';

import {
  CATEGORY_DETAILS_PANEL_ID,
  useCategoryDetails,
} from './CategoryDetailsContext';
import { getCategoryAccentIndex } from './categoryPresentation';
import {
  envelopeCellBorderStyle,
  useCategoryColumnStyle,
  useIsEnvelopeTable,
} from './envelopeTable';
import { SidebarCategoryButtons } from './SidebarCategoryButtons';

type SidebarCategoryProps = {
  innerRef: Ref<HTMLDivElement>;
  category: CategoryEntity;
  categoryGroup?: CategoryGroupEntity;
  dragPreview?: boolean;
  dragging?: boolean;
  goalsShown?: boolean;
  style?: CSSProperties;
  borderColor?: string;
  isLast?: boolean;
  onEditName: (id: CategoryEntity['id']) => void;
  onSave: (category: CategoryEntity) => void;
  onHideNewCategory?: () => void;
} & (
  | {
      editing: true;
      onDelete?: never;
    }
  | {
      editing: boolean;
      onDelete: (id: CategoryEntity['id']) => void;
    }
);

export function SidebarCategory({
  innerRef,
  category,
  categoryGroup,
  dragPreview,
  dragging,
  editing,
  goalsShown = false,
  style,
  isLast,
  onEditName,
  onSave,
  onDelete,
  onHideNewCategory,
}: SidebarCategoryProps) {
  const { t } = useTranslation();
  const categoryColumnStyle = useCategoryColumnStyle();
  const isEnvelopeTable = useIsEnvelopeTable();
  const details = useCategoryDetails();

  const temporary = category.id === 'new';
  // The name opens the details panel (design-decisions §4.2, §5). Right-click
  // still reaches the category menu through the surrounding trigger.
  const opensDetails =
    isEnvelopeTable && !!details && !temporary && !category.is_income;
  const triggerRef = useRef(null);
  const { handleContextMenu } = useContextMenu({
    triggerRef,
    items: [
      {
        name: 'rename',
        text: t('Rename'),
        onClick: () => onEditName(category.id),
      },
      !categoryGroup?.hidden && {
        name: 'toggle-visibility',
        text: category.hidden ? t('Show') : t('Hide'),
        onClick: () => onSave({ ...category, hidden: !category.hidden }),
      },
      {
        name: 'delete',
        text: t('Delete'),
        onClick: () => onDelete(category.id),
      },
    ],
  });

  const isHidden = category.hidden || categoryGroup?.hidden;

  const displayed = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        opacity: isHidden ? 0.33 : undefined,
        backgroundColor: 'transparent',
        height: 20,
        ...(isEnvelopeTable && {
          // The row already dims hidden categories to 50% (design-decisions
          // §4.2); the "Hidden" tag carries the state as text.
          opacity: undefined,
          height: 28,
          gap: 10,
          fontSize: 13.5,
          fontWeight: 500,
        }),
      }}
      ref={triggerRef}
    >
      {opensDetails ? (
        <ReactAriaButton
          data-details-opener={category.id}
          aria-label={t('Show details for {{name}}', { name: category.name })}
          aria-controls={
            details.isShown ? CATEGORY_DETAILS_PANEL_ID : undefined
          }
          onPress={() => details.openCategory(category.id)}
          className={detailsOpenerClassName}
        >
          <CategoryTile
            name={category.name}
            accentIndex={getCategoryAccentIndex(category.id)}
          />
          <TextOneLine data-testid="category-name">{category.name}</TextOneLine>
        </ReactAriaButton>
      ) : (
        <>
          {isEnvelopeTable && !temporary && (
            <CategoryTile
              name={category.name}
              accentIndex={
                category.is_income
                  ? undefined
                  : getCategoryAccentIndex(category.id)
              }
            />
          )}
          <TextOneLine data-testid="category-name">{category.name}</TextOneLine>
        </>
      )}
      {isEnvelopeTable && isHidden && (
        <StatusPill tone="neutral" size="small">
          <Trans>Hidden</Trans>
        </StatusPill>
      )}
      <View style={{ flexShrink: 0, marginLeft: 5 }}>
        <Button
          variant="bare"
          className="hover-visible"
          style={{ color: 'currentColor', padding: 3 }}
          onPress={handleContextMenu}
        >
          <SvgCheveronDown
            width={14}
            height={14}
            style={{ color: 'currentColor' }}
          />
        </Button>
      </View>
      <SidebarCategoryButtons
        category={category}
        dragging={dragging}
        goalsShown={goalsShown}
      />
    </View>
  );

  return (
    <View
      innerRef={innerRef}
      style={{
        ...categoryColumnStyle,
        overflow: 'hidden',
        '& .hover-visible': {
          display: 'none',
        },
        ...(!dragging &&
          !dragPreview && {
            '&:hover .hover-visible': {
              display: 'flex',
            },
            // Row tools also appear for keyboard users (design-decisions §4.2).
            ...(isEnvelopeTable && {
              '&:focus-within .hover-visible': {
                display: 'flex',
              },
            }),
          }),
        ...(dragging && { color: theme.pageTextSubdued }), //always visible color
        // The zIndex here forces the the view on top of a row below
        // it that may be "collapsed" and show a border on top
        ...(dragPreview && {
          backgroundColor: theme.budgetCurrentMonth,
          zIndex: 10000,
          borderRadius: 6,
          overflow: 'hidden',
        }),
        ...style,
      }}
      onKeyDown={e => {
        if (e.key === 'Enter') {
          onEditName(null);
          e.stopPropagation();
        }
      }}
    >
      <InputCell
        value={category.name}
        formatter={() => displayed}
        width="flex"
        exposed={editing || temporary}
        onUpdate={value => {
          if (temporary) {
            if (value === '') {
              onHideNewCategory();
            } else if (value !== '') {
              onSave({ ...category, name: value });
            }
          } else {
            if (value !== category.name) {
              onSave({ ...category, name: value });
            }
          }
        }}
        onBlur={() => onEditName(null)}
        style={{
          paddingLeft: 13,
          ...(isEnvelopeTable && {
            paddingLeft: 16,
            ...envelopeCellBorderStyle,
          }),
          ...(isLast && { borderBottomWidth: 0 }),
        }}
        inputProps={{
          placeholder: temporary ? t('New category name') : '',
        }}
      />
    </View>
  );
}

const detailsOpenerClassName = css({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
  minWidth: 0,
  padding: 0,
  margin: 0,
  border: 'none',
  borderRadius: 6,
  background: 'none',
  color: 'inherit',
  font: 'inherit',
  textAlign: 'left',
  cursor: 'pointer',
  outline: 'none',
  // The name cell clips overflow, so the focus ring sits inside the button.
  '&[data-focus-visible]': {
    boxShadow: `0 0 0 2px ${theme.selectionBorder}`,
  },
});
