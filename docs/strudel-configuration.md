# Strudel Configuration

## Critical: Complete Settings Required

When configuring Strudel's CodeMirror editor, you **MUST** always pass the complete settings object. Partial updates will break features.

### Why This Matters

Strudel uses CodeMirror's compartment system for dynamic reconfiguration. When you call `updateSettings()`, it **reconfigures** the compartments with new StateField instances. If you omit settings like `isFlashEnabled` or `isPatternHighlightingEnabled`, the new StateField instances will have different StateEffect types than the original ones, breaking the connection between:

- The `flash()` function (which dispatches effects with the original type)
- The `flashField` StateField (which listens for effects with the new type)

Result: Effects are dispatched but never received, so decorations are never created.

### The Solution

Always use `toStrudelSettings()` helper from `@/stores/editorSettings`:

```typescript
import { toStrudelSettings } from '@/stores/editorSettings';

// ✅ CORRECT - includes all required settings
editor.updateSettings(toStrudelSettings(userSettings));

// ❌ WRONG - missing required settings, will break flash/highlighting
editor.updateSettings({
  fontSize: 14,
  fontFamily: 'monospace',
  // Missing isFlashEnabled, isPatternHighlightingEnabled, etc.
});
```

## Settings Architecture

### StrudelEditorSettings
User-configurable settings that control CodeMirror behavior:
- `fontSize`, `fontFamily`, `keybindings`
- `lineNumbers`, `lineWrapping`
- `bracketMatching`, `bracketClosing`
- `activeLineHighlight`, `tabIndentation`, `multiCursor`

### StrudualUISettings
Application-level settings that control our UI:
- `theme` - Our app theme (not Strudel's)
- `layoutOrientation` - Vertical/horizontal/auto
- `editorOrder` - Which editor appears first
- `splitRatio` - Editor size ratios

### Complete Strudel Settings
`toStrudelSettings()` converts `StrudelEditorSettings` to the complete format Strudel expects:

```typescript
{
  // User settings (mapped from our names to Strudel's names)
  fontSize: number,
  fontFamily: string,
  keybindings: 'codemirror' | 'emacs' | 'vim',
  isLineNumbersDisplayed: boolean,
  isLineWrappingEnabled: boolean,
  isBracketMatchingEnabled: boolean,
  isBracketClosingEnabled: boolean,
  isActiveLineHighlighted: boolean,
  isTabIndentationEnabled: boolean,
  isMultiCursorEnabled: boolean,
  
  // Always enabled (not user-configurable)
  isFlashEnabled: true,
  isPatternHighlightingEnabled: true,
  isAutoCompletionEnabled: false,
  isTooltipEnabled: false,
  theme: 'strudelTheme',
}
```

## Implementation

### Initialization
```typescript
// strudel.ts - Set localStorage BEFORE creating editor
const strudelSettings = toStrudelSettings(settings || defaultStrudelEditorSettings);
localStorage.setItem('codemirror-settings', JSON.stringify(strudelSettings));

const editor = new StrudelMirror({ /* ... */ });
```

### Reactive Updates
```typescript
// StrudelMirror.tsx - Always use helper for updates
useVisibleTask$(async ({ track }) => {
  track(() => editorSettings.value);
  
  if (strudelInstanceRef?.value) {
    const { toStrudelSettings } = await import('@/stores/editorSettings');
    strudelInstanceRef.value.editor.updateSettings(toStrudelSettings(editorSettings.value));
  }
});
```

## How Decorations Work

Strudel's flash and pattern highlighting use CodeMirror decorations:

1. **Flash**: `Decoration.mark()` with inline `background-color` style covering entire document
2. **Pattern highlighting**: `Decoration.mark()` with inline `outline` style on mini locations
3. **NOT CSS classes** - They're CodeMirror decoration elements with inline styles
4. **StateFields provide decorations** via `provide: (f) => EditorView.decorations.from(f)`
5. **Effects must match** the StateField instance or decorations won't be created

This is why partial settings break everything - you create new StateField instances with different effect types.
