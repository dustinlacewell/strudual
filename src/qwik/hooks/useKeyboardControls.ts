import { useVisibleTask$, useContext } from '@builder.io/qwik';
import { StrudelContext } from '@/contexts/strudelContext';
import { PunctualContext } from '@/contexts/punctualContext';
import { UIContext } from '@/contexts/uiContext';
import { CollabContext } from '@/contexts/collabContext';
import { saveSettings } from '@/stores/editorSettings';

export function useKeyboardControls() {
  const { strudelRef, strudelEditorRef } = useContext(StrudelContext);
  const { punctualAnimatorRef, punctualEditorRef } = useContext(PunctualContext);
  const { activeEditor, showSettings, layoutOrientation, computedOrientation, editorSettings } = useContext(UIContext);
  const collab = useContext(CollabContext);

  useVisibleTask$(() => {
    const handleWheel = (e: WheelEvent) => {
      // Shift+Scroll: Adjust font size
      if (e.shiftKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -1 : 1; // Scroll down = smaller, scroll up = larger
        const currentSize = editorSettings.value.fontSize;
        const newSize = Math.max(8, Math.min(64, currentSize + delta));
        
        if (newSize !== currentSize) {
          editorSettings.value = { ...editorSettings.value, fontSize: newSize };
          saveSettings(editorSettings.value);
        }
      }
    };

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

      // Ctrl+': Rotate layout (toggle between vertical and horizontal based on current computed orientation)
      if (e.ctrlKey && e.key === "'") {
        e.preventDefault();
        // Toggle to the opposite of what's currently displayed
        const newOrientation = computedOrientation.value === 'vertical' ? 'horizontal' : 'vertical';
        layoutOrientation.value = newOrientation;
        editorSettings.value = { ...editorSettings.value, layoutOrientation: newOrientation };
        saveSettings(editorSettings.value);
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
    document.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      document.removeEventListener('keydown', handler);
      document.removeEventListener('wheel', handleWheel);
    };
  });
}
