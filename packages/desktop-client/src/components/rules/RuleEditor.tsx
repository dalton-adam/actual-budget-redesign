// @ts-strict-ignore
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import {
  SvgAdd,
  SvgDelete,
  SvgSubtract,
} from '@actual-app/components/icons/v0';
import {
  SvgCode,
  SvgInformationOutline,
} from '@actual-app/components/icons/v1';
import { Menu } from '@actual-app/components/menu';
import { Select } from '@actual-app/components/select';
import { SpaceBetween } from '@actual-app/components/space-between';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { Tooltip } from '@actual-app/components/tooltip';
import { View } from '@actual-app/components/view';
import { send } from '@actual-app/core/platform/client/connection';
import * as monthUtils from '@actual-app/core/shared/months';
import { q } from '@actual-app/core/shared/query';
import {
  FIELD_TYPES,
  getFieldError,
  getValidOps,
  isValidOp,
  makeValue,
  parse,
  unparse,
} from '@actual-app/core/shared/rules';
import type { ScheduleStatusType } from '@actual-app/core/shared/schedules';
import type {
  NewRuleEntity,
  RuleActionEntity,
  RuleEntity,
} from '@actual-app/core/types/models';
import { css } from '@emotion/css';
import { v4 as uuidv4 } from 'uuid';

import { TagMultiAutocomplete } from '#components/autocomplete/TagMultiAutocomplete';
import {
  dialogButtonStyle,
  dialogEyebrowStyle,
  dialogIconButtonStyle,
  dialogPrimaryButtonStyle,
  dialogTableCardStyle,
} from '#components/common/dialogStyles';
import { FinancialText } from '#components/FinancialText';
import { StatusBadge } from '#components/schedules/StatusBadge';
import { SimpleTransactionsTable } from '#components/transactions/SimpleTransactionsTable';
import { BetweenAmountInput } from '#components/util/AmountInput';
import { DisplayId } from '#components/util/DisplayId';
import { GenericInput } from '#components/util/GenericInput';
import { useDateFormat } from '#hooks/useDateFormat';
import { useFeatureFlag } from '#hooks/useFeatureFlag';
import { useFormat } from '#hooks/useFormat';
import { useSchedules } from '#hooks/useSchedules';
import { SelectedProvider, useSelected } from '#hooks/useSelected';
import { addNotification } from '#notifications/notificationsSlice';
import { aqlQuery } from '#queries/aqlQuery';
import { useDispatch } from '#redux';
import { disableUndo, enableUndo } from '#undo';
import { friendlyOp, getAllocationMethods, mapField } from '#util/rule';

import { FormulaActionEditor } from './FormulaActionEditor';

/**
 * The desktop rule dialog's look (design-decisions §10k, APP-06e). The mobile
 * rule page, and the filter menu, Summary report and schedule form that
 * import `FieldSelect` and `OpSelect`, keep upstream's.
 */
const RuleDialogContext = createContext(false);

/** A condition or action row in the dialog: Card Inset with a hairline. */
const dialogEditorStyle = {
  backgroundColor: theme.cardInset,
  border: `1px solid ${theme.cardHairline}`,
  borderRadius: 10,
  minHeight: 44,
  padding: '6px 6px 6px 12px',
  justifyContent: 'center',
  fontSize: 13,
} as const;

function updateValue(array, value, update) {
  return array.map(v => (v === value ? update() : v));
}

function applyErrors(array, errorsArray) {
  return array.map((item, i) => {
    return { ...item, error: errorsArray[i] };
  });
}

function getTransactionFields(conditions, actions) {
  const fields = ['date'];

  if (conditions.find(c => c.field === 'imported_payee')) {
    fields.push('imported_payee');
  }

  fields.push('payee');

  if (actions.find(a => a.field === 'category')) {
    fields.push('category');
  } else if (
    actions.length > 0 &&
    !['payee', 'date', 'amount'].includes(actions[0].field)
  ) {
    fields.push(actions[0].field);
  }

  fields.push('amount');

  return fields;
}

type FieldSelectProps<T extends string> = {
  fields: [T, string][];
  style?: CSSProperties;
  value: T;
  onChange: (value: T) => void;
};

export function FieldSelect<T extends string>({
  fields,
  style,
  value,
  onChange,
}: FieldSelectProps<T>) {
  const isDialog = useContext(RuleDialogContext);
  // Page Text 600 in the dialog, as the rule chips (design-decisions §10k).
  const color = isDialog ? theme.pageText : theme.pageTextPositive;
  return (
    <View style={style} data-testid="field-select">
      <Select
        bare
        options={fields}
        value={value}
        onChange={onChange}
        className={css({
          color,
          '&[data-hovered]': { color },
          ...(isDialog && { fontWeight: 600 }),
        })}
      />
    </View>
  );
}

type OpSelectProps<T extends string> = {
  ops: T[];
  type?: string;
  style?: CSSProperties;
  value: T;
  formatOp?: (op: string, type: string) => string;
  onChange: (name: string, value: T) => void;
};

export function OpSelect<T extends string>({
  ops,
  type,
  style,
  value,
  formatOp = friendlyOp,
  onChange,
}: OpSelectProps<T>) {
  const isDialog = useContext(RuleDialogContext);
  const opOptions = useMemo(() => {
    const options = ops
      // We don't support the `contains`, `doesNotContain`, `matches` operators
      // for the id type rules yet
      // TODO: Add matches op support for payees, accounts, categories.
      .filter(op =>
        type === 'id'
          ? ![
              'contains',
              'matches',
              'doesNotContain',
              'hasTags',
              'hasAnyTag',
            ].includes(op)
          : true,
      )
      .map(op => [op, formatOp(op, type)]);

    if (type === 'string' || type === 'id') {
      // @ts-expect-error fix this
      options.splice(Math.ceil(options.length / 2), 0, Menu.line);
    }

    return options;
  }, [formatOp, ops, type]);

  return (
    <View data-testid="op-select">
      <Select
        bare
        // @ts-expect-error fix this
        options={opOptions}
        value={value}
        onChange={value => onChange('op', value)}
        style={isDialog ? { color: theme.pageTextSecondary, ...style } : style}
      />
    </View>
  );
}

