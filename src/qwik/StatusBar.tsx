import { component$ } from '@builder.io/qwik';

export const StatusBar = component$(() => {
  // TODO: Wire up actual collab status
  const collabStatus: 'disconnected' | 'connecting' | 'connected' = 'disconnected';
  const peerCount = 0;

  const getLedColor = () => {
    if (collabStatus === 'connected' && peerCount > 0) return 'bg-green-500';
    if (collabStatus === 'connected') return 'bg-neutral-500';
    if (collabStatus === 'connecting') return 'bg-yellow-500';
    return 'bg-neutral-700';
  };

  return (
    <div class="absolute bottom-0 right-0 z-20 flex items-center px-3 py-2 text-xs text-neutral-500 pointer-events-none select-none">
      <span class="flex items-center gap-3">
        <span>evaluate <kbd class="px-1.5 py-0.5 border border-neutral-800 rounded text-neutral-400">Ctrl+Enter</kbd></span>
        <span>stop <kbd class="px-1.5 py-0.5 border border-neutral-800 rounded text-neutral-400">Ctrl+.</kbd></span>
        <span>switch <kbd class="px-1.5 py-0.5 border border-neutral-800 rounded text-neutral-400">Ctrl+;</kbd></span>
        <span>settings <kbd class="px-1.5 py-0.5 border border-neutral-800 rounded text-neutral-400">Esc</kbd></span>
        <div class={`w-2 h-2 rounded-full ${getLedColor()}`} />
      </span>
    </div>
  );
});
