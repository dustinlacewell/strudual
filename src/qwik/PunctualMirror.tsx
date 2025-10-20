import { component$, useSignal, useVisibleTask$, type Signal, useContext, noSerialize, type NoSerialize } from '@builder.io/qwik';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { EditorState, Prec, Compartment } from '@codemirror/state';
import { createEditorTheme } from '@/utils/codemirrorTheme';
import { punctualLanguage } from '@/utils/punctualLanguage';
import { punctualSyntaxHighlighting } from '@/utils/punctualHighlightStyle';
import { emacs } from '@replit/codemirror-emacs';
import { cursorLineDown } from '@codemirror/commands';
import { UIContext } from '@/contexts/uiContext';

interface CompartmentRefs {
  theme: Compartment;
  keybindings: Compartment;
  lineWrapping: Compartment;
  lineNumbers: Compartment;
}

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
  const { editorSettings } = useContext(UIContext);
  const compartments = useSignal<NoSerialize<CompartmentRefs>>();

  useVisibleTask$(({ cleanup }) => {
    if (!containerRef.value) return;

    // Create compartments for dynamic reconfiguration
    const refs: CompartmentRefs = {
      theme: new Compartment(),
      keybindings: new Compartment(),
      lineWrapping: new Compartment(),
      lineNumbers: new Compartment(),
    };
    compartments.value = noSerialize(refs);

    const settings = editorSettings.value;

    const extensions = [
      punctualLanguage,
      punctualSyntaxHighlighting,
      refs.theme.of(createEditorTheme(settings)),
      refs.keybindings.of(settings.keybindings === 'emacs' ? emacs() : []),
      refs.lineWrapping.of(settings.lineWrapping ? EditorView.lineWrapping : []),
      refs.lineNumbers.of(settings.lineNumbers ? lineNumbers() : []),
      // Ctrl+M as alternative to Ctrl+N (next line) - Chrome shadows Ctrl+N
      Prec.highest(
        keymap.of([
          {
            key: 'Ctrl-m',
            run: cursorLineDown,
          },
        ])
      ),
    ];

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

  // Watch settings changes and reconfigure editor dynamically
  useVisibleTask$(({ track }) => {
    track(() => editorSettings.value);
    
    if (localEditorRef.value && compartments.value) {
      const settings = editorSettings.value;
      const refs = compartments.value;
      localEditorRef.value.dispatch({
        effects: [
          refs.theme.reconfigure(createEditorTheme(settings)),
          refs.keybindings.reconfigure(settings.keybindings === 'emacs' ? emacs() : []),
          refs.lineWrapping.reconfigure(settings.lineWrapping ? EditorView.lineWrapping : []),
          refs.lineNumbers.reconfigure(settings.lineNumbers ? lineNumbers() : []),
        ]
      });
    }
  });

  return <div ref={containerRef} class="w-full h-full" />;
});
