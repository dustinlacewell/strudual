/**
 * Strudel utility wrapper for embedded live coding
 * 
 * This provides a clean API for creating Strudel instances
 * that can be embedded in the page with live evaluation.
 */

import { getAudioContext, webaudioOutput, initAudioOnFirstClick, connectToDestination } from '@strudel/webaudio';
import { transpiler } from '@strudel/transpiler';
import { StrudelMirror } from '@strudel/codemirror';
import { silence, evalScope } from '@strudel/core';

export interface StrudelInstance {
  evaluate: (code: string) => Promise<void>;
  start: () => void;
  stop: () => void;
  toggle: () => void;
  setCode: (code: string) => void;
  isPlaying: () => boolean;
  editor: any; // StrudelMirror instance
}

let audioInitPromise: Promise<void> | null = null;
let fetchPatched = false;
let audioTapNode: GainNode | null = null;
let audioRoutingPatched = false;

/**
 * Patch fetch to fix broken sample URLs
 */
function patchFetch() {
  if (fetchPatched) return;
  fetchPatched = true;

  const originalFetch = window.fetch;
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    
    console.log('[Strudel] Fetch intercepted:', url);
    
    // Fix the broken uzu-drumkit URL
    if (url.includes('uzu-drumkit.json')) {
      const fixedUrl = 'https://raw.githubusercontent.com/tidalcycles/uzu-drumkit/refs/heads/main/strudel.json';
      console.log(`[Strudel] Redirecting ${url} -> ${fixedUrl}`);
      return originalFetch(fixedUrl, init);
    }
    
    return originalFetch(input, init);
  };
  
  console.log('[Strudel] Fetch patched successfully');
}

/**
 * Initialize audio context and worklets on first click
 * Returns a promise that resolves when audio is ready
 */
function getAudioReadyPromise(): Promise<void> {
  if (!audioInitPromise) {
    audioInitPromise = initAudioOnFirstClick();
    console.log('[Strudel] Audio initialization will complete on first user interaction');
  }
  return audioInitPromise;
}

/**
 * Legacy export for compatibility
 */
export async function initStrudelAudio(): Promise<void> {
  return getAudioReadyPromise();
}

/**
 * Prebake modules and samples - matches official Strudel REPL
 */
async function prebakeFunction() {
  const { registerSynthSounds, registerZZFXSounds, samples, aliasBank } = await import('@strudel/webaudio');
  const { registerSoundfonts } = await import('@strudel/soundfonts');
  
  // Use evalScope to load modules (this makes them available in eval context)
  const modulesLoading = evalScope(
    import('@strudel/core'),
    import('@strudel/mini'),
    import('@strudel/tonal'),
    import('@strudel/webaudio'),
    import('@strudel/codemirror'), // Provides slider, sliderWithID, and other UI controls
    import('@strudel/draw'), // Drawing/visualization
  );
  
  // Load all samples from local public folder - matches official Strudel REPL prebake
  await Promise.all([
    modulesLoading,
    registerSynthSounds(),
    registerZZFXSounds(),
    registerSoundfonts(), // Soundfont instruments (piano, strings, etc.)
    // Piano samples
    samples('/piano.json', undefined, { prebake: true }),
    // VCSL samples (general-purpose)
    samples('/vcsl.json', 'github:sgossner/VCSL/master/', { prebake: true }),
    // Tidal drum machines (tr505, rolandmt32, doepferms404, etc.)
    samples(
      '/tidal-drum-machines.json',
      'github:ritchse/tidal-drum-machines/main/machines/',
      { prebake: true, tag: 'drum-machines' }
    ),
    // Uzu drumkit (basic bd, sd, hh, etc.)
    samples('/uzu-drumkit.json', undefined, { prebake: true, tag: 'drum-machines' }),
    // Uzu wavetables for synthesis
    samples('/uzu-wavetables.json', undefined, { prebake: true }),
    // Mridangam percussion
    samples('/mridangam.json', undefined, { prebake: true, tag: 'drum-machines' }),
  ]);
  
  // Load drum machine aliases
  aliasBank('/tidal-drum-machines-alias.json');
  
  console.log('[Strudel] Prebake complete - all samples loaded');
}


// Import the proper type
import type { EditorSettings } from '@/stores/editorSettings';

/**
 * Create a Strudel instance for live coding
 */
