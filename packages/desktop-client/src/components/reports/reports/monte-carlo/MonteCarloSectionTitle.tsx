import type { ReactNode } from 'react';

import type { CSSProperties } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';

type MonteCarloSectionTitleProps = {
  children: ReactNode;
  style?: CSSProperties;
};

/** A Monte Carlo section's title, at the report cards' title size. */
export function MonteCarloSectionTitle({
  children,
  style,
}: MonteCarloSectionTitleProps) {
  return (
    <View
      style={{
        fontSize: 15,
        fontWeight: 600,
        lineHeight: 1.35,
        color: theme.pageText,
        ...style,
      }}
    >
      {children}
    </View>
  );
}
