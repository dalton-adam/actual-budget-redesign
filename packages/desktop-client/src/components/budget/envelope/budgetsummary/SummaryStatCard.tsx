import React from 'react';
import type { ReactNode } from 'react';

import { styles } from '@actual-app/components/styles';
import { SurfaceCard } from '@actual-app/components/surface-card';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';

type SummaryStatCardProps = {
  label: ReactNode;
  value: ReactNode;
  footer?: ReactNode;
};

/** A month summary card: label, headline amount and an optional footer. */
export function SummaryStatCard({
  label,
  value,
  footer,
}: SummaryStatCardProps) {
  return (
    <SurfaceCard
      role="group"
      style={{ flex: 1, minWidth: 0, padding: '16px 20px' }}
    >
      <View style={{ color: theme.pageTextSecondary, fontSize: 13 }}>
        {label}
      </View>
      <View
        style={{
          fontSize: 28,
          fontWeight: 700,
          lineHeight: 1.25,
          marginTop: 2,
          ...styles.tnum,
        }}
      >
        {value}
      </View>
      {footer && <View style={{ marginTop: 6 }}>{footer}</View>}
    </SurfaceCard>
  );
}
