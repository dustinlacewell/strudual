import { component$, useContext } from '@builder.io/qwik';
import { UIContext, type SettingsTab } from '@/contexts/uiContext';

interface SettingsMenuItemProps {
  tab: SettingsTab;
}

export const SettingsMenuItem = component$(({ tab }: SettingsMenuItemProps) => {
  const { activeSettingsTab } = useContext(UIContext);

  return (
    <button
      onClick$={() => activeSettingsTab.value = tab}
      class={{
        'flex-1 text-xs pt-[10px] pb-[10px] transition-colors': true,
        'text-neutral-300 border-neutral-300': activeSettingsTab.value === tab,
        'text-neutral-500 hover:text-neutral-200': activeSettingsTab.value !== tab,
      }}
    >
      {tab}
    </button>
  )
})

export const SettingsMenu = component$(() => {
  return (
    <div class="flex flex-col justify-stretch align-stretch">
      <SettingsMenuItem tab="layout" />
      <SettingsMenuItem tab="editor" />
      <SettingsMenuItem tab="strudel" />
      <SettingsMenuItem tab="punctual" />
      <SettingsMenuItem tab="collab" />
      <SettingsMenuItem tab="cache" />
    </div>
  );
});
