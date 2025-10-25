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
    // Escape - Toggle settings modal
    {
      key: 'Escape',
      run: () => true, // Consume in CodeMirror, let bubble to document handler
    },
    
    // Ctrl+; - Switch editor focus
    {
      key: 'Ctrl-;',
      run: () => true,
    },
    
    // Ctrl+Enter - Evaluate both editors
    {
      key: 'Ctrl-Enter',
      run: () => true,
    },
    
    // Ctrl+. - Stop Strudel
    {
      key: 'Ctrl-.',
      run: () => true,
    },
    
    // Ctrl+' - Rotate layout
    {
      key: "Ctrl-'",
      run: () => true,
    },
    
    // Ctrl+Shift+; - Swap editor order
    {
      key: 'Ctrl-Shift-;',
      run: () => true,
    },
    
    // Ctrl+, - Cycle split ratio
    {
      key: 'Ctrl-,',
      run: () => true,
    },
  ])
);

