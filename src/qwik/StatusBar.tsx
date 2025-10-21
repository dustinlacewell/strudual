import { component$, useContext } from '@builder.io/qwik';
import { CollabContext } from '@/contexts/collabContext';

export const StatusBar = component$(() => {
  const collab = useContext(CollabContext);

  const getLedColor = () => {
    if (collab.status.value === 'connected' && collab.peerCount.value > 0) return 'bg-green-500';
    if (collab.status.value === 'connected') return 'bg-neutral-500';
    if (collab.status.value === 'connecting') return 'bg-yellow-500';
    return 'bg-neutral-700';
  };

  return (
    <div class="absolute bottom-0 right-0 z-20 flex flex-col items-end gap-1 px-3 py-2 text-xs text-neutral-500 pointer-events-none select-none">
      {/* Peer list */}
      {collab.peers.value.length > 0 && (
        <div class="flex flex-col items-end gap-0.5">
          {collab.peers.value.map((peer) => (
            <div key={peer.id} class="flex items-center gap-2">
              <span class="text-neutral-400">{peer.name}</span>
              <div 
                class="w-2 h-2 rounded-full" 
                style={{ backgroundColor: peer.color }}
              />
            </div>
          ))}
        </div>
      )}
      
      {/* Keyboard shortcuts and status LED */}
      <div class="flex items-center gap-3">
        <span>evaluate <kbd class="px-1.5 py-0.5 border border-neutral-800 rounded text-neutral-400">Ctrl+Enter</kbd></span>
        <span>stop <kbd class="px-1.5 py-0.5 border border-neutral-800 rounded text-neutral-400">Ctrl+.</kbd></span>
        <span>switch <kbd class="px-1.5 py-0.5 border border-neutral-800 rounded text-neutral-400">Ctrl+;</kbd></span>
        <span>settings <kbd class="px-1.5 py-0.5 border border-neutral-800 rounded text-neutral-400">Esc</kbd></span>
        <div class={`w-2 h-2 rounded-full ${getLedColor()}`} />
      </div>
    </div>
  );
});
