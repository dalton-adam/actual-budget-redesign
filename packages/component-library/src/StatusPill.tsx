import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { Button as ReactAriaButton } from 'react-aria-components';

import { css, cx } from '@emotion/css';

import { styles } from './styles';
import type { CSSProperties } from './styles';
import { theme } from './theme';

export type StatusPillTone = 'positive' | 'neutral' | 'negative' | 'warning';

const toneColors: Record<StatusPillTone, { background: string; text: string }> =
  {
    positive: {
      background: theme.pillPositiveBackground,
      text: theme.pillPositiveText,
    },
    neutral: {
      background: theme.pillNeutralBackground,
      text: theme.pillNeutralText,
    },
    negative: {
      background: theme.pillNegativeBackground,
      text: theme.pillNegativeText,
    },
    warning: {
      background: theme.pillWarningBackground,
      text: theme.pillWarningText,
    },
  };

function getPillStyle(
  tone: StatusPillTone,
  size: 'default' | 'small',
): CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    borderRadius: 99,
    border: 0,
    margin: 0,
    fontWeight: 650,
    lineHeight: 1.2,
    ...(size === 'small'
      ? { padding: '2px 7px', fontSize: 11 }
      : { padding: '4px 10px', fontSize: 12.5 }),
    backgroundColor: toneColors[tone].background,
    color: toneColors[tone].text,
    ...styles.tnum,
  };
}

type StatusPillProps = {
  tone: StatusPillTone;
  /** `small` is the badge size used next to headline amounts. */
  size?: 'default' | 'small';
  className?: string;
  children: ReactNode;
};

/**
 * A status pill or badge (docs/redesign/design-decisions.md §3, §4.3). The
 * tone never carries meaning alone: the content must state it too (an amount
 * with its sign, or a word like "Overassigned").
 */
export function StatusPill({
  tone,
  size = 'default',
  className,
  children,
}: StatusPillProps) {
  return (
    <span className={cx(css(getPillStyle(tone, size)), className)}>
      {children}
    </span>
  );
}

type StatusPillButtonProps = Omit<
  ComponentPropsWithoutRef<typeof ReactAriaButton>,
  'className' | 'style' | 'children'
> & {
  tone: StatusPillTone;
  size?: 'default' | 'small';
  className?: string;
  children: ReactNode;
  /** Full sentence, e.g. "Available $110. Underfunded by $30." */
  'aria-label': string;
};

/** A pill that opens something, such as the Available balance menu. */
export const StatusPillButton = forwardRef<
  HTMLButtonElement,
  StatusPillButtonProps
>(({ tone, size = 'default', className, children, ...props }, ref) => (
  <ReactAriaButton
    ref={ref}
    {...props}
    className={cx(
      css({
        ...getPillStyle(tone, size),
        cursor: 'pointer',
        '&[data-hovered]': { boxShadow: 'inset 0 0 0 1px currentColor' },
        '&[data-focus-visible]': styles.focusRing,
        '&[data-disabled]': { cursor: 'default', opacity: 0.6 },
      }),
      className,
    )}
  >
    {children}
  </ReactAriaButton>
));

StatusPillButton.displayName = 'StatusPillButton';
