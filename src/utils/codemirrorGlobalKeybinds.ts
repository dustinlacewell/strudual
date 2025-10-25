import { keymap } from '@codemirror/view';
import { Prec } from '@codemirror/state';

/**
 * Global application keybinds that should NOT be handled by CodeMirror.
 * These keybinds are handled by useKeyboardControls at the document level.
 * 
 * This keymap prevents CodeMirror from intercepting these keys by consuming them
 * with highest precedence and returning true (handled, stop propagation to other keymaps).
 * The events still bubble to document level where useKeyboardControls handles them.
 */
export const globalKeybindsPrevention = Prec.highest(
  keymap.of([
    { key: 'Escape', run: () => true },           // Toggle settings modal
    { key: 'Ctrl-;', run: () => true },           // Switch editor focus
    { key: 'Ctrl-Enter', run: () => true },       // Evaluate both editors
    { key: 'Ctrl-.', run: () => true },           // Stop Strudel
    { key: "Ctrl-'", run: () => true },           // Rotate layout
    { key: 'Ctrl-Shift-;', run: () => true },     // Swap editor order
    { key: 'Ctrl-,', run: () => true },           // Cycle split ratio
  ])
);

