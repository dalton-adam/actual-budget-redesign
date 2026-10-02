import React from 'react';
import type { CSSProperties } from 'react';

import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';

import { friendlyOp, mapField } from '#util/rule';

import { Value } from './Value';

const valueStyle = {
  color: theme.pillTextHighlighted,
};

/**
 * Opt-in chip look for the desktop Rules list (design-decisions §10d): Card
 * Inset with a hairline, the field in text colour, the operator Secondary
 * and the value in the accent text colour. The mobile list keeps upstream's chips.
 */
export const ruleChipCardStyle = {
  backgroundColor: theme.cardInset,
  border: '1px solid ' + theme.cardHairline,
  color: theme.pageTextSecondary,
  borderRadius: 7,
  padding: '3px 8px',
  fontSize: 12.5,
} as const;

export const ruleChipFieldStyle = {
  color: theme.pageText,
  fontWeight: 600,
} as const;

export const ruleChipValueStyle = {
  // Readable accent text in every theme (buttonPrimaryBackground is 3.3:1
  // on the dark chip).
  color: theme.pillTextHighlighted,
  fontWeight: 600,
} as const;

type ConditionExpressionProps = {
  field: unknown;
  op: unknown;
  value: unknown;
  options: unknown;
  prefix?: string;
  style?: CSSProperties;
  inline?: boolean;
  isCard?: boolean;
};

export function ConditionExpression({
  field,
  op,
  value,
  options,
  prefix,
  style,
  inline,
  isCard,
}: ConditionExpressionProps) {
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
        ...(isCard && ruleChipCardStyle),
        ...style,
      }}
    >
      {prefix && (
        <Text style={isCard ? { color: theme.pageTextFaint } : undefined}>
          {prefix}{' '}
        </Text>
      )}
      <Text style={isCard ? ruleChipFieldStyle : valueStyle}>
        {mapField(field, options)}
      </Text>{' '}
      <Text>{friendlyOp(op)}</Text>{' '}
      {!['onbudget', 'offbudget'].includes(
        (op as string)?.toLocaleLowerCase(),
      ) && (
        <Value
          style={isCard ? ruleChipValueStyle : valueStyle}
          value={value}
          field={field}
          inline={inline}
        />
      )}
    </View>
  );
}
