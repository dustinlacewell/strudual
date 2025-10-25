import { component$, useContext } from '@builder.io/qwik';
import { UIContext, type Keybind } from '@/contexts/uiContext';

interface KeybindHintProps {
  label: string;
  keys: string;
  keybind: Keybind;
  isFlashing: boolean;
}

const KeybindHint = component$<KeybindHintProps>(({ label, keys, isFlashing }) => {
  return (
    <span>
      {label} <kbd class={`px-1.5 py-0.5 border rounded transition-all duration-150 ${
        isFlashing 
          ? 'border-neutral-300 text-neutral-100' 
          : 'border-neutral-800 text-neutral-400'
      }`}>{keys}</kbd>
    </span>
  );
});

export const KeybindHints = component$(() => {
  const { flashingKeybinds } = useContext(UIContext);
  const flashing = flashingKeybinds.value;

  return (
    <div class="flex flex-wrap items-center gap-3" style={{ flexDirection: 'row-reverse', flexWrap: 'wrap-reverse' }}>
      <KeybindHint label="settings" keys="Esc" keybind="settings" isFlashing={flashing.has('settings')} />
      <KeybindHint label="stop" keys="Ctrl+." keybind="stop" isFlashing={flashing.has('stop')} />
      <KeybindHint label="evaluate" keys="Ctrl+Enter" keybind="evaluate" isFlashing={flashing.has('evaluate')} />
      <KeybindHint label="switch" keys="Ctrl+;" keybind="switch" isFlashing={flashing.has('switch')} />
      <KeybindHint label="swap" keys="Ctrl+Shift+;" keybind="swap" isFlashing={flashing.has('swap')} />
      <KeybindHint label="ratio" keys="Ctrl+," keybind="ratio" isFlashing={flashing.has('ratio')} />
      <KeybindHint label="rotate" keys="Ctrl+'" keybind="rotate" isFlashing={flashing.has('rotate')} />
      <KeybindHint label="zoom" keys="Shift+Wheel" keybind="zoom" isFlashing={flashing.has('zoom')} />
    </div>
  );
});
