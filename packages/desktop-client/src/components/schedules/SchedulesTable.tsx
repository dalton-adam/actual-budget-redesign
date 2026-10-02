// @ts-strict-ignore
import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { CSSProperties } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgDotsHorizontalTriple } from '@actual-app/components/icons/v1';
import { SvgCheck } from '@actual-app/components/icons/v2';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import { format as monthUtilFormat } from '@actual-app/core/shared/months';
import { getNormalisedString } from '@actual-app/core/shared/normalisation';
import { getScheduledAmount } from '@actual-app/core/shared/schedules';
import type { ScheduleStatuses } from '@actual-app/core/shared/schedules';
import type { ScheduleEntity } from '@actual-app/core/types/models';

import { FinancialText } from '#components/FinancialText';
import { PrivacyFilter } from '#components/PrivacyFilter';
import { Cell, Field, Row, Table, TableHeader } from '#components/table';
import { DisplayId } from '#components/util/DisplayId';
import { useAccounts } from '#hooks/useAccounts';
import { useContextMenu } from '#hooks/useContextMenu';
import { useDateFormat } from '#hooks/useDateFormat';
import { useFormat } from '#hooks/useFormat';
import { usePayees } from '#hooks/usePayees';

import { StatusBadge } from './StatusBadge';
type SchedulesTableProps = {
  isLoading?: boolean;
  schedules: readonly ScheduleEntity[];
  statuses: ScheduleStatuses;
  filter: string;
  allowCompleted: boolean;
  onSelect: (id: ScheduleEntity['id']) => void;
  /**
   * The Schedules page's card look (design-decisions §10b, APP-04), also
   * used by the desktop link-schedule dialog (§10k, APP-06e).
   */
  isCard?: boolean;
  style: CSSProperties;
  tableStyle?: CSSProperties;
} & (
  | {
      minimal: true;
      onAction?: never;
    }
  | {
      minimal?: false;
      onAction: (
        actionName: ScheduleItemAction,
        id: ScheduleEntity['id'],
      ) => void;
    }
);

type CompletedScheduleItem = { id: 'show-completed' };
type SchedulesTableItem = ScheduleEntity | CompletedScheduleItem;

export type ScheduleItemAction =
  | 'post-transaction'
  | 'post-transaction-today'
  | 'skip'
  | 'complete'
  | 'restart'
  | 'delete';

export const ROW_HEIGHT = 43;
/** Row height of the card look (design-decisions §10b). */
const CARD_ROW_HEIGHT = 44;

const ScheduleCardContext = createContext(false);

/** Eyebrow column headers, as on the account register. */
const eyebrowHeaderStyle = {
  color: theme.pageTextFaint,
  fontSize: 11,
  fontWeight: 650,
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
} as const;

