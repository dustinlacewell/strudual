import { component$, useContext, useComputed$ } from '@builder.io/qwik';
import { CollabContext } from '@/contexts/collabContext';
import { getCollabStatusInfo } from '@/utils/collabStatus';
import { LED } from '../../shared/LED';

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
