import React from 'react';
import type { ReactNode } from 'react';

import { Button } from '@actual-app/components/button';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { Tooltip } from '@actual-app/components/tooltip';
import { View } from '@actual-app/components/view';

type ReportSegmentedControlOption<T extends string> = {
  value: T;
  label: ReactNode;
  /** The segment's accessible name and tooltip, for icon-only segments. */
  title?: string;
  isDisabled?: boolean;
};

type ReportSegmentedControlProps<T extends string> = {
  options: ReadonlyArray<ReportSegmentedControlOption<T>>;
  value: T;
  onChange: (value: T) => void;
  /** Square segments for icons (the custom report's chart types). */
  isIconOnly?: boolean;
  'aria-label'?: string;
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
  isIconOnly = false,
  'aria-label': ariaLabel,
}: ReportSegmentedControlProps<T>) {
  return (
    <View
      role="group"
      aria-label={ariaLabel}
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
        const segment = (
          <Button
            key={option.value}
            variant={isSelected ? 'tabSelected' : 'tab'}
            aria-pressed={isSelected}
            aria-label={option.title}
            isDisabled={option.isDisabled}
            onPress={() => {
              if (!isSelected) {
                onChange(option.value);
              }
            }}
            style={
              isIconOnly
                ? { minHeight: 28, width: 32, padding: 0 }
                : { minHeight: 26, padding: '0 12px' }
            }
          >
            {option.label}
          </Button>
        );
        return option.title ? (
          <Tooltip
            key={option.value}
            placement="bottom start"
            content={<Text>{option.title}</Text>}
            style={{ ...styles.tooltip, lineHeight: 1.5, padding: '6px 10px' }}
          >
            {segment}
          </Tooltip>
        ) : (
          segment
        );
      })}
    </View>
  );
}
