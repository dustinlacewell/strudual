import { useVisibleTask$, useContext } from '@builder.io/qwik';
import { StrudelContext } from '@/contexts/strudelContext';
import { PunctualContext } from '@/contexts/punctualContext';
import { UIContext } from '@/contexts/uiContext';

export function useKeyboardControls() {
  const { strudelRef, strudelContainerRef } = useContext(StrudelContext);
  const { punctualAnimatorRef, punctualEditorRef } = useContext(PunctualContext);
  const { activeEditor, showSettings } = useContext(UIContext);

  useVisibleTask$(() => {
    const handler = (e: KeyboardEvent) => {
      // Esc: Toggle settings modal
      if (e.key === 'Escape') {
        e.preventDefault();
        showSettings.value = !showSettings.value;
        return;
      }

      // Ctrl+;: Switch focus between editors
      if (e.ctrlKey && e.key === ';') {
        e.preventDefault();
        const newEditor = activeEditor.value === 'strudel' ? 'punctual' : 'strudel';
        activeEditor.value = newEditor;
        
        // Focus appropriate editor
        if (newEditor === 'punctual' && punctualEditorRef.value) {
          punctualEditorRef.value.focus();
        } else if (newEditor === 'strudel') {
          const cmContent = strudelContainerRef.value?.querySelector('.cm-content') as HTMLElement;
          if (cmContent) {
            cmContent.focus();
          }
        }
        return;
      }

      // Ctrl+Enter: Evaluate both editors
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        // Evaluate Strudel
        if (strudelRef.value) {
          const strudelCode = strudelContainerRef.value?.querySelector('.cm-content')?.textContent || '';
          strudelRef.value.evaluate(strudelCode);
        }
        // Evaluate Punctual
        if (punctualAnimatorRef.value && punctualEditorRef.value) {
          const punctualCode = punctualEditorRef.value.state.doc.toString();
          punctualAnimatorRef.value.evaluate(punctualCode);
        }
        return;
      }

      // Ctrl+.: Stop Strudel
      if (e.ctrlKey && e.key === '.') {
        e.preventDefault();
        if (strudelRef.value) {
          strudelRef.value.stop();
        }
        return;
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  });
}
