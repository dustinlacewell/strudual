import { createContextId, type Signal } from '@builder.io/qwik';
import type { EditorSettings } from '@/stores/editorSettings';

export type SettingsTab = 'layout' | 'editor' | 'strudel' | 'punctual' | 'collab' | 'cache';

export type LayoutOrientation = 'vertical' | 'horizontal' | 'auto';

export type Keybind = 'settings' | 'stop' | 'evaluate' | 'switch' | 'swap' | 'ratio' | 'rotate' | 'zoom';

export interface UIContextType {
  activeEditor: Signal<'strudel' | 'punctual'>;
  showSettings: Signal<boolean>;
  activeSettingsTab: Signal<SettingsTab>;
  errorMsg: Signal<string>;
  editorSettings: Signal<EditorSettings>;
  autoSaveEnabled: Signal<boolean>;
  autoSaveFilename: Signal<string>;
  layoutOrientation: Signal<LayoutOrientation>;
  computedOrientation: Signal<'vertical' | 'horizontal'>;
  uiReady: Signal<boolean>;
  flashingKeybinds: Signal<Set<Keybind>>;
}

export const UIContext = createContextId<UIContextType>('ui-context');
