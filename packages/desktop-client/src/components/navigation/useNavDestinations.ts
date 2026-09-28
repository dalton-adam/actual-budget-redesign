import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

import {
  SvgCog,
  SvgCreditCard,
  SvgReports,
  SvgStoreFront,
  SvgTag,
  SvgTuning,
  SvgWallet,
} from '@actual-app/components/icons/v1';
import { SvgCalendar3 } from '@actual-app/components/icons/v2';

import { useIsTestEnv } from '#hooks/useIsTestEnv';
import { useSyncServerStatus } from '#hooks/useSyncServerStatus';

export type NavDestination = {
  title: string;
  to: string;
  Icon: typeof SvgWallet;
};

// Routes that live under the "More" menu. `/tools` has no page of its own
// today but was treated as a "More" route by the old sidebar, so it keeps
// highlighting the More tab.
const MORE_ROUTE_PREFIXES = [
  '/payees',
  '/rules',
  '/bank-sync',
  '/tags',
  '/settings',
  '/tools',
];

export function usePrimaryDestinations(): NavDestination[] {
  const { t } = useTranslation();
  return [
    { title: t('Budget'), to: '/budget', Icon: SvgWallet },
    { title: t('Reports'), to: '/reports', Icon: SvgReports },
    { title: t('Schedules'), to: '/schedules', Icon: SvgCalendar3 },
  ];
}

export function useMoreDestinations(): NavDestination[] {
  const { t } = useTranslation();
  const syncServerStatus = useSyncServerStatus();
  const isTestEnv = useIsTestEnv();
  const isUsingServer = syncServerStatus !== 'no-server' || isTestEnv;

  return [
    { title: t('Payees'), to: '/payees', Icon: SvgStoreFront },
    { title: t('Rules'), to: '/rules', Icon: SvgTuning },
    ...(isUsingServer
      ? [{ title: t('Bank Sync'), to: '/bank-sync', Icon: SvgCreditCard }]
      : []),
    { title: t('Tags'), to: '/tags', Icon: SvgTag },
    { title: t('Settings'), to: '/settings', Icon: SvgCog },
  ];
}

export function useIsMoreRouteActive() {
  const { pathname } = useLocation();
  return isMoreRoute(pathname);
}

export function useIsAccountsRouteActive() {
  const { pathname } = useLocation();
  return isAccountsRoute(pathname);
}

export function isMoreRoute(pathname: string) {
  return MORE_ROUTE_PREFIXES.some(route => pathname.startsWith(route));
}

export function isAccountsRoute(pathname: string) {
  return pathname === '/accounts' || pathname.startsWith('/accounts/');
}
