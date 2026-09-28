import React, { useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Popover } from '@actual-app/components/popover';
import { View } from '@actual-app/components/view';

import { NavMenuLink } from './NavMenuLink';
import { menuPanelStyle } from './navMenuStyles';
import { NavTabMenuButton } from './NavTabMenuButton';
import {
  useIsMoreRouteActive,
  useMoreDestinations,
} from './useNavDestinations';

export function MoreMenu() {
  const { t } = useTranslation();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const isActive = useIsMoreRouteActive();
  const destinations = useMoreDestinations();

  return (
    <>
      <NavTabMenuButton
        ref={triggerRef}
        isSelected={isActive}
        isOpen={isOpen}
        onPress={() => setIsOpen(open => !open)}
      >
        <Trans>More</Trans>
      </NavTabMenuButton>
      <Popover
        triggerRef={triggerRef}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        placement="bottom start"
        offset={6}
        style={{ ...menuPanelStyle, width: 220 }}
      >
        <View role="navigation" aria-label={t('More')}>
          {destinations.map(destination => (
            <NavMenuLink
              key={destination.to}
              to={destination.to}
              title={destination.title}
              Icon={destination.Icon}
              onNavigate={() => setIsOpen(false)}
            />
          ))}
        </View>
      </Popover>
    </>
  );
}
