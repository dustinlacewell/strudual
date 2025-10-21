import { createContextId, type Signal } from '@builder.io/qwik';
import type { StrudelInstance } from '@/utils/strudel';
import type { EditorView } from '@codemirror/view';
import type { Compartment } from '@codemirror/state';

export interface StrudelContextType {
  strudelRef: Signal<StrudelInstance | undefined>;
  strudelEditorRef: Signal<EditorView | null>;
  strudelCollabCompartmentRef: Signal<Compartment | null>;
}

export const StrudelContext = createContextId<StrudelContextType>('strudel-context');
