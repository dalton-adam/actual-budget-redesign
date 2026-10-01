import React from 'react';
import type { ComponentProps } from 'react';
import { Trans } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgFilter } from '@actual-app/components/icons/v1';

type FiltersButtonProps = {
  onPress: () => void;
  variant?: ComponentProps<typeof Button>['variant'];
};

export function FiltersButton({
  onPress,
  variant = 'bare',
}: FiltersButtonProps) {
  return (
    <Button variant={variant} onPress={onPress}>
      <SvgFilter
        style={{ width: 12, height: 12, marginRight: 5, flexShrink: 0 }}
      />{' '}
      <Trans>Filter</Trans>
    </Button>
  );
}
