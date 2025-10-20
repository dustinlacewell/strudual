import { component$, useSignal, useVisibleTask$, $ } from '@builder.io/qwik';
import { patchStrudelAudioRouting, getStrudelAudioTap, createStrudel } from '@/utils/strudel';
import { createContainedPunctual } from '@/utils/punctual';
import { getAudioContext } from '@strudel/webaudio';
import type { StrudelInstance } from '@/utils/strudel';
import type { PunctualInstance, PunctualAnimator } from '@/utils/punctual';

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
  const punctualCodeRef = useSignal<HTMLTextAreaElement>();
  
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
      const strudel = await createStrudel(
        strudelContainerRef.value,
        strudelCode,
        { 
          autoStart: false,
          settings: {
            fontSize: 14
          }
        }
      );
      strudelRef.value = strudel;

      // Remove background color from Strudel editor
      strudelContainerRef.value.style.backgroundColor = 'transparent';
      const editorDiv = strudelContainerRef.value.querySelector('.cm-editor');
      if (editorDiv) {
        (editorDiv as HTMLElement).style.backgroundColor = 'transparent';
      }
      const parentDiv = editorDiv?.parentElement;
      if (parentDiv) {
        (parentDiv as HTMLElement).style.backgroundColor = 'transparent';
      }

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

  // Global keyboard handler for switching and stopping
  useVisibleTask$(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === ' ') {
        e.preventDefault();
        const newEditor = activeEditor.value === 'strudel' ? 'punctual' : 'strudel';
        activeEditor.value = newEditor;
        
        // Focus/blur appropriately
        if (newEditor === 'punctual' && punctualCodeRef.value) {
          punctualCodeRef.value.focus();
        } else if (newEditor === 'strudel') {
          if (punctualCodeRef.value) {
            punctualCodeRef.value.blur();
          }
          // Focus Strudel's CodeMirror
          const cmContent = strudelContainerRef.value?.querySelector('.cm-content') as HTMLElement;
          if (cmContent) {
            cmContent.focus();
          }
        }
        return;
      }

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

  // Punctual textarea handler
  const handlePunctualKeyDown = $((e: KeyboardEvent) => {
    if (e.shiftKey && e.key === 'Enter') {
      e.preventDefault();
      if (punctualAnimatorRef.value && punctualCodeRef.value) {
        punctualAnimatorRef.value.evaluate(punctualCodeRef.value.value);
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
        class="absolute top-0 left-0 right-0 z-10 transition-opacity duration-200"
        style={{
          height: '50%',
          opacity: activeEditor.value === 'strudel' ? 1 : 0.3,
          pointerEvents: activeEditor.value === 'strudel' ? 'auto' : 'none',
        }}
      >
        <div ref={strudelContainerRef} class="absolute inset-0" />
      </div>

      {/* Punctual editor - bottom half */}
      <textarea
        ref={punctualCodeRef}
        value={punctualCode}
        onKeyDown$={handlePunctualKeyDown}
        class="absolute bottom-0 left-0 right-0 z-10 bg-transparent text-white font-mono text-xs p-4 border-none outline-none resize-none transition-opacity duration-200"
        style={{
          height: '50%',
          opacity: activeEditor.value === 'punctual' ? 1 : 0.3,
          pointerEvents: activeEditor.value === 'punctual' ? 'auto' : 'none',
          caretColor: 'white',
        }}
        spellcheck={false}
      />

      {/* Status bar */}
      <div class="absolute bottom-0 right-0 z-20 flex items-center px-4 py-2 bg-black/50 text-xs text-neutral-400 pointer-events-none">
        <span>
          <kbd class="px-1 bg-neutral-800 rounded">Ctrl+Space</kbd> switch |
          <kbd class="px-1 bg-neutral-800 rounded">Ctrl+.</kbd> stop |
          <kbd class="px-1 bg-neutral-800 rounded">Ctrl+Enter</kbd> Strudel |
          <kbd class="px-1 bg-neutral-800 rounded">Shift+Enter</kbd> Punctual
        </span>
      </div>
    </div>
  );
});
