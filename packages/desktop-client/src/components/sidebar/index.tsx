import React from 'react';

import { useResponsive } from '@actual-app/components/hooks/useResponsive';

import { Sidebar } from './Sidebar';

export function FloatableSidebar() {
  const { isNarrowWidth } = useResponsive();

  return isNarrowWidth ? null : <Sidebar />;
}
