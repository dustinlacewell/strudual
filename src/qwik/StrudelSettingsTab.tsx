import { component$, useContext, $ } from '@builder.io/qwik';
import { UIContext } from '@/contexts/uiContext';
import { saveSettings } from '@/stores/editorSettings';

export const StrudelSettingsTab = component$(() => {
  const { editorSettings } = useContext(UIContext);

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
        Strudel-specific live coding features
      </div>

      {/* Pattern Highlighting */}
      <label class="flex items-center justify-between cursor-pointer">
        <span class="text-sm text-neutral-300">Pattern Highlighting</span>
        <input
          type="checkbox"
          checked={editorSettings.value.patternHighlighting}
          onChange$={createToggleHandler('patternHighlighting')}
          class="w-4 h-4"
        />
      </label>
      <div class="text-xs text-neutral-500 -mt-2 ml-4">
        Highlights active pattern locations in the code
      </div>

      {/* Flash on Evaluation */}
      <label class="flex items-center justify-between cursor-pointer">
        <span class="text-sm text-neutral-300">Flash on Evaluation</span>
        <input
          type="checkbox"
          checked={editorSettings.value.flash}
          onChange$={createToggleHandler('flash')}
          class="w-4 h-4"
        />
      </label>
      <div class="text-xs text-neutral-500 -mt-2 ml-4">
        Visual feedback when code is evaluated
      </div>

      {/* Tooltips */}
      <label class="flex items-center justify-between cursor-pointer">
        <span class="text-sm text-neutral-300">Tooltips</span>
        <input
          type="checkbox"
          checked={editorSettings.value.tooltip}
          onChange$={createToggleHandler('tooltip')}
          class="w-4 h-4"
        />
      </label>
      <div class="text-xs text-neutral-500 -mt-2 ml-4">
        Show helpful tooltips for Strudel functions
      </div>

      {/* Auto-completion */}
      <label class="flex items-center justify-between cursor-pointer">
        <span class="text-sm text-neutral-300">Auto-completion</span>
        <input
          type="checkbox"
          checked={editorSettings.value.autoCompletion}
          onChange$={createToggleHandler('autoCompletion')}
          class="w-4 h-4"
        />
      </label>
      <div class="text-xs text-neutral-500 -mt-2 ml-4">
        Suggest completions while typing
      </div>
    </div>
  );
});
