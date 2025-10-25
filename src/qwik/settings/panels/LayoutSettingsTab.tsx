import { component$, useContext, $ } from '@builder.io/qwik';
import { UIContext } from '@/contexts/uiContext';
import { saveSettings } from '@/stores/editorSettings';

export const LayoutSettingsTab = component$(() => {
  const { editorSettings, layoutOrientation } = useContext(UIContext);

  const handleFontSizeChange = $((e: Event) => {
    const target = e.target as HTMLInputElement;
    editorSettings.value = { ...editorSettings.value, fontSize: parseInt(target.value) };
    saveSettings(editorSettings.value);
  });

  const handleBackgroundOpacityChange = $((e: Event) => {
    const target = e.target as HTMLInputElement;
    editorSettings.value = { ...editorSettings.value, editorBackgroundOpacity: parseInt(target.value) };
    saveSettings(editorSettings.value);
  });

  const handleInactiveEditorOpacityChange = $((e: Event) => {
    const target = e.target as HTMLInputElement;
    editorSettings.value = { ...editorSettings.value, inactiveEditorOpacity: parseInt(target.value) };
    saveSettings(editorSettings.value);
  });

  const handleLayoutOrientationChange = $((e: Event) => {
    const target = e.target as HTMLInputElement;
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

  return (
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

      {/* Editor Background Opacity */}
      <div>
        <label class="block text-sm text-neutral-300 mb-2">
          Editor Background Opacity: {editorSettings.value.editorBackgroundOpacity}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={editorSettings.value.editorBackgroundOpacity}
          onInput$={handleBackgroundOpacityChange}
          class="w-full"
        />
        <div class="text-xs text-neutral-500 mt-1">
          Lower values dim Punctual visuals behind editors
        </div>
      </div>

      {/* Inactive Editor Opacity */}
      <div>
        <label class="block text-sm text-neutral-300 mb-2">
          Inactive Editor Opacity: {editorSettings.value.inactiveEditorOpacity}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={editorSettings.value.inactiveEditorOpacity}
          onInput$={handleInactiveEditorOpacityChange}
          class="w-full"
        />
        <div class="text-xs text-neutral-500 mt-1">
          Opacity of unfocused editor content (text, sliders, etc)
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
              checked={editorSettings.value.layoutOrientation === 'auto'}
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
              checked={editorSettings.value.layoutOrientation === 'vertical'}
              onChange$={handleLayoutOrientationChange}
              class="w-4 h-4"
            />
            <span>Vertical</span>
          </label>
          <label class="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer">
            <input
              type="radio"
              name="layoutOrientation"
              value="horizontal"
              checked={editorSettings.value.layoutOrientation === 'horizontal'}
              onChange$={handleLayoutOrientationChange}
              class="w-4 h-4"
            />
            <span>Horizontal</span>
          </label>
        </div>
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
    </div>
  );
});
