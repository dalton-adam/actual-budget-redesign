import { isAccountsRoute, isMoreRoute } from './useNavDestinations';

describe('navigation route matching', () => {
  it('treats every More destination as a More route', () => {
    for (const path of [
      '/payees',
      '/payees/abc',
      '/rules',
      '/rules/abc',
      '/bank-sync',
      '/bank-sync/account/abc/edit',
      '/tags',
      '/settings',
    ]) {
      expect(isMoreRoute(path)).toBe(true);
    }
  });

  it('does not treat primary or account routes as More routes', () => {
    for (const path of ['/budget', '/reports', '/schedules', '/accounts']) {
      expect(isMoreRoute(path)).toBe(false);
    }
  });

  it('matches all account routes and nothing else', () => {
    expect(isAccountsRoute('/accounts')).toBe(true);
    expect(isAccountsRoute('/accounts/onbudget')).toBe(true);
    expect(isAccountsRoute('/accounts/offbudget')).toBe(true);
    expect(isAccountsRoute('/accounts/abc-123')).toBe(true);
    expect(isAccountsRoute('/accountsx')).toBe(false);
    expect(isAccountsRoute('/budget')).toBe(false);
  });
});
