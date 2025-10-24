import { component$, $, useContext } from '@builder.io/qwik';
import { punctualLanguage } from '@/utils/punctualLanguage';
import { punctualSyntaxHighlighting } from '@/utils/punctualHighlightStyle';
import { CodeMirrorEditor } from './CodeMirrorEditor';
import { PunctualContext } from '@/contexts/punctualContext';

/**
 * Punctual editor - extends base CodeMirrorEditor with Punctual-specific syntax
 */
export const PunctualMirror = component$(() => {
  const { punctualEditorRef, punctualCollabCompartmentRef, punctualCode, punctualCursor } = useContext(PunctualContext);

  // Factory function to create Punctual-specific extensions
  const createPunctualExtensions = $(() => {
    return [
      punctualLanguage,
      punctualSyntaxHighlighting,
    ];
  });

  return (
    <CodeMirrorEditor
      initialCode={punctualCode.value}
      initialCursor={punctualCursor.value}
      editorRef={punctualEditorRef}
      collabCompartmentRef={punctualCollabCompartmentRef}
      createExtensions={createPunctualExtensions}
    />
  );
});
