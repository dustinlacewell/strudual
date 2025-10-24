import { createContextId, type Signal } from '@builder.io/qwik';
import type { PunctualInstance, PunctualAnimator } from '@/utils/punctual';
import type { EditorView } from '@codemirror/view';
import type { Compartment } from '@codemirror/state';

export interface PunctualContextType {
  punctualRef: Signal<PunctualInstance | undefined>;
  punctualAnimatorRef: Signal<PunctualAnimator | undefined>;
  punctualEditorRef: Signal<EditorView | null>;
  punctualCollabCompartmentRef: Signal<Compartment | null>;
  punctualCanvasRef: Signal<HTMLDivElement | undefined>;
  punctualCode: Signal<string>;
  punctualCursor: Signal<number | null>;
  isReady: Signal<boolean>;
}

export const PunctualContext = createContextId<PunctualContextType>('punctual-context');
