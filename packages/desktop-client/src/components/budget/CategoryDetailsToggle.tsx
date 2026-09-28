import React from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgShowSidebar } from '@actual-app/components/icons/v1';
import { theme } from '@actual-app/components/theme';

import {
  CATEGORY_DETAILS_PANEL_ID,
  useCategoryDetails,
} from './CategoryDetailsContext';

/** Header button that shows or hides the details panel (design-decisions §5). */
export function CategoryDetailsToggle() {
  const { t } = useTranslation();
  const details = useCategoryDetails();

  if (!details) {
    return null;
  }

  return (
    <Button
      variant="control"
      data-details-toggle
      aria-label={
        details.isShown
          ? t('Hide category details')
          : t('Show category details')
      }
      aria-pressed={details.isShown}
      aria-controls={details.isShown ? CATEGORY_DETAILS_PANEL_ID : undefined}
      onPress={details.toggle}
      style={details.isShown ? { backgroundColor: theme.navActive } : undefined}
    >
      {/* The icon's sidebar is on the left; the panel opens on the right. */}
      <SvgShowSidebar
        width={15}
        height={15}
        style={{ transform: 'scaleX(-1)' }}
      />
    </Button>
  );
}
