import { component$ } from '@builder.io/qwik';

export const PunctualSettingsTab = component$(() => {
  return (
    <div class="space-y-4">
      <div class="text-sm text-neutral-400 mb-4">
        Punctual-specific settings
      </div>
      
      <div class="text-sm text-neutral-500">
        No Punctual-specific settings available yet.
      </div>
    </div>
  );
});