type SplitAmountMethodSelectProps = {
  options: [string, string][];
  style?: CSSProperties;
  value: string;
  onChange: (name: string, value: string) => void;
};
function SplitAmountMethodSelect({
  options,
  style,
  value,
  onChange,
}: SplitAmountMethodSelectProps) {
  const isDialog = useContext(RuleDialogContext);
  return (
    <View
      style={{
        color: theme.pageTextPositive,
        ...(isDialog && { color: theme.pageText, fontWeight: 600 }),
        ...style,
      }}
      data-testid="field-select"
    >
      <Select
        bare
        options={options}
        value={value}
        onChange={value => onChange('method', value)}
      />
    </View>
  );
}

function EditorButtons({ onAdd, onDelete }) {
  const { t } = useTranslation();
  const isDialog = useContext(RuleDialogContext);
  return (
    <>
      {onDelete && (
        <Button
          variant={isDialog ? 'control' : 'bare'}
          onPress={onDelete}
          style={isDialog ? undefined : { padding: 7 }}
          className={isDialog ? css(dialogIconButtonStyle) : undefined}
          aria-label={t('Delete entry')}
        >
          <SvgSubtract style={{ width: 8, height: 8, color: 'inherit' }} />
        </Button>
      )}
      {onAdd && (
        <Button
          variant={isDialog ? 'control' : 'bare'}
          onPress={onAdd}
          style={isDialog ? undefined : { padding: 7 }}
          className={isDialog ? css(dialogIconButtonStyle) : undefined}
          aria-label={t('Add entry')}
        >
          <SvgAdd style={{ width: 10, height: 10, color: 'inherit' }} />
        </Button>
      )}
    </>
  );
}

function FieldError({ type }) {
  return (
    <Text
      style={{
        fontSize: 12,
        textAlign: 'center',
        color: theme.errorText,
        marginBottom: 5,
      }}
    >
      {getFieldError(type)}
    </Text>
  );
}

function Editor({ error, style, children }) {
  const isDialog = useContext(RuleDialogContext);
  return (
    <View style={style} data-testid="editor-row">
      <SpaceBetween gap={isDialog ? 8 : 5} style={{ alignItems: 'center' }}>
        {children}
      </SpaceBetween>
      {error && <FieldError type={error} />}
    </View>
  );
}

function ConditionEditor({
  ops,
  condition,
  editorStyle,
  isSchedule,
  onChange,
  onDelete,
  onAdd,
}) {
  const {
    field: originalField,
    op,
    value,
    type,
    options,
    error,
    inputKey,
  } = condition;

  const translatedConditions = useMemo(() => {
    const retValue = [...conditionFields];

    if (retValue && retValue.length > 0) {
      retValue.forEach(field => {
        field[1] = mapField(field[0]);
      });
    }

    return retValue;
  }, []);

  let field = originalField;
  if (field === 'amount' && options) {
    if (options.inflow) {
      field = 'amount-inflow';
    } else if (options.outflow) {
      field = 'amount-outflow';
    }
  }

  let valueEditor;
  if (type === 'number' && op === 'isbetween') {
    valueEditor = (
      <BetweenAmountInput
        key={inputKey}
        defaultValue={value}
        onChange={v => onChange('value', v)}
      />
    );
  } else if (type === 'string' && (op === 'hasTags' || op === 'hasAnyTag')) {
    valueEditor = (
      <TagMultiAutocomplete
        key={inputKey}
        value={value ?? ''}
        setValue={(value: string) => onChange('value', value)}
      />
    );
  } else {
    valueEditor = (
      <GenericInput
        key={inputKey}
        field={field}
        type={type}
        value={value ?? ''}
        op={op}
        multi={op === 'oneOf' || op === 'notOneOf'}
        onChange={v => onChange('value', v)}
        numberFormatType="currency"
      />
    );
  }

  return (
    <Editor style={editorStyle} error={error}>
      <FieldSelect
        // @ts-expect-error fix this
        fields={translatedConditions}
        value={field}
        onChange={value => onChange('field', value)}
      />
      <OpSelect ops={ops} value={op} type={type} onChange={onChange} />

      <View style={{ flex: 1, minWidth: 80 }}>{valueEditor}</View>

      <SpaceBetween direction="horizontal" gap={0}>
        <EditorButtons
          onAdd={onAdd}
          onDelete={isSchedule && field === 'date' ? null : onDelete}
        />
      </SpaceBetween>
    </Editor>
  );
}

function formatAmount(amount, format) {
  if (!amount) {
    return format(0, 'financial');
  } else if (typeof amount === 'number') {
    return format(amount, 'financial');
  } else {
    return `${format(amount.num1, 'financial')} to ${format(
      amount.num2,
      'financial',
    )}`;
  }
}

function ScheduleDescription({ id }) {
  const { isNarrowWidth } = useResponsive();
  const dateFormat = useDateFormat() || 'MM/dd/yyyy';
  const format = useFormat();
  const scheduleQuery = useMemo(
    () => q('schedules').filter({ id }).select('*'),
    [id],
  );
  const {
    schedules,
    statusLabels,
    isLoading: isSchedulesLoading,
  } = useSchedules({ query: scheduleQuery });

  if (isSchedulesLoading) {
    return null;
  }

  const [schedule] = schedules;

  if (schedule && schedules.length === 0) {
    return <View style={{ flex: 1 }}>{id}</View>;
  }

  const status = statusLabels.get(schedule.id) as ScheduleStatusType;

  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <SpaceBetween
        gap={5}
        style={{
          marginRight: 15,
        }}
      >
        <SpaceBetween gap={5} style={{ flexWrap: 'nowrap' }}>
          <Trans>Payee:</Trans>
          <DisplayId
            type="payees"
            id={schedule._payee}
            noneColor={theme.pageTextLight}
          />
        </SpaceBetween>

        <Text style={{ flexShrink: 0 }}>
          <Text> — </Text>
          <Trans>Amount:</Trans>{' '}
          <FinancialText>
            {formatAmount(schedule._amount, format)}
          </FinancialText>
        </Text>

        <Text style={{ flexShrink: 0 }}>
          <Text> — </Text>
          <Trans>
            Next: {{ month: monthUtils.format(schedule.next_date, dateFormat) }}
          </Trans>
        </Text>
      </SpaceBetween>
      {!isNarrowWidth && <StatusBadge status={status} />}
    </View>
  );
}

