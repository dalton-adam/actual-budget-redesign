// @ts-strict-ignore
import React, { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { ButtonWithLoading } from '@actual-app/components/button';
import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import { Paragraph } from '@actual-app/components/paragraph';
import { SpaceBetween } from '@actual-app/components/space-between';
import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import { send } from '@actual-app/core/platform/client/connection';
import { q } from '@actual-app/core/shared/query';
import type { DiscoverScheduleEntity } from '@actual-app/core/types/models';
import { css } from '@emotion/css';

import {
  dialogEyebrowStyle,
  dialogPrimaryButtonStyle,
  dialogTableCardStyle,
} from '#components/common/dialogStyles';
import { Modal, ModalCloseButton, ModalHeader } from '#components/common/Modal';
import { Field, Row, SelectCell, Table, TableHeader } from '#components/table';
import { DisplayId } from '#components/util/DisplayId';
import { useDateFormat } from '#hooks/useDateFormat';
import { useLocale } from '#hooks/useLocale';
import {
  SelectedProvider,
  useSelected,
  useSelectedDispatch,
  useSelectedItems,
} from '#hooks/useSelected';
import { useSendPlatformRequest } from '#hooks/useSendPlatformRequest';
import { aqlQuery } from '#queries/aqlQuery';
import { getRecurringDescription } from '#util/schedule';

import { ScheduleAmountCell } from './SchedulesTable';

const ROW_HEIGHT = 43;
/** Row height of the card look (design-decisions §10k). */
const CARD_ROW_HEIGHT = 44;

function DiscoverSchedulesTable({
  schedules,
  loading,
  isCard,
}: {
  schedules: DiscoverScheduleEntity[];
  loading: boolean;
  isCard: boolean;
}) {
  const { t } = useTranslation();

  const selectedItems = useSelectedItems();
  const dispatchSelected = useSelectedDispatch();
  const dateFormat = useDateFormat() || 'MM/dd/yyyy';
  const locale = useLocale();

  function renderItem({ item }: { item: DiscoverScheduleEntity }) {
    const selected = selectedItems.has(item.id);
    const amountOp = item._conditions.find(c => c.field === 'amount').op;
    const recurDescription = getRecurringDescription(
      item.date,
      dateFormat,
      locale,
    );

    return (
      <Row
        height={isCard ? CARD_ROW_HEIGHT : ROW_HEIGHT}
        inset={15}
        onClick={e => {
          dispatchSelected({
            type: 'select',
            id: item.id,
            isRangeSelect: e.shiftKey,
          });
        }}
        style={{
          borderColor: selected ? theme.tableBorderSelected : theme.tableBorder,
          cursor: 'pointer',
          color: selected
            ? theme.tableRowBackgroundHighlightText
            : theme.tableText,
          backgroundColor: selected
            ? theme.tableRowBackgroundHighlight
            : theme.tableBackground,
          ':hover': {
            backgroundColor: theme.tableRowBackgroundHover,
            color: theme.tableText,
          },
          // Hairline rows, selection tint (design-decisions §10k).
          ...(isCard && {
            color: theme.tableText,
            backgroundColor: selected
              ? theme.selectionBackground
              : theme.cardBackground,
            ':hover': {
              backgroundColor: selected
                ? theme.selectionBackground
                : theme.tableRowHover,
            },
            '& > div': { borderColor: theme.cardHairline },
          }),
        }}
      >
        <SelectCell
          exposed
          focused={false}
          selected={selected}
          onSelect={e => {
            dispatchSelected({
              type: 'select',
              id: item.id,
              isRangeSelect: e.shiftKey,
            });
          }}
        />
        <Field width="flex" style={isCard ? { fontWeight: 600 } : undefined}>
          <DisplayId type="payees" id={item.payee} />
        </Field>
        <Field
          width="flex"
          style={isCard ? { color: theme.pageTextSecondary } : undefined}
        >
          <DisplayId type="accounts" id={item.account} />
        </Field>
        <Field width="auto" title={recurDescription} style={{ flex: 1.5 }}>
          {recurDescription}
        </Field>
        <ScheduleAmountCell amount={item.amount} op={amountOp} />
      </Row>
    );
  }

  const headerFieldStyle = isCard ? dialogEyebrowStyle : undefined;

  return (
    <View
      style={
        isCard
          ? { ...dialogTableCardStyle, flex: '1 1 auto', minHeight: 0 }
          : styles.tableContainer
      }
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
        <SelectCell
          exposed={!loading}
          focused={false}
          selected={selectedItems.size > 0}
          onSelect={e =>
            dispatchSelected({ type: 'select-all', isRangeSelect: e.shiftKey })
          }
        />
        <Field width="flex" style={headerFieldStyle}>
          <Trans>Payee</Trans>
        </Field>
        <Field width="flex" style={headerFieldStyle}>
          <Trans>Account</Trans>
        </Field>
        <Field width="auto" style={{ ...headerFieldStyle, flex: 1.5 }}>
          <Trans>When</Trans>
        </Field>
        <Field width={100} style={{ ...headerFieldStyle, textAlign: 'right' }}>
          <Trans>Amount</Trans>
        </Field>
      </TableHeader>
      <Table
        rowHeight={isCard ? CARD_ROW_HEIGHT : ROW_HEIGHT}
        style={{
          flex: 1,
          backgroundColor: 'transparent',
          // The dialog fits its rows, so the table needs a real basis.
          ...(isCard && {
            flex: `1 1 ${CARD_ROW_HEIGHT * Math.max(2, schedules.length)}px`,
          }),
        }}
        items={schedules}
        loading={loading}
        isSelected={id => selectedItems.has(String(id))}
        renderItem={renderItem}
        renderEmpty={t('No schedules found')}
      />
    </View>
  );
}

export function DiscoverSchedules() {
  const { t } = useTranslation();
  const { isNarrowWidth } = useResponsive();
  const isCard = !isNarrowWidth;

  const { data, isLoading } = useSendPlatformRequest('schedule/discover');

  const schedules = data || [];

  const [creating, setCreating] = useState(false);

  const selectedInst = useSelected<DiscoverScheduleEntity>(
    'discover-schedules',
    schedules,
    [],
  );

  async function onCreate() {
    const selected = schedules.filter(s => selectedInst.items.has(s.id));
    setCreating(true);

    for (const schedule of selected) {
      const scheduleId = await send('schedule/create', {
        conditions: schedule._conditions,
        schedule: {},
      });

      // Now query for matching transactions and link them automatically
      const { filters } = await send('make-filters-from-conditions', {
        conditions: schedule._conditions,
      });

      if (filters.length > 0) {
        const { data: transactions } = await aqlQuery(
          q('transactions').filter({ $and: filters }).select('id'),
        );

        await send('transactions-batch-update', {
          updated: transactions.map(t => ({
            id: t.id,
            schedule: scheduleId,
          })),
        });
      }
    }

    setCreating(false);
  }

  const paragraphStyle = isCard
    ? { fontSize: 13.5, color: theme.pageTextSecondary }
    : undefined;

  return (
    <Modal
      name="schedules-discover"
      containerProps={{
        // On desktop the dialog fits its rows, up to 650px.
        style: isCard
          ? { width: 850, maxHeight: 650 }
          : { width: 850, height: 650 },
      }}
    >
      {({ state }) => (
        <>
          <ModalHeader
            title={t('Found Schedules')}
            rightContent={<ModalCloseButton onPress={() => state.close()} />}
          />
          <Paragraph style={paragraphStyle}>
            <Trans>
              We found some possible schedules in your current transactions.
              Select the ones you want to create.
            </Trans>
          </Paragraph>
          <Paragraph style={paragraphStyle}>
            <Trans>
              If you expected a schedule here and don't see it, it might be
              because the payees of the transactions don't match. Make sure you
              rename payees on all transactions for a schedule to be the same
              payee.
            </Trans>
          </Paragraph>

          <SelectedProvider instance={selectedInst}>
            <DiscoverSchedulesTable
              loading={isLoading}
              schedules={schedules}
              isCard={isCard}
            />
          </SelectedProvider>

          <SpaceBetween
            style={{
              paddingTop: 20,
              paddingBottom: 0,
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
          >
            <ButtonWithLoading
              variant="primary"
              className={isCard ? css(dialogPrimaryButtonStyle) : undefined}
              isLoading={creating}
              isDisabled={selectedInst.items.size === 0}
              onPress={() => {
                void onCreate();
                state.close();
              }}
            >
              <Trans>Create schedules</Trans>
            </ButtonWithLoading>
          </SpaceBetween>
        </>
      )}
    </Modal>
  );
}
