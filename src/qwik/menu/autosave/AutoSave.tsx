import { component$, useContext, useSignal, $ } from '@builder.io/qwik';
import { UIContext } from '@/contexts/uiContext';
import { useAutoSave } from '../../hooks/useAutoSave';

export const AutoSave = component$(() => {
  const uiContext = useContext(UIContext);
  const { autoSaveEnabled, autoSaveFilename } = uiContext;
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

  return (
      <div class="flex items-center gap-2">
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
      </div>
    );
});