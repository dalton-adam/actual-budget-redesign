import React from 'react';
import type { ReactNode } from 'react';
import { NavLink } from 'react-router';

import { css } from '@emotion/css';

import { tabBaseStyle, tabSelectedStyle } from './navTabStyles';

type NavTabLinkProps = {
  to: string;
  children: ReactNode;
};

export function NavTabLink({ to, children }: NavTabLinkProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        css([tabBaseStyle, isActive && tabSelectedStyle])
      }
    >
      {children}
    </NavLink>
  );
}
