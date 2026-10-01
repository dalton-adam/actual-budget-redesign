// @ts-strict-ignore
import { memo, useMemo, useRef } from 'react';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

import {
  SvgArrowThinRight,
  SvgBookmark,
  SvgLightBulb,
} from '@actual-app/components/icons/v1';
import { theme } from '@actual-app/components/theme';
import { Tooltip } from '@actual-app/components/tooltip';
import type { PayeeEntity } from '@actual-app/core/types/models';

import {
  Cell,
  CellButton,
  CustomCell,
  InputCell,
  Row,
  SelectCell,
} from '#components/table';
import { useContextMenu } from '#hooks/useContextMenu';
import { useSelectedDispatch, useSelectedItems } from '#hooks/useSelected';
import { useSyncedPref } from '#hooks/useSyncedPref';

import { PayeeRuleCountLabel } from './PayeeRuleCountLabel';

/** Row height on the card (design-decisions §10c). */
export const PAYEE_ROW_HEIGHT = 44;

type RuleButtonProps = {
  ruleCount: number;
  focused: boolean;
  onEdit: () => void;
  onClick: () => void;
};

function RuleButton({ ruleCount, focused, onEdit, onClick }: RuleButtonProps) {
  return (
    <Cell
      name="rule-count"
      width="auto"
      focused={focused}
      style={{ padding: '0 12px 0 10px', justifyContent: 'center' }}
      plain
    >
      <CellButton
        className="payee-rule-button"
        style={{
          // An accent pill where rules exist, quiet text otherwise
          // (design-decisions §10c).
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          height: 24,
          borderRadius: 7,
          padding: '0 9px',
          fontSize: 12,
          fontWeight: 600,
          whiteSpace: 'nowrap',
          cursor: 'pointer',
          border: '1px solid transparent',
          ...(ruleCount > 0
            ? {
                backgroundColor: theme.selectionBackground,
                color: theme.buttonPrimaryBackground,
                ':hover': { borderColor: theme.selectionBorder },
              }
            : {
                color: theme.pageTextSubdued,
                ':hover': {
                  backgroundColor: theme.controlBackground,
                  borderColor: theme.cardHairline,
                  color: theme.pageText,
                },
              }),
        }}
        onEdit={onEdit}
        onSelect={onClick}
      >
        <PayeeRuleCountLabel count={ruleCount} />
        <SvgArrowThinRight style={{ width: 9, height: 9 }} />
      </CellButton>
    </Cell>
  );
}

type EditablePayeeFields = keyof Pick<
  PayeeEntity,
  'name' | 'favorite' | 'learn_categories'
>;

type PayeeTableRowProps = {
  payee: PayeeEntity;
  ruleCount: number;
  selected: boolean;
  hovered: boolean;
  editing: boolean;
  focusedField: string;
  onHover?: (id: PayeeEntity['id']) => void;
  onEdit: (id: PayeeEntity['id'], field: string) => void;
  onUpdate: <T extends EditablePayeeFields>(
    id: PayeeEntity['id'],
    field: T,
    value: PayeeEntity[T],
  ) => void;
  onDelete: (ids: PayeeEntity['id'][]) => void;
  onViewRules: (id: PayeeEntity['id']) => void;
  onCreateRule: (id: PayeeEntity['id']) => void;
  style?: CSSProperties;
};

