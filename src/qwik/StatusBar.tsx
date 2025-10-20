import { component$ } from '@builder.io/qwik';

export const StatusBar = component$(() => {
  return (
    <div class="absolute bottom-0 right-0 z-20 flex items-center px-4 py-2 bg-black/50 text-xs text-neutral-400 pointer-events-none">
      <span>
        evaluate <kbd class="px-1 bg-neutral-800 rounded">Ctrl+Enter</kbd> |
        stop <kbd class="px-1 bg-neutral-800 rounded">Ctrl+.</kbd> |
        switch <kbd class="px-1 bg-neutral-800 rounded">Ctrl+;</kbd> |
        settings <kbd class="px-1 bg-neutral-800 rounded">Esc</kbd>
      </span>
    </div>
  );
});
