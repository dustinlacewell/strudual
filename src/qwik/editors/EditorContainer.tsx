import { component$, useVisibleTask$, useContext } from '@builder.io/qwik';
import { StrudelMirror } from './StrudelMirror';
import { PunctualMirror } from './PunctualMirror';
import { PunctualContext } from '@/contexts/punctualContext';
import { UIContext } from '@/contexts/uiContext';
import { useEditorFocus } from '../hooks/useEditorFocus';

interface EditorContainerProps {
  height: string;
}

export const EditorContainer = component$<EditorContainerProps>(({
  height,
}) => {
  const { punctualCanvasRef } = useContext(PunctualContext);
  const { activeEditor, editorSettings, computedOrientation, layoutOrientation } = useContext(UIContext);
  const { handleStrudelClick, handlePunctualClick } = useEditorFocus();

  // Compute actual orientation based on 'auto' or explicit choice
  useVisibleTask$(({ track }) => {
    // Track changes to layoutOrientation from editorSettings
    track(() => editorSettings.value.layoutOrientation);
    
    const updateOrientation = () => {
      const setting = editorSettings.value.layoutOrientation;
      
      if (setting === 'auto') {
        // Auto-detect based on aspect ratio
        const aspectRatio = window.innerWidth / window.innerHeight;
        computedOrientation.value = aspectRatio > 1.5 ? 'horizontal' : 'vertical';
      } else {
        // Use explicit setting
        computedOrientation.value = setting;
      }
      
      layoutOrientation.value = setting;
    };
    
    updateOrientation();
    
    // Re-compute on window resize if in auto mode
    const handleResize = () => {
      if (layoutOrientation.value === 'auto') {
        updateOrientation();
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

  return (
    <div class="editor-container" style={{ position: 'relative', width: '100%', height }}>
      {/* Punctual canvas - FULL height background */}
      <div
        ref={punctualCanvasRef}
        class="absolute inset-0 z-0"
        style={{ backgroundColor: 'black' }}
      />

      {/* Dimming layer between Punctual canvas and editors */}
      <div
        class="absolute inset-0 z-5 pointer-events-none"
        style={{
          backgroundColor: 'black',
          opacity: (100 - editorSettings.value.editorBackgroundOpacity) / 100,
        }}
      />

      {/* Strudel editor */}
      <div
        onClick$={handleStrudelClick}
        class="absolute z-10 transition-opacity duration-200 cursor-pointer"
        style={{
          ...(() => {
            const ratio = editorSettings.value.splitRatio;
            const isStrudelFirst = editorSettings.value.editorOrder === 'strudel-first';
            const isStrudelActive = activeEditor.value === 'strudel';
            const isVertical = computedOrientation.value === 'vertical';
            
            // Calculate size based on ratio and active editor
            let strudelSize: string;
            if (ratio === '50-50') {
              strudelSize = '50%';
            } else if (ratio === '33-66') {
              // Active editor gets 66%, inactive gets 33%
              strudelSize = isStrudelActive ? '66.67%' : '33.33%';
            } else { // '100-0'
              // Active editor gets 100%, inactive gets 0%
              strudelSize = isStrudelActive ? '100%' : '0%';
            }
            
            if (isVertical) {
              return isStrudelFirst
                ? { top: 0, left: 0, right: 0, height: strudelSize }
                : { bottom: 0, left: 0, right: 0, height: strudelSize };
            } else {
              return isStrudelFirst
                ? { top: 0, left: 0, bottom: 0, width: strudelSize }
                : { top: 0, right: 0, bottom: 0, width: strudelSize };
            }
          })(),
          opacity: activeEditor.value === 'strudel' ? 1 : 0.3,
          pointerEvents: 'auto',
        }}
      >
        <StrudelMirror />
      </div>

      {/* Punctual editor */}
      <div
        onClick$={handlePunctualClick}
        class="absolute z-10 transition-opacity duration-200 cursor-pointer"
        style={{
          ...(() => {
            const ratio = editorSettings.value.splitRatio;
            const isStrudelFirst = editorSettings.value.editorOrder === 'strudel-first';
            const isPunctualActive = activeEditor.value === 'punctual';
            const isVertical = computedOrientation.value === 'vertical';
            
            // Calculate size based on ratio and active editor
            let punctualSize: string;
            if (ratio === '50-50') {
              punctualSize = '50%';
            } else if (ratio === '33-66') {
              // Active editor gets 66%, inactive gets 33%
              punctualSize = isPunctualActive ? '66.67%' : '33.33%';
            } else { // '100-0'
              // Active editor gets 100%, inactive gets 0%
              punctualSize = isPunctualActive ? '100%' : '0%';
            }
            
            if (isVertical) {
              return isStrudelFirst
                ? { bottom: 0, left: 0, right: 0, height: punctualSize }
                : { top: 0, left: 0, right: 0, height: punctualSize };
            } else {
              return isStrudelFirst
                ? { top: 0, right: 0, bottom: 0, width: punctualSize }
                : { top: 0, left: 0, bottom: 0, width: punctualSize };
            }
          })(),
          opacity: activeEditor.value === 'punctual' ? 1 : 0.3,
          pointerEvents: 'auto',
        }}
      >
        <PunctualMirror />
      </div>
    </div>
  );
});

