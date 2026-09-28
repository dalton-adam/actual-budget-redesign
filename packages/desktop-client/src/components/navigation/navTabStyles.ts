import { styles } from '@actual-app/components/styles';
import type { CSSProperties } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';

export const TAB_HEIGHT = 26;

export const tabBaseStyle: CSSProperties = {
  ...styles.smallText,
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  height: TAB_HEIGHT,
  padding: '0 12px',
  borderRadius: 10,
  whiteSpace: 'nowrap',
  textDecoration: 'none',
  fontWeight: 500,
  color: theme.pageTextSecondary,
  WebkitAppRegion: 'no-drag',
  transition: 'none',
  '@media (prefers-reduced-motion: no-preference)': {
    transition: 'background-color .15s, color .15s',
  },
  ':hover': { backgroundColor: theme.tableRowHover, color: theme.pageText },
  ':focus-visible': styles.focusRing,
};

export const tabSelectedStyle: CSSProperties = {
  backgroundColor: theme.navActive,
  color: theme.pageText,
  fontWeight: 600,
  boxShadow: theme.navActiveShadow,
  ':hover': { backgroundColor: theme.navActive, color: theme.pageText },
};
