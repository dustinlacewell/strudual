import { component$, useContext, $ } from '@builder.io/qwik';
import { UIContext } from '@/contexts/uiContext';
import { SettingsMenu } from './SettingsMenu';
import { SettingsPanel } from './SettingsPanel';
import { SettingsHeader } from './SettingsHeader';

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
      class="fixed inset-0 z-50 flex justify-center"
      style={{ alignItems: 'flex-start', paddingTop: '5em' }}
      onClick$={handleBackdropClick}
    >
      <div onClick$={handleModalClick}
        class="flex flex-col gap-2 bg-black border border-neutral-800 rounded p-6 w-[428px] max-h-[80vh] overflow-y-auto">
        <SettingsHeader />
        <div class="flex select-none">
          <div class="w-[50px]">
            <SettingsMenu />
          </div>
          <div class="w-[15px]">
            
          </div>
          <div class="flex-1">
            <SettingsPanel />
          </div>
        </div>
      </div>
    </div>
  );
});
