import React from 'react';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import type {
  AppendNoteRuleActionEntity,
  DeleteTransactionRuleActionEntity,
  LinkScheduleRuleActionEntity,
  PrependNoteRuleActionEntity,
  RuleActionEntity,
  SetRuleActionEntity,
  SetSplitAmountRuleActionEntity,
} from '@actual-app/core/types/models';

import { friendlyOp, getAllocationMethods, mapField } from '#util/rule';

import {
  ruleChipCardStyle,
  ruleChipFieldStyle,
  ruleChipValueStyle,
} from './ConditionExpression';
import { ScheduleValue } from './ScheduleValue';
import { Value } from './Value';

const valueStyle = {
  color: theme.pillTextHighlighted,
};

type ChipProps = {
  /** Opt-in desktop Rules list chip look (design-decisions §10d). */
  isCard?: boolean;
};

function chipTextStyles(isCard: boolean | undefined) {
  return isCard
    ? { field: ruleChipFieldStyle, value: ruleChipValueStyle }
    : { field: valueStyle, value: valueStyle };
}

type ActionExpressionProps = RuleActionEntity &
  ChipProps & {
    style?: CSSProperties;
  };

export function ActionExpression({ style, ...props }: ActionExpressionProps) {
  return (
    <View
      style={{
        display: 'block',
        maxWidth: '100%',
        color: theme.pillText,
        backgroundColor: theme.pillBackgroundLight,
        borderRadius: 4,
        padding: '3px 5px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        ...(props.isCard && ruleChipCardStyle),
        ...style,
      }}
    >
      {props.op === 'set' ? (
        <SetActionExpression {...props} />
      ) : props.op === 'set-split-amount' ? (
        <SetSplitAmountActionExpression {...props} />
      ) : props.op === 'link-schedule' ? (
        <LinkScheduleActionExpression {...props} />
      ) : props.op === 'prepend-notes' ? (
        <PrependNoteActionExpression {...props} />
      ) : props.op === 'append-notes' ? (
        <AppendNoteActionExpression {...props} />
      ) : props.op === 'delete-transaction' ? (
        <DeleteTransactionActionExpression {...props} />
      ) : null}
    </View>
  );
}

function SetActionExpression({
  op,
  field,
  value,
  options,
  isCard,
}: SetRuleActionEntity & ChipProps) {
  const { t } = useTranslation();
  const text = chipTextStyles(isCard);
  return (
    <>
      <Text>{friendlyOp(op)}</Text>{' '}
      <Text style={text.field}>{mapField(field, options)}</Text>{' '}
      <Text>{t('to ')}</Text>
      {options?.formula ? (
        <>
          <Text>{t('formula ')}</Text>
          <Text style={text.value}>{options.formula}</Text>
        </>
      ) : options?.template ? (
        <>
          <Text>{t('template ')}</Text>
          <Text style={text.value}>{options.template}</Text>
        </>
      ) : (
        <Value style={text.value} value={value} field={field} />
      )}
    </>
  );
}

function SetSplitAmountActionExpression({
  op,
  value,
  options,
  isCard,
}: SetSplitAmountRuleActionEntity & ChipProps) {
  const { t } = useTranslation();
  const text = chipTextStyles(isCard);
  const method = options?.method;
  if (!method) {
    return null;
  }

  return (
    <>
      <Text>{friendlyOp(op)}</Text>{' '}
      <Text style={text.field}>{getAllocationMethods()[method]}</Text>
      {method !== 'remainder' && ': '}
      {options?.method === 'formula' ? (
        <>
          <Text>{t('formula ')}</Text>
          <Text style={text.value}>{options.formula}</Text>
        </>
      ) : method === 'fixed-amount' ? (
        <Value style={text.value} value={value} field="amount" />
      ) : method === 'fixed-percent' ? (
        <Text style={text.value}>{value}%</Text>
      ) : null}
    </>
  );
}

function LinkScheduleActionExpression({
  op,
  value,
  isCard,
}: LinkScheduleRuleActionEntity & ChipProps) {
  return (
    <>
      <Text>{friendlyOp(op)}</Text>{' '}
      <ScheduleValue
        value={value}
        style={isCard ? ruleChipValueStyle : undefined}
      />
    </>
  );
}

function PrependNoteActionExpression({
  op,
  value,
  isCard,
}: PrependNoteRuleActionEntity & ChipProps) {
  return (
    <>
      <Text>{friendlyOp(op)}</Text>{' '}
      <Value style={chipTextStyles(isCard).value} value={value} field="notes" />
    </>
  );
}

function AppendNoteActionExpression({
  op,
  value,
  isCard,
}: AppendNoteRuleActionEntity & ChipProps) {
  return (
    <>
      <Text>{friendlyOp(op)}</Text>{' '}
      <Value style={chipTextStyles(isCard).value} value={value} field="notes" />
    </>
  );
}

function DeleteTransactionActionExpression({
  op,
}: DeleteTransactionRuleActionEntity) {
  return <Text>{friendlyOp(op)}</Text>;
}
