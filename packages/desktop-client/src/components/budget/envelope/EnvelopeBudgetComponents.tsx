import React, { memo, useContext, useRef, useState } from 'react';
import type { ComponentProps, CSSProperties, MouseEvent } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgCheveronDown } from '@actual-app/components/icons/v1';
import {
  SvgArrowsSynchronize,
  SvgCalendar3,
} from '@actual-app/components/icons/v2';
import { Popover } from '@actual-app/components/popover';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import { css } from '@emotion/css';

import { BalanceWithCarryover } from '#components/budget/BalanceWithCarryover';
import { envelopeCellBorderStyle } from '#components/budget/envelopeTable';
import { MonthsContext } from '#components/budget/MonthsContext';
import { makeAmountGrey } from '#components/budget/util';
import { NotesButton } from '#components/NotesButton';
import { CellValue, CellValueText } from '#components/spreadsheet/CellValue';
import { Field, Row, SheetCell } from '#components/table';
import type { SheetCellProps } from '#components/table';
import { useCategoryScheduleGoalTemplateIndicator } from '#hooks/useCategoryScheduleGoalTemplateIndicator';
import { useFormat } from '#hooks/useFormat';
import { useNavigate } from '#hooks/useNavigate';
import { useSheetName } from '#hooks/useSheetName';
import { useSheetValue } from '#hooks/useSheetValue';
import { useUndo } from '#hooks/useUndo';
import type { Binding, SheetFields } from '#spreadsheet';
import { envelopeBudget } from '#spreadsheet/bindings';
import type { CategoryGroupMonthProps, CategoryMonthProps } from '..';

import { BalanceMovementMenu } from './BalanceMovementMenu';
import { BudgetMenu } from './BudgetMenu';
import { CategoryActivityContent } from './CategoryActivityContent';
import { EnvelopeAvailableButton } from './EnvelopeAvailableButton';
import { IncomeMenu } from './IncomeMenu';

export function useEnvelopeSheetName<
  FieldName extends SheetFields<'envelope-budget'>,
>(binding: Binding<'envelope-budget', FieldName>) {
  return useSheetName(binding);
}

export function useEnvelopeSheetValue<
  FieldName extends SheetFields<'envelope-budget'>,
>(binding: Binding<'envelope-budget', FieldName>) {
  return useSheetValue(binding);
}

export const EnvelopeCellValue = <
  FieldName extends SheetFields<'envelope-budget'>,
>(
  props: ComponentProps<typeof CellValue<'envelope-budget', FieldName>>,
) => {
  return <CellValue {...props} />;
};

const EnvelopeSheetCell = <FieldName extends SheetFields<'envelope-budget'>>(
  props: SheetCellProps<'envelope-budget', FieldName>,
) => {
  return <SheetCell {...props} />;
};

// Column header (design-decisions §4.1): small uppercase labels over the
// existing month totals. Paddings line up with the cells below.
const headerLabelStyle: CSSProperties = {
  flex: 1,
  padding: '0 8px',
  textAlign: 'right',
};

const headerTextStyle: CSSProperties = {
  color: theme.pageTextFaint,
  fontSize: 11,
  fontWeight: 650,
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
};

const cellStyle: CSSProperties = {
  color: theme.pageTextSecondary,
  fontWeight: 600,
};

// Group and income totals share the cell paddings of the category rows.
const groupValueStyle: CSSProperties = { padding: '0 8px' };
const groupBalanceValueStyle: CSSProperties = { padding: '0 15px 0 8px' };

