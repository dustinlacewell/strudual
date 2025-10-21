import { component$, useContext, $, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { UIContext } from '@/contexts/uiContext';
import { loadSettings, saveSettings, type EditorSettings } from '@/stores/editorSettings';
import { CollabSettingsTab } from './CollabSettingsTab';
import { CacheSettingsTab } from './CacheSettingsTab';

export const SettingsModal = component$(() => {
  const { showSettings, activeSettingsTab, editorSettings, layoutOrientation } = useContext(UIContext);

  const handleBackdropClick = $(() => {
    showSettings.value = false;
  });

  const handleModalClick = $((e: MouseEvent) => {
    e.stopPropagation();
  });

  const handleFontSizeChange = $((e: Event) => {
    const target = e.target as HTMLInputElement;
    editorSettings.value = { ...editorSettings.value, fontSize: parseInt(target.value) };
    saveSettings(editorSettings.value);
  });

  const handleKeybindingsChange = $((e: Event) => {
    const target = e.target as HTMLSelectElement;
    editorSettings.value = { ...editorSettings.value, keybindings: target.value as EditorSettings['keybindings'] };
    saveSettings(editorSettings.value);
  });

  const handleLayoutOrientationChange = $((e: Event) => {
    const target = e.target as HTMLSelectElement;
    const newOrientation = target.value as 'vertical' | 'horizontal' | 'auto';
    layoutOrientation.value = newOrientation;
    editorSettings.value = { ...editorSettings.value, layoutOrientation: newOrientation };
    saveSettings(editorSettings.value);
  });

  const handleSplitRatioChange = $((e: Event) => {
    const target = e.target as HTMLInputElement;
    const newRatio = target.value as '50-50' | '33-66' | '100-0';
    editorSettings.value = { ...editorSettings.value, splitRatio: newRatio };
    saveSettings(editorSettings.value);
  });

  const handleEditorOrderChange = $((e: Event) => {
    const target = e.target as HTMLInputElement;
    const newOrder = target.value as 'strudel-first' | 'punctual-first';
    editorSettings.value = { ...editorSettings.value, editorOrder: newOrder };
    saveSettings(editorSettings.value);
  });

  const handleToggle = $((key: keyof EditorSettings) => {
    editorSettings.value = { ...editorSettings.value, [key]: !(editorSettings.value[key] as boolean) };
    saveSettings(editorSettings.value);
  });

  if (!showSettings.value) return null;

  return (
    <div
      class="fixed inset-0 z-50 flex justify-center bg-black/50"
      style={{ alignItems: 'flex-start', paddingTop: '5em' }}
      onClick$={handleBackdropClick}
    >
      <div 
        class="bg-black border border-neutral-800 rounded p-6 w-96 max-h-[80vh] overflow-y-auto select-none"
        onClick$={handleModalClick}
      >
        <div class="mb-6">
          <h2 class="text-lg text-neutral-300 mb-4">Settings</h2>
          
          {/* Tabs */}
          <div class="flex gap-4 border-b border-neutral-800">
            <button
              onClick$={() => activeSettingsTab.value = 'editor'}
              class={{
                'pb-2 text-sm transition-colors': true,
                'text-neutral-300 border-b-2 border-neutral-300': activeSettingsTab.value === 'editor',
                'text-neutral-500 hover:text-neutral-400': activeSettingsTab.value !== 'editor',
              }}
            >
              Editor
            </button>
            <button
              onClick$={() => activeSettingsTab.value = 'collab'}
              class={{
                'pb-2 text-sm transition-colors': true,
                'text-neutral-300 border-b-2 border-neutral-300': activeSettingsTab.value === 'collab',
                'text-neutral-500 hover:text-neutral-400': activeSettingsTab.value !== 'collab',
              }}
            >
              Collaboration
            </button>
            <button
              onClick$={() => activeSettingsTab.value = 'cache'}
              class={{
                'pb-2 text-sm transition-colors': true,
                'text-neutral-300 border-b-2 border-neutral-300': activeSettingsTab.value === 'cache',
                'text-neutral-500 hover:text-neutral-400': activeSettingsTab.value !== 'cache',
              }}
            >
              Cache
            </button>
          </div>
        </div>

        {activeSettingsTab.value === 'editor' && (
        <div class="space-y-4">
          {/* Font Size */}
          <div>
            <label class="block text-sm text-neutral-300 mb-2">
              Font Size: {editorSettings.value.fontSize}px
            </label>
            <input
              type="range"
              min="8"
              max="64"
              value={editorSettings.value.fontSize}
              onInput$={handleFontSizeChange}
              class="w-full"
            />
          </div>

          {/* Keybindings */}
          <div>
            <label class="block text-sm text-neutral-300 mb-2">
              Keybindings
            </label>
            <select
              value={editorSettings.value.keybindings}
              onChange$={handleKeybindingsChange}
              class="w-full bg-black text-neutral-300 border border-neutral-800 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-neutral-700"
            >
              <option value="emacs">Emacs</option>
              <option value="vim">Vim</option>
              <option value="codemirror">CodeMirror</option>
            </select>
          </div>

          {/* Split Ratio */}
          <div>
            <label class="block text-sm text-neutral-300 mb-2">
              Split Ratio
            </label>
            <div class="flex gap-4">
              <label class="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer">
                <input
                  type="radio"
                  name="splitRatio"
                  value="50-50"
                  checked={editorSettings.value.splitRatio === '50-50'}
                  onChange$={handleSplitRatioChange}
                  class="w-4 h-4"
                />
                <span>50/50</span>
              </label>
              <label class="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer">
                <input
                  type="radio"
                  name="splitRatio"
                  value="33-66"
                  checked={editorSettings.value.splitRatio === '33-66'}
                  onChange$={handleSplitRatioChange}
                  class="w-4 h-4"
                />
                <span>33/66</span>
              </label>
              <label class="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer">
                <input
                  type="radio"
                  name="splitRatio"
                  value="100-0"
                  checked={editorSettings.value.splitRatio === '100-0'}
                  onChange$={handleSplitRatioChange}
                  class="w-4 h-4"
                />
                <span>100/0</span>
              </label>
            </div>
          </div>

          {/* Editor Order */}
          <div>
            <label class="block text-sm text-neutral-300 mb-2">
              Editor Order
            </label>
            <div class="flex gap-4">
              <label class="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer">
                <input
                  type="radio"
                  name="editorOrder"
                  value="strudel-first"
                  checked={editorSettings.value.editorOrder === 'strudel-first'}
                  onChange$={handleEditorOrderChange}
                  class="w-4 h-4"
                />
                <span>Strudel first</span>
              </label>
              <label class="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer">
                <input
                  type="radio"
                  name="editorOrder"
                  value="punctual-first"
                  checked={editorSettings.value.editorOrder === 'punctual-first'}
                  onChange$={handleEditorOrderChange}
                  class="w-4 h-4"
                />
                <span>Punctual first</span>
              </label>
            </div>
          </div>

          {/* Layout Orientation */}
          <div>
            <label class="block text-sm text-neutral-300 mb-2">
              Layout Orientation
            </label>
            <div class="flex gap-4">
              <label class="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer">
                <input
                  type="radio"
                  name="layoutOrientation"
                  value="auto"
                  checked={layoutOrientation.value === 'auto'}
                  onChange$={handleLayoutOrientationChange}
                  class="w-4 h-4"
                />
                <span>Auto</span>
              </label>
              <label class="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer">
                <input
                  type="radio"
                  name="layoutOrientation"
                  value="vertical"
                  checked={layoutOrientation.value === 'vertical'}
                  onChange$={handleLayoutOrientationChange}
                  class="w-4 h-4"
                />
                <span>Stacked</span>
              </label>
              <label class="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer">
                <input
                  type="radio"
                  name="layoutOrientation"
                  value="horizontal"
                  checked={layoutOrientation.value === 'horizontal'}
                  onChange$={handleLayoutOrientationChange}
                  class="w-4 h-4"
                />
                <span>Side by side</span>
              </label>
            </div>
          </div>

          {/* Toggles */}
          <div class="space-y-2">
            <label class="flex items-center justify-between text-sm text-neutral-300">
              <span>Line Numbers</span>
              <input
                type="checkbox"
                checked={editorSettings.value.lineNumbers}
                onChange$={() => handleToggle('lineNumbers')}
                class="w-4 h-4"
              />
            </label>

            <label class="flex items-center justify-between text-sm text-neutral-300">
              <span>Line Wrapping</span>
              <input
                type="checkbox"
                checked={editorSettings.value.lineWrapping}
                onChange$={() => handleToggle('lineWrapping')}
                class="w-4 h-4"
              />
            </label>

            <label class="flex items-center justify-between text-sm text-neutral-300">
              <span>Bracket Matching</span>
              <input
                type="checkbox"
                checked={editorSettings.value.bracketMatching}
                onChange$={() => handleToggle('bracketMatching')}
                class="w-4 h-4"
              />
            </label>

            <label class="flex items-center justify-between text-sm text-neutral-300">
              <span>Active Line Highlight</span>
              <input
                type="checkbox"
                checked={editorSettings.value.activeLineHighlight}
                onChange$={() => handleToggle('activeLineHighlight')}
                class="w-4 h-4"
              />
            </label>
          </div>
        </div>
        )}

        {activeSettingsTab.value === 'collab' && (
          <CollabSettingsTab />
        )}

        {activeSettingsTab.value === 'cache' && (
          <CacheSettingsTab />
        )}
      </div>
    </div>
  );
});
