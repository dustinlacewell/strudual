import { component$, useSignal, useVisibleTask$, $, useContextProvider } from '@builder.io/qwik';
import type { StrudelInstance } from '@/utils/strudel';
import type { PunctualInstance, PunctualAnimator } from '@/utils/punctual';
import type { EditorView } from '@codemirror/view';
import { PunctualMirror } from './PunctualMirror';
import { StatusBar } from './StatusBar';
import { SettingsModal } from './SettingsModal';
import { StrudelContext } from '@/contexts/strudelContext';
import { PunctualContext } from '@/contexts/punctualContext';
import { UIContext } from '@/contexts/uiContext';
import { useKeyboardControls } from './hooks/useKeyboardControls';
import { useStrudelSetup } from './hooks/useStrudelSetup';
import { usePunctualSetup } from './hooks/usePunctualSetup';
import { useEditorFocus } from './hooks/useEditorFocus';
import { loadSettings } from '@/stores/editorSettings';

interface StrudelPunctualOverlayProps {
  strudelCode?: string;
  punctualCode?: string;
  height?: string;
}

export const StrudelPunctualOverlay = component$<StrudelPunctualOverlayProps>(({
  strudelCode = 's("bd sd, hh*8")',
  punctualCode = 'ilo * circle [0,0] 0.5 >> add;\nimid * hline 0 0.01 >> add;\nihi * vline 0 0.01 >> add;',
  height = '600px',
}) => {
  // Refs
  const strudelRef = useSignal<StrudelInstance>();
  const strudelContainerRef = useSignal<HTMLDivElement>();
  const punctualRef = useSignal<PunctualInstance>();
  const punctualAnimatorRef = useSignal<PunctualAnimator>();
  const punctualEditorRef = useSignal<EditorView | null>(null);
  const punctualCanvasRef = useSignal<HTMLDivElement>();
  
  // UI State
  const activeEditor = useSignal<'strudel' | 'punctual'>('strudel');
  const showSettings = useSignal(false);
  const errorMsg = useSignal('');
  const editorSettings = useSignal(loadSettings());

  // Provide contexts
  useContextProvider(StrudelContext, { strudelRef, strudelContainerRef });
  useContextProvider(PunctualContext, { punctualRef, punctualAnimatorRef, punctualEditorRef, punctualCanvasRef });
  useContextProvider(UIContext, { activeEditor, showSettings, errorMsg, editorSettings });

  // Setup hooks
  useStrudelSetup(strudelCode);
  usePunctualSetup(punctualCode);
  useKeyboardControls();
  const { handleStrudelClick, handlePunctualClick } = useEditorFocus();

  // Expose active editor state globally for attribution component
  useVisibleTask$(() => {
    (window as any).__strudelPunctualActiveEditor = activeEditor;
  });

  // Watch settings changes and update Strudel editor dynamically
  useVisibleTask$(({ track }) => {
    track(() => editorSettings.value);
    
    if (strudelRef.value?.editor) {
      const settings = editorSettings.value;
      strudelRef.value.editor.updateSettings({
        fontSize: settings.fontSize,
        fontFamily: settings.fontFamily,
        keybindings: settings.keybindings,
        isLineNumbersDisplayed: settings.lineNumbers,
        isLineWrappingEnabled: settings.lineWrapping,
        isBracketMatchingEnabled: settings.bracketMatching,
        isBracketClosingEnabled: settings.bracketClosing,
        isActiveLineHighlighted: settings.activeLineHighlight,
        isTabIndentationEnabled: settings.tabIndentation,
        isMultiCursorEnabled: settings.multiCursor,
      });
    }
  });

  // Punctual evaluate handler
  const handlePunctualEvaluate = $((code: string) => {
    if (punctualAnimatorRef.value) {
      punctualAnimatorRef.value.evaluate(code);
    }
  });

  return (
    <div class="strudel-punctual-overlay" style={{ position: 'relative', width: '100%', height: height || '100%' }}>
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
        <div ref={strudelContainerRef} class="absolute inset-0" />
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
        />
      </div>

      <StatusBar />
      
      <SettingsModal />
    </div>
  );
});