export const BudgetTotalsMonth = memo(function BudgetTotalsMonth() {
  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        marginRight: styles.monthRightPadding,
        paddingTop: 8,
        paddingBottom: 8,
        gap: 2,
      }}
    >
      <View style={headerLabelStyle}>
        <Text style={headerTextStyle}>
          <Trans>Assigned</Trans>
        </Text>
        <EnvelopeCellValue
          binding={envelopeBudget.totalBudgeted}
          type="financial"
        >
          {props => (
            <CellValueText {...props} value={-props.value} style={cellStyle} />
          )}
        </EnvelopeCellValue>
      </View>
      <View style={headerLabelStyle}>
        <Text style={headerTextStyle}>
          <Trans>Activity</Trans>
        </Text>
        <EnvelopeCellValue binding={envelopeBudget.totalSpent} type="financial">
          {props => <CellValueText {...props} style={cellStyle} />}
        </EnvelopeCellValue>
      </View>
      <View style={{ ...headerLabelStyle, paddingRight: 15 }}>
        <Text style={headerTextStyle}>
          <Trans>Available</Trans>
        </Text>
        <EnvelopeCellValue
          binding={envelopeBudget.totalBalance}
          type="financial"
        >
          {props => <CellValueText {...props} style={cellStyle} />}
        </EnvelopeCellValue>
      </View>
    </View>
  );
});

export function IncomeHeaderMonth() {
  return (
    <Row
      style={{
        alignItems: 'center',
        paddingRight: 20,
        backgroundColor: 'transparent',
      }}
    >
      <View style={{ flex: 1, textAlign: 'right', ...headerTextStyle }}>
        <Trans>Received</Trans>
      </View>
    </Row>
  );
}

export const ExpenseGroupMonth = memo(function ExpenseGroupMonth({
  group,
}: CategoryGroupMonthProps) {
  const { id } = group;

  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        // The group row paints its tint (design-decisions §4.1).
        backgroundColor: 'transparent',
      }}
    >
      <EnvelopeSheetCell
        name="budgeted"
        width="flex"
        textAlign="right"
        style={{ fontWeight: 600, ...styles.tnum, ...envelopeCellBorderStyle }}
        valueStyle={groupValueStyle}
        valueProps={{
          binding: envelopeBudget.groupBudgeted(id),
          type: 'financial',
        }}
      />
      <EnvelopeSheetCell
        name="spent"
        width="flex"
        textAlign="right"
        style={{ fontWeight: 600, ...styles.tnum, ...envelopeCellBorderStyle }}
        valueStyle={groupValueStyle}
        valueProps={{
          binding: envelopeBudget.groupSumAmount(id),
          type: 'financial',
        }}
      />
      <EnvelopeSheetCell
        name="balance"
        width="flex"
        textAlign="right"
        valueStyle={groupBalanceValueStyle}
        style={{
          fontWeight: 600,
          paddingRight: styles.monthRightPadding,
          ...styles.tnum,
          ...envelopeCellBorderStyle,
        }}
        valueProps={{
          binding: envelopeBudget.groupBalance(id),
          type: 'financial',
        }}
      />
    </View>
  );
});