export async function createStrudel(
  container: HTMLElement,
  initialCode: string = '',
  options: {
    autoStart?: boolean;
    onError?: (error: Error) => void;
    onStateChange?: (state: { started: boolean; isDirty: boolean }) => void;
    settings?: EditorSettings;
  } = {}
): Promise<StrudelInstance> {
  const { autoStart = false, onError, onStateChange, settings } = options;

  // Patch fetch to fix broken sample URLs
  patchFetch();

  // CRITICAL: Set Strudel's localStorage settings BEFORE creating the editor
  // Strudel's codemirror uses a persistent atom that reads from localStorage
  const { toStrudelSettings, defaultSettings } = await import('@/stores/editorSettings');
  const strudelSettings = toStrudelSettings(settings || defaultSettings);
  localStorage.setItem('codemirror-settings', JSON.stringify(strudelSettings));
  console.log('[Strudel] Set localStorage codemirror-settings:', strudelSettings);

  // Don't wait for audio - let it initialize on first play
  // This allows the editor to load immediately

  // Get audio ready promise to pass to beforeEval
  const audioReady = getAudioReadyPromise();

  // Set up draw context for pattern visualization
  // The canvas (#test-canvas) is created in EditorContainer component
  // Strudel's .scope() will find it by ID and draw to it
  const { getDrawContext } = await import('@strudel/draw');
  const drawContext = getDrawContext('test-canvas');
  const drawTime = [-2, 2]; // Time range for drawing patterns

  const editor = new StrudelMirror({
    id: `strudel-${Math.random().toString(36).substr(2, 9)}`,
    defaultOutput: webaudioOutput,
    getTime: () => getAudioContext().currentTime,
    transpiler,
    root: container,
    initialCode: initialCode || '// Ready to code!',
    pattern: silence,
    prebake: prebakeFunction,
    beforeEval: () => audioReady,
    drawTime,
    drawContext,
    autodraw: true, // Enable automatic pattern drawing
    onUpdateState: (state: any) => {
      if (onStateChange) {
        onStateChange({
          started: state.started || false,
          isDirty: state.isDirty || false,
        });
      }
    },
    onEvalError: (error: any) => {
      if (onError) {
        onError(error);
      }
    },
  });

  // No need to call updateSettings - the settings are already loaded from localStorage
  // which we set above before creating the editor

  // Set initial code
  if (initialCode) {
    editor.setCode(initialCode);
  }

  // Auto-start if requested
  if (autoStart) {
    setTimeout(() => {
      editor.evaluate();
      editor.start();
    }, 100);
  }

  return {
    evaluate: async (code: string) => {
      // Don't call setCode - it replaces the document and resets all cursors
      // Strudel's evaluate() reads from the editor automatically
      await editor.evaluate();
    },
    start: () => editor.start(),
    stop: () => editor.stop(),
    toggle: () => editor.toggle(),
    setCode: (code: string) => editor.setCode(code),
    isPlaying: () => editor.repl?.scheduler?.started || false,
    editor,
  };
}

/**
 * Get or create the audio tap node that intercepts Strudel's output
 * This allows other systems (like Punctual) to analyze Strudel's audio
 */
export function getStrudelAudioTap(): GainNode {
  if (!audioTapNode) {
    const audioContext = getAudioContext();
    const tap = audioContext.createGain();
    tap.gain.value = 1.0; // Pass-through, no volume change
    tap.connect(audioContext.destination);
    audioTapNode = tap;
    console.log('[Strudel] Audio tap node created');
  }
  // TypeScript knows audioTapNode is not null here due to the if check above
  return audioTapNode as GainNode;
}

/**
 * Patch Strudel's audio routing to go through our tap node
 * This intercepts at the AudioNode.connect level instead of the module level
 */
export async function patchStrudelAudioRouting(): Promise<void> {
  if (audioRoutingPatched) {
    console.log('[Strudel] Audio routing already patched');
    return;
  }
  
  audioRoutingPatched = true;
  const tap = getStrudelAudioTap();
  const audioContext = getAudioContext();
  
  // Store original AudioNode.connect
  const originalConnect = AudioNode.prototype.connect as any;
  
  // Intercept connections to destination
  (AudioNode.prototype as any).connect = function(this: AudioNode, destination: any, ...args: any[]): any {
    // If trying to connect to the audio destination, route through tap instead
    if (destination === audioContext.destination) {
      return originalConnect.call(this, tap, ...args);
    }
    
    // Otherwise, use original connect
    return originalConnect.call(this, destination, ...args);
  };
  
  console.log('[Strudel] Audio routing patched successfully');
}

/**
 * Extract Strudel code from markdown content
 */
export function extractStrudelCode(content: string): string | null {
  const match = content.match(/```strudel\n([\s\S]*?)```/);
  return match ? match[1].trim() : null;
}
