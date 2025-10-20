import { createContextId, type Signal } from '@builder.io/qwik';
import type { PunctualInstance, PunctualAnimator } from '@/utils/punctual';
import type { EditorView } from '@codemirror/view';

export interface PunctualContextType {
  punctualRef: Signal<PunctualInstance | undefined>;
  punctualAnimatorRef: Signal<PunctualAnimator | undefined>;
  punctualEditorRef: Signal<EditorView | null>;
  punctualCanvasRef: Signal<HTMLDivElement | undefined>;
}

export const PunctualContext = createContextId<PunctualContextType>('punctual-context');