export const PayeeTableRow = memo(
  ({
    payee,
    ruleCount,
    selected,
    hovered,
    editing,
    focusedField,
    onViewRules,
    onCreateRule,
    onHover,
    onDelete,
    onEdit,
    onUpdate,
    style,
  }: PayeeTableRowProps) => {
    const { id } = payee;
    const dispatchSelected = useSelectedDispatch();
    const selectedItems = useSelectedItems();
    const selectedIds = useMemo(() => {
      const ids =
        selectedItems && selectedItems.size > 0 ? selectedItems : [payee.id];
      return Array.from(new Set(ids));
    }, [payee, selectedItems]);

    // Hairline dividers on the card (design-decisions §10c).
    const borderColor = theme.cardHairline;
    const backgroundFocus = hovered || focusedField === 'select';
    const [learnCategories = 'true'] = useSyncedPref('learn-categories');
    const isLearnCategoriesEnabled = String(learnCategories) === 'true';

    const { t } = useTranslation();

    const triggerRef = useRef(null);
    useContextMenu({
      triggerRef,
      items: [
        {
          name: 'delete',
          text: t('Delete'),
          onClick: () => onDelete(selectedIds),
          hidden: payee.transfer_acct != null,
        },
        {
          name: 'favorite',
          text: payee.favorite ? t('Unfavorite') : t('Favorite'),
          onClick: () =>
            selectedIds.forEach(id =>
              onUpdate(id, 'favorite', !payee.favorite),
            ),
          hidden: payee.transfer_acct != null,
        },
        {
          name: 'view-rules',
          text: t('View rules'),
          onClick: () => onViewRules(id),
          hidden: !ruleCount,
        },
        {
          name: 'create-rule',
          text: t('Create rule'),
          onClick: () => onCreateRule(id),
          hidden: selectedIds.length !== 1,
        },
        {
          name: 'learn',
          text: payee.learn_categories
            ? t('Disable learning')
            : t('Enable learning'),
          onClick: () =>
            selectedIds.forEach(id =>
              onUpdate(id, 'learn_categories', !payee.learn_categories),
            ),
          hidden: !isLearnCategoriesEnabled,
        },
      ],
    });

    return (
      <Row
        ref={triggerRef}
        height={PAYEE_ROW_HEIGHT}
        style={{
          alignItems: 'stretch',
          ...style,
          borderColor,
          backgroundColor: selected
            ? theme.selectionBackground
            : hovered || backgroundFocus
              ? theme.tableRowHover
              : theme.cardBackground,
          ...(selected && { zIndex: 100 }),
          '& > div': { borderColor },
          // The quiet rule button looks like a control button on row hover.
          ...(hovered &&
            !ruleCount && {
              '& .payee-rule-button': {
                backgroundColor: theme.controlBackground,
                borderColor: theme.cardHairline,
                color: theme.pageText,
              },
            }),
        }}
        data-focus-key={payee.id}
        onMouseEnter={() => onHover && onHover(payee.id)}
      >
        <SelectCell
          exposed={
            payee.transfer_acct == null && (hovered || selected || editing)
          }
          focused={focusedField === 'select'}
          selected={selected}
          onSelect={e => {
            if (payee.transfer_acct != null) {
              return;
            }
            dispatchSelected({
              type: 'select',
              id: payee.id,
              isRangeSelect: e.shiftKey,
            });
          }}
        />
        <CustomCell
          width={20}
          exposed={!payee.transfer_acct}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
          }}
        >
          {() => {
            return (
              <>
                {payee.favorite ? (
                  <SvgBookmark
                    style={{ width: 10, color: theme.buttonPrimaryBackground }}
                  />
                ) : null}
                {isLearnCategoriesEnabled && !payee.learn_categories && (
                  <Tooltip content={t('Category learning disabled')}>
                    <SvgLightBulb
                      style={{ color: theme.pillWarningText, width: 10 }}
                    />
                  </Tooltip>
                )}
              </>
            );
          }}
        </CustomCell>
        <InputCell
          value={(payee.transfer_acct ? t('Transfer: ') : '') + payee.name}
          valueStyle={
            payee.transfer_acct
              ? { color: theme.pageTextSubdued }
              : { color: theme.pageText, fontWeight: 500 }
          }
          exposed={focusedField === 'name'}
          width="flex"
          onUpdate={value =>
            !payee.transfer_acct && onUpdate(id, 'name', value)
          }
          onExpose={() => onEdit(id, 'name')}
          inputProps={{ readOnly: !!payee.transfer_acct }}
        />
        <RuleButton
          ruleCount={ruleCount}
          focused={focusedField === 'rule-count'}
          onEdit={() => onEdit(id, 'rule-count')}
          onClick={() =>
            ruleCount > 0 ? onViewRules(payee.id) : onCreateRule(payee.id)
          }
        />
      </Row>
    );
  },
);

PayeeTableRow.displayName = 'PayeeTableRow';
