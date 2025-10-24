import { useSignal, useContextProvider, useVisibleTask$ } from '@builder.io/qwik';
import type { StrudelInstance } from '@/utils/strudel';
import type { EditorView } from '@codemirror/view';
import type { Compartment } from '@codemirror/state';
import { EditorView as EditorViewClass } from '@codemirror/view';
import { StateEffect } from '@codemirror/state';
import { StrudelContext } from '@/contexts/strudelContext';
import { loadLastSession, saveStrudelCode } from '@/utils/sessionPersistence';

export function useStrudelContext(initialCode: string) {
  const strudelRef = useSignal<StrudelInstance>();
  const strudelEditorRef = useSignal<EditorView | null>(null);
  const strudelCollabCompartmentRef = useSignal<Compartment | null>(null);
  const strudelCode = useSignal<string>(initialCode);
  const strudelCursor = useSignal<number | null>(null);
  const isReady = useSignal(false);
  
  // Load saved code and cursor position eagerly before components render
  useVisibleTask$(() => {
    const session = loadLastSession();
    if (session.strudelCode) {
      strudelCode.value = session.strudelCode;
    }
    if (session.strudelCursor !== null) {
      strudelCursor.value = session.strudelCursor;
    }
    isReady.value = true;
  }, { strategy: 'document-ready' });

  // Set up auto-save listener
  useVisibleTask$(({ track, cleanup }) => {
    const editor = track(() => strudelEditorRef.value);
    
    if (!editor) return;
    
    // Set up listener to save on changes
    const listener = EditorViewClass.updateListener.of((update) => {
      if (update.docChanged || update.selectionSet) {
        const code = update.state.doc.toString();
        const cursor = update.state.selection.main.head;
        strudelCode.value = code;
        strudelCursor.value = cursor;
        saveStrudelCode(code, cursor);
      }
    });
    
    editor.dispatch({
      effects: StateEffect.appendConfig.of(listener)
    });
    
    cleanup(() => {
      // Save one last time on cleanup
      const cursor = editor.state.selection.main.head;
      saveStrudelCode(editor.state.doc.toString(), cursor);
    });
  });

  useContextProvider(StrudelContext, {
    strudelRef,
    strudelEditorRef,
    strudelCollabCompartmentRef,
    strudelCode,
    strudelCursor,
    isReady,
  });
}

