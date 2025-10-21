import { component$, useContext } from '@builder.io/qwik';
import { UIContext, type SettingsTab } from '@/contexts/uiContext';
import { CacheSettingsTab } from '../CacheSettingsTab';
import { CollabSettingsTab } from '../CollabSettingsTab';
import { EditorSettingsTab } from '../EditorSettingsTab';
import { LayoutSettingsTab } from '../LayoutSettingsTab';
import { PunctualSettingsTab } from '../PunctualSettingsTab';
import { StrudelSettingsTab } from '../StrudelSettingsTab';

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
