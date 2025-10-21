import { component$ } from '@builder.io/qwik';

export const SettingsHeader = component$(() => {
  return (
    <div class="flex justify-between align-center">
      <div class="text-lg text-neutral-300 mb-2">Settings</div>
      <div class="flex align-center gap-1 text-neutral-500 text-xs">
        Licensed
        <span>
          <a
            href="https://raw.githubusercontent.com/dustinlacewell/strudual/refs/heads/main/LICENSE"
            target="_blank"
            rel="noopener"
            class={{
              'hover:text-neutral-300 underline text-xs [font-variant:small-caps]': true,
            }}
          >
            AGPL3
          </a>
        </span>
      </div>

    </div>
  );
});
