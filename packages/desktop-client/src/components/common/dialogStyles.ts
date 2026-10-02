import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';

// Shared looks for the desktop dialogs with their own layouts
// (design-decisions §10k, APP-06e). Pair `dialogButtonStyle` with the
// `control` variant and `dialogPrimaryButtonStyle` with `primary`.

/** Control button: 30px, 9px radius, 13px/600. */
export const dialogButtonStyle = {
  padding: '0 12px',
  fontWeight: 600,
} as const;

/** The primary button in the same shape as the control button. */
export const dialogPrimaryButtonStyle = {
  minHeight: 30,
  padding: '0 12px',
  borderRadius: 9,
  fontWeight: 600,
  '&[data-focus-visible]': styles.focusRing,
} as const;

/** 28px icon button with no fill, the Row Hover wash on hover. */
export const dialogIconButtonStyle = {
  width: 28,
  height: 28,
  minWidth: 28,
  minHeight: 28,
  padding: 0,
  borderRadius: 8,
  backgroundColor: 'transparent',
  borderColor: 'transparent',
  color: theme.pageTextSecondary,
  '&[data-hovered]': {
    backgroundColor: theme.tableRowHover,
    color: theme.pageText,
  },
} as const;

/** Eyebrow text (DESIGN.md typography) for table headers and group labels. */
export const dialogEyebrowStyle = {
  color: theme.pageTextFaint,
  fontSize: 11,
  fontWeight: 650,
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
} as const;

/** A hairline card around a table inside a dialog (no elevation). */
export const dialogTableCardStyle = {
  border: `1px solid ${theme.cardHairline}`,
  borderRadius: 12,
  overflow: 'hidden',
} as const;

/**
 * `Information` as a quiet note in a payee merge dialog: no box, Secondary
 * text after a Faint icon (pass both to `style` and `iconStyle`).
 */
export const dialogNoteStyle = {
  color: theme.pageTextSecondary,
  fontSize: 13,
  boxShadow: 'none',
  padding: 0,
} as const;

export const dialogNoteIconStyle = {
  color: theme.pageTextFaint,
  marginRight: 8,
} as const;
