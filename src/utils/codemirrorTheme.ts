import { EditorView } from '@codemirror/view';
import type { EditorSettings } from '@/stores/editorSettings';

/**
 * Create a unified CodeMirror theme based on editor settings
 */
export function createEditorTheme(settings: EditorSettings) {
  return EditorView.theme({
    '&': {
      backgroundColor: 'transparent',
      color: 'white',
      fontSize: `${settings.fontSize}px`,
      fontFamily: settings.fontFamily,
      height: '100% !important',
    },
    '.cm-content': {
      caretColor: '#ff2d55',
    },
    '.cm-cursor, .cm-fat-cursor': {
      borderLeft: '2px solid #ff2d55',
      borderRight: 'none',
      width: '0',
      background: 'transparent',
      color: 'transparent',
    },
    '.cm-fat-cursor::before': {
      content: 'none',
    },
    // Keep cursor visible when unfocused, no border
    '&:not(.cm-focused) .cm-cursor, &:not(.cm-focused) .cm-fat-cursor': {
      border: 'none !important',
      borderLeft: '2px solid #ff2d55 !important',
      outline: 'none !important',
      background: 'none !important',
      color: 'transparent !important',
    },
    '.cm-selectionBackground': {
      backgroundColor: 'rgba(255, 255, 255, 0.2) !important',
    },
    '&.cm-focused .cm-selectionBackground': {
      backgroundColor: 'rgba(255, 255, 255, 0.3) !important',
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
  });
}
