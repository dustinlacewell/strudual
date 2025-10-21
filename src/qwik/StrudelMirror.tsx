import { component$, useSignal, useVisibleTask$, type Signal, useContext } from '@builder.io/qwik';
import type { EditorView } from '@codemirror/view';
import { createStrudel, type StrudelInstance } from '@/utils/strudel';
import { UIContext } from '@/contexts/uiContext';

interface StrudelMirrorProps {
  initialCode?: string;
  editorRef?: Signal<EditorView | null>;
  strudelInstanceRef?: Signal<StrudelInstance | undefined>;
}

/**
 * Strudel editor - wraps Strudel's StrudelMirror class to match PunctualMirror interface
 */
export const StrudelMirror = component$<StrudelMirrorProps>(({
  initialCode = '',
  editorRef,
  strudelInstanceRef,
}) => {
  const containerRef = useSignal<HTMLDivElement>();
  const { editorSettings, errorMsg } = useContext(UIContext);

  // Create Strudel instance on mount
  useVisibleTask$(async ({ cleanup }) => {
    if (!containerRef.value) return;

    try {
      const settings = editorSettings.value;
      
      const strudel = await createStrudel(
        containerRef.value,
        initialCode,
        { 
          autoStart: false,
          settings: {
            fontSize: settings.fontSize,
            fontFamily: settings.fontFamily,
            keybindings: settings.keybindings,
            isLineNumbersDisplayed: settings.lineNumbers,
            isLineWrappingEnabled: settings.lineWrapping,
            isBracketMatchingEnabled: settings.bracketMatching,
            isBracketClosingEnabled: settings.bracketClosing,
            isActiveLineHighlighted: settings.activeLineHighlight,
            isTabIndentationEnabled: settings.tabIndentation,
            isMultiCursorEnabled: settings.multiCursor,
          }
        }
      );

      // Expose the StrudelInstance if ref provided
      if (strudelInstanceRef) {
        strudelInstanceRef.value = strudel;
      }

      // Expose the CodeMirror EditorView if ref provided
      if (editorRef) {
        editorRef.value = strudel.editor;
      }

      // Make background transparent
      containerRef.value.style.backgroundColor = 'transparent';
      const editorDiv = containerRef.value.querySelector('.cm-editor');
      if (editorDiv) {
        (editorDiv as HTMLElement).style.backgroundColor = 'transparent';
      }
      const parentDiv = editorDiv?.parentElement;
      if (parentDiv) {
        (parentDiv as HTMLElement).style.backgroundColor = 'transparent';
      }
      
      // Override Strudel's cursor to match unified theme
      const cursorStyle = document.createElement('style');
      cursorStyle.textContent = `
        .cm-cursor, .cm-fat-cursor {
          border-left: 2px solid #ff2d55 !important;
          border-right: none !important;
          width: 0 !important;
          background: transparent !important;
          color: transparent !important;
        }
        .cm-fat-cursor::before {
          content: none !important;
        }
        .cm-content {
          caret-color: #ff2d55 !important;
        }
        .cm-editor:not(.cm-focused) .cm-cursor,
        .cm-editor:not(.cm-focused) .cm-fat-cursor {
          border: none !important;
          border-left: 2px solid #ff2d55 !important;
          outline: none !important;
          background: none !important;
          color: transparent !important;
        }
      `;
      containerRef.value.appendChild(cursorStyle);

      cleanup(() => {
        strudel.stop();
        if (editorRef) {
          editorRef.value = null;
        }
        if (strudelInstanceRef) {
          strudelInstanceRef.value = undefined;
        }
      });
    } catch (error) {
      errorMsg.value = error instanceof Error ? error.message : String(error);
    }
  });

  // Watch settings changes and update Strudel editor
  useVisibleTask$(({ track }) => {
    track(() => editorSettings.value);
    
    if (strudelInstanceRef?.value) {
      const settings = editorSettings.value;
      strudelInstanceRef.value.editor.updateSettings({
        fontSize: settings.fontSize,
        fontFamily: settings.fontFamily,
        keybindings: settings.keybindings,
        isLineNumbersDisplayed: settings.lineNumbers,
        isLineWrappingEnabled: settings.lineWrapping,
        isBracketMatchingEnabled: settings.bracketMatching,
        isBracketClosingEnabled: settings.bracketClosing,
        isActiveLineHighlighted: settings.activeLineHighlight,
        isTabIndentationEnabled: settings.tabIndentation,
        isMultiCursorEnabled: settings.multiCursor,
      });
    }
  });

  return <div ref={containerRef} class="w-full h-full" />;
});