function getActionFields() {
  return [
    'category',
    'payee',
    'payee_name',
    'notes',
    'cleared',
    'account',
    'date',
    'amount',
  ].map(field => [field, mapField(field)]);
}
const parentOnlyFields = ['amount', 'cleared', 'account', 'date'];
function getSplitActionFields() {
  return getActionFields().filter(
    ([field]) => !parentOnlyFields.includes(field),
  );
}
function getAllocationMethodOptions(isFormulaEnabled = false) {
  return Object.entries(getAllocationMethods(isFormulaEnabled));
}

type ActionEditorProps = {
  action: RuleActionEntity & {
    field: string;
    type: string;
    error: unknown;
    inputKey?: string;
  };
  editorStyle: CSSProperties;
  onChange: (
    name: string,
    value: unknown,
    extraOptions?: Record<string, unknown>,
  ) => void;
  onDelete: () => void;
  onAdd: () => void;
};
function ActionEditor({
  action,
  editorStyle,
  onChange,
  onDelete,
  onAdd,
}: ActionEditorProps) {
  const { t } = useTranslation();
  const {
    field,
    op,
    value,
    type,
    error,
    inputKey = 'initial',
    // @ts-expect-error fix this
    options,
  } = action;

  const isDialog = useContext(RuleDialogContext);
  const templated = options?.template !== undefined;
  const hasFormula = options?.formula !== undefined;

  // Even if the feature flag is disabled, we still want to be able to turn off templating
  const actionTemplating = useFeatureFlag('actionTemplating');
  const formulaMode = useFeatureFlag('formulaMode');
  const isTemplatingEnabled = actionTemplating || templated;
  const isFormulaEnabled = formulaMode || hasFormula;

  const fields = (
    options?.splitIndex ? getSplitActionFields() : getActionFields()
  ).filter(
    ([s]) =>
      actionTemplating || formulaMode || !s.includes('_name') || field === s,
  );

  return (
    <Editor style={editorStyle} error={error}>
      {op === 'set' ? (
        <>
          <OpSelect
            ops={['set', 'prepend-notes', 'append-notes', 'delete-transaction']}
            value={op}
            onChange={onChange}
          />

          <FieldSelect
            // @ts-expect-error fix this
            fields={fields}
            value={field}
            onChange={value => onChange('field', value)}
          />

          <View style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
              {hasFormula ? (
                <FormulaActionEditor
                  value={options?.formula || ''}
                  onChange={v => onChange('formula', v, { formula: true })}
                />
              ) : (
                <GenericInput
                  key={inputKey}
                  // @ts-expect-error fix this
                  field={field}
                  // @ts-expect-error fix this
                  type={templated ? 'string' : type}
                  // @ts-expect-error fix this
                  op={op}
                  // @ts-expect-error fix this
                  value={options?.template ?? value}
                  onChange={v => onChange('value', v)}
                  numberFormatType="currency"
                  inputStyle={{ height: 30 }}
                />
              )}
            </View>
            {templated && (
              <Text
                style={{
                  ...styles.smallText,
                  color: theme.warningText,
                  marginTop: 3,
                }}
              >
                <Trans>
                  Templating is deprecated and will be removed in a future
                  release. Switch this action to a formula instead.
                </Trans>
              </Text>
            )}
          </View>
          {/*Due to that these fields have id's as value it is not helpful to have templating here*/}
          {isFormulaEnabled &&
            ['payee', 'category', 'account'].indexOf(field) === -1 && (
              <Button
                variant="bare"
                isDisabled={templated}
                style={{
                  padding: 5,
                  backgroundColor: hasFormula
                    ? theme.buttonPrimaryBackground
                    : undefined,
                  height: 24,
                  width: 24,
                }}
                aria-label={
                  hasFormula ? t('Disable formula') : t('Enable formula')
                }
                onPress={() =>
                  hasFormula
                    ? onChange('formula', undefined)
                    : onChange('formula', options.formula || value || '=')
                }
              >
                <span
                  style={{
                    fontSize: 14,
                    fontFamily: 'serif',
                    textAlign: 'center',
                  }}
                >
                  ƒ
                </span>
              </Button>
            )}
          {isTemplatingEnabled &&
            ['payee', 'category', 'account'].indexOf(field) === -1 && (
              <Button
                variant="bare"
                isDisabled={hasFormula}
                style={{
                  padding: 5,
                  backgroundColor: templated
                    ? theme.buttonPrimaryBackground
                    : undefined,
                }}
                aria-label={
                  templated ? t('Disable templating') : t('Enable templating')
                }
                onPress={() => onChange('template', !templated)}
              >
                <SvgCode style={{ width: 12, height: 12, color: 'inherit' }} />
              </Button>
            )}
        </>
      ) : op === 'set-split-amount' ? (
        <>
          <View
            style={{
              padding: '5px 10px',
              lineHeight: '1em',
              flexShrink: 0,
              ...(isDialog && {
                paddingLeft: 0,
                color: theme.pageTextSecondary,
              }),
            }}
          >
            {t('allocate')}
          </View>

          <SplitAmountMethodSelect
            options={getAllocationMethodOptions(isFormulaEnabled)}
            value={options.method}
            onChange={onChange}
          />

          <View
            style={{
              flex: 1,
              minWidth: options.method === 'fixed-percent' ? 45 : 70,
            }}
          >
            {options.method === 'formula' ? (
              <FormulaActionEditor
                value={options?.formula || '='}
                onChange={v => onChange('formula', v, { formula: true })}
              />
            ) : options.method !== 'remainder' ? (
              <GenericInput
                key={inputKey}
                // @ts-expect-error fix this
                field={field}
                op={op}
                type="number"
                numberFormatType={
                  options.method === 'fixed-percent' ? 'percentage' : 'currency'
                }
                value={value}
                onChange={v => onChange('value', v)}
              />
            ) : null}
          </View>
          {options.method === 'formula' && (
            <View
              style={{
                padding: 5,
                backgroundColor: theme.buttonPrimaryBackground,
                height: 24,
                width: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 4,
              }}
              aria-label={t('Formula mode indicator')}
              role="img"
            >
              <span
                style={{
                  fontSize: 14,
                  fontFamily: 'serif',
                  textAlign: 'center',
                }}
              >
                ƒ
              </span>
            </View>
          )}
        </>
      ) : op === 'link-schedule' ? (
        <>
          <View
            style={{
              padding: '5px 10px',
              color: theme.pageTextPositive,
              ...(isDialog && {
                paddingLeft: 0,
                color: theme.pageText,
                fontWeight: 600,
              }),
            }}
          >
            {friendlyOp(op)}
          </View>
          <ScheduleDescription id={value || null} />
        </>
      ) : op === 'prepend-notes' || op === 'append-notes' ? (
        <>
          <OpSelect
            ops={['set', 'prepend-notes', 'append-notes', 'delete-transaction']}
            value={op}
            onChange={onChange}
          />

          <View style={{ flex: 1 }}>
            <GenericInput
              key={inputKey}
              // @ts-expect-error fix this
              field={field}
              type="string"
              op={op}
              value={value}
              onChange={v => onChange('value', v)}
            />
          </View>
        </>
      ) : op === 'delete-transaction' ? (
        <OpSelect
          ops={['set', 'prepend-notes', 'append-notes', 'delete-transaction']}
          value={op}
          onChange={onChange}
        />
      ) : null}

      {op !== 'delete-transaction' && (
        <SpaceBetween gap={0} style={{ flexShrink: 0 }}>
          <EditorButtons
            onAdd={onAdd}
            onDelete={
              (op === 'set' ||
                op === 'prepend-notes' ||
                op === 'append-notes') &&
              onDelete
            }
          />
        </SpaceBetween>
      )}
    </Editor>
  );
}

