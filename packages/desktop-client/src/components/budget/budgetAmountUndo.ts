import { useRef } from 'react';
import type { KeyboardEvent } from 'react';

import { redo, undo } from '#undo';

type UndoKey = Pick<
  KeyboardEvent,
  'key' | 'ctrlKey' | 'metaKey' | 'shiftKey' | 'altKey'
>;

// Which app history action a key press in a Budget amount box should run.
// Only an unedited box hands Cmd/Ctrl+Z to the app; once the box has been
// typed in, the browser's own text undo applies, as in any input.
export function budgetAmountUndoAction(
  event: UndoKey,
  isEdited: boolean,
): 'undo' | 'redo' | null {
  if (isEdited || event.altKey || !(event.ctrlKey || event.metaKey)) {
    return null;
  }
  if (event.key.toLowerCase() !== 'z') {
    return null;
  }
  return event.shiftKey ? 'redo' : 'undo';
}

// Props for a Budget amount box's input. The shared table input stops key
// presses from reaching the app's global Cmd/Ctrl+Z handler, and that handler
// skips focused inputs, so after Enter saves an amount (and focus moves to the
// next box) undo would do nothing.
export function useBudgetAmountUndoKeys() {
  const isEditedRef = useRef(false);

  return {
    onFocus: () => {
      isEditedRef.current = false;
    },
    onChange: () => {
      isEditedRef.current = true;
    },
    onKeyDownCapture: (e: KeyboardEvent<HTMLInputElement>) => {
      const action = budgetAmountUndoAction(e, isEditedRef.current);
      if (action == null) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      if (action === 'redo') {
        redo();
      } else {
        undo();
      }
    },
  };
}
