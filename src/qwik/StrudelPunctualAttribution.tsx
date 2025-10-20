import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';

export const StrudelPunctualAttribution = component$(() => {
  const activeEditor = useSignal<'strudel' | 'punctual'>('strudel');

  useVisibleTask$(() => {
    const interval = setInterval(() => {
      // Poll for active editor state from the overlay component
      const globalState = (window as any).__strudelPunctualActiveEditor;
      if (globalState?.value) {
        activeEditor.value = globalState.value;
      }
    }, 100);

    return () => clearInterval(interval);
  });

  return (
    <div class="fixed bottom-4 left-4 z-50 text-xs text-neutral-500 flex gap-2">
      <span>Powered by</span>
      <a 
        href="https://strudel.cc" 
        target="_blank" 
        rel="noopener" 
        class={{
          'hover:text-neutral-300 underline': true,
          'font-bold text-white': activeEditor.value === 'strudel',
        }}
      >
        Strudel
      </a>
      <span>&</span>
      <a 
        href="https://github.com/dktr0/Punctual" 
        target="_blank" 
        rel="noopener" 
        class={{
          'hover:text-neutral-300 underline': true,
          'font-bold text-white': activeEditor.value === 'punctual',
        }}
      >
        Punctual
      </a>
    </div>
  );
});
