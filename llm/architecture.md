# Architecture

## Tech Stack
- **Astro** - Static site framework
- **Qwik** - Reactive UI components
- **CodeMirror 6** - Both editors
- **Strudel** - Live coding music (@strudel/*)
- **Punctual** - Live coding visuals (custom integration)
- **Three.js** - 3D rendering (used by Punctual)

## Key Components

### StrudelPunctualOverlay
Main component orchestrating both editors and canvas.
- Manages active editor state
- Handles keyboard shortcuts globally
- Routes audio from Strudel to Punctual
- Location: `src/qwik/StrudelPunctualOverlay.tsx`

### PunctualMirror
CodeMirror wrapper for Punctual editor.
- Uses custom language mode
- Loads settings from localStorage
- Location: `src/qwik/PunctualMirror.tsx`

### Audio Routing
Strudel → GainNode tap → speakers + Punctual
- Patches `AudioNode.prototype.connect` globally
- Intercepts connections to `audioContext.destination`
- Both systems share same AudioContext
- Location: `src/utils/strudel.ts` (`patchStrudelAudioRouting`)

## Settings System
Simple localStorage-based (not reactive state):
- `loadSettings()` - Read from localStorage
- `saveSettings()` - Write to localStorage
- Default settings in `defaultSettings` export
- Location: `src/stores/editorSettings.ts`

## Theme System
Unified CodeMirror theme for both editors:
- Transparent background
- White 2px line cursor
- 12px monospace font
- Matches Strudel's color scheme
- Location: `src/utils/codemirrorTheme.ts`

## Punctual Syntax
Custom StreamLanguage mode:
- Keywords: circle, rect, line, add, etc.
- Operators: >>, *, +, etc.
- Colors match Strudel's strudel-theme.mjs
- Location: `src/utils/punctualLanguage.ts`, `src/utils/punctualHighlightStyle.ts`
