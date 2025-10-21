import { component$, type Signal, $ } from '@builder.io/qwik';
import type { EditorView } from '@codemirror/view';
import { punctualLanguage } from '@/utils/punctualLanguage';
import { punctualSyntaxHighlighting } from '@/utils/punctualHighlightStyle';
import { CodeMirrorEditor } from './CodeMirrorEditor';

interface PunctualMirrorProps {
  initialCode?: string;
  onEvaluate?: (code: string) => void;
  editorRef?: Signal<EditorView | null>;
}

/**
 * Punctual editor - extends base CodeMirrorEditor with Punctual-specific syntax
 */
export const PunctualMirror = component$<PunctualMirrorProps>(({
  initialCode = '',
  onEvaluate,
  editorRef,
}) => {
  // Factory function to create Punctual-specific extensions
  const createPunctualExtensions = $(() => {
    return [
      punctualLanguage,
      punctualSyntaxHighlighting,
    ];
  });

  return (
    <CodeMirrorEditor
      initialCode={initialCode}
      editorRef={editorRef}
      createExtensions={createPunctualExtensions}
    />
  );
});
