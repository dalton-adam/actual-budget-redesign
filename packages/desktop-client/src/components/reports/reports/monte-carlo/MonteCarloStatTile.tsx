import type { ReactNode } from 'react';

import type { CSSProperties } from '@actual-app/components/styles';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';

import { REPORT_DISPLAY_STYLE } from '#components/reports/constants';
import { useMonteCarloStyles } from '#components/reports/reports/monte-carlo/monteCarloStyles';

type MonteCarloStatTileProps = {
  label: ReactNode;
  children: ReactNode;
  /** The success rate: Display size on desktop, very large text on mobile */
  isHeadline?: boolean;
  /** Colour of the value, e.g. the success rate's threshold colour */
  color?: string;
  style?: CSSProperties;
};

/**
 * A headline figure in the Monte Carlo results: a Card Inset tile on
 * desktop (APP-03d); at narrow widths the upstream label-over-value pair.
 */
export function MonteCarloStatTile({
  label,
  children,
  isHeadline = false,
  color,
  style,
}: MonteCarloStatTileProps) {
  const { isCard, statLabel } = useMonteCarloStyles();

  if (!isCard) {
    return (
      <View style={{ gap: 4, ...style }}>
        <Text style={statLabel}>{label}</Text>
        <Text
          style={
            isHeadline
              ? { ...styles.veryLargeText, color }
              : { ...styles.mediumText, fontWeight: 500, color }
          }
        >
          {children}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        backgroundColor: theme.cardInset,
        borderRadius: 10,
        padding: '10px 12px',
        gap: 2,
        minWidth: 0,
        ...style,
      }}
    >
      <Text style={statLabel}>{label}</Text>
      <Text
        style={
          isHeadline
            ? { ...REPORT_DISPLAY_STYLE, color }
            : {
                fontSize: 17,
                fontWeight: 700,
                letterSpacing: -0.3,
                lineHeight: 1.3,
                color: color ?? theme.pageText,
              }
        }
      >
        {children}
      </Text>
    </View>
  );
}
