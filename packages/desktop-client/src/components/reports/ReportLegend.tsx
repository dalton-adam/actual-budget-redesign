import React from 'react';

import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';

import { ReportOptions } from './ReportOptions';

type ReportLegendProps = {
  legend?: Array<{ name: string; color: string }>;
  groupBy: string;
  interval: string;
  /** In columns under the chart rather than a list beside it. */
  isRow?: boolean;
};

/**
 * The custom report's legend (APP-03c): the split's name over one row per
 * series, each with its chart colour, inside the chart card.
 */
export function ReportLegend({
  legend,
  groupBy,
  interval,
  isRow = false,
}: ReportLegendProps) {
  return (
    <View style={{ gap: 4, minHeight: 0, flex: isRow ? undefined : 1 }}>
      <Text
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: theme.pageTextSecondary,
        }}
      >
        {groupBy === 'Interval'
          ? ReportOptions.intervalMap.get(interval)
          : groupBy}
      </Text>
      <View
        style={{
          overflowY: 'auto',
          ...(isRow && {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            columnGap: 24,
          }),
        }}
      >
        {legend?.map(item => (
          <View
            key={item.name}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              minHeight: 28,
              fontSize: 12.5,
              color: theme.pageText,
            }}
          >
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 3,
                flexShrink: 0,
                backgroundColor: item.color,
              }}
            />
            <Text
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {item.name}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
