import React from 'react';

import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';

import { FinancialText } from '#components/FinancialText';
import { PrivacyFilter } from '#components/PrivacyFilter';

type CategoryDetailsStatTileProps = {
  testId: string;
  label: string;
  value: string;
};

/** One of the details panel's small stat tiles (design-decisions §5, item 3). */
export function CategoryDetailsStatTile({
  testId,
  label,
  value,
}: CategoryDetailsStatTileProps) {
  return (
    <View
      data-testid={testId}
      style={{
        flex: 1,
        minWidth: 0,
        padding: '8px 10px',
        borderRadius: 10,
        backgroundColor: theme.cardInset,
        gap: 2,
      }}
    >
      <View
        style={{
          fontSize: 12,
          color: theme.pageTextSecondary,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {label}
      </View>
      <PrivacyFilter>
        <FinancialText
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: theme.pageText,
            overflowWrap: 'anywhere',
          }}
        >
          {value}
        </FinancialText>
      </PrivacyFilter>
    </View>
  );
}
