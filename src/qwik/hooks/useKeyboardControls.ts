import { useVisibleTask$, useContext } from '@builder.io/qwik';
import { StrudelContext } from '@/contexts/strudelContext';
import { PunctualContext } from '@/contexts/punctualContext';
import { UIContext } from '@/contexts/uiContext';
import { CollabContext } from '@/contexts/collabContext';
import { saveSettings } from '@/stores/editorSettings';

export function useKeyboardControls() {
  const { strudelRef, strudelEditorRef } = useContext(StrudelContext);
  const { punctualAnimatorRef, punctualEditorRef } = useContext(PunctualContext);
  const { activeEditor, showSettings, layoutOrientation, editorSettings } = useContext(UIContext);
  const collab = useContext(CollabContext);

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
        
        // Focus appropriate editor and broadcast to peers
        if (newEditor === 'punctual' && punctualEditorRef.value) {
          punctualEditorRef.value.focus();
        } else if (newEditor === 'strudel' && strudelEditorRef.value) {
          strudelEditorRef.value.focus();
        }
        
        // Broadcast active editor change to peers
        collab.setActiveEditor(newEditor);
        return;
      }

      // Ctrl+Enter: Evaluate both editors
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        // Evaluate Strudel
        if (strudelRef.value && strudelEditorRef.value) {
          const strudelCode = strudelEditorRef.value.state.doc.toString();
          strudelRef.value.evaluate(strudelCode);
        }
        // Evaluate Punctual
        if (punctualAnimatorRef.value && punctualEditorRef.value) {
          const punctualCode = punctualEditorRef.value.state.doc.toString();
          punctualAnimatorRef.value.evaluate(punctualCode);
        }
        // Broadcast evaluation to peers
        console.log('[keyboard] Broadcasting evaluation to peers');
        collab.broadcastEvaluate();
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

      // Ctrl+R: Rotate layout (toggle vertical/horizontal)
      if (e.ctrlKey && !e.shiftKey && e.key === 'r') {
        e.preventDefault();
        layoutOrientation.value = layoutOrientation.value === 'vertical' ? 'horizontal' : 'vertical';
        return;
      }

      // Ctrl+Shift+;: Swap editor order
      if (e.ctrlKey && e.shiftKey && e.key === ':') { // Shift+; produces ':'
        e.preventDefault();
        const newOrder = editorSettings.value.editorOrder === 'strudel-first' ? 'punctual-first' : 'strudel-first';
        editorSettings.value = { ...editorSettings.value, editorOrder: newOrder };
        saveSettings(editorSettings.value);
        return;
      }

      // Ctrl+,: Cycle split ratio (50-50 -> 33-66 -> 100-0 -> 50-50)
      if (e.ctrlKey && e.key === ',') {
        e.preventDefault();
        const currentRatio = editorSettings.value.splitRatio;
        const newRatio = currentRatio === '50-50' ? '33-66' : currentRatio === '33-66' ? '100-0' : '50-50';
        editorSettings.value = { ...editorSettings.value, splitRatio: newRatio };
        saveSettings(editorSettings.value);
        return;
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  });
}
