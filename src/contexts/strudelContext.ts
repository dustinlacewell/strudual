import { createContextId, type Signal } from '@builder.io/qwik';
import type { StrudelInstance } from '@/utils/strudel';
import type { EditorView } from '@codemirror/view';

export interface StrudelContextType {
  strudelRef: Signal<StrudelInstance | undefined>;
  strudelEditorRef: Signal<EditorView | null>;
}

export const StrudelContext = createContextId<StrudelContextType>('strudel-context');
