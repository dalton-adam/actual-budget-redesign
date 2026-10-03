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
        flex: '1 1 0',
        // Never narrower than its value, so the row wraps a tile onto the
        // next line rather than splitting a number.
        minWidth: 'max-content',
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
            // Long amounts step down a size so three tiles still fit.
            fontSize: value.length > 8 ? 13 : 15,
            fontWeight: 600,
            color: theme.pageText,
            whiteSpace: 'nowrap',
          }}
        >
          {value}
        </FinancialText>
      </PrivacyFilter>
    </View>
  );
}
