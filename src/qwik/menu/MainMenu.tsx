import { component$ } from '@builder.io/qwik';
import { AutoSave } from './autosave/AutoSave';
import { PeerList } from './collab/PeerList';
import { ClearButton } from './ClearButton';

export const MainMenu = component$(() => {
  return (
    <div class="absolute top-0 right-0 z-20 flex flex-row align-center items-end gap-1 px-3 py-2 text-xs text-neutral-500 pointer-events-none select-none">
      <ClearButton />
      <AutoSave />
      <PeerList />
    </div>
  );
});
