import React from 'react';

import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';

import { getCategoryAccentIndex } from '#components/budget/categoryPresentation';
import type { SpendingBarSegment } from '#components/budget/categoryPresentation';

type ActivityStackedBarProps = {
  segments: SpendingBarSegment[];
};

/**
 * Decorative split of the month's spending (design-decisions §3, §7.4).
 * Hidden from assistive technology: the Activity amount beside it carries
 * the meaning.
 */
export function ActivityStackedBar({ segments }: ActivityStackedBarProps) {
  return (
    <View
      aria-hidden="true"
      data-testid="activity-stacked-bar"
      style={{
        flexDirection: 'row',
        gap: 2,
        height: 6,
        borderRadius: 99,
        overflow: 'hidden',
        backgroundColor: theme.progressTrack,
      }}
    >
      {segments.map(segment => (
        <View
          key={segment.type === 'category' ? segment.categoryId : segment.type}
          style={{
            flex: `${segment.value} 1 0`,
            minWidth: 2,
            backgroundColor: getSegmentColor(segment),
          }}
        />
      ))}
    </View>
  );
}

function getSegmentColor(segment: SpendingBarSegment) {
  switch (segment.type) {
    case 'category':
      return theme[
        `categoryAccent${getCategoryAccentIndex(segment.categoryId)}` as keyof typeof theme
      ];
    case 'other':
      return theme.pageTextFaint;
    default:
      return theme.progressTrack;
  }
}
