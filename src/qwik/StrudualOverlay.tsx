import { component$, useContext, useComputed$ } from '@builder.io/qwik';
import { EditorContainer } from './editors/EditorContainer';
import { MainMenu } from './menu/MainMenu';
import { Footer } from './footer/Footer';
import { SettingsModal } from './settings/SettingsModal';
import { UIContext } from '@/contexts/uiContext';
import { StrudelContext } from '@/contexts/strudelContext';
import { PunctualContext } from '@/contexts/punctualContext';
import { useStrudelContext } from './hooks/useStrudelContext';
import { usePunctualContext } from './hooks/usePunctualContext';
import { useUIContext } from './hooks/useUIContext';
import { useCollabContext } from './hooks/useCollabContext';
import { useKeyboardControls } from './hooks/useKeyboardControls';
import { useAutoSave } from './hooks/useAutoSave';

interface StrudualOverlayProps {
  strudelCode?: string;
  punctualCode?: string;
}

export const StrudualOverlay = component$<StrudualOverlayProps>(({
  strudelCode = 's("bd sd, hh*8")',
  punctualCode = 'ilo * circle [0,0] 0.5 >> add;\nimid * hline 0 0.01 >> add;\nihi * vline 0 0.01 >> add;',
}) => {
  // Initialize all contexts
  // UIContext must be provided first since usePunctualContext needs it for error handling
  useUIContext();
  useStrudelContext(strudelCode);
  usePunctualContext(punctualCode);
  useCollabContext();

  // Setup application behaviors
  useKeyboardControls();
  useAutoSave();

  // Get ready state from all contexts
  const { errorMsg, uiReady } = useContext(UIContext);
  const { isReady: strudelReady } = useContext(StrudelContext);
  const { isReady: punctualReady } = useContext(PunctualContext);

  // Compute overall ready state - wait for ALL contexts to be ready
  const allReady = useComputed$(() => {
    return uiReady.value && strudelReady.value && punctualReady.value;
  });

  return (
    <div class="strudual-overlay" style={{ position: 'relative', width: '100%', height: '100%' }}>
      {errorMsg.value && (
        <div class="absolute top-0 left-0 right-0 z-50 p-4 bg-red-900/90 text-white">
          {errorMsg.value}
        </div>
      )}

      {allReady.value && (
        <>
          <EditorContainer
            height="100%"
          />

          <MainMenu />
          <Footer />
          <SettingsModal />
        </>
      )}
    </div>
  );
});
