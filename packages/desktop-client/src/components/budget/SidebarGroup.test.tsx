import React from 'react';
import type { ReactNode } from 'react';

import { generateCategoryGroup } from '@actual-app/core/mocks';
import { initServer } from '@actual-app/core/platform/client/connection';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { SidebarProvider } from '#components/sidebar/SidebarProvider';
import {
  configureTestAppStore,
  createTestQueryClient,
  TestProviders,
} from '#mocks';

import { EnvelopeTableLayoutProvider } from './envelopeTable';
import { SidebarGroup } from './SidebarGroup';

// The redesigned budget rows read their column layout from the table's
// provider, which needs the accounts pane's state
function BudgetTableProviders({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <EnvelopeTableLayoutProvider>{children}</EnvelopeTableLayoutProvider>
    </SidebarProvider>
  );
}

vi.mock(
  '@actual-app/core/platform/client/connection',
  () => import('#mocks/connection'),
);

describe('SidebarGroup context menu', () => {
  let store: ReturnType<typeof configureTestAppStore>;

  const group = generateCategoryGroup('Usual Expenses');

  beforeEach(() => {
    initServer({
      query: async () => ({ data: [], dependencies: [] }),
      'get-cell': async () => ({ name: 'test-cell', value: 0 }),
    });

    store = configureTestAppStore({ queryClient: createTestQueryClient() });
  });

  async function renderRow(children: ReactNode) {
    const result = render(
      <TestProviders store={store}>
        <BudgetTableProviders>{children}</BudgetTableProviders>
      </TestProviders>,
    );
    // Flush the async notes query kicked off on mount
    await act(() => Promise.resolve());
    return result;
  }

  function contextMenuItemNames() {
    return store
      .getState()
      .contextMenu.items.map(item =>
        typeof item === 'object' ? item.name : null,
      );
  }

  it('opens after the group has been renamed', async () => {
    const onSave = vi.fn();

    const { rerender } = await renderRow(
      <SidebarGroup
        group={group}
        editing={false}
        collapsed={false}
        onEdit={vi.fn()}
        onSave={onSave}
        onDelete={vi.fn()}
        onToggleCollapse={vi.fn()}
      />,
    );

    fireEvent.contextMenu(screen.getByText('Usual Expenses'));

    expect(store.getState().contextMenu.isOpen).toBe(true);
    expect(contextMenuItemNames()).toEqual([
      'rename',
      'toggle-visibility',
      'delete',
    ]);

    store.dispatch({ type: 'contextMenu/closeContextMenu' });

    // Renaming exposes the cell's input, which unmounts the row's display
    // node, then puts a brand new one back when editing ends.
    rerender(
      <TestProviders store={store}>
        <BudgetTableProviders>
          <SidebarGroup
            group={group}
            editing
            collapsed={false}
            onEdit={vi.fn()}
            onSave={onSave}
            onDelete={vi.fn()}
            onToggleCollapse={vi.fn()}
          />
        </BudgetTableProviders>
      </TestProviders>,
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Renamed Group' } });
    fireEvent.blur(input);

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Renamed Group' }),
    );

    const renamed = { ...group, name: 'Renamed Group' };
    rerender(
      <TestProviders store={store}>
        <BudgetTableProviders>
          <SidebarGroup
            group={renamed}
            editing={false}
            collapsed={false}
            onEdit={vi.fn()}
            onSave={onSave}
            onDelete={vi.fn()}
            onToggleCollapse={vi.fn()}
          />
        </BudgetTableProviders>
      </TestProviders>,
    );
    await act(() => Promise.resolve());

    fireEvent.contextMenu(screen.getByText('Renamed Group'));

    expect(store.getState().contextMenu.isOpen).toBe(true);
    expect(contextMenuItemNames()).toEqual([
      'rename',
      'toggle-visibility',
      'delete',
    ]);
  });
});
