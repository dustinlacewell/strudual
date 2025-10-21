import { useContext, useVisibleTask$, $ } from '@builder.io/qwik';
import { StrudelContext } from '@/contexts/strudelContext';
import { PunctualContext } from '@/contexts/punctualContext';
import { UIContext } from '@/contexts/uiContext';
import { EditorView } from '@codemirror/view';
import { StateEffect } from '@codemirror/state';
import {
  initAutoSave,
  loadAutoSaveFile,
  writeAutoSave,
  disableAutoSave,
  getAutoSaveFilename,
  renameAutoSaveFile,
  isAutoSaveAvailable,
} from '@/utils/autoSave';

export function useAutoSave() {
  const { strudelEditorRef } = useContext(StrudelContext);
  const { punctualEditorRef } = useContext(PunctualContext);
  const { autoSaveEnabled, autoSaveFilename, errorMsg } = useContext(UIContext);

  // Set up CodeMirror update listeners for auto-save
  useVisibleTask$(({ track, cleanup }) => {
    track(() => autoSaveEnabled.value);
    track(() => strudelEditorRef.value);
    track(() => punctualEditorRef.value);

    if (!autoSaveEnabled.value || !strudelEditorRef.value || !punctualEditorRef.value) {
      return;
    }

    const saveCurrentState = async () => {
      if (!autoSaveEnabled.value || !strudelEditorRef.value || !punctualEditorRef.value) {
        return;
      }

      try {
        const strudelCode = strudelEditorRef.value.state.doc.toString();
        const punctualCode = punctualEditorRef.value.state.doc.toString();
        const name = autoSaveFilename.value;

        await writeAutoSave({ name, strudelCode, punctualCode });
      } catch (e) {
        console.error('[AutoSave] Failed to write:', e);
        
        // Disable auto-save and clear state
        autoSaveEnabled.value = false;
        autoSaveFilename.value = '';
        disableAutoSave();
        
        // Show user-friendly error
        const errMsg = (e as Error).message;
        if (errMsg.includes('state cached in an interface object')) {
          errorMsg.value = 'Auto-save disabled: File handle expired. Right-click save icon to reload.';
        } else {
          errorMsg.value = `Auto-save disabled: ${errMsg}`;
        }
      }
    };

    // Create update listener extension
    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        saveCurrentState();
      }
    });

    // Add listener to both editors
    const strudelEditor = strudelEditorRef.value;
    const punctualEditor = punctualEditorRef.value;

    strudelEditor.dispatch({
      effects: StateEffect.appendConfig.of(updateListener)
    });

    punctualEditor.dispatch({
      effects: StateEffect.appendConfig.of(updateListener)
    });

    console.log('[AutoSave] Update listeners attached');
  });

  const toggleAutoSave = $(async () => {
    if (!isAutoSaveAvailable()) {
      errorMsg.value = 'File System Access API not available (Chrome/Edge only)';
      return;
    }

    if (autoSaveEnabled.value) {
      // Disable auto-save
      autoSaveEnabled.value = false;
      autoSaveFilename.value = '';
      disableAutoSave();
    } else {
      // Enable auto-save
      try {
        const result = await initAutoSave();
        
        if (!result) {
          // User cancelled
          return;
        }

        // Load content into editors (even if empty)
        if (strudelEditorRef.value) {
          strudelEditorRef.value.dispatch({
            changes: {
              from: 0,
              to: strudelEditorRef.value.state.doc.length,
              insert: result.strudelCode || '',
            },
          });
        }

        if (punctualEditorRef.value) {
          punctualEditorRef.value.dispatch({
            changes: {
              from: 0,
              to: punctualEditorRef.value.state.doc.length,
              insert: result.punctualCode || '',
            },
          });
        }

        autoSaveFilename.value = result.name;
        autoSaveEnabled.value = true;
      } catch (e) {
        errorMsg.value = `Failed to initialize auto-save: ${(e as Error).message}`;
      }
    }
  });

  const renameFile = $(async (newName: string) => {
    if (!autoSaveEnabled.value || !strudelEditorRef.value || !punctualEditorRef.value) return;

    try {
      const strudelCode = strudelEditorRef.value.state.doc.toString();
      const punctualCode = punctualEditorRef.value.state.doc.toString();
      
      await renameAutoSaveFile(newName, strudelCode, punctualCode);
      autoSaveFilename.value = newName;
    } catch (e) {
      errorMsg.value = `Failed to rename file: ${(e as Error).message}`;
    }
  });

  const loadFile = $(async () => {
    if (!isAutoSaveAvailable()) {
      errorMsg.value = 'File System Access API not available (Chrome/Edge only)';
      return;
    }

    try {
      const result = await loadAutoSaveFile();
      
      if (!result) {
        // User cancelled
        return;
      }

      // Load content into editors (even if empty)
      if (strudelEditorRef.value) {
        strudelEditorRef.value.dispatch({
          changes: {
            from: 0,
            to: strudelEditorRef.value.state.doc.length,
            insert: result.strudelCode || '',
          },
        });
      }

      if (punctualEditorRef.value) {
        punctualEditorRef.value.dispatch({
          changes: {
            from: 0,
            to: punctualEditorRef.value.state.doc.length,
            insert: result.punctualCode || '',
          },
        });
      }

      autoSaveFilename.value = result.name;
      autoSaveEnabled.value = true;
    } catch (e) {
      errorMsg.value = `Failed to load file: ${(e as Error).message}`;
    }
  });

  return {
    toggleAutoSave,
    renameFile,
    loadFile,
  };
}
