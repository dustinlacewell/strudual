import { createContextId, type Signal } from '@builder.io/qwik';
import type { EditorSettings } from '@/stores/editorSettings';

export interface UIContextType {
  activeEditor: Signal<'strudel' | 'punctual'>;
  showSettings: Signal<boolean>;
  errorMsg: Signal<string>;
  editorSettings: Signal<EditorSettings>;
}

export const UIContext = createContextId<UIContextType>('ui-context');
