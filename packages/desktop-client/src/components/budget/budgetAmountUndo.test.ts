import { describe, expect, it } from 'vitest';

import { budgetAmountUndoAction } from './budgetAmountUndo';

function key(
  overrides: Partial<Parameters<typeof budgetAmountUndoAction>[0]> = {},
) {
  return {
    key: 'z',
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    altKey: false,
    ...overrides,
  };
}

describe('budgetAmountUndoAction', () => {
  it('runs app undo for Ctrl+Z or Cmd+Z in an unedited box', () => {
    expect(budgetAmountUndoAction(key({ ctrlKey: true }), false)).toBe('undo');
    expect(budgetAmountUndoAction(key({ metaKey: true }), false)).toBe('undo');
  });

  it('runs app redo with Shift held, whatever the key case', () => {
    expect(
      budgetAmountUndoAction(
        key({ key: 'Z', ctrlKey: true, shiftKey: true }),
        false,
      ),
    ).toBe('redo');
  });

  it('leaves undo to the input once the box has been edited', () => {
    expect(budgetAmountUndoAction(key({ ctrlKey: true }), true)).toBeNull();
    expect(
      budgetAmountUndoAction(key({ ctrlKey: true, shiftKey: true }), true),
    ).toBeNull();
  });

  it('ignores other keys and modifier combinations', () => {
    expect(budgetAmountUndoAction(key(), false)).toBeNull();
    expect(
      budgetAmountUndoAction(key({ key: 'y', ctrlKey: true }), false),
    ).toBeNull();
    expect(
      budgetAmountUndoAction(key({ ctrlKey: true, altKey: true }), false),
    ).toBeNull();
  });
});
