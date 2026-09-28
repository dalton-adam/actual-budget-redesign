import React from 'react';
import type { ReactNode } from 'react';

import { theme } from '@actual-app/components/theme';
import { css } from '@emotion/css';

type NavTabTrackProps = {
  label: string;
  children: ReactNode;
};

export function NavTabTrack({ label, children }: NavTabTrackProps) {
  return (
    <nav
      aria-label={label}
      // The app tour's "Getting around" step anchors here.
      data-testid="sidebar-primary-buttons"
      className={css({
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        padding: 2,
        borderRadius: 12,
        backgroundColor: theme.navTrack,
        flexShrink: 0,
      })}
    >
      {children}
    </nav>
  );
}
