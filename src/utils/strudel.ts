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

let audioInitialized = false;
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
 * Initialize audio context (requires user interaction)
 */
export async function initStrudelAudio(): Promise<void> {
  if (!audioInitialized) {
    await initAudioOnFirstClick();
    audioInitialized = true;
  }
}

/**
 * Prebake modules and samples - EXACTLY like Strudel's prebake.mjs
 */
async function prebakeFunction() {
  const { registerSynthSounds, registerZZFXSounds, samples } = await import('@strudel/webaudio');
  
  // Use evalScope to load modules (this makes them available in eval context)
  const modulesLoading = evalScope(
    import('@strudel/core'),
    import('@strudel/mini'),
    import('@strudel/tonal'),
    import('@strudel/webaudio'),
  );
  
  const tc = 'https://raw.githubusercontent.com/tidalcycles/uzu-drumkit/main';
  
  // Return Promise.all with modulesLoading AND samples - EXACTLY like prebake.mjs line 30-45
  await Promise.all([
    modulesLoading,
    registerSynthSounds(),
    registerZZFXSounds(),
    samples(`${tc}/strudel.json`),
  ]);
  
  console.log('[Strudel] Prebake complete');
}


export interface StrudelSettings {
  keybindings?: 'codemirror' | 'vim' | 'emacs' | 'vscode';
  isTabIndentationEnabled?: boolean;
  isLineNumbersDisplayed?: boolean;
  isBracketMatchingEnabled?: boolean;
  isBracketClosingEnabled?: boolean;
  isLineWrappingEnabled?: boolean;
  isActiveLineHighlighted?: boolean;
  isMultiCursorEnabled?: boolean;
  fontSize?: number;
  fontFamily?: string;
}

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
    settings?: StrudelSettings;
  } = {}
): Promise<StrudelInstance> {
  const { autoStart = false, onError, onStateChange, settings } = options;

  // Patch fetch to fix broken sample URLs
  patchFetch();

  // Don't wait for audio - let it initialize on first play
  // This allows the editor to load immediately

  const editor = new StrudelMirror({
    id: `strudel-${Math.random().toString(36).substr(2, 9)}`,
    defaultOutput: webaudioOutput,
    getTime: () => getAudioContext().currentTime,
    transpiler,
    root: container,
    initialCode: initialCode || '// Ready to code!',
    pattern: silence,
    prebake: prebakeFunction,
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

  // Apply settings if provided
  if (settings) {
    const fullSettings = {
      keybindings: settings.keybindings || 'emacs',
      isTabIndentationEnabled: settings.isTabIndentationEnabled ?? true,
      isLineNumbersDisplayed: settings.isLineNumbersDisplayed ?? true,
      isBracketMatchingEnabled: settings.isBracketMatchingEnabled ?? true,
      isBracketClosingEnabled: settings.isBracketClosingEnabled ?? true,
      isLineWrappingEnabled: settings.isLineWrappingEnabled ?? false,
      isActiveLineHighlighted: settings.isActiveLineHighlighted ?? true,
      isMultiCursorEnabled: settings.isMultiCursorEnabled ?? false,
      fontSize: settings.fontSize || 12,
      fontFamily: settings.fontFamily || 'monospace',
      // Required defaults
      isAutoCompletionEnabled: false,
      isPatternHighlightingEnabled: true,
      isFlashEnabled: true,
      isTooltipEnabled: false,
      theme: 'strudelTheme',
    };
    editor.updateSettings(fullSettings);
  }

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
      editor.setCode(code);
      await editor.evaluate();
    },
    start: () => editor.start(),
    stop: () => editor.stop(),
    toggle: () => editor.toggle(),
    setCode: (code: string) => editor.setCode(code),
    isPlaying: () => editor.started || false,
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
      console.log('[Strudel] Intercepted connection to destination, routing through tap');
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
