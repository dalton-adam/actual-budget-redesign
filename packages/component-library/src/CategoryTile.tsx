import { css, cx } from '@emotion/css';

import { theme } from './theme';

const ACCENT_COUNT = 10;

type CategoryTileProps = {
  name: string;
  /**
   * 1-based `categoryAccentN` role. Omit for neutral styling (income
   * categories and group rows).
   */
  accentIndex?: number;
  size?: number;
  className?: string;
};

export function getTileLetter(name: string) {
  const trimmed = name.trim();
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
  const first = segmenter.segment(trimmed)[Symbol.iterator]().next();
  return first.done ? '' : first.value.segment.toLocaleUpperCase();
}

export function getAccentColor(accentIndex: number | undefined) {
  if (
    accentIndex === undefined ||
    !Number.isInteger(accentIndex) ||
    accentIndex < 1 ||
    accentIndex > ACCENT_COUNT
  ) {
    return theme.pageTextSecondary;
  }
  return theme[`categoryAccent${accentIndex}` as keyof typeof theme];
}

/**
 * Decorative category tile (docs/redesign/design-decisions.md §4.1, §4.2):
 * the first grapheme of the name on a low-opacity accent tint. Hidden from
 * assistive technology because the name is always shown beside it.
 */
export function CategoryTile({
  name,
  accentIndex,
  size = 26,
  className,
}: CategoryTileProps) {
  return (
    <span
      aria-hidden
      className={cx(
        css({
          position: 'relative',
          display: 'inline-grid',
          placeItems: 'center',
          flexShrink: 0,
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.3),
          overflow: 'hidden',
          fontSize: Math.round(size * 0.46),
          fontWeight: 700,
          lineHeight: 1,
          color: getAccentColor(accentIndex),
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            backgroundColor: 'currentColor',
            opacity: theme.tileAlpha,
          },
        }),
        className,
      )}
    >
      <span className={css({ position: 'relative' })}>
        {getTileLetter(name)}
      </span>
    </span>
  );
}
