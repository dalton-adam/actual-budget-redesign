import React, { useState } from 'react';
import { Dialog, Heading, Modal, ModalOverlay } from 'react-aria-components';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgClose } from '@actual-app/components/icons/v1';
import { SvgNavigationMenu } from '@actual-app/components/icons/v2';
import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import { css } from '@emotion/css';

import { NavAccountList } from './NavAccountList';
import { NavBudgetMenu } from './NavBudgetMenu';
import { NavMenuLink } from './NavMenuLink';
import { menuDividerStyle, menuSectionLabelStyle } from './navMenuStyles';
import {
  useMoreDestinations,
  usePrimaryDestinations,
} from './useNavDestinations';

// Sits above the title bar and sidebar (1000/1001) and below modals (3000),
// so a modal opened from the drawer (Add account) is never hidden by it.
const DRAWER_Z_INDEX = 2000;

// Compact navigation: below 900px every destination moves into this
// drawer (design-decisions §2).
export function NavDrawer() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const primary = usePrimaryDestinations();
  const more = useMoreDestinations();
  const close = () => setIsOpen(false);

  return (
    <>
      <Button
        variant="control"
        aria-label={t('Open navigation')}
        aria-expanded={isOpen}
        onPress={() => setIsOpen(true)}
      >
        <SvgNavigationMenu width={15} height={15} />
      </Button>
      <ModalOverlay
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        isDismissable
        className={css({
          position: 'fixed',
          inset: 0,
          zIndex: DRAWER_Z_INDEX,
          backgroundColor: 'rgba(0, 0, 0, 0.35)',
        })}
      >
        <Modal
          className={css({
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: 300,
            maxWidth: '85vw',
            backgroundColor: theme.menuBackground,
            color: theme.menuItemText,
            ...styles.shadowLarge,
            '@media (prefers-reduced-motion: no-preference)': {
              '&[data-entering]': {
                animation: 'nav-drawer-in .18s ease-out',
              },
              '@keyframes nav-drawer-in': {
                from: { transform: 'translateX(-100%)' },
                to: { transform: 'translateX(0)' },
              },
            },
          })}
        >
          <Dialog
            aria-label={t('Navigation')}
            className={css({
              height: '100%',
              outline: 'none',
              display: 'flex',
              flexDirection: 'column',
            })}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 10px 6px 16px',
              }}
            >
              <Heading
                slot="title"
                className={css({
                  ...styles.mediumText,
                  fontWeight: 600,
                  margin: 0,
                })}
              >
                <Trans>Navigation</Trans>
              </Heading>
              <Button
                variant="bare"
                aria-label={t('Close navigation')}
                onPress={close}
              >
                <SvgClose width={10} height={10} />
              </Button>
            </View>
            <nav
              aria-label={t('Main')}
              className={css({
                flex: 1,
                overflowY: 'auto',
                padding: '0 6px 12px',
                ...styles.lightScrollbar,
              })}
            >
              {primary.map(destination => (
                <NavMenuLink
                  key={destination.to}
                  to={destination.to}
                  title={destination.title}
                  Icon={destination.Icon}
                  onNavigate={close}
                />
              ))}

              <View style={menuDividerStyle} />
              <View style={menuSectionLabelStyle}>
                <Trans>Accounts</Trans>
              </View>
              <NavAccountList onNavigate={close} />

              <View style={menuDividerStyle} />
              <View style={menuSectionLabelStyle}>
                <Trans>More</Trans>
              </View>
              {more.map(destination => (
                <NavMenuLink
                  key={destination.to}
                  to={destination.to}
                  title={destination.title}
                  Icon={destination.Icon}
                  onNavigate={close}
                />
              ))}
            </nav>
            <View
              style={{
                padding: 6,
                borderTop: `1px solid ${theme.menuBorder}`,
              }}
            >
              <NavBudgetMenu onAction={close} />
            </View>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </>
  );
}
