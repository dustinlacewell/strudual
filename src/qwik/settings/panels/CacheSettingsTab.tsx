import { component$, useSignal, useVisibleTask$, $, useContext } from '@builder.io/qwik';
import { StrudelContext } from '@/contexts/strudelContext';
import { PunctualContext } from '@/contexts/punctualContext';
import {
  loadPatterns,
  createPattern,
  updatePatternName,
  updatePatternCode,
  deletePattern,
  savePatternToDisk,
  isFileSystemApiAvailable,
  type CachedPattern,
} from '@/stores/patternCache';

export const CacheSettingsTab = component$(() => {
  const { strudelEditorRef } = useContext(StrudelContext);
  const { punctualEditorRef } = useContext(PunctualContext);
  
  const patterns = useSignal<CachedPattern[]>([]);
  const selectedPatternId = useSignal<string | null>(null);
  const editingId = useSignal<string | null>(null);
  const editingName = useSignal('');
  const hasFileSystemApi = useSignal(false);
  const editInputRef = useSignal<HTMLInputElement>();

  // Load patterns on mount
  useVisibleTask$(() => {
    patterns.value = loadPatterns();
    hasFileSystemApi.value = isFileSystemApiAvailable();
  });

  const selectedPattern = patterns.value.find(p => p.id === selectedPatternId.value);

  // Focus input when editing starts
  useVisibleTask$(({ track }) => {
    track(() => editingId.value);
    if (editingId.value && editInputRef.value) {
      editInputRef.value.focus();
      editInputRef.value.select();
    }
  });

  const handleNewPattern = $(() => {
    const strudelCode = strudelEditorRef.value?.state.doc.toString() || '';
    const punctualCode = punctualEditorRef.value?.state.doc.toString() || '';
    
    const newPattern = createPattern(strudelCode, punctualCode);
    patterns.value = loadPatterns();
    selectedPatternId.value = newPattern.id;
  });

  const handleLoad = $((pattern: CachedPattern) => {
    if (strudelEditorRef.value) {
      strudelEditorRef.value.dispatch({
        changes: {
          from: 0,
          to: strudelEditorRef.value.state.doc.length,
          insert: pattern.strudelCode,
        },
      });
    }
    
    if (punctualEditorRef.value) {
      punctualEditorRef.value.dispatch({
        changes: {
          from: 0,
          to: punctualEditorRef.value.state.doc.length,
          insert: pattern.punctualCode,
        },
      });
    }
  });

  const handleUpdate = $((id: string) => {
    const strudelCode = strudelEditorRef.value?.state.doc.toString() || '';
    const punctualCode = punctualEditorRef.value?.state.doc.toString() || '';
    
    updatePatternCode(id, strudelCode, punctualCode);
    patterns.value = loadPatterns();
  });

  const handleDelete = $((id: string) => {
    deletePattern(id);
    patterns.value = loadPatterns();
    if (selectedPatternId.value === id) {
      selectedPatternId.value = null;
    }
  });

  const handleSaveToDisk = $(async (pattern: CachedPattern) => {
    try {
      await savePatternToDisk(pattern);
    } catch (e) {
      console.error('Failed to save pattern to disk:', e);
    }
  });

  const startEditing = $((pattern: CachedPattern) => {
    editingId.value = pattern.id;
    editingName.value = pattern.name;
  });

  const finishEditing = $(() => {
    if (editingId.value && editingName.value.trim()) {
      updatePatternName(editingId.value, editingName.value.trim());
      patterns.value = loadPatterns();
    }
    editingId.value = null;
    editingName.value = '';
  });

  const cancelEditing = $(() => {
    editingId.value = null;
    editingName.value = '';
  });

  return (
    <div class="space-y-4">
      {/* New Pattern Button */}
      <button
        onClick$={handleNewPattern}
        class="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-4 py-2 rounded transition-colors"
      >
        New Pattern
      </button>

      {/* Pattern List */}
      <div class="space-y-1 max-h-48 overflow-y-auto border border-neutral-800 rounded p-2">
        {patterns.value.length === 0 && (
          <div class="text-neutral-500 text-sm text-center py-4">
            No cached patterns yet
          </div>
        )}
        
        {patterns.value.map((pattern) => (
          <div
            key={pattern.id}
            class={{
              'flex items-center gap-2 p-2 rounded transition-colors border': true,
              'bg-neutral-800 border-white': selectedPatternId.value === pattern.id,
              'bg-transparent border-black hover:bg-neutral-900': selectedPatternId.value !== pattern.id,
            }}
            onClick$={() => selectedPatternId.value = pattern.id}
          >
            {/* Editable Name */}
            <div class="flex-1 min-w-0">
              {editingId.value === pattern.id ? (
                <input
                  ref={editInputRef}
                  type="text"
                  value={editingName.value}
                  onInput$={(e) => editingName.value = (e.target as HTMLInputElement).value}
                  onKeyDown$={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      finishEditing();
                    }
                    if (e.key === 'Escape') cancelEditing();
                  }}
                  onBlur$={finishEditing}
                  class="w-full bg-black text-neutral-300 border border-neutral-700 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-600"
                />
              ) : (
                <span
                  class="block text-neutral-300 text-sm cursor-pointer truncate px-2 py-1"
                  onDblClick$={(e) => {
                    e.stopPropagation();
                    startEditing(pattern);
                  }}
                >
                  {pattern.name}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <button
              onClick$={(e) => {
                e.stopPropagation();
                handleLoad(pattern);
              }}
              class="text-xs px-2 py-1 bg-blue-900 hover:bg-blue-800 text-neutral-300 rounded transition-colors"
              title="Load into editors"
            >
              Load
            </button>
            
            <button
              onClick$={(e) => {
                e.stopPropagation();
                handleUpdate(pattern.id);
              }}
              class="text-xs px-2 py-1 bg-green-900 hover:bg-green-800 text-neutral-300 rounded transition-colors"
              title="Update with current editor contents"
            >
              Update
            </button>
            
            <button
              onClick$={(e) => {
                e.stopPropagation();
                handleDelete(pattern.id);
              }}
              class="text-xs px-2 py-1 bg-red-900 hover:bg-red-800 text-neutral-300 rounded transition-colors"
              title="Delete pattern"
            >
              Delete
            </button>
            
            {hasFileSystemApi.value && (
              <button
                onClick$={(e) => {
                  e.stopPropagation();
                  handleSaveToDisk(pattern);
                }}
                class="text-xs px-2 py-1 bg-purple-900 hover:bg-purple-800 text-neutral-300 rounded transition-colors"
                title="Save to disk"
              >
                Save
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Code Preview */}
      {selectedPattern && (
        <div class="space-y-2">
          <div class="space-y-2">
            {/* Strudel Code */}
            <div class="space-y-1">
              <div class="text-xs text-neutral-500">Strudel</div>
              <textarea
                value={selectedPattern.strudelCode}
                readOnly
                class="w-full h-32 bg-black text-neutral-300 border border-neutral-800 rounded p-2 text-xs font-mono resize-none overflow-auto focus:outline-none"
              />
            </div>
            
            {/* Punctual Code */}
            <div class="space-y-1">
              <div class="text-xs text-neutral-500">Punctual</div>
              <textarea
                value={selectedPattern.punctualCode}
                readOnly
                class="w-full h-32 bg-black text-neutral-300 border border-neutral-800 rounded p-2 text-xs font-mono resize-none overflow-auto focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
