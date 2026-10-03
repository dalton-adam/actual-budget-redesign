import React from 'react';
import type { KeyboardEvent } from 'react';
import { Dialog, Modal, ModalOverlay } from 'react-aria-components';
import { useTranslation } from 'react-i18next';

import { styles } from '@actual-app/components/styles';
import type { CSSProperties } from '@actual-app/components/styles';
import { SurfaceCard } from '@actual-app/components/surface-card';
import { theme } from '@actual-app/components/theme';
import { css } from '@emotion/css';

import { CategoryDetailsBody } from './CategoryDetailsBody';
import {
  CATEGORY_DETAILS_PANEL_ID,
  DeferredCategoryDetails,
  DETAILS_PANEL_GAP,
  useCategoryDetails,
} from './CategoryDetailsContext';
import { CategoryDetailsHeader } from './CategoryDetailsHeader';

// Above the title bar and accounts pane (1000/1001), below modals (3000),
// matching the navigation drawer.
const OVERLAY_Z_INDEX = 2000;

const panelCardStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  padding: 20,
  gap: 16,
  overflowY: 'auto',
  ...styles.lightScrollbar,
  // `View` sets `min-height: 0`; without this, sections squash and overlap
  // instead of the card scrolling when the content is taller than the card.
  '& > *': { flexShrink: 0 },
};

type CategoryDetailsPanelProps = {
  width: number;
};

/**
 * The Budget page's category details panel frame (design-decisions §5):
 * beside the table from 900px, an overlay with a scrim below that or when
 * the table would not fit beside it.
 */
export function CategoryDetailsPanel({ width }: CategoryDetailsPanelProps) {
  const { t } = useTranslation();
  const details = useCategoryDetails();

  if (!details) {
    return null;
  }

  // The frame renders at once, so the table never shifts; its contents
  // follow when the browser is idle (DeferredCategoryDetails).
  const contents = (
    <DeferredCategoryDetails>
      <CategoryDetailsContents />
    </DeferredCategoryDetails>
  );

  if (details.mode === 'overlay') {
    return (
      <ModalOverlay
        isOpen={details.isShown}
        onOpenChange={isOpen => {
          if (!isOpen) {
            details.close();
          }
        }}
        isDismissable
        className={css({
          position: 'fixed',
          inset: 0,
          zIndex: OVERLAY_Z_INDEX,
          backgroundColor: theme.scrim,
        })}
      >
        <Modal
          className={css({
            position: 'absolute',
            top: 12,
            right: 12,
            bottom: 12,
            width: `min(${width}px, calc(100vw - 24px))`,
            display: 'flex',
            outline: 'none',
          })}
        >
          <Dialog
            id={CATEGORY_DETAILS_PANEL_ID}
            aria-label={t('Category details')}
            className={css({ display: 'flex', flex: 1, outline: 'none' })}
          >
            <SurfaceCard style={panelCardStyle}>{contents}</SurfaceCard>
          </Dialog>
        </Modal>
      </ModalOverlay>
    );
  }

  if (!details.isShown) {
    return null;
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape' && !e.defaultPrevented) {
      e.preventDefault();
      details?.close();
    }
  }

  return (
    <aside
      id={CATEGORY_DETAILS_PANEL_ID}
      aria-label={t('Category details')}
      data-testid="category-details-panel"
      onKeyDown={onKeyDown}
      className={css({
        display: 'flex',
        width: width + DETAILS_PANEL_GAP,
        paddingLeft: DETAILS_PANEL_GAP,
        flexShrink: 0,
      })}
    >
      <SurfaceCard style={panelCardStyle}>{contents}</SurfaceCard>
    </aside>
  );
}

function CategoryDetailsContents() {
  const month = useCategoryDetails()?.month;
  if (!month) {
    return null;
  }
  return (
    <>
      <CategoryDetailsHeader month={month} />
      <CategoryDetailsBody month={month} />
    </>
  );
}
