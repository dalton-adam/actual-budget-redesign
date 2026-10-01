import React from 'react';
import type { ComponentProps } from 'react';

import { Button } from '@actual-app/components/button';
import { SvgFilter } from '@actual-app/components/icons/v1';

type CompactFiltersButtonProps = {
  onPress: () => void;
  variant?: ComponentProps<typeof Button>['variant'];
};

export function CompactFiltersButton({
  onPress,
  variant = 'bare',
}: CompactFiltersButtonProps) {
  return (
    <Button variant={variant} onPress={onPress} style={{ minWidth: 20 }}>
      <SvgFilter
        width={15}
        height={15}
        style={{ width: 15, height: 15, flexShrink: 0 }}
      />
    </Button>
  );
}
