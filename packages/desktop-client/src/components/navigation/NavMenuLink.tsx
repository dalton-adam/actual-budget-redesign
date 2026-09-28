import React from 'react';
import type { ComponentType, ReactNode, SVGProps } from 'react';
import { NavLink } from 'react-router';

import { css } from '@emotion/css';

import { menuRowActiveStyle, menuRowStyle } from './navMenuStyles';

type NavMenuLinkProps = {
  to: string;
  title: string;
  Icon?: ComponentType<SVGProps<SVGSVGElement>>;
  end?: boolean;
  right?: ReactNode;
  onNavigate?: () => void;
};

export function NavMenuLink({
  to,
  title,
  Icon,
  end = false,
  right,
  onNavigate,
}: NavMenuLinkProps) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        css([menuRowStyle, isActive && menuRowActiveStyle])
      }
    >
      {Icon && <Icon width={14} height={14} style={{ flexShrink: 0 }} />}
      <span style={{ flex: 1 }}>{title}</span>
      {right}
    </NavLink>
  );
}
