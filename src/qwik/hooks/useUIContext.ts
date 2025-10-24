import { useSignal, useVisibleTask$, useContextProvider } from '@builder.io/qwik';
import { UIContext } from '@/contexts/uiContext';
import { loadSettings } from '@/stores/editorSettings';
import { getCollabParams } from '@/utils/urlParams';
import { loadLastSession, saveActiveEditor } from '@/utils/sessionPersistence';

export function useUIContext() {
  const activeEditor = useSignal<'strudel' | 'punctual'>('strudel');
  const uiReady = useSignal(false);
  
  const showSettings = useSignal(false);
  const activeSettingsTab = useSignal<'layout' | 'editor' | 'strudel' | 'punctual' | 'collab' | 'cache'>('layout');
  const errorMsg = useSignal('');
  const editorSettings = useSignal(loadSettings());
  const autoSaveEnabled = useSignal(false);
  const autoSaveFilename = useSignal('');
  const layoutOrientation = useSignal<'vertical' | 'horizontal' | 'auto'>('auto');
  const computedOrientation = useSignal<'vertical' | 'horizontal'>('vertical');

  // On first run, reload settings and active editor from localStorage eagerly
  useVisibleTask$(() => {
    if (editorSettings.value.layoutOrientation === 'auto' && layoutOrientation.value === 'auto') {
      const clientSettings = loadSettings();
      editorSettings.value = clientSettings;
    }
    
    // Restore active editor
    const session = loadLastSession();
    if (session.activeEditor) {
      activeEditor.value = session.activeEditor;
    }
    
    // Mark UI as ready after loading
    uiReady.value = true;
  }, { strategy: 'document-ready' });

  // Open modal to collab tab if URL has room param (but no username for auto-connect)
  useVisibleTask$(() => {
    const urlParams = getCollabParams();
    
    if (urlParams.room && !urlParams.username) {
      activeSettingsTab.value = 'collab';
      showSettings.value = true;
    }
  });

  // Save active editor changes to session
  useVisibleTask$(({ track }) => {
    const editor = track(() => activeEditor.value);
    saveActiveEditor(editor);
  });

  useContextProvider(UIContext, {
    activeEditor,
    showSettings,
    activeSettingsTab,
    errorMsg,
    editorSettings,
    autoSaveEnabled,
    autoSaveFilename,
    layoutOrientation,
    computedOrientation,
    uiReady,
  });
}

