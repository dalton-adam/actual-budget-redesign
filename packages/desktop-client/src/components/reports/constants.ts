import { styles } from '@actual-app/components/styles';

export const NON_DRAGGABLE_AREA_CLASS_NAME = 'non-draggable-area';

// A dashboard widget's headline value beside its title (APP-03).
export const WIDGET_VALUE_STYLE = {
  fontSize: 18,
  fontWeight: 700,
  letterSpacing: -0.3,
  lineHeight: 1.25,
  marginBottom: 4,
} as const;

// Display size (APP-03b): a report page's title, as on the dashboard, and
// the headline total in its chart card.
export const REPORT_DISPLAY_STYLE = {
  fontSize: 28,
  fontWeight: 700,
  letterSpacing: -0.4,
  lineHeight: 1.2,
} as const;

// A report page's chart and explanation cards: the widget cards' hairline
// Surface with no shadow (APP-03, design-decisions §10a).
export const REPORT_PAGE_CARD_STYLE = {
  boxShadow: 'none',
  padding: '20px 24px',
} as const;

// Smaller report page surfaces, such as the Calendar report's month tiles.
export const REPORT_PAGE_TILE_STYLE = {
  ...styles.surfaceCard,
  boxShadow: 'none',
  borderRadius: 14,
  padding: 14,
} as const;
