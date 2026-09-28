import { css, cx } from '@emotion/css';

import { theme } from './theme';

type ProgressBarProps = {
  /** Fill between 0 and 1; values outside are clamped. */
  value: number;
  /** A theme role, e.g. `theme.categoryAccent3` or `theme.pillNegativeText`. */
  color: string;
  height?: number;
  /**
   * Accessible name. Without it the bar is decoration and hidden from
   * assistive technology, so the amount beside it must say the same thing.
   */
  'aria-label'?: string;
  className?: string;
};

export function clampProgress(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(1, Math.max(0, value));
}

/** Rounded progress bar (docs/redesign/design-decisions.md §4.1, §7.1). */
export function ProgressBar({
  value,
  color,
  height = 6,
  'aria-label': ariaLabel,
  className,
}: ProgressBarProps) {
  const fill = clampProgress(value);
  const percent = Math.round(fill * 100);

  return (
    <div
      {...(ariaLabel
        ? {
            role: 'progressbar',
            'aria-label': ariaLabel,
            'aria-valuemin': 0,
            'aria-valuemax': 100,
            'aria-valuenow': percent,
          }
        : { 'aria-hidden': true })}
      className={cx(
        css({
          height,
          borderRadius: 99,
          backgroundColor: theme.progressTrack,
          overflow: 'hidden',
          flexShrink: 0,
        }),
        className,
      )}
    >
      <div
        data-testid="progress-fill"
        className={css({
          height: '100%',
          borderRadius: 99,
          backgroundColor: color,
          '@media (prefers-reduced-motion: no-preference)': {
            transition: 'width .2s ease',
          },
        })}
        style={{ width: `${fill * 100}%` }}
      />
    </div>
  );
}
