import { $, useContext } from '@builder.io/qwik';
import { StrudelContext } from '@/contexts/strudelContext';
import { PunctualContext } from '@/contexts/punctualContext';
import { UIContext } from '@/contexts/uiContext';
import { CollabContext } from '@/contexts/collabContext';

export function useEditorFocus() {
  const { strudelEditorRef } = useContext(StrudelContext);
  const { punctualEditorRef } = useContext(PunctualContext);
  const { activeEditor } = useContext(UIContext);
  const collab = useContext(CollabContext);

  const handleStrudelClick = $(() => {
    if (activeEditor.value !== 'strudel') {
      activeEditor.value = 'strudel';
      if (strudelEditorRef.value) {
        strudelEditorRef.value.focus();
      }
      collab.setActiveEditor('strudel');
    }
  });

  const handlePunctualClick = $(() => {
    if (activeEditor.value !== 'punctual') {
      activeEditor.value = 'punctual';
      if (punctualEditorRef.value) {
        punctualEditorRef.value.focus();
      }
      collab.setActiveEditor('punctual');
    }
  });

  return {
    handleStrudelClick,
    handlePunctualClick,
  };
}
