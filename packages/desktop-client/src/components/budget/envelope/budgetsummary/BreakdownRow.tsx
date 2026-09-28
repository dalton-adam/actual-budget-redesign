import React from 'react';
import type { ReactNode } from 'react';

import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';

type BreakdownRowProps = {
  label: ReactNode;
  isTotal?: boolean;
  children: ReactNode;
};

export function BreakdownRow({
  label,
  isTotal = false,
  children,
}: BreakdownRowProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        gap: 16,
        lineHeight: 1.8,
        color: isTotal ? theme.pageText : theme.pageTextSecondary,
        fontWeight: isTotal ? 700 : 400,
      }}
    >
      <View>{label}</View>
      <View style={{ textAlign: 'right' }}>{children}</View>
    </View>
  );
}
