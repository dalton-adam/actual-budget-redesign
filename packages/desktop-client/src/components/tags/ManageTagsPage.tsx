import React from 'react';
import { Trans } from 'react-i18next';

import { Text } from '@actual-app/components/text';

import { Page, PageHeader } from '#components/Page';

import { ManageTags } from './ManageTags';

export const ManageTagsPage = () => {
  return (
    <Page
      header={
        // Display title, as on the payee and rule pages (APP-05c).
        <PageHeader
          title={
            <Text style={tagsTitleStyle}>
              <Trans>Tags</Trans>
            </Text>
          }
          style={{ marginTop: 6 }}
        />
      }
    >
      <ManageTags />
    </Page>
  );
};

const tagsTitleStyle = {
  fontSize: 28,
  fontWeight: 700,
  letterSpacing: -0.4,
  lineHeight: 1.2,
} as const;
