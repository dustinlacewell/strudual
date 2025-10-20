import { component$, useSignal, useVisibleTask$, type Signal } from '@builder.io/qwik';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { EditorState, Prec } from '@codemirror/state';
import { loadSettings } from '@/stores/editorSettings';
import { createEditorTheme } from '@/utils/codemirrorTheme';
import { punctualLanguage } from '@/utils/punctualLanguage';
import { punctualSyntaxHighlighting } from '@/utils/punctualHighlightStyle';
import { emacs } from '@replit/codemirror-emacs';

interface PunctualMirrorProps {
  initialCode?: string;
  onEvaluate?: (code: string) => void;
  editorRef?: Signal<EditorView | null>;
}

export const PunctualMirror = component$<PunctualMirrorProps>(({
  initialCode = '',
  onEvaluate,
  editorRef,
}) => {
  const containerRef = useSignal<HTMLDivElement>();
  const localEditorRef = useSignal<EditorView | null>(null);

  useVisibleTask$(({ cleanup }) => {
    if (!containerRef.value) return;

    const settings = loadSettings();

    const extensions = [
      punctualLanguage,
      punctualSyntaxHighlighting,
      createEditorTheme(settings),
    ];

    // Add keybindings
    if (settings.keybindings === 'emacs') {
      extensions.push(emacs());
    }

    if (settings.lineWrapping) {
      extensions.push(EditorView.lineWrapping);
    }

    if (settings.lineNumbers) {
      extensions.push(lineNumbers());
    }

    const state = EditorState.create({
      doc: initialCode,
      extensions,
    });

    const view = new EditorView({
      state,
      parent: containerRef.value,
    });

    localEditorRef.value = view;
    if (editorRef) {
      editorRef.value = view;
    }

    cleanup(() => {
      view.destroy();
      localEditorRef.value = null;
      if (editorRef) {
        editorRef.value = null;
      }
    });
  });

  return <div ref={containerRef} class="w-full h-full" />;
});
