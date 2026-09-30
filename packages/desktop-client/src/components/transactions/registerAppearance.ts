import { createContext, useContext } from 'react';

import type { CategoryEntity } from '@actual-app/core/types/models';

import { getCategoryAccentIndex } from '#components/budget/categoryPresentation';

/**
 * The account register's row height (design-decisions §10, APP-02), passed
 * through the shared table's `rowHeight` prop. The shared `ROW_HEIGHT`
 * stays 32px for every other table.
 */
export const REGISTER_ROW_HEIGHT = 36;

const RegisterAppearanceContext = createContext(false);

export const RegisterAppearanceProvider = RegisterAppearanceContext.Provider;

/**
 * True inside the account register. Other screens that reuse the
 * transaction table (the Calendar report) keep upstream's look until their
 * own task restyles them.
 */
export function useIsRegister() {
  return useContext(RegisterAppearanceContext);
}

/**
 * The accent for a transaction's category, or undefined (neutral) for
 * income and uncategorized rows: accents show identity for spending
 * categories only (DESIGN.md, category accents).
 */
export function getRegisterAccentIndex(category: CategoryEntity | undefined) {
  if (!category || category.is_income) {
    return undefined;
  }
  return getCategoryAccentIndex(category.id);
}
