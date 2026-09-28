import { forwardRef } from 'react';
import type { ComponentProps } from 'react';

import { styles } from './styles';
import { theme } from './theme';
import { View } from './View';

type SurfaceCardProps = ComponentProps<typeof View>;

/**
 * The redesign's card surface (docs/redesign/design-decisions.md §1, §3):
 * hairline border, large radius and the theme's card elevation. Separate
 * from `Card` so existing screens keep their look.
 */
export const SurfaceCard = forwardRef<HTMLDivElement, SurfaceCardProps>(
  ({ style, ...props }, ref) => (
    <View
      {...props}
      ref={ref}
      style={{ ...styles.surfaceCard, color: theme.pageText, ...style }}
    />
  ),
);

SurfaceCard.displayName = 'SurfaceCard';
