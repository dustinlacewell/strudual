import { useVisibleTask$, useContext } from '@builder.io/qwik';
import { createStrudel } from '@/utils/strudel';
import { loadSettings } from '@/stores/editorSettings';
import { StrudelContext } from '@/contexts/strudelContext';
import { UIContext } from '@/contexts/uiContext';

export function useStrudelSetup(strudelCode: string) {
  const { strudelRef, strudelContainerRef } = useContext(StrudelContext);
  const { errorMsg } = useContext(UIContext);

  useVisibleTask$(async () => {
    if (!strudelContainerRef.value) return;

    try {
      const settings = loadSettings();
      
      const strudel = await createStrudel(
        strudelContainerRef.value,
        strudelCode,
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
      strudelRef.value = strudel;

      // Remove background color and fix cursor style
      strudelContainerRef.value.style.backgroundColor = 'transparent';
      const editorDiv = strudelContainerRef.value.querySelector('.cm-editor');
      if (editorDiv) {
        (editorDiv as HTMLElement).style.backgroundColor = 'transparent';
      }
      const parentDiv = editorDiv?.parentElement;
      if (parentDiv) {
        (parentDiv as HTMLElement).style.backgroundColor = 'transparent';
      }
      
      // Override Strudel's vim/block cursor to match unified theme
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
        /* Remove ugly unfocused cursor border */
        .cm-editor:not(.cm-focused) .cm-cursor,
        .cm-editor:not(.cm-focused) .cm-fat-cursor {
          border: none !important;
          border-left: 2px solid #ff2d55 !important;
          outline: none !important;
          background: none !important;
          color: transparent !important;
        }
      `;
      strudelContainerRef.value.appendChild(cursorStyle);

      // Add Ctrl+M as alternative to Ctrl+N (Chrome shadows Ctrl+N with new window)
      // This is a workaround since we can't easily modify Strudel's keymap
      const handleCtrlM = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.key === 'm') {
          e.preventDefault();
          // Simulate down arrow
          const event = new KeyboardEvent('keydown', {
            key: 'ArrowDown',
            bubbles: true,
          });
          e.target?.dispatchEvent(event);
        }
      };
      strudelContainerRef.value.addEventListener('keydown', handleCtrlM);

      // Focus on Strudel editor (after next frame)
      requestAnimationFrame(() => {
        const cmContent = strudelContainerRef.value?.querySelector('.cm-content') as HTMLElement;
        if (cmContent) {
          cmContent.focus();
        }
      });
    } catch (error) {
      errorMsg.value = error instanceof Error ? error.message : String(error);
    }
  });
}
