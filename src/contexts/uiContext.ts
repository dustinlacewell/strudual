import { createContextId, type Signal } from '@builder.io/qwik';
import type { EditorSettings } from '@/stores/editorSettings';

export type SettingsTab = 'editor' | 'collab' | 'cache';

export interface UIContextType {
  activeEditor: Signal<'strudel' | 'punctual'>;
  showSettings: Signal<boolean>;
  activeSettingsTab: Signal<SettingsTab>;
  errorMsg: Signal<string>;
  editorSettings: Signal<EditorSettings>;
  autoSaveEnabled: Signal<boolean>;
  autoSaveFilename: Signal<string>;
}

export const UIContext = createContextId<UIContextType>('ui-context');
