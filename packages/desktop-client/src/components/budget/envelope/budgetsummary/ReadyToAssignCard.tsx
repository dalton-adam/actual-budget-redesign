import React, { useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { Button as ReactAriaButton } from 'react-aria-components';
import { Trans } from 'react-i18next';

import { SvgCheveronDown } from '@actual-app/components/icons/v1';
import { StatusPill } from '@actual-app/components/status-pill';
import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';
import { css } from '@emotion/css';

import {
  EnvelopeCellValue,
  useEnvelopeSheetValue,
} from '#components/budget/envelope/EnvelopeBudgetComponents';
import { useEnvelopeBudget } from '#components/budget/envelope/EnvelopeBudgetContext';
import { FinancialText } from '#components/FinancialText';
import { PrivacyFilter } from '#components/PrivacyFilter';
import { useFormat } from '#hooks/useFormat';
import { useLocale } from '#hooks/useLocale';
import { envelopeBudget } from '#spreadsheet/bindings';

import { ReadyToAssignBreakdown } from './ReadyToAssignBreakdown';
import { ToBudgetPopover } from './ToBudget';

type ReadyToAssignKind = 'positive' | 'zero' | 'negative';

export function getReadyToAssignKind(value: number): ReadyToAssignKind {
  return value > 0 ? 'positive' : value < 0 ? 'negative' : 'zero';
}

type ReadyToAssignCardProps = {
  month: string;
  /** The one-line version used by the compact summary strip. */
  isCompact?: boolean;
};

/**
 * The Ready to Assign card (design-decisions §3). Pressing it, or
 * right-clicking it, opens one popover with the existing breakdown followed
 * by the existing To Budget actions.
 */
export function ReadyToAssignCard({
  month,
  isCompact = false,
}: ReadyToAssignCardProps) {
  const locale = useLocale();
  const format = useFormat();
  const { onBudgetAction } = useEnvelopeBudget();
  const triggerRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [position, setPosition] = useState({ crossOffset: 0, offset: 0 });

  const toBudget = useEnvelopeSheetValue(envelopeBudget.toBudget) ?? 0;
  // The spreadsheet cache only refreshes subscribed cells. Subscribe to the
  // breakdown's and menu's cells while the card is shown, as the always
  // visible TotalsList did, so opening the popover never shows a stale value.
  useEnvelopeSheetValue(envelopeBudget.incomeAvailable);
  useEnvelopeSheetValue(envelopeBudget.lastMonthOverspent);
  useEnvelopeSheetValue(envelopeBudget.totalBudgeted);
  useEnvelopeSheetValue(envelopeBudget.forNextMonth);
  useEnvelopeSheetValue(envelopeBudget.manualBuffered);
  useEnvelopeSheetValue(envelopeBudget.autoBuffered);
  useEnvelopeSheetValue(envelopeBudget.totalIncome);
  useEnvelopeSheetValue(envelopeBudget.fromLastMonth);
  const kind = getReadyToAssignKind(toBudget);
  const prevMonthName = monthUtils.format(
    monthUtils.prevMonth(month),
    'MMM',
    locale,
  );

  const amountColor =
    kind === 'positive'
      ? theme.toBudgetPositive
      : kind === 'negative'
        ? theme.toBudgetNegative
        : theme.pageText;

  const badge =
    kind === 'negative' ? (
      <StatusPill tone="negative" size="small">
        <Trans>Overassigned</Trans>
      </StatusPill>
    ) : kind === 'zero' ? (
      <StatusPill tone="neutral" size="small">
        <Trans>All assigned</Trans>
      </StatusPill>
    ) : null;

  const amount = (
    <PrivacyFilter>
      <FinancialText style={{ color: amountColor }}>
        {format(toBudget, 'financial')}
      </FinancialText>
    </PrivacyFilter>
  );

  function onContextMenu(e: MouseEvent) {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({
      crossOffset: e.clientX - rect.left,
      offset: e.clientY - rect.bottom,
    });
    setMenuOpen(true);
  }

  return (
    <>
      <View
        ref={triggerRef}
        data-testid="ready-to-assign"
        data-kind={kind}
        onContextMenu={onContextMenu}
        style={{ flex: isCompact ? undefined : 1.3, minWidth: 0 }}
      >
        <ReactAriaButton
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          onPress={() => {
            setPosition({ crossOffset: 0, offset: 0 });
            setMenuOpen(true);
          }}
          className={css(
            isCompact
              ? compactButtonStyle
              : getCardButtonStyle(kind === 'positive' || kind === 'negative'),
            !isCompact && {
              '::after': {
                background: `radial-gradient(circle, ${
                  kind === 'negative' ? theme.heroGlowNegative : theme.heroGlow
                }, transparent 65%)`,
              },
            },
          )}
        >
          {isCompact ? (
            <>
              <span className={css({ color: theme.pageTextSecondary })}>
                <Trans>Ready to Assign</Trans>
              </span>
              <b className={css({ fontWeight: 700 })}>{amount}</b>
              {badge}
              <SvgCheveronDown
                width={10}
                height={10}
                style={{ color: theme.pageTextSecondary }}
              />
            </>
          ) : (
            <>
              <span className={css(breakdownHintStyle)} aria-hidden="true">
                <SvgCheveronDown width={10} height={10} />
              </span>
              <span className={css(labelRowStyle)}>
                <Trans>Ready to Assign</Trans>
                {badge}
              </span>
              <span
                className={css(amountStyle)}
                data-testid="ready-to-assign-amount"
              >
                {amount}
              </span>
              <span className={css(sublineStyle)}>
                {kind === 'positive' ? (
                  <Trans
                    i18nKey="<availableFunds /> available funds"
                    components={{
                      availableFunds: (
                        <EnvelopeCellValue
                          binding={envelopeBudget.incomeAvailable}
                          type="financial"
                        />
                      ),
                    }}
                  />
                ) : kind === 'zero' ? (
                  <Trans>Every dollar has a job</Trans>
                ) : (
                  <Trans>More assigned than you have</Trans>
                )}
              </span>
            </>
          )}
        </ReactAriaButton>
      </View>

      <ToBudgetPopover
        triggerRef={triggerRef}
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        month={month}
        onBudgetAction={onBudgetAction}
        placement="bottom start"
        style={{ width: 300, margin: 1 }}
        header={
          <ReadyToAssignBreakdown month={month} prevMonthName={prevMonthName} />
        }
        {...position}
      />
    </>
  );
}

function getCardButtonStyle(hasGlow: boolean) {
  return {
    ...styles.surfaceCard,
    position: 'relative' as const,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    width: '100%',
    height: '100%',
    padding: '16px 20px',
    margin: 0,
    textAlign: 'left' as const,
    font: 'inherit',
    color: theme.pageText,
    cursor: 'pointer',
    '::after': {
      content: hasGlow ? '""' : 'none',
      position: 'absolute' as const,
      width: 260,
      height: 260,
      left: -40,
      top: -110,
      pointerEvents: 'none' as const,
    },
    '&[data-hovered]': { borderColor: theme.cardInset },
    '&[data-focus-visible]': styles.focusRing,
  };
}

const compactButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '4px 10px',
  margin: 0,
  border: 0,
  borderRadius: 9,
  background: 'transparent',
  font: 'inherit',
  color: theme.pageText,
  cursor: 'pointer',
  whiteSpace: 'nowrap' as const,
  '&[data-hovered]': { backgroundColor: theme.tableRowHover },
  '&[data-focus-visible]': styles.focusRing,
};

const breakdownHintStyle = {
  position: 'absolute' as const,
  top: 14,
  right: 14,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 26,
  height: 26,
  borderRadius: 8,
  color: theme.pageTextSecondary,
  backgroundColor: theme.cardInset,
  zIndex: 1,
};

const labelRowStyle = {
  display: 'flex',
  flexWrap: 'wrap' as const,
  alignItems: 'center',
  gap: '4px 8px',
  paddingRight: 32,
  fontSize: 13,
  color: theme.pageTextSecondary,
  position: 'relative' as const,
  zIndex: 1,
};

const amountStyle = {
  fontSize: 34,
  fontWeight: 700,
  lineHeight: 1.2,
  marginTop: 2,
  position: 'relative' as const,
  zIndex: 1,
};

const sublineStyle = {
  fontSize: 12.5,
  marginTop: 2,
  color: theme.pageTextSecondary,
  position: 'relative' as const,
  zIndex: 1,
};
