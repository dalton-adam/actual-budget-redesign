// @ts-strict-ignore
import React from 'react';

import { theme } from '@actual-app/components/theme';
import type { CategoryGroupEntity } from '@actual-app/core/types/models';

import { Row } from '#components/table';

import {
  ENVELOPE_GROUP_ROW_HEIGHT,
  envelopeGroupRowStyle,
  useIsEnvelopeTable,
} from './envelopeTable';
import { RenderMonths } from './RenderMonths';
import { SidebarGroup } from './SidebarGroup';

import { useBudgetComponents } from '.';

type IncomeGroupProps = {
  group: CategoryGroupEntity;
  editingCell: { id: CategoryGroupEntity['id']; cell: string } | null;
  collapsed: boolean;
  onEditName: (id: CategoryGroupEntity['id']) => void;
  onSave: (group: CategoryGroupEntity) => void;
  onSortCategories?: (
    groupId: CategoryGroupEntity['id'],
    direction: 'asc' | 'desc',
  ) => void;
  onToggleCollapse: (id: CategoryGroupEntity['id']) => void;
  onShowNewCategory: (groupId: CategoryGroupEntity['id']) => void;
};

export function IncomeGroup({
  group,
  editingCell,
  collapsed,
  onEditName,
  onSave,
  onSortCategories,
  onToggleCollapse,
  onShowNewCategory,
}: IncomeGroupProps) {
  const { IncomeGroupComponent: MonthComponent } = useBudgetComponents();
  const isEnvelopeTable = useIsEnvelopeTable();
  return (
    <Row
      collapsed
      height={isEnvelopeTable ? ENVELOPE_GROUP_ROW_HEIGHT : undefined}
      style={{
        fontWeight: 600,
        backgroundColor: theme.budgetHeaderCurrentMonth, //use budget color
        ...(isEnvelopeTable && envelopeGroupRowStyle),
      }}
    >
      <SidebarGroup
        group={group}
        collapsed={collapsed}
        editing={
          editingCell &&
          editingCell.cell === 'name' &&
          editingCell.id === group.id
        }
        onEdit={onEditName}
        onSave={onSave}
        onSortCategories={onSortCategories}
        onToggleCollapse={onToggleCollapse}
        onShowNewCategory={onShowNewCategory}
      />
      <RenderMonths
        style={
          isEnvelopeTable ? { borderLeftColor: theme.cardHairline } : undefined
        }
      >
        {({ month }) => <MonthComponent month={month} group={group} />}
      </RenderMonths>
    </Row>
  );
}
