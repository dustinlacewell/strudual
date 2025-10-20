import { createContextId, type Signal } from '@builder.io/qwik';

export interface UIContextType {
  activeEditor: Signal<'strudel' | 'punctual'>;
  showSettings: Signal<boolean>;
  errorMsg: Signal<string>;
}

export const UIContext = createContextId<UIContextType>('ui-context');
