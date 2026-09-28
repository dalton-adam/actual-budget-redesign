import {
  ACCOUNTS_PANE_OPEN_WIDTH,
  resolveAccountsPaneExpanded,
} from './SidebarProvider';

describe('accounts pane default state', () => {
  it('defaults to collapsed below 1280px and expanded at 1280px', () => {
    expect(
      resolveAccountsPaneExpanded(null, ACCOUNTS_PANE_OPEN_WIDTH - 1),
    ).toBe(false);
    expect(resolveAccountsPaneExpanded(null, ACCOUNTS_PANE_OPEN_WIDTH)).toBe(
      true,
    );
  });

  it('uses the device-local choice instead of the viewport default', () => {
    expect(resolveAccountsPaneExpanded(true, 1000)).toBe(true);
    expect(resolveAccountsPaneExpanded(false, 1440)).toBe(false);
  });
});
