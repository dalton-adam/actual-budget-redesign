import React from 'react';
import type { ReactNode } from 'react';

import { Button } from '@actual-app/components/button';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';

type ReportSegmentedControlProps<T extends string> = {
  options: ReadonlyArray<{ value: T; label: ReactNode }>;
  value: T;
  onChange: (value: T) => void;
};

/**
 * A choice between a few report modes, such as Live/Static, as a segmented
 * control on a report page (APP-03b). Choosing the selected segment again
 * does nothing.
 */
export function ReportSegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: ReportSegmentedControlProps<T>) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        padding: 2,
        borderRadius: 11,
        backgroundColor: theme.navTrack,
        flexShrink: 0,
      }}
    >
      {options.map(option => {
        const isSelected = option.value === value;
        return (
          <Button
            key={option.value}
            variant={isSelected ? 'tabSelected' : 'tab'}
            aria-pressed={isSelected}
            onPress={() => {
              if (!isSelected) {
                onChange(option.value);
              }
            }}
            style={{ minHeight: 26, padding: '0 12px' }}
          >
            {option.label}
          </Button>
        );
      })}
    </View>
  );
}
