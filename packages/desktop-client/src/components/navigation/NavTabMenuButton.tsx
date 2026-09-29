import React, { forwardRef } from 'react';
import type { ReactNode } from 'react';

import { Button } from '@actual-app/components/button';
import { SvgCheveronDown } from '@actual-app/components/icons/v1';
import { css } from '@emotion/css';

import { TITLEBAR_TIGHT } from './constants';
import { TAB_HEIGHT } from './navTabStyles';

type NavTabMenuButtonProps = {
  isSelected: boolean;
  isOpen: boolean;
  onPress: () => void;
  children: ReactNode;
};

export const NavTabMenuButton = forwardRef<
  HTMLButtonElement,
  NavTabMenuButtonProps
>(({ isSelected, isOpen, onPress, children }, ref) => (
  <Button
    ref={ref}
    variant={isSelected ? 'tabSelected' : 'tab'}
    aria-expanded={isOpen}
    // Tells assistive tech the current page is one of this menu's routes.
    aria-current={isSelected ? 'page' : undefined}
    onPress={onPress}
    className={css({
      padding: '0 10px 0 12px',
      [TITLEBAR_TIGHT]: { padding: '0 6px 0 8px' },
    })}
    style={{ height: TAB_HEIGHT, gap: 4 }}
  >
    {children}
    <SvgCheveronDown width={10} height={10} style={{ flexShrink: 0 }} />
  </Button>
));

NavTabMenuButton.displayName = 'NavTabMenuButton';
