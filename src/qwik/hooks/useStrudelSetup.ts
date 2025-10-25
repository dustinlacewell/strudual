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

      // Watch for settings changes and update editor
      // Note: This will be set up in a separate useVisibleTask in the parent component

      // Remove background color
      strudelContainerRef.value.style.backgroundColor = 'transparent';
      const editorDiv = strudelContainerRef.value.querySelector('.cm-editor');
      if (editorDiv) {
        (editorDiv as HTMLElement).style.backgroundColor = 'transparent';
      }
      const parentDiv = editorDiv?.parentElement;
      if (parentDiv) {
        (parentDiv as HTMLElement).style.backgroundColor = 'transparent';
      }

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
