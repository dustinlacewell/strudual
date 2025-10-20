# Changelog

## 2025-10-20 - Editor Unification Complete

### Added
- **PunctualMirror component** - CodeMirror wrapper replacing textarea
- **Punctual syntax highlighting** - Custom language mode with Strudel color scheme
- **Unified theme system** - Both editors share settings from localStorage
- **Click-to-focus** - Click any editor to switch focus
- **Simplified keyboard controls**:
  - `Ctrl+Enter` - Evaluate both editors
  - `Ctrl+.` - Stop Strudel
  - `Ctrl+Space` - Switch focus

### Changed
- Punctual editor now uses CodeMirror (was textarea)
- Both editors use 12px monospace font
- Both editors use 2px white line cursor (always visible)
- Removed separate Shift+Enter binding for Punctual

### Fixed
- Strudel's salmon unfocused cursor outline removed
- Punctual cursor stays visible when unfocused
- Removed padding from Punctual editor container
- Added global `.cm-editor { height: 100% }` style

### Technical
- Tried Zustand, failed with SSR (React hooks incompatible with Qwik)
- Using simple localStorage functions instead
- Punctual colors match Strudel's `strudel-theme.mjs` exactly

## 2025-10-20 - Initial Setup

### Added
- Astro + Qwik project structure
- Copied Strudel/Punctual integration from ldlework-astro
- Audio routing: Strudel → GainNode tap → speakers + Punctual
- Split-screen overlay (Strudel top 50%, Punctual bottom 50%)

### Fixed
- `overflow: hidden` leak from bare `html, body` selectors
- Used scoped `.strudual-page` class instead
