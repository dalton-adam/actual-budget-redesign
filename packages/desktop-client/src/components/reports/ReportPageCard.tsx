import React from 'react';
import type { ReactNode } from 'react';

import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import type { CSSProperties } from '@actual-app/components/styles';
import { SurfaceCard } from '@actual-app/components/surface-card';
import { View } from '@actual-app/components/view';

import { REPORT_PAGE_CARD_STYLE } from './constants';

type ReportPageCardProps = {
  children: ReactNode;
  style?: CSSProperties;
};

/**
 * A report page's chart or explanation card (APP-03b): a hairline Surface
 * card with no shadow on desktop; a plain block at narrow widths, where
 * mobile keeps the upstream layout (plan §19.4).
 */
export function ReportPageCard({ children, style }: ReportPageCardProps) {
  const { isNarrowWidth } = useResponsive();

  if (isNarrowWidth) {
    return <View style={style}>{children}</View>;
  }

  return (
    <SurfaceCard style={{ ...REPORT_PAGE_CARD_STYLE, ...style }}>
      {children}
    </SurfaceCard>
  );
}
