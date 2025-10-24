import { component$, useContext } from '@builder.io/qwik';
import { UIContext } from '@/contexts/uiContext';
import { KeybindHints } from './KeybindHints';
import { StrudualAttribution } from './StrudualAttribution';

export const Footer = component$(() => {
  const { activeEditor } = useContext(UIContext);

  return (
    <div class="fixed bottom-0 left-0 right-0 z-20 flex items-end justify-between gap-6 px-3 py-2 text-xs text-neutral-500 select-none">
      <StrudualAttribution />
      <KeybindHints />
    </div>
  );
});
