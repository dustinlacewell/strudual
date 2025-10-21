import { component$, useContext } from '@builder.io/qwik';
import { UIContext } from '@/contexts/uiContext';
import { KeybindHints } from './KeybindHints';

export const Footer = component$(() => {
  const { activeEditor } = useContext(UIContext);

  return (
    <div class="fixed bottom-0 left-0 right-0 z-20 flex items-end justify-between gap-6 px-3 py-2 text-xs text-neutral-500 pointer-events-none select-none">
      {/* Attribution - bottom left */}
      <div class="flex gap-2 font-mono">
        <a 
          href="https://github.com/dustinlacewell/strudual" 
          target="_blank" 
          rel="noopener" 
          class="hover:text-neutral-300 underline pointer-events-auto"
        >
          Strudual
        </a>
        <span>=</span>
        <a 
          href="https://strudel.cc" 
          target="_blank" 
          rel="noopener" 
          class={{
            'hover:text-neutral-300 underline pointer-events-auto': true,
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
            'hover:text-neutral-300 underline pointer-events-auto': true,
            'font-bold text-white': activeEditor.value === 'punctual',
          }}
        >
          Punctual
        </a>
      </div>

      {/* Keyboard hints - bottom right, wrapping upward */}
      <KeybindHints />
    </div>
  );
});
