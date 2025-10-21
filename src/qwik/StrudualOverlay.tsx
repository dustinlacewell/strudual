import { component$, useSignal, useVisibleTask$, $, useContextProvider } from '@builder.io/qwik';
import type { StrudelInstance } from '@/utils/strudel';
import type { PunctualInstance, PunctualAnimator } from '@/utils/punctual';
import type { EditorView } from '@codemirror/view';
import type { Compartment } from '@codemirror/state';
import { StrudelMirror } from './StrudelMirror';
import { PunctualMirror } from './PunctualMirror';
import { CollabStatus } from './CollabStatus';
import { Footer } from './Footer';
import { SettingsModal } from './settings/SettingsModal';
import { StrudelContext } from '@/contexts/strudelContext';
import { PunctualContext } from '@/contexts/punctualContext';
import { UIContext } from '@/contexts/uiContext';
import { CollabContext } from '@/contexts/collabContext';
import { useKeyboardControls } from './hooks/useKeyboardControls';
import { usePunctualSetup } from './hooks/usePunctualSetup';
import { useEditorFocus } from './hooks/useEditorFocus';
import { useCollabSession } from './hooks/useCollabSession';
import { useAutoSave } from './hooks/useAutoSave';
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
  const activeSettingsTab = useSignal<'layout' | 'editor' | 'strudel' | 'punctual' | 'collab' | 'cache'>('layout');
  const errorMsg = useSignal('');
  const editorSettings = useSignal(loadSettings());
  const autoSaveEnabled = useSignal(false);
  const autoSaveFilename = useSignal('');
  const layoutOrientation = useSignal<'vertical' | 'horizontal' | 'auto'>('auto');
  const computedOrientation = useSignal<'vertical' | 'horizontal'>('vertical');
  
  // Compute actual orientation based on 'auto' or explicit choice (client-side only)
  useVisibleTask$(({ track }) => {
    // On first run, reload settings from localStorage (client-side only)
    if (editorSettings.value.layoutOrientation === 'auto' && layoutOrientation.value === 'auto') {
      const clientSettings = loadSettings();
      editorSettings.value = clientSettings;
    }
    
    // Track changes to layoutOrientation from editorSettings
    track(() => editorSettings.value.layoutOrientation);
    
    const updateOrientation = () => {
      const setting = editorSettings.value.layoutOrientation;
      
      if (setting === 'auto') {
        // Auto-detect based on aspect ratio
        const aspectRatio = window.innerWidth / window.innerHeight;
        computedOrientation.value = aspectRatio > 1.5 ? 'horizontal' : 'vertical';
      } else {
        // Use explicit setting
        computedOrientation.value = setting;
      }
      
      layoutOrientation.value = setting;
    };
    
    updateOrientation();
    
    // Re-compute on window resize if in auto mode
    const handleResize = () => {
      if (layoutOrientation.value === 'auto') {
        updateOrientation();
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

  // Provide editor contexts FIRST (collab hook needs them)
  useContextProvider(StrudelContext, { strudelRef, strudelEditorRef, strudelCollabCompartmentRef });
  useContextProvider(PunctualContext, { punctualRef, punctualAnimatorRef, punctualEditorRef, punctualCollabCompartmentRef, punctualCanvasRef });
  useContextProvider(UIContext, { activeEditor, showSettings, activeSettingsTab, errorMsg, editorSettings, autoSaveEnabled, autoSaveFilename, layoutOrientation, computedOrientation });

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
  useAutoSave();
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

      {/* Dimming layer between Punctual canvas and editors */}
      <div
        class="absolute inset-0 z-5 pointer-events-none"
        style={{
          backgroundColor: 'black',
          opacity: (100 - editorSettings.value.editorBackgroundOpacity) / 100,
        }}
      />

      {/* Strudel editor */}
      <div
        onClick$={handleStrudelClick}
        class="absolute z-10 transition-opacity duration-200 cursor-pointer"
        style={{
          ...(() => {
            const ratio = editorSettings.value.splitRatio;
            const isStrudelFirst = editorSettings.value.editorOrder === 'strudel-first';
            const isStrudelActive = activeEditor.value === 'strudel';
            const isVertical = computedOrientation.value === 'vertical';
            
            // Calculate size based on ratio and active editor
            let strudelSize: string;
            if (ratio === '50-50') {
              strudelSize = '50%';
            } else if (ratio === '33-66') {
              // Active editor gets 66%, inactive gets 33%
              strudelSize = isStrudelActive ? '66.67%' : '33.33%';
            } else { // '100-0'
              // Active editor gets 100%, inactive gets 0%
              strudelSize = isStrudelActive ? '100%' : '0%';
            }
            
            if (isVertical) {
              return isStrudelFirst
                ? { top: 0, left: 0, right: 0, height: strudelSize }
                : { bottom: 0, left: 0, right: 0, height: strudelSize };
            } else {
              return isStrudelFirst
                ? { top: 0, left: 0, bottom: 0, width: strudelSize }
                : { top: 0, right: 0, bottom: 0, width: strudelSize };
            }
          })(),
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

      {/* Punctual editor */}
      <div
        onClick$={handlePunctualClick}
        class="absolute z-10 transition-opacity duration-200 cursor-pointer"
        style={{
          ...(() => {
            const ratio = editorSettings.value.splitRatio;
            const isStrudelFirst = editorSettings.value.editorOrder === 'strudel-first';
            const isPunctualActive = activeEditor.value === 'punctual';
            const isVertical = computedOrientation.value === 'vertical';
            
            // Calculate size based on ratio and active editor
            let punctualSize: string;
            if (ratio === '50-50') {
              punctualSize = '50%';
            } else if (ratio === '33-66') {
              // Active editor gets 66%, inactive gets 33%
              punctualSize = isPunctualActive ? '66.67%' : '33.33%';
            } else { // '100-0'
              // Active editor gets 100%, inactive gets 0%
              punctualSize = isPunctualActive ? '100%' : '0%';
            }
            
            if (isVertical) {
              return isStrudelFirst
                ? { bottom: 0, left: 0, right: 0, height: punctualSize }
                : { top: 0, left: 0, right: 0, height: punctualSize };
            } else {
              return isStrudelFirst
                ? { top: 0, right: 0, bottom: 0, width: punctualSize }
                : { top: 0, left: 0, bottom: 0, width: punctualSize };
            }
          })(),
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

      <CollabStatus />
      <Footer />
      
      <SettingsModal />
    </div>
  );
});
