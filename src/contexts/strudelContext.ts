import { createContextId, type Signal } from '@builder.io/qwik';
import type { StrudelInstance } from '@/utils/strudel';

export interface StrudelContextType {
  strudelRef: Signal<StrudelInstance | undefined>;
  strudelContainerRef: Signal<HTMLDivElement | undefined>;
}

export const StrudelContext = createContextId<StrudelContextType>('strudel-context');
