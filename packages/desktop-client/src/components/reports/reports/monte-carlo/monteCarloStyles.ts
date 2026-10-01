import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';

// Shared layout constants for the Monte Carlo configuration and results
// UI, so the visual language stays consistent across the report's files.

/** Small uppercase heading used for stat tiles, field groups and tables */
export const GROUP_HEADING_STYLE = {
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: 0.5,
  textTransform: 'uppercase',
  color: theme.pageText,
} as const;

export const FIELD_STYLE = { width: 170 } as const;

export const FIELD_LABEL_STYLE = { fontWeight: 600 } as const;

export const FIELD_LABEL_ROW_STYLE = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 6,
  minHeight: 18,
} as const;

// The report's cards on desktop (APP-03d): Eyebrow group and column
// headings, as the register's, and labels in Secondary text.
const EYEBROW_STYLE = {
  fontSize: 11,
  fontWeight: 650,
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  color: theme.pageTextFaint,
} as const;

const CARD_FIELD_LABEL_STYLE = {
  fontSize: 12,
  fontWeight: 600,
  color: theme.pageTextSecondary,
} as const;

// Narrower fields on the card, so the plan's three groups share one row
const CARD_FIELD_STYLE = { width: 136 } as const;

// The help icon sits right after its label on the card
const CARD_FIELD_LABEL_ROW_STYLE = {
  ...FIELD_LABEL_ROW_STYLE,
  justifyContent: 'flex-start',
  gap: 5,
} as const;

// The configuration tabs' tables on the card: a hairline frame, Eyebrow
// headers and rows on the card's own surface.
const CARD_TABLE_CONTAINER_STYLE = {
  border: `1px solid ${theme.cardHairline}`,
  borderRadius: 12,
  overflow: 'hidden',
} as const;

const CARD_TABLE_HEADER_STYLE = {
  ...EYEBROW_STYLE,
  backgroundColor: theme.cardBackground,
  borderColor: theme.cardHairline,
} as const;

/**
 * The heading, label and table styles for the current width: the card look on
 * desktop (APP-03d); at narrow widths, where mobile keeps the upstream
 * layout (plan §19.4), the styles above.
 */
export function useMonteCarloStyles() {
  const { isNarrowWidth } = useResponsive();
  return isNarrowWidth
    ? {
        isCard: false,
        groupHeading: GROUP_HEADING_STYLE,
        fieldLabel: FIELD_LABEL_STYLE,
        field: FIELD_STYLE,
        fieldLabelRow: FIELD_LABEL_ROW_STYLE,
        statLabel: GROUP_HEADING_STYLE,
        tableContainer: styles.tableContainer,
        tableHeader: undefined,
        rowBackground: theme.tableBackground,
        rowBorder: theme.tableBorder,
        mutedText: theme.pageText,
      }
    : {
        isCard: true,
        groupHeading: EYEBROW_STYLE,
        fieldLabel: CARD_FIELD_LABEL_STYLE,
        field: CARD_FIELD_STYLE,
        fieldLabelRow: CARD_FIELD_LABEL_ROW_STYLE,
        statLabel: CARD_FIELD_LABEL_STYLE,
        tableContainer: CARD_TABLE_CONTAINER_STYLE,
        tableHeader: CARD_TABLE_HEADER_STYLE,
        rowBackground: theme.cardBackground,
        rowBorder: theme.cardHairline,
        mutedText: theme.pageTextSecondary,
      };
}
