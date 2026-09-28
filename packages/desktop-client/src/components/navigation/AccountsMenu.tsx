import React, { useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Popover } from '@actual-app/components/popover';
import { View } from '@actual-app/components/view';

import { NavAccountList } from './NavAccountList';
import { menuPanelStyle } from './navMenuStyles';
import { NavTabMenuButton } from './NavTabMenuButton';
import { useIsAccountsRouteActive } from './useNavDestinations';

export function AccountsMenu() {
  const { t } = useTranslation();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const isActive = useIsAccountsRouteActive();

  return (
    <>
      <NavTabMenuButton
        ref={triggerRef}
        isSelected={isActive}
        isOpen={isOpen}
        onPress={() => setIsOpen(open => !open)}
      >
        <Trans>Accounts</Trans>
      </NavTabMenuButton>
      <Popover
        triggerRef={triggerRef}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        placement="bottom start"
        offset={6}
        style={{ ...menuPanelStyle, width: 300, maxHeight: '70vh' }}
      >
        <View role="navigation" aria-label={t('Accounts')}>
          <NavAccountList onNavigate={() => setIsOpen(false)} />
        </View>
      </Popover>
    </>
  );
}
