import { $, useContext } from '@builder.io/qwik';
import { StrudelContext } from '@/contexts/strudelContext';
import { PunctualContext } from '@/contexts/punctualContext';
import { UIContext } from '@/contexts/uiContext';

export function useEditorFocus() {
  const { strudelContainerRef } = useContext(StrudelContext);
  const { punctualEditorRef } = useContext(PunctualContext);
  const { activeEditor } = useContext(UIContext);

  const handleStrudelClick = $(() => {
    if (activeEditor.value !== 'strudel') {
      activeEditor.value = 'strudel';
      const cmContent = strudelContainerRef.value?.querySelector('.cm-content') as HTMLElement;
      if (cmContent) {
        cmContent.focus();
      }
    }
  });

  const handlePunctualClick = $(() => {
    if (activeEditor.value !== 'punctual') {
      activeEditor.value = 'punctual';
      if (punctualEditorRef.value) {
        punctualEditorRef.value.focus();
      }
    }
  });

  return {
    handleStrudelClick,
    handlePunctualClick,
  };
}
