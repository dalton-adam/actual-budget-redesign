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
  ':hover': { backgroundColor: theme.menuItemBackgroundHover },
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
  backgroundColor: theme.menuBorder,
  flexShrink: 0,
};

export const menuPanelStyle: CSSProperties = {
  ...styles.popover,
  padding: 6,
  borderRadius: 12,
};
