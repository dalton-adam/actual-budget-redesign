import React from 'react';
import type { ReactNode } from 'react';

import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import type { CSSProperties } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';

type ReportPageBodyProps = {
  children: ReactNode;
  style?: CSSProperties;
};

/**
 * The scrolling area under a report page's header (APP-03b): on desktop its
 * cards sit on the page background (prototype shots `55`, `56`). Mobile is
 * deferred (plan §19.4), so at narrow widths it keeps the upstream layout.
 */
export function ReportPageBody({ children, style }: ReportPageBodyProps) {
  const { isNarrowWidth } = useResponsive();

  return (
    <View
      style={{
        flex: '1 0 auto',
        overflowY: 'auto',
        ...(isNarrowWidth
          ? { backgroundColor: theme.tableBackground, padding: 20, gap: 30 }
          : { padding: '0 20px 20px', gap: 16 }),
        paddingTop: 0,
        ...style,
      }}
    >
      {children}
    </View>
  );
}
