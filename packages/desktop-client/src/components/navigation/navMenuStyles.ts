import { styles } from '@actual-app/components/styles';
import type { CSSProperties } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';

// Shared by the Accounts and More menus and the compact drawer so a row
// looks the same wherever it appears.
export const menuRowStyle: CSSProperties = {
  ...styles.smallText,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
  minHeight: 32,
  padding: '0 10px',
  borderRadius: 8,
  color: theme.menuItemText,
  textDecoration: 'none',
  cursor: 'pointer',
  userSelect: 'none',
  ':hover': { backgroundColor: theme.tableRowHover },
  ':focus-visible': { ...styles.focusRing, outlineOffset: -2 },
};

export const menuRowActiveStyle: CSSProperties = {
  backgroundColor: theme.menuItemBackgroundHover,
  fontWeight: 600,
};

export const menuSectionLabelStyle: CSSProperties = {
  ...styles.verySmallText,
  fontWeight: 600,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: theme.menuItemTextHeader,
  padding: '10px 10px 4px',
};

export const menuDividerStyle: CSSProperties = {
  height: 1,
  margin: '6px 4px',
  backgroundColor: theme.cardHairline,
  flexShrink: 0,
};

// The frame (card, hairline, 12px radius, popover shadow) comes from the
// shared Popover; the panel only adds its inset.
export const menuPanelStyle: CSSProperties = {
  padding: 6,
};