export function ScheduleAmountCell({
  amount,
  op,
}: {
  amount: ScheduleEntity['_amount'];
  op: ScheduleEntity['_amountOp'];
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const isCard = useContext(ScheduleCardContext);

  const num = getScheduledAmount(amount);
  const currencyAmount = format(Math.abs(num || 0), 'financial');
  const isApprox = op === 'isapprox';
  const isBetween = op === 'isbetween';
  let cellText = '';
  if (isApprox) {
    cellText = t('Approximately {{currencyAmount}}', {
      currencyAmount,
    });
  } else if (isBetween && typeof amount != 'number') {
    cellText = t('{{currency1}} to {{currency2}}', {
      currency1: format(Math.abs(amount.num1 || 0), 'financial'),
      currency2: format(Math.abs(amount.num2 || 0), 'financial'),
    });
  } else {
    cellText = currencyAmount;
  }
  return (
    <Cell
      width={100}
      plain
      style={{
        textAlign: 'right',
        flexDirection: 'row',
        alignItems: 'center',
        padding: '0 5px',
      }}
      name="amount"
    >
      {isApprox && (
        <View
          style={{
            textAlign: 'left',
            color: isCard ? theme.pageTextFaint : theme.pageTextSubdued,
            lineHeight: '1em',
            marginRight: 10,
          }}
          title={cellText}
        >
          ~
        </View>
      )}
      {isBetween && (
        <View
          style={{
            textAlign: 'left',
            color: isCard ? theme.pageTextFaint : theme.pageTextSubdued,
            lineHeight: '1em',
            marginRight: 10,
          }}
          title={cellText}
        >
          ±
        </View>
      )}
      <FinancialText
        style={{
          flex: 1,
          color:
            num > 0
              ? isCard
                ? theme.numberPositive
                : theme.noticeTextLight
              : theme.tableText,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
        title={cellText}
      >
        <PrivacyFilter>
          {num > 0 ? `+${currencyAmount}` : `${currencyAmount}`}
        </PrivacyFilter>
      </FinancialText>
    </Cell>
  );
}

function ScheduleRow({
  schedule,
  onAction,
  onSelect,
  minimal,
  statuses,
  dateFormat,
}: {
  schedule: ScheduleEntity;
  dateFormat: string;
} & Pick<
  SchedulesTableProps,
  'onSelect' | 'onAction' | 'minimal' | 'statuses'
>) {
  const { t } = useTranslation();
  const isCard = useContext(ScheduleCardContext);

  const rowRef = useRef(null);
  const buttonRef = useRef(null);

  const status = statuses.get(schedule.id);
  useContextMenu({
    triggerRef: rowRef,
    items: !minimal
      ? [
          {
            name: 'post-transaction',
            text: t('Post transaction'),
            onClick: () => onAction('post-transaction', schedule.id),
          },
          {
            name: 'post-transaction-today',
            text: t('Post transaction today'),
            onClick: () => onAction('post-transaction-today', schedule.id),
          },
          {
            name: 'restart',
            text: t('Restart'),
            onClick: () => onAction('restart', schedule.id),
            hidden: status !== 'completed',
          },
          {
            name: 'skip',
            text: t('Skip next scheduled date'),
            onClick: () => onAction('skip', schedule.id),
            hidden: status === 'completed',
          },
          {
            name: 'complete',
            text: t('Complete'),
            onClick: () => onAction('complete', schedule.id),
            hidden: status === 'completed',
          },
          {
            name: 'delete',
            text: t('Delete'),
            onClick: () => onAction('delete', schedule.id),
          },
        ]
      : [],
  });

  return (
    <Row
      ref={rowRef}
      height={isCard ? CARD_ROW_HEIGHT : ROW_HEIGHT}
      inset={15}
      onClick={() => onSelect(schedule.id)}
      style={{
        cursor: 'pointer',
        backgroundColor: theme.tableBackground,
        color: theme.tableText,
        ':hover': { backgroundColor: theme.tableRowBackgroundHover },
        // Hairline dividers on the card (design-decisions §10b).
        ...(isCard && {
          backgroundColor: theme.cardBackground,
          ':hover': { backgroundColor: theme.tableRowHover },
          '& > div': { borderColor: theme.cardHairline },
        }),
      }}
    >
      <Field width="flex" name="name">
        <Text
          style={
            schedule.name == null
              ? {
                  color: isCard
                    ? theme.pageTextFaint
                    : theme.buttonNormalDisabledText,
                }
              : isCard
                ? { fontWeight: 600 }
                : null
          }
          title={schedule.name ? schedule.name : ''}
        >
          {schedule.name ? schedule.name : t('None')}
        </Text>
      </Field>
      <Field width="flex" name="payee">
        <DisplayId type="payees" id={schedule._payee} />
      </Field>
      <Field
        width="flex"
        name="account"
        style={isCard ? { color: theme.pageTextSubdued } : undefined}
      >
        <DisplayId type="accounts" id={schedule._account} />
      </Field>
      <Field width={110} name="date">
        {schedule.next_date
          ? monthUtilFormat(schedule.next_date, dateFormat)
          : null}
      </Field>
      <Field width={120} name="status" style={{ alignItems: 'flex-start' }}>
        <StatusBadge status={statuses.get(schedule.id)} isPill={isCard} />
      </Field>
      <ScheduleAmountCell amount={schedule._amount} op={schedule._amountOp} />
      {!minimal && (
        <Field
          width={isCard ? 96 : 80}
          style={{
            textAlign: 'center',
            ...(isCard && { color: theme.pageTextSubdued }),
          }}
        >
          {schedule._date &&
            typeof schedule._date === 'object' &&
            schedule._date.frequency && (
              <SvgCheck style={{ width: 13, height: 13 }} />
            )}
        </Field>
      )}
      {!minimal && (
        <Field width={40} name="actions">
          <View>
            <Button
              ref={buttonRef}
              variant="bare"
              aria-label={t('Menu')}
              style={
                isCard
                  ? {
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      color: theme.pageTextSubdued,
                    }
                  : undefined
              }
              onPress={() => {
                if (rowRef.current) {
                  const rect = buttonRef.current?.getBoundingClientRect();
                  const clientX = rect ? rect.left : 0;
                  const clientY = rect ? rect.bottom : 0;
                  (rowRef.current as HTMLElement).dispatchEvent(
                    new MouseEvent('contextmenu', {
                      bubbles: true,
                      clientX,
                      clientY,
                    }),
                  );
                }
              }}
            >
              <SvgDotsHorizontalTriple
                width={15}
                height={15}
                style={{ transform: 'rotateZ(90deg)' }}
              />
            </Button>
          </View>
        </Field>
      )}
    </Row>
  );
}

export function SchedulesTable({
  isLoading,
  schedules,
  statuses,
  filter,
  minimal,
  allowCompleted,
  style,
  onSelect,
  onAction,
  isCard = false,
  tableStyle,
}: SchedulesTableProps) {
  const { t } = useTranslation();
  const format = useFormat();

  const dateFormat = useDateFormat() || 'MM/dd/yyyy';
  const [showCompleted, setShowCompleted] = useState(false);

  const { data: payees } = usePayees();
  const { data: accounts = [] } = useAccounts();

  const filteredSchedules = useMemo(() => {
    if (!filter) {
      return schedules;
    }
    const filterIncludes = (str: string) =>
      str
        ? getNormalisedString(str).includes(getNormalisedString(filter)) ||
          getNormalisedString(filter).includes(getNormalisedString(str))
        : false;

    return schedules.filter(schedule => {
      const payee = payees.find(p => schedule._payee === p.id);
      const account = accounts.find(a => schedule._account === a.id);
      const amount = getScheduledAmount(schedule._amount);
      let amountStr = '';
      if (schedule._amountOp === 'isbetween') {
        amountStr = '±';
      } else if (schedule._amountOp === 'isapprox') {
        amountStr = '~';
      }
      amountStr +=
        (amount > 0 ? '+' : '') + format(Math.abs(amount || 0), 'financial');
      const dateStr = schedule.next_date
        ? monthUtilFormat(schedule.next_date, dateFormat)
        : null;

      return (
        filterIncludes(schedule.name) ||
        filterIncludes(payee && payee.name) ||
        filterIncludes(account && account.name) ||
        filterIncludes(amountStr) ||
        filterIncludes(statuses.get(schedule.id)) ||
        filterIncludes(dateStr)
      );
    });
  }, [payees, accounts, schedules, filter, statuses, format, dateFormat]);

  const items: readonly SchedulesTableItem[] = useMemo(() => {
    const unCompletedSchedules = filteredSchedules.filter(s => !s.completed);

    if (!allowCompleted) {
      return unCompletedSchedules;
    }
    if (showCompleted) {
      return filteredSchedules;
    }

    const hasCompletedSchedule = filteredSchedules.find(s => s.completed);

    if (!hasCompletedSchedule) return unCompletedSchedules;

    return [...unCompletedSchedules, { id: 'show-completed' }];
  }, [filteredSchedules, showCompleted, allowCompleted]);

  function renderItem({ item }: { item: SchedulesTableItem }) {
    if (item.id === 'show-completed') {
      return (
        <Row
          height={rowHeight}
          inset={15}
          style={{
            cursor: 'pointer',
            backgroundColor: 'transparent',
            ':hover': { backgroundColor: theme.tableRowBackgroundHover },
            ...(isCard && {
              ':hover': { backgroundColor: theme.tableRowHover },
              '& > div': { borderColor: theme.cardHairline },
            }),
          }}
          onClick={() => setShowCompleted(true)}
        >
          <Field
            width="flex"
            style={{
              fontStyle: 'italic',
              textAlign: 'center',
              color: theme.tableText,
              // A quiet row on the card (design-decisions §10b).
              ...(isCard && {
                fontStyle: 'normal',
                fontWeight: 600,
                fontSize: 12.5,
                color: theme.pageTextSubdued,
              }),
            }}
          >
            <Trans>Show completed schedules</Trans>
          </Field>
        </Row>
      );
    }
    return (
      <ScheduleRow
        schedule={item as ScheduleEntity}
        {...{ statuses, dateFormat, onSelect, onAction, minimal }}
      />
    );
  }

  const rowHeight = isCard ? CARD_ROW_HEIGHT : ROW_HEIGHT;
  const headerFieldStyle = isCard ? eyebrowHeaderStyle : undefined;

  return (
    <ScheduleCardContext.Provider value={isCard}>
      <View
        style={{
          ...styles.tableContainer,
          // One Surface card with hairlines (design-decisions §10b).
          ...(isCard && {
            ...styles.surfaceCard,
            overflow: 'hidden',
          }),
          ...tableStyle,
        }}
      >
        <TableHeader
          height={isCard ? 38 : ROW_HEIGHT}
          inset={15}
          style={
            isCard
              ? {
                  backgroundColor: theme.cardBackground,
                  '& > div': {
                    borderTopWidth: 0,
                    borderColor: theme.cardHairline,
                  },
                }
              : undefined
          }
        >
          <Field width="flex" style={headerFieldStyle}>
            <Trans>Name</Trans>
          </Field>
          <Field width="flex" style={headerFieldStyle}>
            <Trans>Payee</Trans>
          </Field>
          <Field width="flex" style={headerFieldStyle}>
            <Trans>Account</Trans>
          </Field>
          <Field width={110} style={headerFieldStyle}>
            <Trans>Next date</Trans>
          </Field>
          <Field width={120} style={headerFieldStyle}>
            <Trans>Status</Trans>
          </Field>
          <Field
            width={100}
            style={{ ...headerFieldStyle, textAlign: 'right' }}
          >
            <Trans>Amount</Trans>
          </Field>
          {!minimal && (
            <Field
              width={isCard ? 96 : 80}
              style={{ ...headerFieldStyle, textAlign: 'center' }}
            >
              <Trans>Recurring</Trans>
            </Field>
          )}
          {!minimal && <Field width={40} />}
        </TableHeader>
        <Table
          loading={isLoading}
          rowHeight={rowHeight}
          backgroundColor="transparent"
          style={{ flex: 1, backgroundColor: 'transparent', ...style }}
          items={items as ScheduleEntity[]}
          renderItem={renderItem}
          renderEmpty={filter ? t('No matching schedules') : t('No schedules')}
        />
      </View>
    </ScheduleCardContext.Provider>
  );
}
