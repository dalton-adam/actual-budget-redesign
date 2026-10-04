// @ts-strict-ignore
import React from 'react';
import type { ComponentProps, MouseEvent } from 'react';

import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import type {
  CategoryEntity,
  CategoryGroupEntity,
} from '@actual-app/core/types/models';

import { DropHighlight, useDraggable, useDroppable } from '#components/sort';
import type {
  DragState,
  OnDragChangeCallback,
  OnDropCallback,
} from '#components/sort';
import { Row } from '#components/table';
import { useDragRef } from '#hooks/useDragRef';

import { useCategoryDetails } from './CategoryDetailsContext';
import {
  ENVELOPE_CATEGORY_ROW_HEIGHT,
  useIsEnvelopeTable,
} from './envelopeTable';
import { RenderMonths } from './RenderMonths';
import { SidebarCategory } from './SidebarCategory';

import { useBudgetComponents } from '.';

const ROW_CONTROL_SELECTOR =
  'button, a, input, textarea, select, [role="button"], [role="menuitem"]';

type ExpenseCategoryProps = {
  cat: CategoryEntity;
  categoryGroup?: CategoryGroupEntity;
  editingCell: { id: string; cell: string } | null;
  dragState: DragState<CategoryEntity> | DragState<CategoryGroupEntity> | null;
  onEditName?: ComponentProps<typeof SidebarCategory>['onEditName'];
  onEditMonth?: (id: CategoryEntity['id'], month: string) => void;
  onSave?: ComponentProps<typeof SidebarCategory>['onSave'];
  onDelete?: ComponentProps<typeof SidebarCategory>['onDelete'];
  onDragChange: OnDragChangeCallback<CategoryEntity>;
  onBudgetAction: (month: string, action: string, arg: unknown) => void;
  onShowActivity: (id: CategoryEntity['id'], month: string) => void;
  onReorder: OnDropCallback;
};

export function ExpenseCategory({
  cat,
  categoryGroup,
  editingCell,
  dragState,
  onEditName,
  onEditMonth,
  onSave,
  onDelete,
  onBudgetAction,
  onShowActivity,
  onDragChange,
  onReorder,
}: ExpenseCategoryProps) {
  let dragging = dragState && dragState.item === cat;

  if (dragState && dragState.item.id === cat.group) {
    dragging = true;
  }

  const { dragRef } = useDraggable({
    type: 'category',
    onDragChange,
    item: cat,
    canDrag: editingCell === null,
  });
  const handleDragRef = useDragRef(dragRef);

  const { dropRef, dropPos } = useDroppable({
    types: 'category',
    id: cat.id,
    onDrop: onReorder,
  });

  const { ExpenseCategoryComponent: MonthComponent } = useBudgetComponents();
  const isEnvelopeTable = useIsEnvelopeTable();
  const isEditingAmount =
    editingCell && editingCell.id === cat.id && editingCell.cell !== 'name';
  const details = useCategoryDetails();
  // The details panel's subject: selection tint and a 3px bar on the left
  // edge (design-decisions §4.2).
  const isDetailsSubject =
    !!details && details.isShown && details.selectedCategoryId === cat.id;
  const opensDetails = isEnvelopeTable && !!details && cat.id !== 'new';

  // A click anywhere on the row opens its details, except on the row's own
  // controls. The name stays the keyboard opener (SidebarCategory).
  const onRowClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!opensDetails || dragState || e.defaultPrevented) {
      return;
    }
    const target = e.target as Element;
    // Popovers opened from the row are portaled out of it but still bubble
    // their React events here.
    if (
      !e.currentTarget.contains(target) ||
      target.closest(ROW_CONTROL_SELECTOR)
    ) {
      return;
    }
    details.openCategory(cat.id);
  };

  return (
    <Row
      innerRef={dropRef}
      onClick={onRowClick}
      collapsed
      height={isEnvelopeTable ? ENVELOPE_CATEGORY_ROW_HEIGHT : undefined}
      style={{
        backgroundColor: theme.budgetCurrentMonth,
        opacity: cat.hidden || categoryGroup?.hidden ? 0.5 : undefined,
        ...(isEnvelopeTable && {
          backgroundColor:
            isEditingAmount || isDetailsSubject
              ? theme.selectionBackground
              : theme.cardBackground,
          ...(isDetailsSubject && {
            boxShadow: `inset 3px 0 0 ${theme.selectionBorder}`,
          }),
          ...(!isEditingAmount &&
            !isDetailsSubject &&
            !dragState && {
              ':hover': { backgroundColor: theme.tableRowHover },
            }),
        }),
      }}
    >
      <DropHighlight pos={dropPos} offset={{ top: 1 }} />

      <View style={{ flex: 1, flexDirection: 'row' }}>
        <SidebarCategory
          innerRef={handleDragRef}
          category={cat}
          categoryGroup={categoryGroup}
          dragPreview={dragging && dragState.preview}
          dragging={dragging && !dragState.preview}
          editing={
            editingCell &&
            editingCell.cell === 'name' &&
            editingCell.id === cat.id
          }
          onEditName={onEditName}
          onSave={onSave}
          onDelete={onDelete}
        />

        <RenderMonths
          style={
            isEnvelopeTable
              ? { borderLeftColor: theme.cardHairline }
              : undefined
          }
        >
          {({ month }) => (
            <MonthComponent
              month={month}
              editing={
                editingCell &&
                editingCell.id === cat.id &&
                editingCell.cell === month
              }
              category={cat}
              onEdit={onEditMonth}
              onBudgetAction={onBudgetAction}
              onShowActivity={onShowActivity}
            />
          )}
        </RenderMonths>
      </View>
    </Row>
  );
}
