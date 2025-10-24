import { component$, useSignal, useVisibleTask$, useContext } from '@builder.io/qwik';
import { StateEffect } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { createStrudel } from '@/utils/strudel';
import { UIContext } from '@/contexts/uiContext';
import { StrudelContext } from '@/contexts/strudelContext';

/**
 * Strudel editor - wraps Strudel's StrudelMirror class to match PunctualMirror interface
 */
export const StrudelMirror = component$(() => {
  const containerRef = useSignal<HTMLDivElement>();
  const { editorSettings, errorMsg } = useContext(UIContext);
  const { strudelRef, strudelEditorRef, strudelCollabCompartmentRef, strudelCode, strudelCursor } = useContext(StrudelContext);

  // Create Strudel instance on mount
  useVisibleTask$(async ({ cleanup }) => {
    if (!containerRef.value) return;

    try {
      const settings = editorSettings.value;
      
      // Read code value here, after localStorage has been loaded
      const strudel = await createStrudel(
        containerRef.value,
        strudelCode.value,
        { 
          autoStart: false,
          settings: settings,
        }
      );

      // Expose the StrudelInstance to context
      strudelRef.value = strudel;

      // Get editor view reference
      const editorView = (strudel.editor as any).editor as EditorView;

      // Expose the CodeMirror EditorView to context
      // strudel.editor is StrudelMirror instance, strudel.editor.editor is the EditorView
      strudelEditorRef.value = editorView;

      // Restore cursor position if available
      if (strudelCursor.value !== null) {
        const maxPos = editorView.state.doc.length;
        const cursor = Math.min(strudelCursor.value, maxPos);
        editorView.dispatch({
          selection: { anchor: cursor, head: cursor },
        });
      }

      // Create and inject collab compartment
      const { Compartment, StateEffect } = await import('@codemirror/state');
      
      const collabCompartment = new Compartment();
      strudelCollabCompartmentRef.value = collabCompartment;
      
      editorView.dispatch({
        effects: [
          StateEffect.appendConfig.of(collabCompartment.of([])),
        ]
      });
      
      console.log('[StrudelMirror] Injected collab compartment');

      // Make background transparent (Strudel sets its own background)
      containerRef.value.style.backgroundColor = 'transparent';
      const editorDiv = containerRef.value.querySelector('.cm-editor');
      if (editorDiv) {
        (editorDiv as HTMLElement).style.backgroundColor = 'transparent';
      }
      const parentDiv = editorDiv?.parentElement;
      if (parentDiv) {
        (parentDiv as HTMLElement).style.backgroundColor = 'transparent';
      }

      cleanup(() => {
        strudel.stop();
        strudelEditorRef.value = null;
        strudelRef.value = undefined;
      });
    } catch (error) {
      errorMsg.value = error instanceof Error ? error.message : String(error);
    }
  });

  // Watch settings changes and update Strudel editor
  useVisibleTask$(async ({ track }) => {
    track(() => editorSettings.value);

    if (strudelRef.value) {
      const { toStrudelSettings } = await import('@/stores/editorSettings');
      strudelRef.value.editor.updateSettings(toStrudelSettings(editorSettings.value));
    }
  });

  return <div ref={containerRef} class="w-full h-full" />;
});
