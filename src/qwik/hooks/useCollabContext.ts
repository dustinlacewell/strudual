import { useContextProvider } from '@builder.io/qwik';
import { CollabContext } from '@/contexts/collabContext';
import { useCollabSession } from './useCollabSession';

export function useCollabContext() {
  const collab = useCollabSession();
  useContextProvider(CollabContext, collab);
}

