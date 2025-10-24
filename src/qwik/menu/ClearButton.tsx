import { component$, useContext, useSignal, $ } from '@builder.io/qwik';
import { StrudelContext } from '@/contexts/strudelContext';
import { PunctualContext } from '@/contexts/punctualContext';

export const ClearButton = component$(() => {
  const strudelContext = useContext(StrudelContext);
  const punctualContext = useContext(PunctualContext);

  const { strudelEditorRef } = strudelContext;
  const { punctualEditorRef } = punctualContext;

  const clearBuffers = $(() => {
    if (strudelEditorRef.value) {
      const strudelTx = strudelEditorRef.value.state.update({
        changes: { from: 0, to: strudelEditorRef.value.state.doc.length, insert: '' }
      });
      strudelEditorRef.value.dispatch(strudelTx);
    }
    if (punctualEditorRef.value) {
      const punctualTx = punctualEditorRef.value.state.update({
        changes: { from: 0, to: punctualEditorRef.value.state.doc.length, insert: '' }
      });
      punctualEditorRef.value.dispatch(punctualTx);
    }
  });

  return (
    <button
      class="pointer-events-auto bg-transparent hover:bg-neutral-900/30 rounded transition-colors p-1.5 group"
      title="Clear both editors"
      onClick$={clearBuffers}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="#6b7280"
        class="group-hover:fill-white transition-colors"
      >
        <path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m-3 12.59L17.59 17 14 13.41 10.41 17 9 15.59 12.59 12 9 8.41 10.41 7 14 10.59 17.59 7 19 8.41 15.41 12z"></path>
      </svg>
    </button>
  );
});