export const ExpenseCategoryMonth = memo(function ExpenseCategoryMonth({
  month,
  category,
  editing,
  onEdit,
  onBudgetAction,
  onShowActivity,
}: CategoryMonthProps) {
  const { t } = useTranslation();
  const format = useFormat();

  const budgetMenuTriggerRef = useRef(null);
  const balanceMenuTriggerRef = useRef(null);
  const [budgetMenuOpen, setBudgetMenuOpen] = useState(false);
  const [budgetPosition, setBudgetPosition] = useState({
    crossOffset: 0,
    offset: 0,
  });
  const resetBudgetPosition = (crossOffset = 0, offset = 0) =>
    setBudgetPosition({ crossOffset, offset });

  const handleBudgetContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setBudgetPosition({
      crossOffset: e.clientX - rect.left,
      offset: e.clientY - rect.bottom,
    });
    setBudgetMenuOpen(true);
  };

  const [balanceMenuOpen, setBalanceMenuOpen] = useState(false);
  const [balancePosition, setBalancePosition] = useState({
    crossOffset: 0,
    offset: 0,
  });
  const resetBalancePosition = (crossOffset = 0, offset = 0) =>
    setBalancePosition({ crossOffset, offset });

  const handleBalanceContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setBalancePosition({
      crossOffset: e.clientX - rect.left,
      offset: e.clientY - rect.bottom,
    });
    setBalanceMenuOpen(true);
  };

  const onMenuAction = (...args: Parameters<typeof onBudgetAction>) => {
    onBudgetAction(...args);
    setBudgetMenuOpen(false);
  };

  const { showUndoNotification } = useUndo();

  const navigate = useNavigate();

  const { schedule, scheduleStatus, isScheduleRecurring, description } =
    useCategoryScheduleGoalTemplateIndicator({
      category,
      month,
    });

  const showScheduleIndicator = schedule && scheduleStatus;
  // The Activity percentage is hidden when several month columns share the
  // width (design-decisions §4.1).
  const { months } = useContext(MonthsContext);

  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        // The row paints the card, hover and editing backgrounds.
        backgroundColor: 'transparent',
        '& .hover-visible': {
          opacity: 0,
          transition: 'opacity .25s',
        },
        '&:hover .hover-visible, &:focus-within .hover-visible, & .force-visible .hover-visible':
          {
            opacity: 1,
          },
        '& .hover-expand': {
          maxWidth: 0,
          overflow: 'hidden',
          transition: 'max-width 0s .25s',
        },
        '&:hover .hover-expand, &:focus-within .hover-expand, & .hover-expand.force-visible':
          {
            maxWidth: '300px',
            overflow: 'visible',
            transition: 'max-width 0s linear 0s',
          },
        '@media (prefers-reduced-motion: reduce)': {
          '& .hover-visible': { transition: 'none' },
        },
      }}
    >
      <View
        ref={budgetMenuTriggerRef}
        style={{
          flex: 1,
          flexDirection: 'row',
        }}
        onContextMenu={e => {
          if (editing) return;
          handleBudgetContextMenu(e);
        }}
      >
        {!editing && (
          <>
            <View
              style={{
                paddingLeft: 3,
                alignItems: 'center',
                justifyContent: 'center',
                borderTopWidth: 1,
                borderBottomWidth: 1,
                ...envelopeCellBorderStyle,
              }}
            >
              <NotesButton
                id={`${category.id}-${month}`}
                defaultColor={theme.pageTextLight}
              />
            </View>
            <View
              className={`hover-expand ${budgetMenuOpen ? 'force-visible' : ''}`}
              style={{
                flexDirection: 'row',
                flexShrink: 1,
                paddingLeft: 3,
                alignItems: 'center',
                justifyContent: 'center',
                borderTopWidth: 1,
                borderBottomWidth: 1,
                ...envelopeCellBorderStyle,
              }}
            >
              <Button
                variant="bare"
                onPress={() => {
                  resetBudgetPosition(2, -4);
                  setBudgetMenuOpen(true);
                }}
                style={{
                  padding: 3,
                }}
              >
                <SvgCheveronDown
                  width={14}
                  height={14}
                  className="hover-visible"
                />
              </Button>
              <Popover
                triggerRef={budgetMenuTriggerRef}
                placement="bottom left"
                isOpen={budgetMenuOpen}
                onOpenChange={() => setBudgetMenuOpen(false)}
                style={{ width: 200 }}
                isNonModal
                {...budgetPosition}
              >
                <BudgetMenu
                  onCopyLastMonthAverage={() => {
                    onMenuAction(month, 'copy-single-last', {
                      category: category.id,
                    });
                    showUndoNotification({
                      message: t(`Budget set to last month's budget.`),
                    });
                  }}
                  onSetMonthsAverage={numberOfMonths => {
                    if (
                      numberOfMonths !== 3 &&
                      numberOfMonths !== 6 &&
                      numberOfMonths !== 12
                    ) {
                      return;
                    }

                    onMenuAction(month, `set-single-${numberOfMonths}-avg`, {
                      category: category.id,
                    });
                    showUndoNotification({
                      message: t(
                        'Budget set to {{numberOfMonths}}-month average.',
                        { numberOfMonths },
                      ),
                    });
                  }}
                  onApplyBudgetTemplate={() => {
                    onMenuAction(month, 'apply-single-category-template', {
                      category: category.id,
                    });
                    showUndoNotification({
                      message: t(`Budget template applied.`),
                    });
                  }}
                />
              </Popover>
            </View>
          </>
        )}
        <EnvelopeSheetCell
          name="budget"
          exposed={editing}
          focused={editing}
          width="flex"
          onExpose={() => onEdit(category.id, month)}
          style={{
            ...(editing && { zIndex: 100 }),
            ...styles.tnum,
            ...envelopeCellBorderStyle,
          }}
          textAlign="right"
          valueStyle={{
            cursor: 'default',
            // The whole cell stays the click-to-edit target.
            margin: '7px 0',
            padding: '0 8px',
            borderRadius: 8,
            fontWeight: 500,
            ':hover': {
              boxShadow: 'inset 0 0 0 1px ' + theme.cardHairline,
              backgroundColor: theme.controlBackground,
            },
          }}
          valueProps={{
            binding: envelopeBudget.catBudgeted(category.id),
            type: 'financial',
            getValueStyle: makeAmountGrey,
            formatExpr: format.forEdit,
            unformatExpr: format.fromEdit,
          }}
          inputProps={{
            onBlur: () => {
              onEdit(null);
            },
            style: {
              backgroundColor: theme.controlBackground,
              // design-decisions §4.2: 1.5px selection border while editing.
              border: '1.5px solid ' + theme.selectionBorder,
              borderRadius: 8,
              height: 30,
              alignSelf: 'center',
            },
          }}
          onSave={(parsedIntegerAmount: number | null) => {
            onBudgetAction(month, 'budget-amount', {
              category: category.id,
              amount: parsedIntegerAmount ?? 0,
            });
          }}
        />
      </View>
      <Field
        name="spent"
        width="flex"
        truncate={false}
        style={{ textAlign: 'right', ...envelopeCellBorderStyle }}
        contentStyle={{ padding: '0 8px' }}
      >
        <CategoryActivityContent
          categoryId={category.id}
          showPercent={months.length === 1}
        >
          <View
            data-testid="category-month-spent"
            onClick={() => onShowActivity(category.id, month)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: showScheduleIndicator
                ? 'space-between'
                : 'flex-end',
              gap: 2,
              whiteSpace: 'nowrap',
            }}
          >
            {showScheduleIndicator && (
              <View title={description}>
                <Button
                  variant="bare"
                  style={{
                    color:
                      scheduleStatus === 'missed'
                        ? theme.budgetNumberNegative
                        : scheduleStatus === 'due'
                          ? theme.templateNumberUnderFunded
                          : theme.upcomingText,
                  }}
                  onPress={() =>
                    schedule._account
                      ? navigate(`/accounts/${schedule._account}`)
                      : navigate('/accounts')
                  }
                >
                  {isScheduleRecurring ? (
                    <SvgArrowsSynchronize style={{ width: 12, height: 12 }} />
                  ) : (
                    <SvgCalendar3 style={{ width: 12, height: 12 }} />
                  )}
                </Button>
              </View>
            )}
            <EnvelopeCellValue
              binding={envelopeBudget.catSumAmount(category.id)}
              type="financial"
            >
              {props => (
                <CellValueText
                  {...props}
                  className={css({
                    cursor: 'pointer',
                    ':hover': { textDecoration: 'underline' },
                    ...makeAmountGrey(props.value),
                  })}
                />
              )}
            </EnvelopeCellValue>
          </View>
        </CategoryActivityContent>
      </Field>
      <Field
        ref={balanceMenuTriggerRef}
        name="balance"
        width="flex"
        truncate={false}
        style={{
          paddingRight: styles.monthRightPadding,
          textAlign: 'right',
          ...envelopeCellBorderStyle,
        }}
        contentStyle={{ alignItems: 'flex-end' }}
      >
        <EnvelopeAvailableButton
          category={category}
          month={month}
          tooltipDisabled={balanceMenuOpen}
          onPress={() => {
            resetBalancePosition(-6, -4);
            setBalanceMenuOpen(true);
          }}
          onContextMenu={e => {
            handleBalanceContextMenu(e);
            // We need to calculate differently from the hook due to being aligned to the right
            const rect = e.currentTarget.getBoundingClientRect();
            resetBalancePosition(
              e.clientX - rect.right + 200 - 8,
              e.clientY - rect.bottom - 8,
            );
          }}
        />

        <Popover
          triggerRef={balanceMenuTriggerRef}
          placement="bottom end"
          isOpen={balanceMenuOpen}
          onOpenChange={() => setBalanceMenuOpen(false)}
          style={{
            margin: 1,
            minWidth: 190,
          }}
          isNonModal
          {...balancePosition}
        >
          <BalanceMovementMenu
            categoryId={category.id}
            month={month}
            onBudgetAction={onBudgetAction}
            onClose={() => setBalanceMenuOpen(false)}
          />
        </Popover>
      </Field>
    </View>
  );
});

