import { component$, useContext } from '@builder.io/qwik';
import { UIContext, type SettingsTab } from '@/contexts/uiContext';
import { CacheSettingsTab } from './panels/CacheSettingsTab';
import { CollabSettingsTab } from './panels/CollabSettingsTab';
import { EditorSettingsTab } from './panels/EditorSettingsTab';
import { LayoutSettingsTab } from './panels/LayoutSettingsTab';
import { PunctualSettingsTab } from './panels/PunctualSettingsTab';
import { StrudelSettingsTab } from './panels/StrudelSettingsTab';

export const SettingsPanel = component$(() => {
  const { activeSettingsTab } = useContext(UIContext);

  return (
    <div>
      {
        activeSettingsTab.value === 'layout' && (
          <LayoutSettingsTab />
        )
      }

      {
        activeSettingsTab.value === 'editor' && (
          <EditorSettingsTab />
        )
      }

      {
        activeSettingsTab.value === 'strudel' && (
          <StrudelSettingsTab />
        )
      }

      {
        activeSettingsTab.value === 'punctual' && (
          <PunctualSettingsTab />
        )
      }

      {
        activeSettingsTab.value === 'collab' && (
          <CollabSettingsTab />
        )
      }

      {
        activeSettingsTab.value === 'cache' && (
          <CacheSettingsTab />
        )
      }
    </div >
  );
});
