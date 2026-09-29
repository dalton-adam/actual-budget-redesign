import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { CategoryTile } from '@actual-app/components/category-tile';
import {
  SvgCheveronLeft,
  SvgCheveronRight,
  SvgClose,
} from '@actual-app/components/icons/v1';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';

import { useLocale } from '#hooks/useLocale';

import { useCategoryDetails } from './CategoryDetailsContext';
import { getCategoryAccentIndex } from './categoryPresentation';

type CategoryDetailsHeaderProps = {
  month: string;
};

const stepperButtonStyle = {
  width: 24,
  height: 24,
  padding: 0,
  color: theme.pageTextSecondary,
};

/**
 * Top of the details panel (design-decisions §5, item 1): tile, name (wraps),
 * group, the panel's own month stepper and the close button.
 */
export function CategoryDetailsHeader({ month }: CategoryDetailsHeaderProps) {
  const { t } = useTranslation();
  const locale = useLocale();
  const details = useCategoryDetails();

  if (!details) {
    return null;
  }
  const { selected } = details;

  const closeButton = (
    <Button
      variant="control"
      aria-label={t('Close details')}
      onPress={() => details.close()}
      style={{ flexShrink: 0 }}
    >
      <SvgClose width={10} height={10} />
    </Button>
  );

  if (!selected) {
    return (
      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          {closeButton}
        </View>
        <View style={{ color: theme.pageTextSecondary, fontSize: 13 }}>
          <Trans>Choose a category to see its details.</Trans>
        </View>
      </View>
    );
  }

  const { category, group } = selected;
  const isHidden = category.hidden || group.hidden;

  return (
    <View
      data-testid="category-details-header"
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
    >
      <CategoryTile
        name={category.name}
        accentIndex={getCategoryAccentIndex(category.id)}
        size={44}
      />
      <View style={{ flex: 1, minWidth: 0 }}>
        <h2
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 700,
            lineHeight: 1.25,
            letterSpacing: -0.3,
            color: theme.pageText,
            overflowWrap: 'anywhere',
          }}
        >
          {category.name}
        </h2>
        <View
          style={{
            marginTop: 1,
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            columnGap: 6,
            fontSize: 12.5,
            color: theme.pageTextSecondary,
          }}
        >
          <span style={{ overflowWrap: 'anywhere' }}>
            {isHidden
              ? t('{{group}} · Hidden', { group: group.name })
              : group.name}
          </span>
          <View
            role="group"
            aria-label={t('Details month')}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <Button
              variant="bare"
              aria-label={t('Details: month before')}
              isDisabled={!details.canStepMonth(-1)}
              onPress={() => details.stepMonth(-1)}
              style={stepperButtonStyle}
            >
              <SvgCheveronLeft width={12} height={12} />
            </Button>
            <span
              data-testid="category-details-month"
              aria-live="polite"
              style={{
                minWidth: 64,
                textAlign: 'center',
                fontWeight: 600,
                color: theme.pageText,
              }}
            >
              {monthUtils.format(month, 'MMM yyyy', locale)}
            </span>
            <Button
              variant="bare"
              aria-label={t('Details: month after')}
              isDisabled={!details.canStepMonth(1)}
              onPress={() => details.stepMonth(1)}
              style={stepperButtonStyle}
            >
              <SvgCheveronRight width={12} height={12} />
            </Button>
          </View>
        </View>
      </View>
      {closeButton}
    </View>
  );
}
