import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgAdd } from '@actual-app/components/icons/v1';
import {
  SvgArrowButtonLeft1,
  SvgArrowButtonRight1,
} from '@actual-app/components/icons/v2';
import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';

import { FeatureErrorFallback } from '#components/FeatureErrorFallback';
import { replaceModal } from '#modals/modalsSlice';
import { useDispatch } from '#redux';

import { Accounts } from './Accounts';
import { useSidebar } from './SidebarProvider';

const EXPANDED_WIDTH = 236;
const COLLAPSED_WIDTH = 56;

export function Sidebar() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { expanded, setExpanded } = useSidebar();

  const onAddAccount = () => {
    dispatch(replaceModal({ modal: { name: 'add-account', options: {} } }));
  };

  return (
    <ErrorBoundary FallbackComponent={FeatureErrorFallback}>
      <View
        role="complementary"
        aria-label={expanded ? t('Accounts') : t('Accounts, collapsed')}
        data-testid="accounts-pane"
        data-expanded={expanded}
        style={{
          width: expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
          minWidth: expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
          height: '100%',
          overflow: 'hidden',
          flexShrink: 0,
          color: theme.pageText,
          backgroundColor: theme.cardBackground,
          borderRight: `1px solid ${theme.cardHairline}`,
          transition: 'width .18s ease, min-width .18s ease',
          '@media (prefers-reduced-motion: reduce)': {
            transition: 'none',
          },
          ...styles.lightScrollbar,
        }}
      >
        <View
          style={{
            height: 44,
            padding: expanded ? '0 8px 0 16px' : '0 8px',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: expanded ? 'space-between' : 'center',
            flexShrink: 0,
          }}
        >
          {expanded && (
            <strong style={{ ...styles.smallText }}>
              <Trans>Accounts</Trans>
            </strong>
          )}
          <Button
            variant="bare"
            aria-label={
              expanded ? t('Collapse accounts') : t('Expand accounts')
            }
            aria-expanded={expanded}
            onPress={() => setExpanded(value => !value)}
            style={{
              width: 32,
              height: 32,
              padding: 0,
              color: theme.pageTextSecondary,
              justifyContent: 'center',
            }}
          >
            {expanded ? (
              <SvgArrowButtonLeft1 width={14} height={14} />
            ) : (
              <SvgArrowButtonRight1 width={14} height={14} />
            )}
          </Button>
        </View>

        <View style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <Accounts collapsed={!expanded} />
        </View>

        <View
          style={{
            padding: '6px 8px 10px',
            borderTop: `1px solid ${theme.cardHairline}`,
            flexShrink: 0,
          }}
        >
          <Button
            data-testid="sidebar-add-account"
            variant="bare"
            aria-label={t('Add account')}
            onPress={onAddAccount}
            style={{
              width: '100%',
              minHeight: 36,
              padding: expanded ? '0 8px' : 0,
              justifyContent: expanded ? 'flex-start' : 'center',
              gap: 8,
              color: theme.pageText,
            }}
          >
            <SvgAdd width={13} height={13} />
            {expanded && <Trans>Add account</Trans>}
          </Button>
        </View>
      </View>
    </ErrorBoundary>
  );
}
