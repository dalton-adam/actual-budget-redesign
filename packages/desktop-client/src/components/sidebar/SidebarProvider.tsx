// @ts-strict-ignore
import React, { createContext, useCallback, useContext, useMemo } from 'react';
import type { Dispatch, ReactNode, SetStateAction } from 'react';

import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import { useLocalStorage } from 'usehooks-ts';

export const ACCOUNTS_PANE_OPEN_WIDTH = 1280;

export function resolveAccountsPaneExpanded(
  storedExpanded: boolean | null,
  width: number,
) {
  return storedExpanded ?? width >= ACCOUNTS_PANE_OPEN_WIDTH;
}

type SidebarContextValue = {
  hidden: boolean;
  setHidden: Dispatch<SetStateAction<boolean>>;
  floating: boolean;
  alwaysFloats: boolean;
  expanded: boolean;
  setExpanded: Dispatch<SetStateAction<boolean>>;
};

const SidebarContext = createContext<SidebarContextValue>(null);

type SidebarProviderProps = {
  children: ReactNode;
};

export function SidebarProvider({ children }: SidebarProviderProps) {
  const { width } = useResponsive();
  const [storedExpanded, setStoredExpanded] = useLocalStorage<boolean | null>(
    'actual-accounts-pane-expanded',
    null,
  );
  const expanded = resolveAccountsPaneExpanded(storedExpanded, width);
  const setExpanded: Dispatch<SetStateAction<boolean>> = useCallback(
    value => {
      setStoredExpanded(current => {
        const currentExpanded = resolveAccountsPaneExpanded(current, width);
        return typeof value === 'function' ? value(currentExpanded) : value;
      });
    },
    [setStoredExpanded, width],
  );

  // Retain the legacy context fields for settings layouts while the old
  // floating sidebar preference remains supported elsewhere in the app.
  const hidden = !expanded;
  const setHidden: Dispatch<SetStateAction<boolean>> = useCallback(
    value => {
      setExpanded(
        current => !(typeof value === 'function' ? value(!current) : value),
      );
    },
    [setExpanded],
  );
  const floating = !expanded;
  const alwaysFloats = false;

  return (
    <SidebarContext.Provider
      value={{
        hidden,
        setHidden,
        floating,
        alwaysFloats,
        expanded,
        setExpanded,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const { hidden, setHidden, floating, alwaysFloats, expanded, setExpanded } =
    useContext(SidebarContext);

  return useMemo(
    () => ({
      hidden,
      setHidden,
      floating,
      alwaysFloats,
      expanded,
      setExpanded,
    }),
    [hidden, setHidden, floating, alwaysFloats, expanded, setExpanded],
  );
}
