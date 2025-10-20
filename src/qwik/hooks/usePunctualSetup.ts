import { useVisibleTask$, useContext } from '@builder.io/qwik';
import { patchStrudelAudioRouting, getStrudelAudioTap } from '@/utils/strudel';
import { createContainedPunctual } from '@/utils/punctual';
import { getAudioContext } from '@strudel/webaudio';
import { PunctualContext } from '@/contexts/punctualContext';
import { UIContext } from '@/contexts/uiContext';

export function usePunctualSetup(initialCode: string) {
  const { punctualRef, punctualAnimatorRef, punctualCanvasRef } = useContext(PunctualContext);
  const { errorMsg } = useContext(UIContext);

  useVisibleTask$(async () => {
    if (!punctualCanvasRef.value) return;

    try {
      const audioContext = getAudioContext();
      (window as any).__strudelAudioContext = audioContext;
      await patchStrudelAudioRouting();

      const punctual = await createContainedPunctual(
        punctualCanvasRef.value,
        { webAudioContext: audioContext }
      );
      punctualRef.value = punctual;

      // Set audio input
      punctual.setAudioInput(getStrudelAudioTap);

      // Create animator
      const { PunctualAnimator } = await import('@/utils/punctual');
      const animator = new PunctualAnimator(punctual);
      punctualAnimatorRef.value = animator;

      // Evaluate initial code and start
      await animator.evaluate(initialCode);
      animator.start();
    } catch (error) {
      errorMsg.value = error instanceof Error ? error.message : String(error);
    }
  });
}
