import { component$ } from '@builder.io/qwik';

export const KeybindHints = component$(() => {
  return (
    <div class="flex flex-wrap items-center gap-3" style={{ flexDirection: 'row-reverse', flexWrap: 'wrap-reverse' }}>
      <span>settings <kbd class="px-1.5 py-0.5 border border-neutral-800 rounded text-neutral-400">Esc</kbd></span>
      <span>stop <kbd class="px-1.5 py-0.5 border border-neutral-800 rounded text-neutral-400">Ctrl+.</kbd></span>
      <span>evaluate <kbd class="px-1.5 py-0.5 border border-neutral-800 rounded text-neutral-400">Ctrl+Enter</kbd></span>
      <span>switch <kbd class="px-1.5 py-0.5 border border-neutral-800 rounded text-neutral-400">Ctrl+;</kbd></span>
      <span>swap <kbd class="px-1.5 py-0.5 border border-neutral-800 rounded text-neutral-400">Ctrl+Shift+;</kbd></span>
      <span>ratio <kbd class="px-1.5 py-0.5 border border-neutral-800 rounded text-neutral-400">Ctrl+,</kbd></span>
      <span>rotate <kbd class="px-1.5 py-0.5 border border-neutral-800 rounded text-neutral-400">Ctrl+'</kbd></span>
    </div>
  );
});
