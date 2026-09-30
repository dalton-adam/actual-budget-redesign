import React, { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode, RefObject } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import { SvgDotsHorizontalTriple } from '@actual-app/components/icons/v1';
import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import { css } from '@emotion/css';

import { useContextMenu } from '#hooks/useContextMenu';
import { useIsInViewport } from '#hooks/useIsInViewport';
import { useNavigate } from '#hooks/useNavigate';
import { pushModal } from '#modals/modalsSlice';
import { useDispatch } from '#redux';
import {
  useCopyDashboardWidgetMutation,
  useRemoveDashboardWidgetMutation,
} from '#reports/mutations';

import { NON_DRAGGABLE_AREA_CLASS_NAME } from './constants';

type ReportCardProps = {
  widgetId: string;
  isEditing?: boolean;
  disableClick?: boolean;
  to?: string;
  children: ReactNode;
  size?: number;
  style?: CSSProperties;
  onRename?: () => void;
  contextMenuTriggerRef?: RefObject<HTMLDivElement | null>;
};

export function ReportCard({
  widgetId,
  isEditing,
  disableClick,
  to,
  children,
  size = 1,
  style,
  onRename,
  contextMenuTriggerRef,
}: ReportCardProps) {
  const ref = useRef(null);
  const isInViewport = useIsInViewport(ref);
  const [hasRendered, setHasRendered] = useState(false);
  const navigate = useNavigate();
  const { isNarrowWidth } = useResponsive();
  const containerProps = {
    flex: isNarrowWidth ? '1 1' : `0 0 calc(${size * 100}% / 3 - 20px)`,
  };

  useEffect(() => {
    if (isInViewport && !hasRendered) {
      setHasRendered(true);
    }
  }, [isInViewport, hasRendered]);

  const layoutProps = {
    isEditing,
    widgetId,
    onRename,
    contextMenuTriggerRef,
  };

  const content = (
    <View
      ref={ref}
      style={{
        // A hairline Surface card with no shadow (APP-03, owner decision
        // September 30, 2026; docs/redesign/prototype/README.md).
        backgroundColor: theme.cardBackground,
        border: `1px ${isEditing ? 'dashed' : 'solid'} ${
          isEditing ? theme.pageTextFaint : theme.cardHairline
        }`,
        borderRadius: 18,
        overflow: 'hidden',
        color: theme.pageText,
        width: '100%',
        height: '100%',
        '@media (prefers-reduced-motion: no-preference)': {
          transition: 'border-color .15s',
        },
        ...(isEditing
          ? {
              // Room for the always-visible widget menu in edit mode, so it
              // never covers the header's value or change pill. Each card's
              // header is the first child of its root view.
              '& > div > div:first-child': { paddingRight: 48 },
              '& .recharts-surface:hover': {
                cursor: 'move',
                ':active': { cursor: 'grabbing' },
              },
              ':active': { cursor: 'grabbing' },
            }
          : {
              '& .recharts-surface:hover': {
                cursor: 'pointer',
              },
            }),
        ':hover': {
          ...(to ? { borderColor: theme.pageTextFaint } : null),
          ...(isEditing ? { cursor: 'move' } : null),
        },
        ...(to ? null : containerProps),
        ...style,
      }}
    >
      {/* we render the content only if it is in the viewport
      this reduces the amount of concurrent server api calls and thus
      has a better performance */}
      {isInViewport || hasRendered ? children : null}
    </View>
  );

  if (to && !isEditing && !disableClick) {
    return (
      <Layout {...layoutProps}>
        <Button
          variant="bare"
          onPress={() => navigate(to, { state: { goBack: true } })}
          className={css({
            // Keyboard focus: the redesign focus ring plus the stronger card
            // border that hover shows.
            '&[data-focus-visible]': styles.focusRing,
            '&[data-focus-visible] > div': { borderColor: theme.pageTextFaint },
          })}
          style={{
            height: '100%',
            width: '100%',
            background: 'transparent',
            padding: 0,
            textAlign: 'left',
            overflow: 'visible',
            borderRadius: 18,
          }}
        >
          {content}
        </Button>
      </Layout>
    );
  }

  return <Layout {...layoutProps}>{content}</Layout>;
}

type LayoutProps = {
  children: ReactNode;
} & Pick<
  ReportCardProps,
  'isEditing' | 'widgetId' | 'onRename' | 'contextMenuTriggerRef'
>;

function Layout({
  children,
  isEditing,
  widgetId,
  onRename,
  contextMenuTriggerRef,
}: LayoutProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const triggerRef = useRef<HTMLButtonElement>(null);
  const internalViewRef = useRef<HTMLDivElement>(null);
  const viewRef = contextMenuTriggerRef || internalViewRef;

  const removeDashboardWidgetMutation = useRemoveDashboardWidgetMutation();
  const copyDashboardWidgetMutation = useCopyDashboardWidgetMutation();

  useContextMenu({
    triggerRef: viewRef,
    items: [
      onRename && {
        name: 'rename',
        text: t('Rename'),
        onClick: onRename,
        order: 1,
      },
      {
        name: 'remove',
        text: t('Remove'),
        onClick: () => removeDashboardWidgetMutation.mutate({ id: widgetId }),
        order: 1,
      },
      {
        name: 'copy',
        text: t('Copy to dashboard'),
        onClick: () => {
          dispatch(
            pushModal({
              modal: {
                name: 'copy-widget-to-dashboard',
                options: {
                  onSelect: targetDashboardId => {
                    copyDashboardWidgetMutation.mutate({
                      id: widgetId,
                      targetDashboardPageId: targetDashboardId,
                    });
                  },
                },
              },
            }),
          );
        },
        order: 1,
      },
    ],
  });

  return (
    <View
      ref={viewRef}
      style={{
        display: 'block',
        height: '100%',
        '& .hover-visible': {
          opacity: 0,
          transition: 'opacity .25s',
        },
        '&:hover .hover-visible': {
          opacity: 1,
        },
      }}
    >
      {isEditing && (
        <View
          className={NON_DRAGGABLE_AREA_CLASS_NAME}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 1,
          }}
        >
          <Button
            ref={triggerRef}
            variant="control"
            aria-label={t('Menu')}
            style={{ width: 28, height: 28, minWidth: 28, minHeight: 28 }}
            onPress={() => {
              if (viewRef.current) {
                const rect = triggerRef.current?.getBoundingClientRect();
                const clientX = rect ? rect.left : 0;
                const clientY = rect ? rect.bottom : 0;
                viewRef.current.dispatchEvent(
                  new MouseEvent('contextmenu', {
                    bubbles: true,
                    clientX,
                    clientY,
                  }),
                );
              }
            }}
          >
            <SvgDotsHorizontalTriple width={13} height={13} />
          </Button>
        </View>
      )}

      {children}
    </View>
  );
}
