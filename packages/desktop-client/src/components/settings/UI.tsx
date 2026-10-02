import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { Trans } from 'react-i18next';
import { useLocation } from 'react-router';

import { Button } from '@actual-app/components/button';
import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import { SvgCheveronDown } from '@actual-app/components/icons/v1';
import type { CSSProperties } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { tokens } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import { css } from '@emotion/css';

import { Link } from '#components/common/Link';

/**
 * The redesign look (design-decisions §10f) applies above the narrow
 * breakpoint; the mobile Settings screen keeps upstream's (plan §19.4).
 */
export function useSettingsRedesign() {
  const { isNarrowWidth } = useResponsive();
  return !isNarrowWidth;
}

/** Status text colours: the pill text roles on desktop, upstream's on mobile. */
export function useSettingsStatusColors() {
  const isRedesign = useSettingsRedesign();
  return isRedesign
    ? {
        positive: theme.pillPositiveText,
        warning: theme.pillWarningText,
        negative: theme.pillNegativeText,
      }
    : {
        positive: theme.noticeTextLight,
        warning: theme.warningText,
        negative: theme.errorText,
      };
}

/** Rounded corners and a Faint border on the shared checkbox (desktop). */
export const redesignCheckboxStyle: CSSProperties = {
  borderRadius: 5,
  border: '1px solid ' + theme.pageTextFaint,
};

/** Select triggers take the Control look at 32px (desktop). */
export const redesignSelectStyle: CSSProperties = {
  minWidth: 170,
  minHeight: 32,
  maxWidth: '100%',
};

/** Card Inset panel for the version lines and IDs (desktop). */
export const settingsInsetStyle: CSSProperties = {
  backgroundColor: theme.cardInset,
  borderRadius: 10,
  padding: '12px 14px',
};

type SettingProps = {
  primaryAction?: ReactNode;
  style?: CSSProperties;
  children: ReactNode;
};

export const Setting = ({ primaryAction, style, children }: SettingProps) => {
  const isRedesign = useSettingsRedesign();

  if (isRedesign) {
    // A Surface card without elevation; controls under a hairline
    // (design-decisions §10f).
    return (
      <View
        className={css([
          {
            backgroundColor: theme.cardBackground,
            border: '1px solid ' + theme.cardHairline,
            borderRadius: 18,
            padding: '18px 20px',
            width: '100%',
            alignItems: 'flex-start',
            fontSize: 13,
            lineHeight: 1.55,
            color: theme.pageTextSecondary,
            '& strong': { color: theme.pageText, fontWeight: 600 },
            '& a': { fontWeight: 600, textDecoration: 'none' },
            '& a:hover': { textDecoration: 'underline' },
          },
          style,
        ])}
      >
        <View style={{ gap: 10, width: '100%' }}>{children}</View>
        {primaryAction ? (
          <View
            style={{
              width: '100%',
              alignItems: 'flex-start',
              marginTop: 14,
              paddingTop: 14,
              borderTop: '1px solid ' + theme.cardHairline,
              color: theme.pageText,
            }}
          >
            {primaryAction}
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View
      className={css([
        {
          backgroundColor: theme.pillBackground,
          alignSelf: 'flex-start',
          alignItems: 'flex-start',
          padding: 15,
          borderRadius: 4,
          border: '1px solid ' + theme.pillBorderDark,
          width: '100%',
        },
        style,
      ])}
    >
      <View
        style={{
          marginBottom: primaryAction ? 10 : 0,
          lineHeight: 1.5,
          gap: 10,
        }}
      >
        {children}
      </View>
      {primaryAction || null}
    </View>
  );
};

type AdvancedToggleProps = {
  children: ReactNode;
};

export const AdvancedToggle = ({ children }: AdvancedToggleProps) => {
  const location = useLocation();
  const [expanded, setExpanded] = useState(location.hash === '#advanced');
  const isRedesign = useSettingsRedesign();

  if (!expanded) {
    return isRedesign ? (
      <Button
        variant="control"
        onPress={() => setExpanded(true)}
        data-testid="advanced-settings"
        style={{ alignSelf: 'flex-start', gap: 6, marginBottom: 25 }}
      >
        <Trans>Show advanced settings</Trans>
        <SvgCheveronDown
          width={12}
          height={12}
          style={{ color: theme.pageTextSecondary }}
        />
      </Button>
    ) : (
      <Link
        variant="text"
        onClick={() => setExpanded(true)}
        data-testid="advanced-settings"
        style={{
          flexShrink: 0,
          alignSelf: 'flex-start',
          color: theme.pageTextPositive,
          marginBottom: 25,
        }}
      >
        <Trans>Show advanced settings</Trans>
      </Link>
    );
  }

  return (
    <View
      id="advanced"
      style={{
        gap: isRedesign ? 12 : 20,
        alignItems: 'flex-start',
        marginBottom: 25,
        width: '100%',
      }}
      className={
        isRedesign
          ? undefined
          : css({
              [`@media (min-width: ${tokens.breakpoint_small})`]: {
                width: 'auto',
              },
            })
      }
      innerRef={el => {
        if (el && location.hash === '#advanced') {
          el.scrollIntoView(true);
        }
      }}
    >
      <View
        style={
          isRedesign
            ? {
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: -0.3,
                lineHeight: 1.25,
                color: theme.pageText,
                marginTop: 14,
                flexShrink: 0,
              }
            : { fontSize: 20, fontWeight: 500, flexShrink: 0 }
        }
      >
        <Trans>Advanced Settings</Trans>
      </View>
      {children}
    </View>
  );
};

export function Column({
  title,
  children,
  style,
}: {
  title: string;
  children: ReactNode;
  style?: CSSProperties;
}) {
  const isRedesign = useSettingsRedesign();

  return (
    <View
      style={{
        alignItems: 'flex-start',
        flexGrow: 1,
        gap: isRedesign ? 6 : '0.5em',
        width: '100%',
        ...style,
      }}
    >
      <Text
        style={
          isRedesign
            ? {
                // Eyebrow label (design-decisions §10f).
                fontSize: 11,
                fontWeight: 650,
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                lineHeight: 1.3,
                color: theme.pageTextFaint,
              }
            : { fontWeight: 500 }
        }
      >
        {title}
      </Text>
      <View style={{ alignItems: 'flex-start', gap: '1em', width: '100%' }}>
        {children}
      </View>
    </View>
  );
}
