import { component$, useContext, $ } from '@builder.io/qwik';
import { UIContext } from '@/contexts/uiContext';
import { saveSettings, type EditorSettings } from '@/stores/editorSettings';

export const EditorSettingsTab = component$(() => {
  const { editorSettings } = useContext(UIContext);

  const handleKeybindingsChange = $((e: Event) => {
    const target = e.target as HTMLInputElement;
    editorSettings.value = { ...editorSettings.value, keybindings: target.value as EditorSettings['keybindings'] };
    saveSettings(editorSettings.value);
  });

  const createToggleHandler = (key: keyof typeof editorSettings.value) => {
    return $((e: Event) => {
      const target = e.target as HTMLInputElement;
      editorSettings.value = { ...editorSettings.value, [key]: target.checked };
      saveSettings(editorSettings.value);
    });
  };

  return (
    <div class="space-y-4">
      <div class="text-sm text-neutral-400 mb-4">
        Shared CodeMirror settings for both editors
      </div>

      {/* Keybindings */}
      <div>
        <label class="block text-sm text-neutral-300 mb-2">
          Keybindings
        </label>
        <div class="flex gap-4">
          <label class="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer">
            <input
              type="radio"
              name="keybindings"
              value="codemirror"
              checked={editorSettings.value.keybindings === 'codemirror'}
              onChange$={handleKeybindingsChange}
              class="w-4 h-4"
            />
            <span>Default</span>
          </label>
          <label class="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer">
            <input
              type="radio"
              name="keybindings"
              value="emacs"
              checked={editorSettings.value.keybindings === 'emacs'}
              onChange$={handleKeybindingsChange}
              class="w-4 h-4"
            />
            <span>Emacs</span>
          </label>
          <label class="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer">
            <input
              type="radio"
              name="keybindings"
              value="vim"
              checked={editorSettings.value.keybindings === 'vim'}
              onChange$={handleKeybindingsChange}
              class="w-4 h-4"
            />
            <span>Vim</span>
          </label>
        </div>
      </div>

      {/* Line Numbers */}
      <label class="flex items-center justify-between cursor-pointer">
        <span class="text-sm text-neutral-300">Line Numbers</span>
        <input
          type="checkbox"
          checked={editorSettings.value.lineNumbers}
          onChange$={createToggleHandler('lineNumbers')}
          class="w-4 h-4"
        />
      </label>

      {/* Line Wrapping */}
      <label class="flex items-center justify-between cursor-pointer">
        <span class="text-sm text-neutral-300">Line Wrapping</span>
        <input
          type="checkbox"
          checked={editorSettings.value.lineWrapping}
          onChange$={createToggleHandler('lineWrapping')}
          class="w-4 h-4"
        />
      </label>

      {/* Bracket Matching */}
      <label class="flex items-center justify-between cursor-pointer">
        <span class="text-sm text-neutral-300">Bracket Matching</span>
        <input
          type="checkbox"
          checked={editorSettings.value.bracketMatching}
          onChange$={createToggleHandler('bracketMatching')}
          class="w-4 h-4"
        />
      </label>

      {/* Bracket Closing */}
      <label class="flex items-center justify-between cursor-pointer">
        <span class="text-sm text-neutral-300">Auto-close Brackets</span>
        <input
          type="checkbox"
          checked={editorSettings.value.bracketClosing}
          onChange$={createToggleHandler('bracketClosing')}
          class="w-4 h-4"
        />
      </label>

      {/* Active Line Highlight */}
      <label class="flex items-center justify-between cursor-pointer">
        <span class="text-sm text-neutral-300">Highlight Active Line</span>
        <input
          type="checkbox"
          checked={editorSettings.value.activeLineHighlight}
          onChange$={createToggleHandler('activeLineHighlight')}
          class="w-4 h-4"
        />
      </label>

      {/* Tab Indentation */}
      <label class="flex items-center justify-between cursor-pointer">
        <span class="text-sm text-neutral-300">Tab Indentation</span>
        <input
          type="checkbox"
          checked={editorSettings.value.tabIndentation}
          onChange$={createToggleHandler('tabIndentation')}
          class="w-4 h-4"
        />
      </label>

      {/* Multi-cursor */}
      <label class="flex items-center justify-between cursor-pointer">
        <span class="text-sm text-neutral-300">Multi-cursor (Ctrl+Click)</span>
        <input
          type="checkbox"
          checked={editorSettings.value.multiCursor}
          onChange$={createToggleHandler('multiCursor')}
          class="w-4 h-4"
        />
      </label>
    </div>
  );
});
