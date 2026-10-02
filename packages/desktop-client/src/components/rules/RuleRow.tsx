// @ts-strict-ignore
import React, { memo, useRef } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgRightArrow2 } from '@actual-app/components/icons/v0';
import { SpaceBetween } from '@actual-app/components/space-between';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import type { RuleEntity } from '@actual-app/core/types/models';

import { Cell, Field, Row, SelectCell } from '#components/table';
import { useContextMenu } from '#hooks/useContextMenu';
import { useSelectedDispatch } from '#hooks/useSelected';
import {
  friendlyOp,
  groupActionsBySplitIndex,
  translateRuleStage,
} from '#util/rule';

import { ActionExpression } from './ActionExpression';
import { ConditionExpression } from './ConditionExpression';

/** Stage column width, shared with the header (design-decisions §10d). */
export const RULE_STAGE_WIDTH = 58;

type RuleRowProps = {
  rule: RuleEntity;
  hovered?: boolean;
  selected?: boolean;
  onHover?: (id: string | null) => void;
  onEditRule?: (rule: RuleEntity) => void;
  onDeleteRule?: (rule: RuleEntity) => void;
};

export const RuleRow = memo(
  ({
    rule,
    hovered,
    selected,
    onHover,
    onEditRule,
    onDeleteRule,
  }: RuleRowProps) => {
    const dispatchSelected = useSelectedDispatch();
    // Hairline dividers on the card (design-decisions §10d).
    const borderColor = theme.cardHairline;

    const actionSplits = groupActionsBySplitIndex(rule.actions);
    const hasSplits = actionSplits.length > 1;

    const hasSchedule = rule.actions.some(({ op }) => op === 'link-schedule');

    const { t } = useTranslation();

    const triggerRef = useRef(null);

    useContextMenu({
      triggerRef,
      items: [
        onEditRule && {
          name: 'edit',
          text: t('Edit'),
          onClick: () => onEditRule(rule),
        },
        onDeleteRule &&
          !hasSchedule && {
            name: 'delete',
            text: t('Delete'),
            onClick: () => onDeleteRule(rule),
          },
      ],
    });

    return (
      <Row
        ref={triggerRef}
        height="auto"
        style={{
          fontSize: 13,
          minHeight: 44,
          zIndex: selected ? 101 : 'auto',
          borderColor,
          backgroundColor: selected
            ? theme.selectionBackground
            : hovered
              ? theme.tableRowHover
              : theme.cardBackground,
          '& > div': { borderColor },
        }}
        collapsed
        onMouseEnter={() => onHover && onHover(rule.id)}
        onMouseLeave={() => onHover && onHover(null)}
      >
        <SelectCell
          exposed={hovered || selected}
          focused
          onSelect={e => {
            dispatchSelected({
              type: 'select',
              id: rule.id,
              isRangeSelect: e.shiftKey,
            });
          }}
          selected={selected}
        />

        <Cell
          name="stage"
          width={RULE_STAGE_WIDTH}
          plain
          style={{ color: theme.tableText, justifyContent: 'center' }}
        >
          {rule.stage && (
            <View
              style={{
                // Neutral stage pill (design-decisions §10d).
                alignSelf: 'flex-start',
                marginLeft: 5,
                height: 22,
                justifyContent: 'center',
                backgroundColor: theme.pillNeutralBackground,
                color: theme.pillNeutralText,
                borderRadius: 6,
                padding: '0 8px',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {translateRuleStage(rule.stage)}
            </View>
          )}
        </Cell>

        <Field width="flex" style={{ padding: '10px 0' }} truncate={false}>
          <SpaceBetween style={{ alignItems: 'center' }} gap={12}>
            <View
              style={{ flex: 1, alignItems: 'flex-start' }}
              data-testid="conditions"
            >
              {rule.conditions.map((cond, i) => (
                <ConditionExpression
                  key={i}
                  isCard
                  field={cond.field}
                  op={cond.op}
                  inline
                  value={cond.value}
                  options={cond.options}
                  prefix={i > 0 ? friendlyOp(rule.conditionsOp) : null}
                  style={i !== 0 && { marginTop: 4 }}
                />
              ))}
            </View>

            <Text>
              <SvgRightArrow2
                style={{ width: 12, height: 12, color: theme.pageTextFaint }}
              />
            </Text>

            <View
              style={{ flex: 1, alignItems: 'flex-start' }}
              data-testid="actions"
            >
              {hasSplits
                ? actionSplits.map((split, i) => (
                    <View
                      key={split.id}
                      style={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        marginTop: i > 0 ? 6 : 0,
                        padding: 8,
                        borderColor: theme.cardHairline,
                        borderWidth: '1px',
                        borderRadius: 10,
                      }}
                    >
                      <Text
                        style={{
                          // Eyebrow split label (design-decisions §10d).
                          color: theme.pageTextFaint,
                          fontSize: 11,
                          fontWeight: 650,
                          textTransform: 'uppercase',
                          letterSpacing: '0.07em',
                          marginBottom: 6,
                        }}
                      >
                        {i ? t('Split {{num}}', { num: i }) : t('Apply to all')}
                      </Text>
                      {split.actions.map((action, j) => (
                        <ActionExpression
                          key={j}
                          isCard
                          {...action}
                          style={j !== 0 && { marginTop: 4 }}
                        />
                      ))}
                    </View>
                  ))
                : rule.actions.map((action, i) => (
                    <ActionExpression
                      key={i}
                      isCard
                      {...action}
                      style={i !== 0 && { marginTop: 4 }}
                    />
                  ))}
            </View>
          </SpaceBetween>
        </Field>

        <Cell name="edit" plain style={{ padding: '0 14px', paddingLeft: 12 }}>
          <Button variant="control" onPress={() => onEditRule(rule)}>
            <Trans>Edit</Trans>
          </Button>
        </Cell>
      </Row>
    );
  },
);

RuleRow.displayName = 'RuleRow';
