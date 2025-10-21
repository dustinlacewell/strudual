import { component$, useSignal, useVisibleTask$, type Signal, useContext, noSerialize, type NoSerialize, type QRL } from '@builder.io/qwik';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { EditorState, Prec, Compartment, type Extension } from '@codemirror/state';
import { createEditorTheme } from '@/utils/codemirrorTheme';
import { basicSetup } from '@/utils/codemirrorBasicSetup';
import { emacs } from '@replit/codemirror-emacs';
import { cursorLineDown, deleteCharBackward } from '@codemirror/commands';
import { UIContext } from '@/contexts/uiContext';
import type { EditorSettings } from '@/stores/editorSettings';

interface CompartmentRefs {
  theme: Compartment;
  keybindings: Compartment;
  lineWrapping: Compartment;
  lineNumbers: Compartment;
  collab: Compartment; // For future Yjs integration
}

export interface CodeMirrorEditorProps {
  initialCode?: string;
  editorRef?: Signal<EditorView | null>;
  /** Factory function to create editor-specific extensions (language, syntax, etc.) */
  createExtensions?: QRL<() => Extension[]>;
  /** Called after editor is created, before it's added to DOM */
  onEditorCreated?: QRL<(view: EditorView) => void>;
}

/**
 * Base CodeMirror editor component with unified settings and compartment management.
 * Both StrudelMirror and PunctualMirror extend this.
 */
export const CodeMirrorEditor = component$<CodeMirrorEditorProps>(({
  initialCode = '',
  editorRef,
  createExtensions,
  onEditorCreated,
}) => {
  const containerRef = useSignal<HTMLDivElement>();
  const localEditorRef = useSignal<EditorView | null>(null);
  const { editorSettings } = useContext(UIContext);
  const compartments = useSignal<NoSerialize<CompartmentRefs>>();

  // Create editor on mount
  useVisibleTask$(async ({ cleanup }) => {
    if (!containerRef.value) return;

    // Create compartments for dynamic reconfiguration
    const refs: CompartmentRefs = {
      theme: new Compartment(),
      keybindings: new Compartment(),
      lineWrapping: new Compartment(),
      lineNumbers: new Compartment(),
      collab: new Compartment(), // Empty for now, will be populated by collab system
    };
    compartments.value = noSerialize(refs);

    const settings = editorSettings.value;

    // Get editor-specific extensions if provided
    const specificExtensions = createExtensions ? await createExtensions() : [];

    // Build extensions array
    const allExtensions = [
      // Basic setup (undo/redo, selection, keymaps)
      ...basicSetup,
      
      // Editor-specific extensions (language, syntax, etc.)
      ...specificExtensions,
      
      // Compartmentalized settings
      refs.theme.of(createEditorTheme(settings)),
      refs.keybindings.of(getKeybindingExtensions(settings)),
      refs.lineWrapping.of(settings.lineWrapping ? EditorView.lineWrapping : []),
      refs.lineNumbers.of(settings.lineNumbers ? lineNumbers() : []),
      refs.collab.of([]), // Empty initially
      
      // Custom keybindings
      Prec.highest(
        keymap.of([
          {
            // Ctrl+M as alternative to Ctrl+N (next line) - Chrome shadows Ctrl+N
            key: 'Ctrl-m',
            run: cursorLineDown,
          },
          {
            // Ctrl+Q as alternative to Ctrl+W (kill region) - Chrome shadows Ctrl+W
            // Simulates Ctrl-Shift-W which emacs mode handles as killRegion
            key: 'Ctrl-q',
            run: (view) => {
              // Create synthetic Ctrl-Shift-W event to trigger emacs killRegion
              const event = new KeyboardEvent('keydown', {
                key: 'w',
                code: 'KeyW',
                ctrlKey: true,
                shiftKey: true,
                bubbles: true,
                cancelable: true
              });
              view.contentDOM.dispatchEvent(event);
              return true;
            },
          },
        ])
      ),
    ];

    const state = EditorState.create({
      doc: initialCode,
      extensions: allExtensions,
    });

    const view = new EditorView({
      state,
      parent: containerRef.value,
    });

    // Call lifecycle hook if provided
    if (onEditorCreated) {
      await onEditorCreated(view);
    }

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
          refs.keybindings.reconfigure(getKeybindingExtensions(settings)),
          refs.lineWrapping.reconfigure(settings.lineWrapping ? EditorView.lineWrapping : []),
          refs.lineNumbers.reconfigure(settings.lineNumbers ? lineNumbers() : []),
        ]
      });
    }
  });

  return <div ref={containerRef} class="w-full h-full" />;
});

/**
 * Get keybinding extensions based on settings
 */
function getKeybindingExtensions(settings: EditorSettings): Extension[] {
  switch (settings.keybindings) {
    case 'emacs':
      // Use Prec.high to override defaultKeymap (which has Ctrl-A for select all)
      return [Prec.high(emacs())];
    case 'vim':
      // TODO: Add vim keybindings when needed
      return [];
    default:
      return [];
  }
}
