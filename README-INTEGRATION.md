# Strudual - Strudel + Punctual Integration

This site integrates Strudel (live coding music) with Punctual (live coding visuals) for audio-reactive visual performances.

## What Was Copied

### Dependencies Added
- `@builder.io/qwik` + `@qwikdev/astro` - Qwik integration for Astro
- `@astrojs/tailwind` + `tailwindcss` - Tailwind CSS for styling
- `@strudel/*` packages - Strudel live coding music system
- `three` - 3D library (used by Punctual)

### Files Copied
- `src/utils/strudel.ts` - Strudel wrapper with audio routing
- `src/utils/punctual.ts` - Punctual wrapper for visual coding
- `src/qwik/StrudelPunctualOverlay.tsx` - Main overlay component
- `src/qwik/StrudelPunctualAttribution.tsx` - Attribution footer
- `src/lib/punctual/*` - Punctual library files

### Configuration
- `astro.config.mjs` - Added Qwik integration
- `tsconfig.json` - Added path aliases (`@/*` -> `src/*`)
- `src/pages/index.astro` - Main page with the overlay

## How It Works

**Audio Routing:**
- Patches `AudioNode.prototype.connect` globally to intercept Strudel's audio
- Routes audio through a GainNode "tap" that connects to both speakers and Punctual
- Both systems share the same AudioContext

**Component Structure:**
- Punctual canvas fills full viewport as background (z-0)
- Strudel editor in top 50%, transparent background (z-10)
- Punctual textarea in bottom 50%, transparent background (z-10)
- Active editor opacity 100%, inactive 30%

## Keyboard Shortcuts

- `Ctrl+Space` - Switch between editors
- `Ctrl+.` - Stop Strudel playback
- `Ctrl+Enter` - Evaluate Strudel code
- `Shift+Enter` - Evaluate Punctual code

## Punctual Audio Signals

Use these in Punctual to react to Strudel's audio:
- `ilo` - Low frequencies (bass)
- `imid` - Mid frequencies
- `ihi` - High frequencies  
- `ifft` - Full FFT data

## Example Usage

```javascript
// Strudel (top editor)
s("bd sd, hh*8")

// Punctual (bottom editor)
ilo * circle [0,0] 0.5 >> add;
imid * hline 0 0.01 >> add;
ihi * vline 0 0.01 >> add;
```

## Running

```bash
npm run dev    # Development server
npm run build  # Production build
npm run preview # Preview production build
```

## Important Notes

- Don't use `.bank()` with Strudel samples - just `s("bd sd, hh*8")` works
- The overlay uses `overflow: hidden` on body - only for this page
- Audio routing uses prototype patching (aggressive but works without forking Strudel)
