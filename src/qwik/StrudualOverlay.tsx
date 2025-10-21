import { component$, useSignal, useVisibleTask$, $, useContextProvider } from '@builder.io/qwik';
import type { StrudelInstance } from '@/utils/strudel';
import type { PunctualInstance, PunctualAnimator } from '@/utils/punctual';
import type { EditorView } from '@codemirror/view';
import type { Compartment } from '@codemirror/state';
import { StrudelMirror } from './StrudelMirror';
import { PunctualMirror } from './PunctualMirror';
import { StatusBar } from './StatusBar';
import { SettingsModal } from './SettingsModal';
import { StrudelContext } from '@/contexts/strudelContext';
import { PunctualContext } from '@/contexts/punctualContext';
import { UIContext } from '@/contexts/uiContext';
import { CollabContext } from '@/contexts/collabContext';
import { useKeyboardControls } from './hooks/useKeyboardControls';
import { usePunctualSetup } from './hooks/usePunctualSetup';
import { useEditorFocus } from './hooks/useEditorFocus';
import { useCollabSession } from './hooks/useCollabSession';
import { loadSettings } from '@/stores/editorSettings';
import { getCollabParams } from '@/utils/urlParams';

interface StrudualOverlayProps {
  strudelCode?: string;
  punctualCode?: string;
  height?: string;
}

export const StrudualOverlay = component$<StrudualOverlayProps>(({
  strudelCode = 's("bd sd, hh*8")',
  punctualCode = 'ilo * circle [0,0] 0.5 >> add;\nimid * hline 0 0.01 >> add;\nihi * vline 0 0.01 >> add;',
  height = '600px',
}) => {
  // Refs
  const strudelRef = useSignal<StrudelInstance>();
  const strudelEditorRef = useSignal<EditorView | null>(null);
  const strudelCollabCompartmentRef = useSignal<Compartment | null>(null);
  const punctualRef = useSignal<PunctualInstance>();
  const punctualAnimatorRef = useSignal<PunctualAnimator>();
  const punctualEditorRef = useSignal<EditorView | null>(null);
  const punctualCollabCompartmentRef = useSignal<Compartment | null>(null);
  const punctualCanvasRef = useSignal<HTMLDivElement>();
  
  // UI State
  const activeEditor = useSignal<'strudel' | 'punctual'>('strudel');
  const showSettings = useSignal(false);
  const activeSettingsTab = useSignal<'editor' | 'collab'>('editor');
  const errorMsg = useSignal('');
  const editorSettings = useSignal(loadSettings());

  // Provide editor contexts FIRST (collab hook needs them)
  useContextProvider(StrudelContext, { strudelRef, strudelEditorRef, strudelCollabCompartmentRef });
  useContextProvider(PunctualContext, { punctualRef, punctualAnimatorRef, punctualEditorRef, punctualCollabCompartmentRef, punctualCanvasRef });
  useContextProvider(UIContext, { activeEditor, showSettings, activeSettingsTab, errorMsg, editorSettings });

  // Setup collab session (needs editor contexts)
  const collab = useCollabSession();
  
  // Provide collab context
  useContextProvider(CollabContext, collab);
  
  // Open modal to collab tab if URL has room param (but no username for auto-connect)
  useVisibleTask$(() => {
    // Check URL directly to avoid timing issues with signals
    const urlParams = getCollabParams();
    
    console.log('[overlay] Checking URL params:', urlParams);
    
    if (urlParams.room && !urlParams.username) {
      console.log('[overlay] Opening modal to collab tab');
      activeSettingsTab.value = 'collab';
      showSettings.value = true;
    }
  });

  // Setup hooks
  usePunctualSetup(punctualCode);
  useKeyboardControls();
  const { handleStrudelClick, handlePunctualClick } = useEditorFocus();

  // Expose active editor state globally for attribution component
  useVisibleTask$(() => {
    (window as any).__strudualActiveEditor = activeEditor;
  });

  // Punctual evaluate handler
  const handlePunctualEvaluate = $((code: string) => {
    if (punctualAnimatorRef.value) {
      punctualAnimatorRef.value.evaluate(code);
    }
  });

  return (
    <div class="strudual-overlay" style={{ position: 'relative', width: '100%', height: height || '100%' }}>
      {errorMsg.value && (
        <div class="absolute top-0 left-0 right-0 z-50 p-4 bg-red-900/90 text-white">
          {errorMsg.value}
        </div>
      )}

      {/* Punctual canvas - FULL height background */}
      <div
        ref={punctualCanvasRef}
        class="absolute inset-0 z-0"
        style={{ backgroundColor: 'black' }}
      />

      {/* Strudel editor - top half */}
      <div
        onClick$={handleStrudelClick}
        class="absolute top-0 left-0 right-0 z-10 transition-opacity duration-200 cursor-pointer"
        style={{
          height: '50%',
          opacity: activeEditor.value === 'strudel' ? 1 : 0.3,
          pointerEvents: 'auto',
        }}
      >
        <StrudelMirror
          initialCode={strudelCode}
          editorRef={strudelEditorRef}
          strudelInstanceRef={strudelRef}
          collabCompartmentRef={strudelCollabCompartmentRef}
        />
      </div>

      {/* Punctual editor - bottom half */}
      <div
        onClick$={handlePunctualClick}
        class="absolute bottom-0 left-0 right-0 z-10 transition-opacity duration-200 cursor-pointer"
        style={{
          height: '50%',
          opacity: activeEditor.value === 'punctual' ? 1 : 0.3,
          pointerEvents: 'auto',
        }}
      >
        <PunctualMirror
          initialCode={punctualCode}
          onEvaluate={handlePunctualEvaluate}
          editorRef={punctualEditorRef}
          collabCompartmentRef={punctualCollabCompartmentRef}
        />
      </div>

      <StatusBar />
      
      <SettingsModal />
    </div>
  );
});