function StageInfo() {
  const isDialog = useContext(RuleDialogContext);
  return (
    <View style={{ position: 'relative', marginLeft: 5 }}>
      <Tooltip
        content={
          <Trans>
            The stage of a rule allows you to force a specific order. Pre rules
            always run first, and post rules always run last. Within each stage
            rules are automatically ordered from least to most specific.
          </Trans>
        }
        placement="bottom start"
        style={{
          ...styles.tooltip,
          padding: 10,
          color: theme.pageTextLight,
          maxWidth: 450,
          lineHeight: 1.5,
        }}
      >
        <SvgInformationOutline
          style={{
            width: 11,
            height: 11,
            color: isDialog ? theme.pageTextFaint : theme.pageTextLight,
          }}
        />
      </Tooltip>
    </View>
  );
}

type StageButtonProps = {
  selected: boolean;
  children: ReactNode;
  style?: CSSProperties;
  onSelect: () => void;
};
function StageButton({
  selected,
  children,
  style,
  onSelect,
}: StageButtonProps) {
  const isDialog = useContext(RuleDialogContext);
  if (isDialog) {
    // A segment of the stage control (design-decisions §10k).
    return (
      <Button
        variant={selected ? 'tabSelected' : 'tab'}
        aria-pressed={selected}
        style={{ minHeight: 26, padding: '0 12px', ...style }}
        onPress={onSelect}
      >
        {children}
      </Button>
    );
  }
  return (
    <Button
      variant="bare"
      style={{
        fontSize: 'inherit',
        ...(selected && {
          backgroundColor: theme.pillBackgroundSelected,
          ':hover': { backgroundColor: theme.pillBackgroundSelected },
        }),
        ...style,
      }}
      onPress={onSelect}
    >
      {children}
    </Button>
  );
}

function newInput(item) {
  return { ...item, inputKey: uuidv4() };
}

