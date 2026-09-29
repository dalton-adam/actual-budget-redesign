import React from 'react';
import { Trans } from 'react-i18next';

import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import {
  Area,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';

import { useRechartsAnimation } from '#components/reports/chart-theme';

import { getEvenPace } from './categoryPresentation';
import type { CategoryPace } from './categoryPresentation';

export const PACE_CHART_HEIGHT = 110;

type CategoryDetailsPaceChartProps = {
  pace: CategoryPace;
  /** Series colour: the category accent, or negative when overspent. */
  color: string;
};

/**
 * Cumulative spending by day against a dashed even-pace line
 * (design-decisions §7.2). Decoration only: the section's accessible name
 * and summary say the same thing in words.
 */
export function CategoryDetailsPaceChart({
  pace,
  color,
}: CategoryDetailsPaceChartProps) {
  const animationProps = useRechartsAnimation({ isAnimationActive: false });
  const { days, upto, start, series, kind, hasPaceLine } = pace;

  // x is the end of day x; day 0 is the start of the month at zero spent.
  const data = Array.from({ length: days + 1 }, (_, day) => ({
    day,
    spent: day <= upto ? (day === 0 ? 0 : series[day - 1]) : null,
    even: getEvenPace(start, day, days),
  }));
  const values = [0, ...series, hasPaceLine ? start : 0];
  const min = Math.min(...values);
  const max = Math.max(...values, 1) * 1.08;

  return (
    <View
      aria-hidden
      data-testid="category-details-pace-chart"
      style={{ position: 'relative', height: PACE_CHART_HEIGHT }}
    >
      <ResponsiveContainer width="100%" height={PACE_CHART_HEIGHT}>
        <ComposedChart
          data={data}
          margin={{ top: 4, right: 1, bottom: 1, left: 1 }}
        >
          <XAxis type="number" dataKey="day" domain={[0, days]} hide />
          <YAxis type="number" domain={[min, max]} hide />
          {hasPaceLine && (
            <Line
              dataKey="even"
              type="linear"
              stroke={theme.pageTextFaint}
              strokeWidth={1.5}
              strokeDasharray="4 5"
              dot={false}
              activeDot={false}
              {...animationProps}
            />
          )}
          {kind !== 'future' && (
            <Area
              dataKey="spent"
              type="stepBefore"
              stroke={color}
              strokeWidth={2.5}
              fill={color}
              fillOpacity={0.18}
              dot={false}
              activeDot={false}
              connectNulls={false}
              {...animationProps}
            />
          )}
          {kind === 'current' && (
            <ReferenceLine
              x={upto}
              stroke={theme.pageTextFaint}
              strokeDasharray="2 3"
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
      {kind === 'future' && (
        <View
          style={{
            position: 'absolute',
            inset: 0,
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            color: theme.pageTextSecondary,
          }}
        >
          <View
            style={{
              padding: '3px 8px',
              borderRadius: 6,
              backgroundColor: theme.cardInset,
            }}
          >
            <Trans>No activity yet</Trans>
          </View>
        </View>
      )}
    </View>
  );
}
