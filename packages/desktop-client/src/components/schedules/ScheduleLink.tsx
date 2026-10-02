// @ts-strict-ignore
import React, { useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import { SvgAdd } from '@actual-app/components/icons/v0';
import { InitialFocus } from '@actual-app/components/initial-focus';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import { send } from '@actual-app/core/platform/client/connection';
import { q } from '@actual-app/core/shared/query';
import { css } from '@emotion/css';

import { dialogPrimaryButtonStyle } from '#components/common/dialogStyles';
import { Modal, ModalCloseButton, ModalHeader } from '#components/common/Modal';
import { Search } from '#components/common/Search';
import { useSchedules } from '#hooks/useSchedules';
import { pushModal } from '#modals/modalsSlice';
import type { Modal as ModalType } from '#modals/modalsSlice';
import { useDispatch } from '#redux';

import { ROW_HEIGHT, SchedulesTable } from './SchedulesTable';

type ScheduleLinkProps = Extract<
  ModalType,
  { name: 'schedule-link' }
>['options'];

export function ScheduleLink({
  transactionIds: ids,
  getTransaction,
  accountName,
  onScheduleLinked,
}: ScheduleLinkProps) {
  const { t } = useTranslation();
  const { isNarrowWidth } = useResponsive();
  // The sentence on its own line, the search at the left, "Create New" at
  // the right and the Schedules card table (design-decisions §10k).
  const isCard = !isNarrowWidth;

  const dispatch = useDispatch();
  const [filter, setFilter] = useState(accountName || '');
  const schedulesQuery = useMemo(
    () => q('schedules').filter({ completed: false }).select('*'),
    [],
  );
  const {
    isLoading: isSchedulesLoading,
    schedules,
    statuses,
  } = useSchedules({ query: schedulesQuery });

  const searchInput = useRef<HTMLInputElement | null>(null);

  async function onSelect(scheduleId: string) {
    if (ids?.length > 0) {
      await send('transactions-batch-update', {
        updated: ids.map(id => ({ id, schedule: scheduleId })),
      });
      onScheduleLinked?.(schedules.find(s => s.id === scheduleId));
    }
  }

  async function onCreate() {
    dispatch(
      pushModal({
        modal: {
          name: 'schedule-edit',
          options: {
            id: null,
            transaction: getTransaction(ids[0]),
          },
        },
      }),
    );
  }

  return (
    <Modal
      name="schedule-link"
      containerProps={{
        style: {
          width: 800,
        },
      }}
    >
      {({ state }) => (
        <>
          <ModalHeader
            title={t('Link schedule')}
            rightContent={<ModalCloseButton onPress={() => state.close()} />}
          />
          {isCard && (
            <Text
              style={{
                fontSize: 13.5,
                color: theme.pageTextSecondary,
                marginBottom: 12,
              }}
            >
              {t(
                'Choose the schedule these {{ count }} transactions belong to:',
                { count: ids?.length ?? 0 },
              )}
            </Text>
          )}
          <View
            style={{
              flexDirection: 'row',
              gap: 4,
              marginBottom: 20,
              alignItems: 'center',
              ...(isCard && { gap: 8, marginBottom: 0 }),
            }}
          >
            {!isCard && (
              <Text>
                {t(
                  'Choose the schedule these {{ count }} transactions belong to:',
                  { count: ids?.length ?? 0 },
                )}
              </Text>
            )}
            <InitialFocus<HTMLInputElement>>
              {node => (
                <Search
                  ref={r => {
                    node.current = r;
                    searchInput.current = r;
                  }}
                  isInModal
                  width={300}
                  placeholder={t('Filter schedules…')}
                  value={filter}
                  onChange={setFilter}
                />
              )}
            </InitialFocus>
            {ids.length === 1 && (
              <Button
                variant="primary"
                style={
                  isCard
                    ? { marginLeft: 'auto' }
                    : { marginLeft: 15, padding: '4px 10px' }
                }
                className={
                  isCard
                    ? css({ ...dialogPrimaryButtonStyle, gap: 4 })
                    : undefined
                }
                onPress={() => {
                  state.close();
                  void onCreate();
                }}
              >
                <SvgAdd
                  style={
                    isCard
                      ? { width: 12, height: 12 }
                      : { width: '20', padding: '3' }
                  }
                />
                <Trans>Create New</Trans>
              </Button>
            )}
          </View>

          <View
            style={{
              flex: `1 1 ${
                (ROW_HEIGHT - 1) * (Math.max(schedules.length, 1) + 1)
              }px`,
              marginTop: isCard ? 14 : 15,
              maxHeight: '50vh',
            }}
          >
            <SchedulesTable
              isLoading={isSchedulesLoading}
              allowCompleted={false}
              filter={filter}
              minimal
              onSelect={id => {
                void onSelect(id);
                state.close();
              }}
              schedules={schedules}
              statuses={statuses}
              isCard={isCard}
              // A hairline card inside the dialog, without elevation.
              tableStyle={
                isCard ? { borderRadius: 12, boxShadow: 'none' } : undefined
              }
              style={null}
            />
          </View>
        </>
      )}
    </Modal>
  );
}
