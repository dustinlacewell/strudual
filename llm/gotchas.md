# Gotchas & Solutions

## Zustand + Qwik SSR
**Problem:** Zustand uses React hooks, fails in Qwik SSR with "Cannot read properties of null (reading 'useCallback')"

**Solution:** Use simple localStorage functions instead of reactive state management.

## Strudel Vim Cursor
**Problem:** Strudel defaults to vim keybindings, creates `.cm-fat-cursor` block cursor with salmon outline when unfocused.

**Solution:** Inject inline styles after Strudel initialization to override cursor styling.

## Punctual Cursor Disappearing
**Problem:** CodeMirror hides cursor when editor loses focus by default.

**Solution:** Add `&:not(.cm-focused) .cm-cursor` rule in theme to keep cursor visible.

## CodeMirror Height
**Problem:** Editors not filling containers properly.

**Solution:** Global CSS `.cm-editor { height: 100% !important; }` in page styles.

## Strudel Code Evaluation
**Problem:** Can't just call `strudelRef.value.evaluate()` without arguments.

**Solution:** Extract code from `.cm-content` textContent and pass to evaluate().

## Astro Scoped Styles Leak
**Problem:** Bare `html, body` selectors in Astro `<style>` blocks aren't scoped, leak globally.

**Solution:** Use `is:global` and scoped class names like `.strudual-page`.

## No Haskell Mode for CodeMirror 6
**Problem:** Punctual is PureScript-like, no official language mode exists.

**Solution:** Create custom StreamLanguage mode with Punctual-specific keywords.
