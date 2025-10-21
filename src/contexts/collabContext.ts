import { createContextId, type Signal } from '@builder.io/qwik';
import type { DualEditorCollabSession, CollabPeer, CollabStatus } from '@/utils/collabSession';

export interface CollabContextType {
  session: Signal<DualEditorCollabSession | null>;
  status: Signal<CollabStatus>;
  peerCount: Signal<number>;
  peers: Signal<CollabPeer[]>;
  isReady: Signal<boolean>;
  username: Signal<string>;
  roomName: Signal<string>;
  connect: (lobbyId: string, username: string) => Promise<void>;
  disconnect: () => void;
  setActiveEditor: (editor: 'strudel' | 'punctual') => void;
  broadcastEvaluate: () => void;
}

export const CollabContext = createContextId<CollabContextType>('collab-context');
