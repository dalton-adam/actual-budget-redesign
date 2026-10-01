import React, { useCallback, useMemo, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgAdd } from '@actual-app/components/icons/v1';
import { SpaceBetween } from '@actual-app/components/space-between';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import { send } from '@actual-app/core/platform/client/connection';
import { q } from '@actual-app/core/shared/query';
import type { ScheduleEntity } from '@actual-app/core/types/models';

import { Search } from '#components/common/Search';
import { FeatureErrorFallback } from '#components/FeatureErrorFallback';
import { Page, PageHeader } from '#components/Page';
import { useSchedules } from '#hooks/useSchedules';
import { pushModal } from '#modals/modalsSlice';
import { useDispatch } from '#redux';

import { SchedulesTable } from './SchedulesTable';
import type { ScheduleItemAction } from './SchedulesTable';

export function Schedules() {
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const [filter, setFilter] = useState('');

  const onEdit = useCallback(
    (id: ScheduleEntity['id']) => {
      dispatch(
        pushModal({ modal: { name: 'schedule-edit', options: { id } } }),
      );
    },
    [dispatch],
  );

  const onAdd = useCallback(() => {
    dispatch(pushModal({ modal: { name: 'schedule-edit', options: {} } }));
  }, [dispatch]);

  const onDiscover = useCallback(() => {
    dispatch(pushModal({ modal: { name: 'schedules-discover' } }));
  }, [dispatch]);

  const onChangeUpcomingLength = useCallback(() => {
    dispatch(pushModal({ modal: { name: 'schedules-upcoming-length' } }));
  }, [dispatch]);

  const onAction = useCallback(
    async (name: ScheduleItemAction, id: ScheduleEntity['id']) => {
      switch (name) {
        case 'post-transaction':
          await send('schedule/post-transaction', { id });
          break;
        case 'post-transaction-today':
          await send('schedule/post-transaction', { id, today: true });
          break;
        case 'skip':
          await send('schedule/skip-next-date', { id });
          break;
        case 'complete':
          await send('schedule/update', {
            schedule: { id, completed: true },
          });
          break;
        case 'restart':
          await send('schedule/update', {
            schedule: { id, completed: false },
            resetNextDate: true,
          });
          break;
        case 'delete':
          await send('schedule/delete', { id });
          break;
        default:
          throw new Error(`Unknown action: ${String(name)}`);
      }
    },
    [],
  );

  const schedulesQuery = useMemo(() => q('schedules').select('*'), []);
  const {
    isLoading: isSchedulesLoading,
    schedules,
    statuses,
  } = useSchedules({ query: schedulesQuery });

  return (
    <ErrorBoundary FallbackComponent={FeatureErrorFallback}>
      <Page
        header={
          // Display title, as on the account and report pages (APP-04).
          <PageHeader
            title={
              <Text style={scheduleTitleStyle}>
                <Trans>Schedules</Trans>
              </Text>
            }
            style={{ marginTop: 6 }}
          />
        }
      >
        <SpaceBetween
          gap={8}
          wrap={false}
          style={{ margin: '14px 0', flexShrink: 0 }}
        >
          <Button
            variant="primary"
            onPress={onAdd}
            style={{ gap: 6, borderRadius: 9, minHeight: 30 }}
          >
            <SvgAdd width={10} height={10} />
            <Trans>Add new schedule</Trans>
          </Button>
          <Button variant="control" onPress={onDiscover}>
            <Trans>Find schedules</Trans>
          </Button>
          <Button variant="control" onPress={onChangeUpcomingLength}>
            <Trans>Change upcoming length</Trans>
          </Button>
          <View style={{ flex: 1 }} />
          <Search
            placeholder={t('Filter schedules…')}
            value={filter}
            onChange={setFilter}
          />
        </SpaceBetween>

        <SchedulesTable
          isLoading={isSchedulesLoading}
          schedules={schedules}
          filter={filter}
          statuses={statuses}
          allowCompleted
          isCard
          onSelect={onEdit}
          onAction={onAction}
          style={{ backgroundColor: theme.cardBackground }}
          tableStyle={{ marginBottom: 20 }}
        />
      </Page>
    </ErrorBoundary>
  );
}

const scheduleTitleStyle = {
  fontSize: 28,
  fontWeight: 700,
  letterSpacing: -0.4,
  lineHeight: 1.2,
} as const;
