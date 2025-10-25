import { EditorView } from '@codemirror/view';
import { Prec } from '@codemirror/state';
import type { EditorSettings } from '@/stores/editorSettings';

/**
 * Create a unified CodeMirror theme based on editor settings
 * Uses highest precedence to override keybinding mode themes (emacs/vim)
 */
export function createEditorTheme(settings: EditorSettings) {
  return Prec.highest(EditorView.theme({
    '&': {
      backgroundColor: 'transparent',
      color: 'white',
      fontSize: `${settings.fontSize}px`,
      fontFamily: settings.fontFamily,
      height: '100% !important',
    },
    '.cm-content': {
      caretColor: 'transparent',
    },
    '.cm-cursor': {
      borderLeft: '2px solid #ff9696',
      animation: 'none',
    },
    '.cm-fat-cursor': {
      background: '#ff9696',
      border: 'none',
      outline: 'none',
    },
    '.cm-cursorLayer': {
      animationDuration: '0ms !important',
    },
    '.cm-fat-cursor::before': {
      content: 'none',
    },
    // Keep cursor visible when unfocused
    '&:not(.cm-focused) .cm-cursor': {
      borderLeft: '2px solid #ff9696',
    },
    '&:not(.cm-focused) .cm-fat-cursor': {
      background: 'none',
      border: 'none',
      outline: 'solid 1px #ff9696',
    },
    '.cm-selectionBackground, ::selection': {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    '&.cm-focused .cm-selectionBackground, &.cm-focused ::selection': {
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    '.cm-activeLine': {
      backgroundColor: settings.activeLineHighlight ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
    },
    '.cm-gutters': {
      backgroundColor: 'transparent',
      color: 'rgba(255, 255, 255, 0.5)',
      border: 'none',
    },
    '.cm-activeLineGutter': {
      backgroundColor: settings.activeLineHighlight ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
    },
  }));
}