function ConditionsList({
  conditionsOp,
  conditions,
  editorStyle,
  isSchedule,
  onChangeConditions,
}) {
  const isDialog = useContext(RuleDialogContext);
  function addCondition(index) {
    if (conditionFields && conditionFields.length > 0) {
      conditionFields.forEach(field => {
        field[1] = mapField(field[0]);
      });
    }

    // (remove the inflow and outflow pseudo-fields since they'd be a pain to get right)
    let fields = conditionFields
      .map(f => f[0])
      .filter(f => f !== 'amount-inflow' && f !== 'amount-outflow');

    // suggest a sensible next field: the same if 'or' or different if 'and'
    if (conditions.length && conditionsOp === 'or') {
      fields = [conditions[0].field];
    } else {
      fields = fields.filter(
        f => !conditions.some(c => c.field.includes(f) || f.includes(c.field)),
      );
    }
    const field = fields[0] || 'payee';

    const copy = [...conditions];
    copy.splice(index + 1, 0, {
      type: FIELD_TYPES.get(field),
      field,
      op: 'is',
      value: null,
      inputKey: uuidv4(),
    });
    onChangeConditions(copy);
  }

  function addInitialCondition() {
    addCondition(-1);
  }

  function removeCondition(cond) {
    onChangeConditions(conditions.filter(c => c !== cond));
  }

  function updateCondition(cond, field, value) {
    onChangeConditions(
      updateValue(conditions, cond, () => {
        if (field === 'field') {
          const newCond = { field: value };

          if (value === 'amount-inflow') {
            newCond.field = 'amount';
            // @ts-expect-error fix this
            newCond.options = { inflow: true };
          } else if (value === 'amount-outflow') {
            newCond.field = 'amount';
            // @ts-expect-error fix this
            newCond.options = { outflow: true };
          }

          // @ts-expect-error fix this
          newCond.type = FIELD_TYPES.get(newCond.field);

          const prevType = FIELD_TYPES.get(cond.field);
          if (
            (prevType === 'string' || prevType === 'number') &&
            // @ts-expect-error fix this
            prevType === newCond.type &&
            cond.op !== 'isbetween' &&
            isValidOp(newCond.field, cond.op)
          ) {
            // Don't clear the value & op if the type is string/number and
            // the type hasn't changed
            // @ts-expect-error fix this
            newCond.op = cond.op;
            return newInput(makeValue(cond.value, newCond));
          } else {
            // @ts-expect-error fix this
            newCond.op = getValidOps(newCond.field)[0];
            return newInput(makeValue(null, newCond));
          }
        } else if (field === 'op') {
          const op = value;

          // Switching between oneOf and other operators is a
          // special-case. It changes the input type, so we need to
          // clear the value
          if (
            cond.op !== 'oneOf' &&
            cond.op !== 'notOneOf' &&
            (op === 'oneOf' || op === 'notOneOf')
          ) {
            return newInput(
              makeValue(cond.value != null ? [cond.value] : [], {
                ...cond,
                op: value,
              }),
            );
          } else if (
            (cond.op === 'oneOf' || cond.op === 'notOneOf') &&
            op !== 'oneOf' &&
            op !== 'notOneOf'
          ) {
            return newInput(
              makeValue(cond.value.length > 0 ? cond.value[0] : null, {
                ...cond,
                op: value,
              }),
            );
          } else if (cond.op !== 'isbetween' && op === 'isbetween') {
            // TODO: I don't think we need `makeValue` anymore. It
            // tries to parse the value as a float and we had to
            // special-case isbetween. I don't know why we need that
            // behavior and we can probably get rid of `makeValue`
            return makeValue(
              {
                num1: cond.value,
                num2: cond.value,
              },
              { ...cond, op: value },
            );
          } else if (cond.op === 'isbetween' && op !== 'isbetween') {
            return makeValue(cond.value.num1 || 0, {
              ...cond,
              op: value,
            });
          } else {
            return { ...cond, op: value };
          }
        } else if (field === 'value') {
          return makeValue(value, cond);
        }

        return cond;
      }),
    );
  }

  return conditions.length === 0 ? (
    <Button
      variant={isDialog ? 'control' : 'normal'}
      style={{ alignSelf: 'flex-start' }}
      className={isDialog ? css(dialogButtonStyle) : undefined}
      onPress={addInitialCondition}
    >
      <Trans>Add condition</Trans>
    </Button>
  ) : (
    <SpaceBetween direction="vertical" gap={10} data-testid="condition-list">
      {conditions.map((cond, i) => {
        let ops = getValidOps(cond.field);

        // Hack for now, these ops should be the only ones available
        // for recurring dates
        if (cond.type === 'date' && cond.value && cond.value.frequency) {
          ops = ['is', 'isapprox'];
        } else if (
          cond.options &&
          (cond.options.inflow || cond.options.outflow)
        ) {
          ops = ops.filter(op => op !== 'isbetween');
        }

        return (
          <View key={i} style={{ width: '100%' }}>
            <ConditionEditor
              editorStyle={editorStyle}
              ops={ops}
              condition={cond}
              isSchedule={isSchedule}
              onChange={(name, value) => {
                updateCondition(cond, name, value);
              }}
              onDelete={() => removeCondition(cond)}
              onAdd={() => addCondition(i)}
            />
          </View>
        );
      })}
    </SpaceBetween>
  );
}

const getActions = splits => splits.flatMap(s => s.actions);
const getUnparsedActions = splits => getActions(splits).map(unparse);

// TODO:
// * Dont touch child transactions?

const conditionFields = [
  'imported_payee',
  'account',
  'category',
  'category_group',
  'date',
  'payee',
  'notes',
  'amount',
]
  .map(field => [field, mapField(field)])
  .concat([
    ['amount-inflow', mapField('amount', { inflow: true })],
    ['amount-outflow', mapField('amount', { outflow: true })],
    ['cleared', mapField('cleared')],
  ]);

type RuleEditorProps = {
  rule: RuleEntity | NewRuleEntity;
  onSave?: (rule: RuleEntity) => void;
  onCancel?: () => void;
  onDelete?: () => void;
  /** The desktop dialog's look (design-decisions §10k); off on mobile. */
  isDialog?: boolean;
  style?: CSSProperties;
};

