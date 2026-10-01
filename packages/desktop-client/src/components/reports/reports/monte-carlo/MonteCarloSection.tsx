import type { ReactNode } from 'react';

import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import type { CSSProperties } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';

import { ReportPageCard } from '#components/reports/ReportPageCard';

type MonteCarloSectionProps = {
  children: ReactNode;
  style?: CSSProperties;
};

/**
 * One of the Monte Carlo report's sections: a report page card on desktop
 * (APP-03d); at narrow widths, where mobile keeps the upstream layout (plan
 * §19.4), the block it was before.
 */
export function MonteCarloSection({ children, style }: MonteCarloSectionProps) {
  const { isNarrowWidth } = useResponsive();

  if (isNarrowWidth) {
    return (
      <View
        style={{
          backgroundColor: theme.tableBackground,
          padding: 20,
          flexShrink: 0,
          ...style,
        }}
      >
        {children}
      </View>
    );
  }

  return (
    <ReportPageCard style={{ flexShrink: 0, ...style }}>
      {children}
    </ReportPageCard>
  );
}
