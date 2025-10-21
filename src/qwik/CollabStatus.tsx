import { component$, useContext, useSignal, $ } from '@builder.io/qwik';
import { CollabContext } from '@/contexts/collabContext';
import { UIContext } from '@/contexts/uiContext';
import { StrudelContext } from '@/contexts/strudelContext';
import { PunctualContext } from '@/contexts/punctualContext';
import { useAutoSave } from './hooks/useAutoSave';
import { LED, StatusLED } from './StatusLED';
import type { EditorView } from '@codemirror/view';

export const CollabStatus = component$(() => {
  const collab = useContext(CollabContext);
  const uiContext = useContext(UIContext);
  const strudelContext = useContext(StrudelContext);
  const punctualContext = useContext(PunctualContext);
  
  const { showSettings, activeSettingsTab, autoSaveEnabled, autoSaveFilename } = uiContext;
  const { strudelEditorRef } = strudelContext;
  const { punctualEditorRef } = punctualContext;
  const { toggleAutoSave, renameFile, loadFile } = useAutoSave();
  
  const editingFilename = useSignal(false);
  const editFilenameValue = useSignal('');

  const startEditingFilename = $(() => {
    editingFilename.value = true;
    editFilenameValue.value = autoSaveFilename.value;
  });

  const finishEditingFilename = $(async () => {
    if (editFilenameValue.value.trim() && editFilenameValue.value.trim() !== autoSaveFilename.value) {
      await renameFile(editFilenameValue.value.trim());
    }
    editingFilename.value = false;
  });

  const cancelEditingFilename = $(() => {
    editingFilename.value = false;
  });

  const clearBuffers = $(() => {
    if (strudelEditorRef.value) {
      const strudelTx = strudelEditorRef.value.state.update({
        changes: { from: 0, to: strudelEditorRef.value.state.doc.length, insert: '' }
      });
      strudelEditorRef.value.dispatch(strudelTx);
    }
    if (punctualEditorRef.value) {
      const punctualTx = punctualEditorRef.value.state.update({
        changes: { from: 0, to: punctualEditorRef.value.state.doc.length, insert: '' }
      });
      punctualEditorRef.value.dispatch(punctualTx);
    }
  });

  return (
    <div class="absolute top-0 right-0 z-20 flex flex-col items-end gap-1 px-3 py-2 text-xs text-neutral-500 pointer-events-none select-none">
      {/* Auto-save and Status LED row */}
      <div class="flex items-center gap-2">
        {/* Clear buffers button */}
        <button
          class="pointer-events-auto bg-transparent hover:bg-neutral-900/30 rounded transition-colors p-1.5 group"
          title="Clear both editors"
          onClick$={clearBuffers}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="#6b7280"
            class="group-hover:fill-white transition-colors"
          >
            <path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m-3 12.59L17.59 17 14 13.41 10.41 17 9 15.59 12.59 12 9 8.41 10.41 7 14 10.59 17.59 7 19 8.41 15.41 12z"></path>
          </svg>
        </button>

        {/* Auto-save */}
        <div class="flex items-center gap-2">
          <button
            class="pointer-events-auto bg-transparent hover:bg-neutral-900/30 rounded transition-colors p-1.5 group"
            title={autoSaveEnabled.value ? 'Disable auto-save (right-click to load file)' : 'Enable auto-save (right-click to load file)'}
            onClick$={toggleAutoSave}
            onContextMenu$={(e) => {
              e.preventDefault();
              loadFile();
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke={autoSaveEnabled.value ? '#22c55e' : '#6b7280'}
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="group-hover:stroke-white transition-colors"
            >
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
          </button>
          
          {autoSaveEnabled.value && (
            <div style={{ width: '120px' }}>
              {editingFilename.value ? (
                <input
                  type="text"
                  value={editFilenameValue.value}
                  onInput$={(e) => editFilenameValue.value = (e.target as HTMLInputElement).value}
                  onKeyDown$={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      finishEditingFilename();
                    }
                    if (e.key === 'Escape') cancelEditingFilename();
                  }}
                  onBlur$={finishEditingFilename}
                  class="w-full pointer-events-auto bg-black text-neutral-300 border border-neutral-700 rounded px-2 py-0.5 text-xs text-center focus:outline-none focus:ring-1 focus:ring-neutral-600"
                  autoFocus
                />
              ) : (
                <span
                  class="block text-neutral-300 text-xs cursor-pointer pointer-events-auto px-2 py-0.5 truncate text-center border border-neutral-700 rounded bg-black"
                  onDblClick$={startEditingFilename}
                  title="Double-click to rename"
                >
                  {autoSaveFilename.value}
                </span>
              )}
            </div>
          )}
        </div>

        <StatusLED
          onClick={$(() => {
            activeSettingsTab.value = 'collab';
            showSettings.value = true;
          })}
        />
      </div>
      
      {/* Separator line below status LED */}
      {collab.peers.value.length > 0 && (
        <div class="w-[24px] border-b border-neutral-700 mt-1" />
      )}
      
      {/* Peer list */}
      {collab.peers.value.length > 0 && (
        <div class="flex flex-col items-end gap-0.5">
          {collab.peers.value.map((peer) => (
            <div key={peer.id} class="flex items-center gap-2">
              <span style={{ color: peer.color }}>{peer.name}</span>
              <LED color={peer.color} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
