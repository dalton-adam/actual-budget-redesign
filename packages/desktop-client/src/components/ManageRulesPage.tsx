import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Trans } from 'react-i18next';

import { Text } from '@actual-app/components/text';

import { FeatureErrorFallback } from '#components/FeatureErrorFallback';

import { ManageRules } from './ManageRules';
import { Page, PageHeader } from './Page';

export function ManageRulesPage() {
  return (
    <ErrorBoundary FallbackComponent={FeatureErrorFallback}>
      <Page
        header={
          // Display title, as on the account, report, schedule and payee
          // pages (APP-05b).
          <PageHeader
            title={
              <Text style={rulesTitleStyle}>
                <Trans>Rules</Trans>
              </Text>
            }
            style={{ marginTop: 6 }}
          />
        }
      >
        <ManageRules isModal={false} payeeId={null} />
      </Page>
    </ErrorBoundary>
  );
}

const rulesTitleStyle = {
  fontSize: 28,
  fontWeight: 700,
  letterSpacing: -0.4,
  lineHeight: 1.2,
} as const;
