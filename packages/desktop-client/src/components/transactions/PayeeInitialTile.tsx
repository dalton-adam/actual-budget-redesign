import {
  getAccentColor,
  getTileLetter,
} from '@actual-app/components/category-tile';
import { theme } from '@actual-app/components/theme';
import { css } from '@emotion/css';

type PayeeInitialTileProps = {
  name: string;
  accentIndex: number | undefined;
};

/**
 * The register's payee initial (design-decisions §10), tinted with the
 * row's category accent, or neutral for income, split, transfer and
 * uncategorized rows. A circle rather than the budget's rounded square
 * (shot 14), so a payee never reads as a category.
 *
 * The letter is drawn with CSS, not as text, so the payee cell's text (what
 * copy, find-in-page and the E2E page models read) stays the payee name.
 * Decorative; the name is beside it.
 */
export function PayeeInitialTile({ name, accentIndex }: PayeeInitialTileProps) {
  const letter = getTileLetter(name);
  if (!letter) {
    return null;
  }
  return (
    <span
      aria-hidden
      data-letter={letter}
      className={tileClassName}
      style={{ color: getAccentColor(accentIndex) }}
    />
  );
}

const tileClassName = css({
  position: 'relative',
  display: 'inline-grid',
  placeItems: 'center',
  flexShrink: 0,
  width: 22,
  height: 22,
  marginRight: 8,
  borderRadius: 99,
  overflow: 'hidden',
  fontSize: 10,
  fontWeight: 700,
  lineHeight: 1,
  fontStyle: 'normal',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    backgroundColor: 'currentColor',
    opacity: theme.tileAlpha,
  },
  '&::after': {
    content: 'attr(data-letter)',
    position: 'relative',
  },
});
