import { component$, useContext, $ } from '@builder.io/qwik';
import { CollabContext } from '@/contexts/collabContext';
import { UIContext } from '@/contexts/uiContext';
import { LED } from '../../shared/LED';
import { StatusLED } from './StatusLED';


export const PeerList = component$(() => {
  const collab = useContext(CollabContext);
  const uiContext = useContext(UIContext);
  const { showSettings, activeSettingsTab } = uiContext;

  return (
    <div class="flex flex-col items-end gap-1 relative">
      <StatusLED
        onClick={$(() => {
          activeSettingsTab.value = 'collab';
          showSettings.value = true;
        })}
      />
      <div class="absolute top-[20px] flex flex-col items-end">
        {
          collab.peers.value.length > 0 && (
            <div class="w-[24px] border-b border-neutral-700 mt-1" />
          )
        }
        {
          collab.peers.value.length > 0 && (
            <div class="flex flex-col items-end gap-0.5">
              {collab.peers.value.map((peer) => (
                <div key={peer.id} class="flex items-center gap-2">
                  <span style={{ color: peer.color }}>{peer.name}</span>
                  <LED color={peer.color} />
                </div>
              ))}
            </div>
          )
        }
      </div>
    </div >
  );
});