export function RuleEditor({
  rule: defaultRule,
  onSave: originalOnSave,
  onDelete,
  onCancel,
  isDialog = false,
  style,
}: RuleEditorProps) {
  const { t } = useTranslation();
  const { isNarrowWidth } = useResponsive();
  const isCard = isDialog && !isNarrowWidth;
  const [conditions, setConditions] = useState(
    defaultRule.conditions.map(parse).map(c => ({ ...c, inputKey: uuidv4() })),
  );
  const [actionSplits, setActionSplits] = useState(() => {
    const parsedActions = defaultRule.actions.map(parse);
    return parsedActions.reduce(
      (acc, action) => {
        const splitIndex = action.options?.splitIndex ?? 0;
        acc[splitIndex] = acc[splitIndex] ?? {
          id: uuidv4(),
          actions: [],
        };
        acc[splitIndex].actions.push({
          ...action,
          inputKey: uuidv4(),
        });
        return acc;
      },
      // The pre-split group is always there
      [{ id: uuidv4(), actions: [] }],
    );
  });
  const [stage, setStage] = useState(defaultRule.stage);
  const [conditionsOp, setConditionsOp] = useState(defaultRule.conditionsOp);
  const [transactions, setTransactions] = useState([]);
  const dispatch = useDispatch();
  const scrollableEl = useRef(undefined);

  const isSchedule = getActions(actionSplits).some(
    action => action.op === 'link-schedule',
  );

  useEffect(() => {
    // Disable undo while this modal is open
    disableUndo();
    return () => enableUndo();
  }, [dispatch]);

  useEffect(() => {
    // Flash the scrollbar
    if (scrollableEl.current) {
      const el = scrollableEl.current;
      const top = el.scrollTop;
      el.scrollTop = top + 1;
      el.scrollTop = top;
    }

    // Run it here
    async function run() {
      const { filters } = await send('make-filters-from-conditions', {
        conditions: conditions.map(unparse),
      });

      if (filters.length > 0) {
        const conditionsOpKey = conditionsOp === 'or' ? '$or' : '$and';
        const parentOnlyCondition =
          actionSplits.length > 1 ? { is_child: false } : {};
        const { data: transactions } = await aqlQuery(
          q('transactions')
            .filter({ [conditionsOpKey]: filters, ...parentOnlyCondition })
            .select('*'),
        );
        setTransactions(transactions);
      } else {
        setTransactions([]);
      }
    }
    void run();
  }, [actionSplits, conditions, conditionsOp]);

  const selectedInst = useSelected('transactions', transactions, []);

  function addInitialAction() {
    addActionToSplitAfterIndex(0, -1);
  }

  function addActionToSplitAfterIndex(splitIndex, actionIndex) {
    let newAction;
    if (splitIndex && !actionSplits[splitIndex]?.actions?.length) {
      actionSplits[splitIndex] = { id: uuidv4(), actions: [] };
      newAction = {
        op: 'set-split-amount',
        options: { method: 'remainder', splitIndex },
        value: null,
        inputKey: uuidv4(),
      };
    } else {
      const fieldsArray =
        splitIndex === 0 ? getActionFields() : getSplitActionFields();
      let fields = fieldsArray.map(f => f[0]);
      for (const action of actionSplits[splitIndex].actions) {
        fields = fields.filter(f => f !== action.field);
      }
      const field = fields[0] || 'category';
      newAction = {
        type: FIELD_TYPES.get(field),
        field,
        op: 'set',
        value: '',
        options: { splitIndex },
        inputKey: uuidv4(),
      };
    }

    const actionsCopy = [...actionSplits[splitIndex].actions];
    actionsCopy.splice(actionIndex + 1, 0, newAction);
    const copy = [...actionSplits];
    copy[splitIndex] = { ...actionSplits[splitIndex], actions: actionsCopy };
    setActionSplits(copy);
  }

  function onChangeAction(action, field, value, extraOptions?) {
    setActionSplits(
      actionSplits.map(({ id, actions }) => ({
        id,
        actions: updateValue(actions, action, () => {
          const a = { ...action };

          if (field === 'method') {
            a.options = { ...a.options, method: value };
          } else if (field === 'template') {
            if (value) {
              a.options = { ...a.options, template: a.value };
            } else {
              a.options = { ...a.options, template: undefined };
              if (a.type !== 'string') a.value = null;
            }
          } else if (field === 'formula') {
            if (value === undefined) {
              // Disable formula mode
              a.options = { ...a.options, formula: undefined };
              if (a.type !== 'string') a.value = null;
            } else {
              // Keep formula mode; allow empty string while editing
              a.options = { ...a.options, formula: String(value) };
            }
          } else {
            // Handle formula updates
            if (extraOptions?.formula && a.options?.formula !== undefined) {
              // Only update formula, not the value field
              a.options = {
                ...a.options,
                formula: value,
              };
            } else if (a.options?.template !== undefined) {
              // Only update template, not the value field
              a.options = {
                ...a.options,
                template: value,
              };
            } else {
              // Normal value update
              a[field] = value;
            }

            if (field === 'field') {
              a.type = FIELD_TYPES.get(a.field);
              a.value = value === 'date' ? '' : null;
              a.options = {
                ...a.options,
                template: undefined,
                formula: undefined,
              };
              return newInput(a);
            } else if (field === 'op') {
              a.value = null;
              a.inputKey = '' + Math.random();
              a.options = { ...a.options, template: undefined };
              return newInput(a);
            }
          }

          return a;
        }),
      })),
    );
  }

  function onChangeStage(stage) {
    setStage(stage);
  }

  function onChangeConditionsOp(value) {
    setConditionsOp(value);
  }

  function onRemoveAction(action) {
    setActionSplits(splits =>
      splits.map(({ id, actions }) => ({
        id,
        actions: actions.filter(a => a !== action),
      })),
    );
  }

  function onRemoveSplit(splitIndexToRemove) {
    setActionSplits(splits => {
      const copy = [];
      splits.forEach(({ id }, index) => {
        if (index === splitIndexToRemove) {
          return;
        }
        copy.push({ id, actions: [] });
      });
      getActions(splits).forEach(action => {
        const currentSplitIndex = action.options?.splitIndex ?? 0;
        if (currentSplitIndex === splitIndexToRemove) {
          return;
        }
        const newSplitIndex =
          currentSplitIndex > splitIndexToRemove
            ? currentSplitIndex - 1
            : currentSplitIndex;
        copy[newSplitIndex].actions.push({
          ...action,
          options: { ...action.options, splitIndex: newSplitIndex },
        });
      });
      return copy;
    });
  }

  function onApply() {
    const selectedTransactions = transactions.filter(({ id }) =>
      selectedInst.items.has(id),
    );
    void send('rule-apply-actions', {
      transactions: selectedTransactions,
      actions: getUnparsedActions(actionSplits),
    }).then(content => {
      // This makes it refetch the transactions
      content.errors.forEach(error => {
        dispatch(
          addNotification({
            notification: {
              type: 'error',
              message: error,
            },
          }),
        );
      });
      setActionSplits([...actionSplits]);
    });
  }

  async function onSave() {
    const rule = {
      ...defaultRule,
      stage,
      conditionsOp,
      conditions: conditions.map(unparse),
      actions: getUnparsedActions(actionSplits),
    };

    // @ts-expect-error fix this
    const method = rule.id ? 'rule-update' : 'rule-add';
    // @ts-expect-error fix this
    const { error, id: newId } = await send(method, rule);

    if (error) {
      // @ts-expect-error fix this
      if (error.conditionErrors) {
        // @ts-expect-error fix this
        setConditions(applyErrors(conditions, error.conditionErrors));
      }

      // @ts-expect-error fix this
      if (error.actionErrors) {
        let usedErrorIdx = 0;
        setActionSplits(
          actionSplits.map(item => ({
            ...item,
            actions: item.actions.map(action => ({
              ...action,
              // @ts-expect-error fix this
              error: error.actionErrors[usedErrorIdx++] ?? null,
            })),
          })),
        );
      }
    } else {
      // If adding a rule, we got back an id
      if (newId) {
        // @ts-expect-error fix this
        rule.id = newId;
      }

      // @ts-expect-error fix this
      originalOnSave?.(rule);
    }
  }

  // Enable editing existing split rules even if the feature has since been disabled.
  const showSplitButton = actionSplits.length > 0;

  const editorStyle = isCard ? dialogEditorStyle : styles.editorPill;
  const buttonVariant = isCard ? 'control' : 'normal';
  const buttonClassName = isCard ? css(dialogButtonStyle) : undefined;
  const leadStyle = isCard
    ? {
        marginBottom: 10,
        fontSize: 13.5,
        fontWeight: 600,
        color: theme.pageText,
      }
    : { marginBottom: 15 };

  const stageButtons = (
    <>
      <StageButton
        selected={stage === 'pre'}
        onSelect={() => onChangeStage('pre')}
      >
        <Trans>Pre</Trans>
      </StageButton>
      <StageButton
        selected={stage === null}
        onSelect={() => onChangeStage(null)}
      >
        <Trans>Default</Trans>
      </StageButton>
      <StageButton
        selected={stage === 'post'}
        onSelect={() => onChangeStage('post')}
      >
        <Trans>Post</Trans>
      </StageButton>
    </>
  );

  return (
    <RuleDialogContext.Provider value={isCard}>
      <View style={style}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 15,
            padding: '0 20px',
            ...(isCard && {
              padding: 0,
              marginBottom: 14,
              color: theme.pageTextSecondary,
            }),
          }}
        >
          <Text style={{ marginRight: isCard ? 10 : 15 }}>
            <Trans>Stage of rule:</Trans>
          </Text>

          <SpaceBetween gap={5} style={{ alignItems: 'center' }}>
            {isCard ? (
              // The stage as a segmented control (design-decisions §10k).
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 2,
                  padding: 2,
                  borderRadius: 11,
                  backgroundColor: theme.navTrack,
                }}
              >
                {stageButtons}
              </View>
            ) : (
              stageButtons
            )}

            <StageInfo />
          </SpaceBetween>
        </View>

        <View
          innerRef={scrollableEl}
          style={{
            borderBottom: '1px solid ' + theme.tableBorder,
            padding: '0 20px 20px 20px',
            overflow: 'auto',
            maxHeight: 'calc(100% - 300px)',
            minHeight: 100,
            position: 'relative',
            zIndex: 2,
            // Hairline-separated sections (design-decisions §10k).
            ...(isCard && {
              borderTop: '1px solid ' + theme.cardHairline,
              borderBottomColor: theme.cardHairline,
              padding: '14px 0 18px',
            }),
          }}
        >
          <View style={{ flexShrink: 0 }}>
            <View style={{ marginBottom: isCard ? 18 : 30 }}>
              <Text style={leadStyle}>
                <Trans>
                  If{' '}
                  <FieldSelect
                    data-testid="conditions-op"
                    style={{
                      display: 'inline-flex',
                      // A small control select in the dialog.
                      ...(isCard && {
                        margin: '0 2px',
                        padding: '0 2px',
                        borderRadius: 7,
                        border: '1px solid ' + theme.cardHairline,
                        backgroundColor: theme.controlBackground,
                      }),
                    }}
                    fields={[
                      ['and', t('all')],
                      ['or', t('any')],
                    ]}
                    value={conditionsOp}
                    onChange={onChangeConditionsOp}
                  />
                  {{ allOrAny: '' }} of these conditions match:
                </Trans>
              </Text>

              <ConditionsList
                conditionsOp={conditionsOp}
                conditions={conditions}
                editorStyle={editorStyle}
                isSchedule={isSchedule}
                onChangeConditions={conds => setConditions(conds)}
              />
            </View>

            <Text style={leadStyle}>
              <Trans>Then apply these actions:</Trans>
            </Text>
            <View style={{ flex: 1 }}>
              {actionSplits.length === 0 && (
                <Button
                  variant={buttonVariant}
                  className={buttonClassName}
                  style={{ alignSelf: 'flex-start' }}
                  onPress={addInitialAction}
                >
                  <Trans>Add action</Trans>
                </Button>
              )}
              <SpaceBetween
                direction="vertical"
                gap={10}
                data-testid="action-split-list"
              >
                {actionSplits.map(({ id, actions }, splitIndex) => (
                  <View
                    key={id}
                    style={{ width: '100%' }}
                    nativeStyle={
                      actionSplits.length > 1
                        ? isCard
                          ? {
                              borderColor: theme.cardHairline,
                              borderWidth: '1px',
                              borderRadius: '12px',
                              padding: '10px',
                            }
                          : {
                              borderColor: theme.tableBorder,
                              borderWidth: '1px',
                              borderRadius: '5px',
                              padding: '5px',
                            }
                        : {}
                    }
                  >
                    {actionSplits.length > 1 && (
                      <SpaceBetween
                        gap={5}
                        style={{
                          justifyContent: 'space-between',
                          ...(isCard && {
                            alignItems: 'center',
                            minHeight: 24,
                            marginBottom: 8,
                          }),
                        }}
                      >
                        <Text
                          style={
                            isCard
                              ? { ...dialogEyebrowStyle, paddingLeft: 2 }
                              : {
                                  ...styles.smallText,
                                  marginBottom: '10px',
                                }
                          }
                        >
                          {splitIndex === 0
                            ? t('Apply to all')
                            : `${t('Split')} ${splitIndex}`}
                        </Text>
                        {splitIndex > 0 && (
                          <Button
                            variant={isCard ? 'control' : 'bare'}
                            onPress={() => onRemoveSplit(splitIndex)}
                            style={
                              isCard
                                ? undefined
                                : {
                                    width: 20,
                                    height: 20,
                                  }
                            }
                            className={
                              isCard
                                ? css({
                                    ...dialogIconButtonStyle,
                                    width: 24,
                                    height: 24,
                                    minWidth: 24,
                                    minHeight: 24,
                                  })
                                : undefined
                            }
                            aria-label={t('Delete split')}
                          >
                            <SvgDelete
                              style={{
                                width: 8,
                                height: 8,
                                color: 'inherit',
                              }}
                            />
                          </Button>
                        )}
                      </SpaceBetween>
                    )}
                    <SpaceBetween
                      direction="vertical"
                      gap={isCard ? 6 : 10}
                      data-testid="action-list"
                    >
                      {actions.map((action, actionIndex) => (
                        <View key={actionIndex} style={{ width: '100%' }}>
                          <ActionEditor
                            action={action}
                            editorStyle={editorStyle}
                            onChange={(name, value, extraOptions) =>
                              onChangeAction(action, name, value, extraOptions)
                            }
                            onDelete={() => onRemoveAction(action)}
                            onAdd={() =>
                              addActionToSplitAfterIndex(
                                splitIndex,
                                actionIndex,
                              )
                            }
                          />
                        </View>
                      ))}
                    </SpaceBetween>

                    {actions.length === 0 && (
                      <Button
                        variant={buttonVariant}
                        className={buttonClassName}
                        style={{ alignSelf: 'flex-start', marginTop: 5 }}
                        onPress={() =>
                          addActionToSplitAfterIndex(splitIndex, -1)
                        }
                      >
                        <Trans>Add action</Trans>
                      </Button>
                    )}
                  </View>
                ))}
              </SpaceBetween>
              {showSplitButton && (
                <Button
                  variant={buttonVariant}
                  className={buttonClassName}
                  style={{ alignSelf: 'flex-start', marginTop: 15 }}
                  onPress={() => {
                    addActionToSplitAfterIndex(actionSplits.length, -1);
                  }}
                  data-testid="add-split-transactions"
                >
                  {actionSplits.length > 1
                    ? t('Add another split')
                    : t('Split into multiple transactions')}
                </Button>
              )}
            </View>
          </View>
        </View>

        <SelectedProvider instance={selectedInst}>
          <View
            style={{
              padding: '20px',
              flex: 1,
              position: 'relative',
              zIndex: 1,
              ...(isCard && { padding: '14px 0 0', minHeight: 0 }),
            }}
          >
            <SpaceBetween
              gap={5}
              style={{
                flexDirection: 'row',
                flexWrap: 'nowrap',
                justifyContent: 'space-between',
                marginBottom: 12,
                ...(isCard && { alignItems: 'center', marginBottom: 10 }),
              }}
            >
              <Text
                style={{
                  color: isCard ? theme.pageTextSecondary : theme.pageTextLight,
                  marginBottom: 0,
                }}
              >
                <Trans>This rule applies to these transactions:</Trans>
              </Text>

              <Button
                variant={buttonVariant}
                className={buttonClassName}
                isDisabled={selectedInst.items.size === 0}
                onPress={onApply}
              >
                <Trans>Apply actions</Trans> ({selectedInst.items.size})
              </Button>
            </SpaceBetween>

            {/* @ts-expect-error fix this */}
            <SimpleTransactionsTable
              transactions={transactions}
              fields={getTransactionFields(
                conditions,
                getActions(actionSplits),
              )}
              isCard={isCard}
              style={
                isCard
                  ? dialogTableCardStyle
                  : {
                      border: '1px solid ' + theme.tableBorder,
                      borderRadius: '6px 6px 0 0',
                    }
              }
            />

            <SpaceBetween
              style={{
                marginTop: 20,
                justifyContent: onDelete ? 'space-between' : 'flex-end',
                // The footer stays in view under a hairline, as in the
                // schedule dialog (design-decisions §10k).
                ...(isCard && {
                  marginTop: 16,
                  paddingTop: 14,
                  borderTop: '1px solid ' + theme.cardHairline,
                }),
              }}
            >
              {onDelete && (
                <Button
                  variant={buttonVariant}
                  className={buttonClassName}
                  onPress={onDelete}
                >
                  <Trans>Delete</Trans>
                </Button>
              )}

              <SpaceBetween gap={isCard ? 8 : undefined}>
                <Button
                  variant={buttonVariant}
                  className={buttonClassName}
                  onPress={onCancel}
                >
                  <Trans>Cancel</Trans>
                </Button>
                <Button
                  variant="primary"
                  className={isCard ? css(dialogPrimaryButtonStyle) : undefined}
                  onPress={onSave}
                >
                  <Trans>Save</Trans>
                </Button>
              </SpaceBetween>
            </SpaceBetween>
          </View>
        </SelectedProvider>
      </View>
    </RuleDialogContext.Provider>
  );
}
