import React from 'react';
import type { ReactNode } from 'react';

import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';

import { PrivacyFilter } from '#components/PrivacyFilter';

import { Change } from './Change';
import { ChangePill } from './ChangePill';
import { REPORT_DISPLAY_STYLE } from './constants';

type ReportPageCardHeaderProps = {
  title?: ReactNode;
  subtitle?: ReactNode;
  /** The headline total, already wrapped for privacy. */
  total?: ReactNode;
  /** Other figures under the total, e.g. a breakdown; shown as given. */
  summary?: ReactNode;
  /** The change shown last. */
  changeAmount?: number;
  /** For spending, an increase is the bad direction. */
  isIncreaseNegative?: boolean;
};

/**
 * A report page chart card's header (APP-03b): title and subline on the
 * left, the total at Display size, any summary and the change pill on the
 * right. At narrow widths, where mobile keeps the upstream layout (plan
 * §19.4), only the figures and the coloured change show, right-aligned as
 * before.
 */
export function ReportPageCardHeader({
  title,
  subtitle,
  total,
  summary,
  changeAmount,
  isIncreaseNegative,
}: ReportPageCardHeaderProps) {
  const { isNarrowWidth } = useResponsive();
  const hasChange = changeAmount != null;

  if (isNarrowWidth) {
    return (
      <View
        style={{ alignItems: 'flex-end', textAlign: 'right', paddingTop: 20 }}
      >
        {total && (
          <View
            style={{ ...styles.largeText, fontWeight: 400, marginBottom: 5 }}
          >
            {total}
          </View>
        )}
        {summary}
        {hasChange && (
          <PrivacyFilter>
            <Change amount={changeAmount} />
          </PrivacyFilter>
        )}
      </View>
    );
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
        marginBottom: 12,
      }}
    >
      <View style={{ flex: 1, minWidth: 0 }}>
        {title && (
          <View
            style={{
              fontSize: 15,
              fontWeight: 600,
              lineHeight: 1.35,
              color: theme.pageText,
            }}
          >
            {title}
          </View>
        )}
        {subtitle && <View style={{ marginTop: 2 }}>{subtitle}</View>}
      </View>
      {(total || summary || hasChange) && (
        <View style={{ alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
          {total && <View style={REPORT_DISPLAY_STYLE}>{total}</View>}
          {summary}
          {hasChange && (
            <PrivacyFilter>
              <ChangePill
                amount={changeAmount}
                isIncreaseNegative={isIncreaseNegative}
              />
            </PrivacyFilter>
          )}
        </View>
      )}
    </View>
  );
}
