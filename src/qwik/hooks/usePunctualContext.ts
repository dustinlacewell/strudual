import { useSignal, useContextProvider, useVisibleTask$ } from '@builder.io/qwik';
import type { PunctualInstance, PunctualAnimator } from '@/utils/punctual';
import type { EditorView } from '@codemirror/view';
import type { Compartment } from '@codemirror/state';
import { EditorView as EditorViewClass } from '@codemirror/view';
import { StateEffect } from '@codemirror/state';
import { PunctualContext } from '@/contexts/punctualContext';
import { usePunctualSetup } from './usePunctualSetup';
import { loadLastSession, savePunctualCode } from '@/utils/sessionPersistence';

export function usePunctualContext(initialCode: string) {
  const punctualRef = useSignal<PunctualInstance>();
  const punctualAnimatorRef = useSignal<PunctualAnimator>();
  const punctualEditorRef = useSignal<EditorView | null>(null);
  const punctualCollabCompartmentRef = useSignal<Compartment | null>(null);
  const punctualCanvasRef = useSignal<HTMLDivElement>();
  const punctualCode = useSignal<string>(initialCode);
  const punctualCursor = useSignal<number | null>(null);
  const isReady = useSignal(false);
  
  // Load saved code and cursor position eagerly before components render
  useVisibleTask$(() => {
    const session = loadLastSession();
    if (session.punctualCode) {
      punctualCode.value = session.punctualCode;
    }
    if (session.punctualCursor !== null) {
      punctualCursor.value = session.punctualCursor;
    }
    isReady.value = true;
  }, { strategy: 'document-ready' });

  // Set up auto-save listener
  useVisibleTask$(({ track, cleanup }) => {
    const editor = track(() => punctualEditorRef.value);
    
    if (!editor) return;
    
    // Set up listener to save on changes
    const listener = EditorViewClass.updateListener.of((update) => {
      if (update.docChanged || update.selectionSet) {
        const code = update.state.doc.toString();
        const cursor = update.state.selection.main.head;
        punctualCode.value = code;
        punctualCursor.value = cursor;
        savePunctualCode(code, cursor);
      }
    });
    
    editor.dispatch({
      effects: StateEffect.appendConfig.of(listener)
    });
    
    cleanup(() => {
      // Save one last time on cleanup
      const cursor = editor.state.selection.main.head;
      savePunctualCode(editor.state.doc.toString(), cursor);
    });
  });

  useContextProvider(PunctualContext, {
    punctualRef,
    punctualAnimatorRef,
    punctualEditorRef,
    punctualCollabCompartmentRef,
    punctualCanvasRef,
    punctualCode,
    punctualCursor,
    isReady,
  });

  // Setup Punctual after context is provided (use initial code, signal will update on mount)
  usePunctualSetup(initialCode);
}

