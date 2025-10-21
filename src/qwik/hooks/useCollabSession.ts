import { useSignal, useVisibleTask$, useContext, $ } from '@builder.io/qwik';
import { DualEditorCollabSession } from '@/utils/collabSession';
import type { CollabPeer, CollabStatus } from '@/utils/collabSession';
import { StrudelContext } from '@/contexts/strudelContext';
import { PunctualContext } from '@/contexts/punctualContext';
import { Compartment, StateEffect } from '@codemirror/state';
import type { EditorView } from '@codemirror/view';

export function useCollabSession() {
  const { strudelEditorRef, strudelCollabCompartmentRef } = useContext(StrudelContext);
  const { punctualEditorRef, punctualCollabCompartmentRef } = useContext(PunctualContext);
  
  const session = useSignal<DualEditorCollabSession | null>(null);
  const status = useSignal<CollabStatus>('disconnected');
  const peerCount = useSignal(0);
  const peers = useSignal<CollabPeer[]>([]);
  const isReady = useSignal(false);
  const username = useSignal('');
  const roomName = useSignal('');

  // Initialize session when both editors are ready
  useVisibleTask$(({ track, cleanup }) => {
    // Track editor refs so this runs when they change
    track(() => strudelEditorRef.value);
    track(() => punctualEditorRef.value);
    
    if (!strudelEditorRef.value || !punctualEditorRef.value || 
        !strudelCollabCompartmentRef.value || !punctualCollabCompartmentRef.value) {
      isReady.value = false;
      return;
    }

    // Get the EditorView instances (both refs now contain EditorView directly)
    const strudelEditor = strudelEditorRef.value;
    const punctualEditor = punctualEditorRef.value;

    console.log('[collab] Using existing compartments from editors');
    
    // Don't create a new session if one already exists
    if (session.value) {
      console.log('[collab] Session already exists, cleaning up old one');
      session.value.disconnect();
    }
    
    const collabSession = new DualEditorCollabSession();
    
    // Store session immediately so it doesn't get garbage collected
    session.value = collabSession;
    
    // Use the existing compartments that are already in the editors
    collabSession.setStrudelEditor(strudelEditor, strudelCollabCompartmentRef.value);
    collabSession.setPunctualEditor(punctualEditor, punctualCollabCompartmentRef.value);
    
    console.log('[collab] Session created and configured');
    
    // Event handlers
    const handleStatusChange = () => {
      const info = collabSession.getConnectionInfo();
      status.value = info.status;
    };
    
    const handlePeerCountChange = () => {
      const info = collabSession.getConnectionInfo();
      peerCount.value = info.peerCount;
      peers.value = collabSession.getPeers();
    };
    
    const handleRemoteEvaluate = () => {
      // Emit event that overlay can listen to
      collabSession.emit('remoteEvaluate');
    };
    
    collabSession.on('statusChange', handleStatusChange);
    collabSession.on('peerCountChange', handlePeerCountChange);
    collabSession.on('evaluate', handleRemoteEvaluate);
    
    session.value = collabSession;
    status.value = collabSession.getConnectionInfo().status;
    peerCount.value = collabSession.getConnectionInfo().peerCount;
    isReady.value = true;
    
    cleanup(() => {
      collabSession.off('statusChange', handleStatusChange);
      collabSession.off('peerCountChange', handlePeerCountChange);
      collabSession.off('evaluate', handleRemoteEvaluate);
      collabSession.disconnect();
      session.value = null;
      isReady.value = false;
    });
  });

  const connect = $(async (lobbyId: string, user: string) => {
    if (!session.value) {
      throw new Error('Collaboration session not initialized. Please refresh the page.');
    }
    username.value = user;
    roomName.value = lobbyId;
    await session.value.connect(lobbyId, user);
  });

  const disconnect = $(() => {
    session.value?.disconnect();
  });

  const setActiveEditor = $((editor: 'strudel' | 'punctual') => {
    session.value?.setActiveEditor(editor);
  });

  const broadcastEvaluate = $(() => {
    session.value?.broadcastEvaluate();
  });

  return {
    session,
    status,
    peerCount,
    peers,
    isReady,
    username,
    roomName,
    connect,
    disconnect,
    setActiveEditor,
    broadcastEvaluate,
  };
}
