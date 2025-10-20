import { component$, useSignal, useVisibleTask$, $ } from '@builder.io/qwik';
import { patchStrudelAudioRouting, getStrudelAudioTap, createStrudel } from '@/utils/strudel';
import { createContainedPunctual } from '@/utils/punctual';
import { getAudioContext } from '@strudel/webaudio';
import type { StrudelInstance } from '@/utils/strudel';
import type { PunctualInstance, PunctualAnimator } from '@/utils/punctual';
import { PunctualMirror } from './PunctualMirror';
import type { EditorView } from '@codemirror/view';
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
  const punctualCanvasRef = useSignal<HTMLDivElement>();
  const strudelContainerRef = useSignal<HTMLDivElement>();
  const punctualEditorRef = useSignal<EditorView | null>(null);
  
  const strudelRef = useSignal<StrudelInstance>();
  const punctualRef = useSignal<PunctualInstance>();
  const punctualAnimatorRef = useSignal<PunctualAnimator>();
  const activeEditor = useSignal<'strudel' | 'punctual'>('strudel');
  const errorMsg = useSignal('');

  // Expose active editor state globally for attribution component
  useVisibleTask$(() => {
    (window as any).__strudelPunctualActiveEditor = activeEditor;
  });

  // Setup audio routing and Punctual canvas
  useVisibleTask$(async () => {
    if (!punctualCanvasRef.value) return;

    try {
      const audioContext = getAudioContext();
      (window as any).__strudelAudioContext = audioContext;
      await patchStrudelAudioRouting();

      const punctual = await createContainedPunctual(
        punctualCanvasRef.value,
        { webAudioContext: audioContext }
      );
      punctualRef.value = punctual;

      // Set audio input
      punctual.setAudioInput(getStrudelAudioTap);

      // Create animator
      const { PunctualAnimator } = await import('@/utils/punctual');
      const animator = new PunctualAnimator(punctual);
      punctualAnimatorRef.value = animator;

      // Evaluate initial code and start
      await animator.evaluate(punctualCode);
      animator.start();
    } catch (error) {
      errorMsg.value = error instanceof Error ? error.message : String(error);
    }
  });

  // Setup Strudel
  useVisibleTask$(async () => {
    if (!strudelContainerRef.value) return;

    try {
      const settings = loadSettings();
      
      const strudel = await createStrudel(
        strudelContainerRef.value,
        strudelCode,
        { 
          autoStart: false,
          settings: {
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
          }
        }
      );
      strudelRef.value = strudel;

      // Remove background color and fix cursor style
      strudelContainerRef.value.style.backgroundColor = 'transparent';
      const editorDiv = strudelContainerRef.value.querySelector('.cm-editor');
      if (editorDiv) {
        (editorDiv as HTMLElement).style.backgroundColor = 'transparent';
      }
      const parentDiv = editorDiv?.parentElement;
      if (parentDiv) {
        (parentDiv as HTMLElement).style.backgroundColor = 'transparent';
      }
      
      // Override Strudel's vim/block cursor to match unified theme
      const cursorStyle = document.createElement('style');
      cursorStyle.textContent = `
        .cm-cursor, .cm-fat-cursor {
          border-left: 2px solid white !important;
          border-right: none !important;
          width: 0 !important;
          background: transparent !important;
          color: transparent !important;
        }
        .cm-fat-cursor::before {
          content: none !important;
        }
        .cm-content {
          caret-color: white !important;
        }
        /* Remove ugly unfocused cursor outline */
        .cm-editor:not(.cm-focused) .cm-cursor {
          outline: none !important;
          border-color: white !important;
        }
      `;
      strudelContainerRef.value.appendChild(cursorStyle);

      // Focus on Strudel editor (after next frame)
      requestAnimationFrame(() => {
        const cmContent = strudelContainerRef.value?.querySelector('.cm-content') as HTMLElement;
        if (cmContent) {
          cmContent.focus();
        }
      });
    } catch (error) {
      errorMsg.value = error instanceof Error ? error.message : String(error);
    }
  });

  // Global keyboard handler
  useVisibleTask$(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl+Space: Switch focus between editors
      if (e.ctrlKey && e.key === ' ') {
        e.preventDefault();
        const newEditor = activeEditor.value === 'strudel' ? 'punctual' : 'strudel';
        activeEditor.value = newEditor;
        
        // Focus appropriate editor
        if (newEditor === 'punctual' && punctualEditorRef.value) {
          punctualEditorRef.value.focus();
        } else if (newEditor === 'strudel') {
          const cmContent = strudelContainerRef.value?.querySelector('.cm-content') as HTMLElement;
          if (cmContent) {
            cmContent.focus();
          }
        }
        return;
      }

      // Ctrl+Enter: Evaluate both editors
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        // Evaluate Strudel
        if (strudelRef.value) {
          const strudelCode = strudelContainerRef.value?.querySelector('.cm-content')?.textContent || '';
          strudelRef.value.evaluate(strudelCode);
        }
        // Evaluate Punctual
        if (punctualAnimatorRef.value && punctualEditorRef.value) {
          const punctualCode = punctualEditorRef.value.state.doc.toString();
          punctualAnimatorRef.value.evaluate(punctualCode);
        }
        return;
      }

      // Ctrl+.: Stop Strudel
      if (e.ctrlKey && e.key === '.') {
        e.preventDefault();
        if (strudelRef.value) {
          strudelRef.value.stop();
        }
        return;
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  });

  // Punctual evaluate handler
  const handlePunctualEvaluate = $((code: string) => {
    if (punctualAnimatorRef.value) {
      punctualAnimatorRef.value.evaluate(code);
    }
  });

  // Click handlers to switch focus
  const handleStrudelClick = $(() => {
    if (activeEditor.value !== 'strudel') {
      activeEditor.value = 'strudel';
      const cmContent = strudelContainerRef.value?.querySelector('.cm-content') as HTMLElement;
      if (cmContent) {
        cmContent.focus();
      }
    }
  });

  const handlePunctualClick = $(() => {
    if (activeEditor.value !== 'punctual') {
      activeEditor.value = 'punctual';
      if (punctualEditorRef.value) {
        punctualEditorRef.value.focus();
      }
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

      {/* Status bar */}
      <div class="absolute bottom-0 right-0 z-20 flex items-center px-4 py-2 bg-black/50 text-xs text-neutral-400 pointer-events-none">
        <span>
          evaluate <kbd class="px-1 bg-neutral-800 rounded">Ctrl+Enter</kbd> |
          stop <kbd class="px-1 bg-neutral-800 rounded">Ctrl+.</kbd> |
          switch <kbd class="px-1 bg-neutral-800 rounded">Ctrl+Space</kbd>
        </span>
      </div>
    </div>
  );
});