type IncomeGroupMonthProps = {
  month: string;
};
export function IncomeGroupMonth(_props: IncomeGroupMonthProps) {
  return (
    <View style={{ flex: 1 }}>
      <EnvelopeSheetCell
        name="received"
        width="flex"
        textAlign="right"
        style={{
          fontWeight: 600,
          paddingRight: styles.monthRightPadding,
          ...styles.tnum,
          // The group row paints its tint.
          backgroundColor: 'transparent',
          ...envelopeCellBorderStyle,
        }}
        valueStyle={groupBalanceValueStyle}
        valueProps={{
          binding: envelopeBudget.groupIncomeReceived,
          type: 'financial',
        }}
      />
    </View>
  );
}

export function IncomeCategoryMonth({
  category,
  isLast,
  month,
  onShowActivity,
  onBudgetAction,
}: CategoryMonthProps) {
  const incomeMenuTriggerRef = useRef(null);
  const [incomeMenuOpen, setIncomeMenuOpen] = useState(false);
  const [incomePosition, setIncomePosition] = useState({
    crossOffset: 0,
    offset: 0,
  });
  const resetIncomePosition = (crossOffset = 0, offset = 0) =>
    setIncomePosition({ crossOffset, offset });

  const handleIncomeContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setIncomePosition({
      crossOffset: e.clientX - rect.left,
      offset: e.clientY - rect.bottom,
    });
    setIncomeMenuOpen(true);
  };

  return (
    <View style={{ flex: 1 }}>
      <Field
        name="received"
        width="flex"
        truncate={false}
        ref={incomeMenuTriggerRef}
        style={{
          textAlign: 'right',
          ...(isLast && { borderBottomWidth: 0 }),
          // The row paints the card and hover backgrounds.
          backgroundColor: 'transparent',
          ...envelopeCellBorderStyle,
        }}
        contentStyle={{ paddingRight: 15 }}
      >
        <View
          name="received"
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-end',
            position: 'relative',
          }}
        >
          <Button
            variant="bare"
            onPress={() => {
              resetIncomePosition(-6, -4);
              setIncomeMenuOpen(true);
            }}
            onContextMenu={e => {
              handleIncomeContextMenu(e);
              // We need to calculate differently from the hook due to being aligned to the right
              const rect = e.currentTarget.getBoundingClientRect();
              resetIncomePosition(
                e.clientX - rect.right + 200 - 8,
                e.clientY - rect.bottom - 8,
              );
            }}
            style={{
              background: 'transparent',
              padding: 0,
              paddingRight: styles.monthRightPadding,
            }}
          >
            <BalanceWithCarryover
              carryover={envelopeBudget.catCarryover(category.id)}
              balance={envelopeBudget.catSumAmount(category.id)}
              goal={envelopeBudget.catGoal(category.id)}
              budgeted={envelopeBudget.catBudgeted(category.id)}
              longGoal={envelopeBudget.catLongGoal(category.id)}
            />
          </Button>
          <Popover
            triggerRef={incomeMenuTriggerRef}
            placement="bottom end"
            isOpen={incomeMenuOpen}
            onOpenChange={() => setIncomeMenuOpen(false)}
            style={{ margin: 1 }}
            isNonModal
            {...incomePosition}
          >
            <IncomeMenu
              categoryId={category.id}
              month={month}
              onBudgetAction={onBudgetAction}
              onShowActivity={onShowActivity}
              onClose={() => setIncomeMenuOpen(false)}
            />
          </Popover>
        </View>
      </Field>
    </View>
  );
}

export { BudgetSummary } from './budgetsummary/BudgetSummary';
