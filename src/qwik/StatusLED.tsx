import { component$, useContext, useComputed$ } from '@builder.io/qwik';
import { CollabContext } from '@/contexts/collabContext';
import { getCollabStatusInfo } from '@/utils/collabStatus';

export interface LEDProps {
  color: string;
  onClick?: () => void;
}

/**
 * Simple colored dot - parent container with inner dot
 * Parent is always same size (for alignment), inner dot is the visual element
 */
export const LED = component$<LEDProps>(({ color, onClick }) => {
  const container = (
    <div class="led-container w-6 h-6 flex items-center justify-center">
      <div class="led-dot w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
    </div>
  );
  
  if (onClick) {
    return (
      <button
        class="pointer-events-auto bg-transparent hover:bg-neutral-900/30 rounded transition-colors"
        onClick$={onClick}
      >
        {container}
      </button>
    );
  }
  
  return container;
});

export interface StatusLEDProps {
  onClick?: () => void;
}

/**
 * Status LED - wraps LED with collab status color logic
 */
export const StatusLED = component$<StatusLEDProps>(({ onClick }) => {
  const collab = useContext(CollabContext);
  
  // Use useComputed$ for reactive computation
  const statusInfo = useComputed$(() => {
    return getCollabStatusInfo(collab.status.value, collab.peerCount.value);
  });
  
  return (
    <div title={statusInfo.value.label}>
      <LED color={statusInfo.value.bgColor} onClick={onClick} />
    </div>
  );
});
