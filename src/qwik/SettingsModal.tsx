import { component$, useContext, $ } from '@builder.io/qwik';
import { UIContext } from '@/contexts/uiContext';
import { LayoutSettingsTab } from './LayoutSettingsTab';
import { EditorSettingsTab } from './EditorSettingsTab';
import { StrudelSettingsTab } from './StrudelSettingsTab';
import { PunctualSettingsTab } from './PunctualSettingsTab';
import { CollabSettingsTab } from './CollabSettingsTab';
import { CacheSettingsTab } from './CacheSettingsTab';

export const SettingsModal = component$(() => {
  const { showSettings, activeSettingsTab } = useContext(UIContext);

  const handleBackdropClick = $(() => {
    showSettings.value = false;
  });

  const handleModalClick = $((e: MouseEvent) => {
    e.stopPropagation();
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
          <div class="flex border-b border-neutral-800">
            <button
              onClick$={() => activeSettingsTab.value = 'layout'}
              class={{
                'flex-1 pb-2 text-xs transition-colors': true,
                'text-neutral-300 border-b-2 border-neutral-300': activeSettingsTab.value === 'layout',
                'text-neutral-500 hover:text-neutral-400': activeSettingsTab.value !== 'layout',
              }}
            >
              Layout
            </button>
            <button
              onClick$={() => activeSettingsTab.value = 'editor'}
              class={{
                'flex-1 pb-2 text-xs transition-colors': true,
                'text-neutral-300 border-b-2 border-neutral-300': activeSettingsTab.value === 'editor',
                'text-neutral-500 hover:text-neutral-400': activeSettingsTab.value !== 'editor',
              }}
            >
              Editor
            </button>
            <button
              onClick$={() => activeSettingsTab.value = 'strudel'}
              class={{
                'flex-1 pb-2 text-xs transition-colors': true,
                'text-neutral-300 border-b-2 border-neutral-300': activeSettingsTab.value === 'strudel',
                'text-neutral-500 hover:text-neutral-400': activeSettingsTab.value !== 'strudel',
              }}
            >
              Strudel
            </button>
            <button
              onClick$={() => activeSettingsTab.value = 'punctual'}
              class={{
                'flex-1 pb-2 text-xs transition-colors': true,
                'text-neutral-300 border-b-2 border-neutral-300': activeSettingsTab.value === 'punctual',
                'text-neutral-500 hover:text-neutral-400': activeSettingsTab.value !== 'punctual',
              }}
            >
              Punctual
            </button>
            <button
              onClick$={() => activeSettingsTab.value = 'collab'}
              class={{
                'flex-1 pb-2 text-xs transition-colors': true,
                'text-neutral-300 border-b-2 border-neutral-300': activeSettingsTab.value === 'collab',
                'text-neutral-500 hover:text-neutral-400': activeSettingsTab.value !== 'collab',
              }}
            >
              Collab
            </button>
            <button
              onClick$={() => activeSettingsTab.value = 'cache'}
              class={{
                'flex-1 pb-2 text-xs transition-colors': true,
                'text-neutral-300 border-b-2 border-neutral-300': activeSettingsTab.value === 'cache',
                'text-neutral-500 hover:text-neutral-400': activeSettingsTab.value !== 'cache',
              }}
            >
              Cache
            </button>
          </div>
        </div>

        {activeSettingsTab.value === 'layout' && (
          <LayoutSettingsTab />
        )}

        {activeSettingsTab.value === 'editor' && (
          <EditorSettingsTab />
        )}

        {activeSettingsTab.value === 'strudel' && (
          <StrudelSettingsTab />
        )}

        {activeSettingsTab.value === 'punctual' && (
          <PunctualSettingsTab />
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
