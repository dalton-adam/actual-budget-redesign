import type { ReactNode } from 'react';

import { SurfaceCard } from '@actual-app/components/surface-card';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';

/**
 * The full hero needs a window this wide and this tall; smaller windows get
 * the one-band hero so the register keeps its rows (the Budget page's
 * summary cards give way below the same height, design-decisions §3).
 */
const ACCOUNT_HERO_WIDE_FROM = 1280;
const ACCOUNT_HERO_TALL_FROM = 900;

export function isAccountHeroCompact(width: number, height: number) {
  return width < ACCOUNT_HERO_WIDE_FROM || height < ACCOUNT_HERO_TALL_FROM;
}

type AccountHeroProps = {
  isCompact: boolean;
  isReconciling: boolean;
  eyebrow?: ReactNode;
  title: ReactNode;
  actions?: ReactNode;
  balance: ReactNode;
  chips?: ReactNode;
  reconcileBand?: ReactNode;
};

/**
 * The account hero card (docs/redesign/design-decisions.md §10): eyebrow,
 * name, balance and chips, with Bank Sync and Reconcile in the card. In
 * smaller windows it collapses to one band with the balance on the right.
 */
export function AccountHero({
  isCompact,
  isReconciling,
  eyebrow,
  title,
  actions,
  balance,
  chips,
  reconcileBand,
}: AccountHeroProps) {
  const heading = (
    <View style={{ minWidth: 0 }}>
      {eyebrow && (
        <View
          style={{
            fontSize: 13,
            color: theme.pageTextSecondary,
            marginBottom: 2,
          }}
        >
          {eyebrow}
        </View>
      )}
      {title}
    </View>
  );

  const chipRow = chips && (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 8,
      }}
    >
      {chips}
    </View>
  );

  return (
    <SurfaceCard
      data-testid="account-hero"
      style={{
        flex: 1,
        minWidth: 0,
        padding: isCompact ? '12px 18px' : '16px 20px',
        gap: isCompact ? 8 : 10,
        ...(isReconciling && {
          borderColor: theme.selectionBorder,
          boxShadow: `inset 0 0 0 1px ${theme.selectionBorder}, ${theme.cardElevation}`,
        }),
      }}
    >
      {isCompact ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1, minWidth: 0, gap: 8 }}>
            {heading}
            {chipRow}
          </View>
          {actions}
          {balance}
        </View>
      ) : (
        <>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            {heading}
            {actions}
          </View>
          {balance}
          {chipRow}
        </>
      )}
      {reconcileBand}
    </SurfaceCard>
  );
}
