import {
  keymap,
  highlightSpecialChars,
  drawSelection,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
} from '@codemirror/view';
import { history, historyKeymap, defaultKeymap } from '@codemirror/commands';
import { closeBracketsKeymap } from '@codemirror/autocomplete';

/**
 * Basic CodeMirror setup matching Strudel's basicSetup
 * Includes: history (undo/redo), special char highlighting, selection features, keymaps
 */
export const basicSetup = [
  highlightSpecialChars(),
  history(),
  drawSelection(),
  dropCursor(),
  rectangularSelection(),
  crosshairCursor(),
  keymap.of([
    ...closeBracketsKeymap,
    ...defaultKeymap,
    ...historyKeymap,
  ]),
];
