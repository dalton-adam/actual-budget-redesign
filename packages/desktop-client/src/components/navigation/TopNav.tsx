import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { useResponsive } from '@actual-app/components/hooks/useResponsive';

import { AccountsMenu } from './AccountsMenu';
import { COMPACT_NAV_WIDTH } from './constants';
import { MoreMenu } from './MoreMenu';
import { NavDrawer } from './NavDrawer';
import { NavTabLink } from './NavTabLink';
import { NavTabTrack } from './NavTabTrack';

// Primary navigation in the title bar: pill tabs on wide windows, a
// drawer below COMPACT_NAV_WIDTH (design-decisions §2).
export function TopNav() {
  const { t } = useTranslation();
  const { width } = useResponsive();

  if (width < COMPACT_NAV_WIDTH) {
    return <NavDrawer />;
  }

  return (
    <NavTabTrack label={t('Main')}>
      <NavTabLink to="/budget">
        <Trans>Budget</Trans>
      </NavTabLink>
      <AccountsMenu />
      <NavTabLink to="/reports">
        <Trans>Reports</Trans>
      </NavTabLink>
      <NavTabLink to="/schedules">
        <Trans>Schedules</Trans>
      </NavTabLink>
      <MoreMenu />
    </NavTabTrack>
  );
}
