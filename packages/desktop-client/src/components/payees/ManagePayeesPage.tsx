import React from 'react';
import { Trans } from 'react-i18next';
import { useLocation } from 'react-router';

import { Text } from '@actual-app/components/text';
import type { PayeeEntity } from '@actual-app/core/types/models';

import { Page, PageHeader } from '#components/Page';

import { ManagePayeesWithData } from './ManagePayeesWithData';

export function ManagePayeesPage() {
  const location = useLocation();
  const locationState = location.state;
  const initialSelectedIds =
    locationState && 'selectedPayee' in locationState
      ? [locationState.selectedPayee as PayeeEntity['id']]
      : [];
  return (
    <Page
      header={
        // Display title, as on the account, report and schedule pages
        // (APP-05a).
        <PageHeader
          title={
            <Text style={payeesTitleStyle}>
              <Trans>Payees</Trans>
            </Text>
          }
          style={{ marginTop: 6 }}
        />
      }
    >
      <ManagePayeesWithData initialSelectedIds={initialSelectedIds} />
    </Page>
  );
}

const payeesTitleStyle = {
  fontSize: 28,
  fontWeight: 700,
  letterSpacing: -0.4,
  lineHeight: 1.2,
} as const;
